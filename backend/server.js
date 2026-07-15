const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connectDB } = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const revenueRoutes = require("./routes/revenueRoutes");
const predictionRoutes = require("./routes/predictionRoutes");
const financialHealthRoutes = require("./routes/financialHealthRoutes");
const reportRoutes = require("./routes/reportRoutes");
const goalsRoutes = require("./routes/goalsRoutes");
const growthPlanRoutes = require("./routes/growthPlanRoutes");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

// sequelize.sync({ alter: true });

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/revenues", revenueRoutes);
app.use("/api/predictions", predictionRoutes);
app.use("/api/financial-health", financialHealthRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/goals", goalsRoutes);
app.use("/api/growth-plan", growthPlanRoutes);

app.get("/", (req, res) => {
  res.send("Backend Running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
