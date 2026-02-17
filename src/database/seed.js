const fs = require('fs').promises;
const path = require('path');
const db = require('./connection');

async function runSeed() {
    try {
        console.log('Starting database seeding...');
        
        await db.connect();
        const pool = db.getPool();
        
        // Read and execute seed data
        const seedPath = path.join(__dirname, 'seed.sql');
        const seedData = await fs.readFile(seedPath, 'utf8');
        
        await pool.query(seedData);
        console.log('Database seeded successfully');
        
        // Verify seed data
        const result = await pool.query(`
            SELECT 
                COUNT(DISTINCT at.id) as asset_types,
                COUNT(DISTINCT w.id) as wallets,
                COUNT(DISTINCT t.id) as transactions
            FROM asset_types at
            CROSS JOIN wallets w
            CROSS JOIN transactions t
        `);
        
        console.log('Seed verification:', result.rows[0]);
        
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    } finally {
        await db.disconnect();
    }
}

// Run seed if this file is executed directly
if (require.main === module) {
    runSeed();
}

module.exports = { runSeed };
