const walletService = require('../services/walletService');
const { validate, schemas } = require('../validators/transactionValidator');

class WalletController {
    // Get wallet balance
    async getBalance(req, res) {
        try {
            const { userId, assetTypeId } = validate(schemas.balanceQuery, req.query);
            const balance = await walletService.getBalance(userId, assetTypeId);
            
            res.json({
                success: true,
                data: balance
            });
        } catch (error) {
            console.error('Get balance error:', error);
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    // Get all wallets for a user
    async getUserWallets(req, res) {
        try {
            const { userId } = req.params;
            
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    error: 'User ID is required'
                });
            }

            const wallets = await walletService.getUserWallets(userId);
            
            res.json({
                success: true,
                data: wallets
            });
        } catch (error) {
            console.error('Get user wallets error:', error);
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    // Wallet top-up (purchase)
    async topup(req, res) {
        try {
            const transactionData = validate(schemas.topup, {
                ...req.body,
                transactionType: 'TOPUP'
            });
            
            const result = await walletService.executeTransaction({
                ...transactionData,
                transactionType: 'TOPUP'
            });
            
            res.status(201).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Top-up error:', error);
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    // Bonus/Incentive
    async bonus(req, res) {
        try {
            const transactionData = validate(schemas.bonus, {
                ...req.body,
                transactionType: 'BONUS'
            });
            
            const result = await walletService.executeTransaction({
                ...transactionData,
                transactionType: 'BONUS'
            });
            
            res.status(201).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Bonus error:', error);
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    // Purchase/Spend
    async spend(req, res) {
        try {
            const transactionData = validate(schemas.spend, {
                ...req.body,
                transactionType: 'SPEND'
            });
            
            const result = await walletService.executeTransaction({
                ...transactionData,
                transactionType: 'SPEND'
            });
            
            res.status(201).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Spend error:', error);
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    // Get transaction history
    async getTransactionHistory(req, res) {
        try {
            const { userId, assetTypeId, limit, offset } = validate(schemas.historyQuery, req.query);
            const history = await walletService.getTransactionHistory(userId, assetTypeId, limit, offset);
            
            res.json({
                success: true,
                data: history
            });
        } catch (error) {
            console.error('Get transaction history error:', error);
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    // Get asset types
    async getAssetTypes(req, res) {
        try {
            const assetTypes = await walletService.getAssetTypes();
            
            res.json({
                success: true,
                data: assetTypes
            });
        } catch (error) {
            console.error('Get asset types error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Health check endpoint
    async healthCheck(req, res) {
        try {
            // Simple database connectivity check
            const assetTypes = await walletService.getAssetTypes();
            
            res.json({
                success: true,
                status: 'healthy',
                timestamp: new Date().toISOString(),
                database: 'connected'
            });
        } catch (error) {
            console.error('Health check error:', error);
            res.status(503).json({
                success: false,
                status: 'unhealthy',
                error: error.message
            });
        }
    }
}

module.exports = new WalletController();
