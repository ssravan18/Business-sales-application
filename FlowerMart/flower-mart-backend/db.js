const { Pool } = require('pg');
require('dotenv').config();

// Debug: Check if the URL is being read
if (!process.env.DATABASE_URL) {
    console.error("❌ CRITICAL ERROR: DATABASE_URL is missing in .env file.");
    process.exit(1);
}

// Logic: If the URL contains "localhost", we turn SSL OFF.
// If it does not contain "localhost" (cloud), we turn SSL ON.
const isLocal = process.env.DATABASE_URL.includes('localhost');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Only use SSL if NOT local
    ssl: isLocal ? false : { rejectUnauthorized: false }
});

pool.on('connect', () => {
    console.log(`✅ Database connected successfully (${isLocal ? 'Local' : 'Cloud'})`);
});

pool.on('error', (err) => {
    console.error('❌ Database Error:', err);
});

module.exports = pool;