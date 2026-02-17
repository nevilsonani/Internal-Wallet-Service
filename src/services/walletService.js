const { v4: uuidv4 } = require('uuid');
const db = require('../database/connection');

class WalletService {
    // Get wallet balance for a user and asset type
    async getBalance(userId, assetTypeId) {
        const pool = db.getPool();
        
        const result = await pool.query(`
            SELECT w.balance, at.name as asset_name, at.symbol, at.decimals
            FROM wallets w
            JOIN asset_types at ON w.asset_type_id = at.id
            WHERE w.user_id = $1 AND w.asset_type_id = $2 AND w.is_active = true
        `, [userId, assetTypeId]);
        
        if (result.rows.length === 0) {
            throw new Error(`Wallet not found for user ${userId} and asset ${assetTypeId}`);
        }
        
        return result.rows[0];
    }

    // Get all wallets for a user
    async getUserWallets(userId) {
        const pool = db.getPool();
        
        const result = await pool.query(`
            SELECT w.id, w.balance, at.id as asset_type_id, at.name, at.symbol, at.decimals
            FROM wallets w
            JOIN asset_types at ON w.asset_type_id = at.id
            WHERE w.user_id = $1 AND w.is_active = true AND at.is_active = true
            ORDER BY at.name
        `, [userId]);
        
        return result.rows;
    }

