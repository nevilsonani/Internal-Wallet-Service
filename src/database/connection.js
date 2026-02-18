const { Pool } = require('pg');
require('dotenv').config();

class DatabaseConnection {
    constructor() {
        this.pool = null;
        this.isConnected = false;
    }

    async connect() {
        if (this.isConnected) {
            return this.pool;
        }

        try {
            this.pool = new Pool({
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT || 5432,
                database: process.env.DB_NAME || 'wallet_service',
                user: process.env.DB_USER || 'wallet_user',
                password: process.env.DB_PASSWORD || 'wallet_password',
                connectionString: process.env.DATABASE_URL,
                max: 20, // Maximum number of clients in the pool
                idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
                connectionTimeoutMillis: 2000, // How long to wait when connecting a new client
                ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
            });

            // Test the connection
            const client = await this.pool.connect();
            await client.query('SELECT NOW()');
            client.release();
            
            this.isConnected = true;
            console.log('Database connected successfully');
            return this.pool;
        } catch (error) {
            console.error('Database connection failed:', error);
            throw error;
        }
    }

    async disconnect() {
        if (this.pool) {
            await this.pool.end();
            this.isConnected = false;
            console.log('Database disconnected');
        }
    }

    getPool() {
        if (!this.isConnected) {
            throw new Error('Database not connected. Call connect() first.');
        }
        return this.pool;
    }

    // Transaction helper with deadlock retry logic
    async withTransaction(callback, maxRetries = 3) {
        const pool = this.getPool();
        let attempt = 0;
        
        while (attempt < maxRetries) {
            const client = await pool.connect();
            
            try {
                await client.query('BEGIN');
                
                // Set transaction isolation level
                await client.query('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');
                
                const result = await callback(client);
                
                await client.query('COMMIT');
                return result;
                
            } catch (error) {
                await client.query('ROLLBACK');
                
                // Check if it's a deadlock and retry
                if (error.code === '40P01' && attempt < maxRetries - 1) {
                    attempt++;
                    console.warn(`Deadlock detected, retrying attempt ${attempt}/${maxRetries}`);
                    // Exponential backoff
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
                    continue;
                }
                
                throw error;
                
            } finally {
                client.release();
            }
        }
        
        throw new Error(`Transaction failed after ${maxRetries} attempts`);
    }
}

module.exports = new DatabaseConnection();
