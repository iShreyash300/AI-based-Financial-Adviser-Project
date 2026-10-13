require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL is not defined in .env");
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function runSetup() {
  try {
    console.log("⚡ Checking database connection and existing tables...");
    const res = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
    );
    const existingTables = res.rows.map((r) => r.table_name);
    console.log("📌 Existing tables in database:", existingTables);

    const schemaPath = path.join(__dirname, "..", "database", "schema.sql");
    console.log(`📄 Reading schema from: ${schemaPath}`);
    const sql = fs.readFileSync(schemaPath, "utf8");

    // Execute full SQL block
    try {
      await pool.query(sql);
      console.log("✅ Schema executed successfully.");
    } catch (err) {
      if (err.code === "42P07" || err.code === "42710" || err.code === "23505") {
        console.log("ℹ️ Tables or indexes already exist in the database.");
      } else {
        console.warn("⚠️ Notice during schema execution:", err.message);
      }
    }

    const finalRes = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
    );
    console.log("✅ Database ready. Tables active:", finalRes.rows.map((r) => r.table_name));
  } catch (err) {
    console.error("❌ Setup failed:", err);
  } finally {
    await pool.end();
  }
}

runSetup();
