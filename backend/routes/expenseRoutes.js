const express = require("express");
const router = express.Router();

const {
  getExpenses,
  createExpense,
  deleteExpense,
} = require("../controllers/expenseController");

const verifyToken = require("../middleware/authMiddleware");

// Protect all endpoints with JWT check
router.use(verifyToken);

router.get("/", getExpenses);
router.post("/", createExpense);
router.delete("/:id", deleteExpense);

module.exports = router;
