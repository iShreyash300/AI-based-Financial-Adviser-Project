const express = require("express");
const router = express.Router();

const {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} = require("../controllers/budgetController");

const verifyToken = require("../middleware/authMiddleware");

router.use(verifyToken);

router.get("/", getBudgets);
router.post("/", createBudget);
router.put("/:id", updateBudget);
router.delete("/:id", deleteBudget);

module.exports = router;
