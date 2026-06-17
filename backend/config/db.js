// const { Sequelize } = require("sequelize");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Neo PostgreSQL Connected");
    client.release();
  } catch (error) {
    console.log("❌ Database Error:-->", error.message);
  }
};

module.exports = {
  pool,
  connectDB,
};
