const fs = require('fs').promises;
const path = require('path');
const db = require('./connection');

async function runMigrations() {
    try {
        console.log('Starting database migration...');
        
        await db.connect();
        const pool = db.getPool();
        
        // Read and execute schema
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = await fs.readFile(schemaPath, 'utf8');
        
        await pool.query(schema);
        console.log('Database schema created successfully');
        
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await db.disconnect();
    }
}

// Run migrations if this file is executed directly
if (require.main === module) {
    runMigrations();
}

module.exports = { runMigrations };
