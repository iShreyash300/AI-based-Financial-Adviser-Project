require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { pool } = require("./config/db");

async function runMigration() {
  try {
    const migrationPath = path.join(__dirname, "..", "database", "migration.sql");
    console.log(`Running migration from: ${migrationPath}`);
    const sql = fs.readFileSync(migrationPath, "utf8");

    await pool.query(sql);
    console.log("✅ Migration applied successfully!");

    const cols = await pool.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'expenses' ORDER BY ordinal_position;"
    );
    console.log("Updated columns in expenses:", cols.rows.map((r) => r.column_name));
  } catch (err) {
    console.error("❌ Migration failed:", err);
  } finally {
    await pool.end();
  }
}

runMigration();
