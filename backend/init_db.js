const { Pool } = require("pg");

// Paste your Neon Database URL here
const DATABASE_URL = "postgresql://neondb_owner:npg_wpNc8tA3aWov@ep-polished-haze-aolhlk96-pooler.c-2.ap-southeast-1.aws.neon.tech/financial_advisor?sslmode=require&channel_binding=require";

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function testConnection() {
    try {
        const result = await pool.query("SELECT NOW()");

        console.log("✅ Connected to Neon Database");
        console.log("Server Time:", result.rows[0].now);

    } catch (err) {
        console.error("❌ Database Connection Failed");
        console.error(err.message);
    } finally {
        await pool.end();
    }
}

testConnection();