    // Execute transaction with idempotency and concurrency control
    async executeTransaction(transactionData) {
        const {
            idempotencyKey,
            transactionType,
            userId,
            assetTypeId,
            amount,
            referenceId,
            description,
            createdBy
        } = transactionData;

        return await db.withTransaction(async (client) => {
            // Check for idempotency
            const existingTx = await client.query(`
                SELECT id, status FROM transactions 
                WHERE transaction_idempotency_key = $1
            `, [idempotencyKey]);

            if (existingTx.rows.length > 0) {
                const tx = existingTx.rows[0];
                if (tx.status === 'COMPLETED') {
                    // Return existing transaction result
                    const entries = await client.query(`
                        SELECT te.entry_type, te.amount, te.balance_after, w.user_id
                        FROM transaction_entries te
                        JOIN wallets w ON te.wallet_id = w.id
                        WHERE te.transaction_id = $1
                    `, [tx.id]);

                    return {
                        transactionId: tx.id,
                        status: tx.status,
                        message: 'Transaction already processed',
                        entries: entries.rows
                    };
                } else {
                    throw new Error(`Transaction with idempotency key ${idempotencyKey} already exists with status ${tx.status}`);
                }
            }

            // Validate transaction type and amount
            if (amount <= 0) {
                throw new Error('Transaction amount must be positive');
            }

            // Get user wallet and lock it for update
            const walletResult = await client.query(`
                SELECT id, balance, wallet_type FROM wallets 
                WHERE user_id = $1 AND asset_type_id = $2 AND is_active = true
                FOR UPDATE
            `, [userId, assetTypeId]);

            if (walletResult.rows.length === 0) {
                throw new Error(`Wallet not found for user ${userId} and asset ${assetTypeId}`);
            }

            const wallet = walletResult.rows[0];

            // Get system treasury wallet for double-entry
            const systemWalletResult = await client.query(`
                SELECT id, balance FROM wallets 
                WHERE user_id = 'system_treasury' AND asset_type_id = $1 AND is_active = true
                FOR UPDATE
            `, [assetTypeId]);

            if (systemWalletResult.rows.length === 0) {
                throw new Error(`System treasury wallet not found for asset ${assetTypeId}`);
            }

            const systemWallet = systemWalletResult.rows[0];

            // Calculate new balances based on transaction type
            let userNewBalance, systemNewBalance, userEntryType, systemEntryType;

            switch (transactionType) {
                case 'TOPUP':
                    // User receives credits, system treasury debits
                    if (systemWallet.balance < amount) {
                        throw new Error('Insufficient system treasury balance');
                    }
                    userNewBalance = wallet.balance + amount;
                    systemNewBalance = systemWallet.balance - amount;
                    userEntryType = 'CREDIT';
                    systemEntryType = 'DEBIT';
                    break;

                case 'BONUS':
                    // User receives free credits, system creates new credits
                    userNewBalance = wallet.balance + amount;
                    systemNewBalance = systemWallet.balance + amount; // System tracks total issued
                    userEntryType = 'CREDIT';
                    systemEntryType = 'CREDIT';
                    break;

                case 'SPEND':
                    // User spends credits, system treasury receives
                    if (wallet.balance < amount) {
                        throw new Error('Insufficient balance');
                    }
                    userNewBalance = wallet.balance - amount;
                    systemNewBalance = systemWallet.balance + amount;
                    userEntryType = 'DEBIT';
                    systemEntryType = 'CREDIT';
                    break;

                default:
                    throw new Error(`Invalid transaction type: ${transactionType}`);
            }

            // Create transaction record
            const transactionResult = await client.query(`
                INSERT INTO transactions 
                (id, transaction_idempotency_key, transaction_type, reference_id, description, status, created_by)
                VALUES ($1, $2, $3, $4, $5, 'COMPLETED', $6)
                RETURNING id, created_at
            `, [uuidv4(), idempotencyKey, transactionType, referenceId, description, createdBy]);

            const transaction = transactionResult.rows[0];

            // Update wallet balances
            await client.query(`
                UPDATE wallets SET balance = $1, updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
            `, [userNewBalance, wallet.id]);

            await client.query(`
                UPDATE wallets SET balance = $1, updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
            `, [systemNewBalance, systemWallet.id]);

            // Create transaction entries (double-entry)
            await client.query(`
                INSERT INTO transaction_entries 
                (transaction_id, wallet_id, entry_type, amount, balance_after)
                VALUES ($1, $2, $3, $4, $5)
            `, [transaction.id, wallet.id, userEntryType, amount, userNewBalance]);

            await client.query(`
                INSERT INTO transaction_entries 
                (transaction_id, wallet_id, entry_type, amount, balance_after)
                VALUES ($1, $2, $3, $4, $5)
            `, [transaction.id, systemWallet.id, systemEntryType, amount, systemNewBalance]);

            // Update transaction completion time
            await client.query(`
                UPDATE transactions SET completed_at = CURRENT_TIMESTAMP
                WHERE id = $1
            `, [transaction.id]);

            return {
                transactionId: transaction.id,
                status: 'COMPLETED',
                message: 'Transaction completed successfully',
                entries: [
                    {
                        userId: userId,
                        entryType: userEntryType,
                        amount: amount,
                        balanceAfter: userNewBalance
                    },
                    {
                        userId: 'system_treasury',
                        entryType: systemEntryType,
                        amount: amount,
                        balanceAfter: systemNewBalance
                    }
                ]
            };
        });
    }

    // Get transaction history
    async getTransactionHistory(userId, assetTypeId = null, limit = 50, offset = 0) {
        const pool = db.getPool();
        
        let query = `
            SELECT t.id, t.transaction_type, t.reference_id, t.description, 
                   t.status, t.created_at, t.completed_at,
                   te.entry_type, te.amount, te.balance_after,
                   at.name as asset_name, at.symbol
            FROM transactions t
            JOIN transaction_entries te ON t.id = te.transaction_id
            JOIN wallets w ON te.wallet_id = w.id
            JOIN asset_types at ON w.asset_type_id = at.id
            WHERE w.user_id = $1
        `;
        
        const params = [userId];
        
        if (assetTypeId) {
            query += ` AND w.asset_type_id = $${params.length + 1}`;
            params.push(assetTypeId);
        }
        
        query += ` ORDER BY t.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);
        
        const result = await pool.query(query, params);
        
        return result.rows;
    }

    // Get available asset types
    async getAssetTypes() {
        const pool = db.getPool();
        
        const result = await pool.query(`
            SELECT id, name, symbol, description, decimals, is_active
            FROM asset_types
            WHERE is_active = true
            ORDER BY name
        `);
        
        return result.rows;
    }
}

module.exports = new WalletService();
