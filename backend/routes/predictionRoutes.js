const express = require("express");
const router = express.Router();

const {
  getExpensePrediction,
  getRevenuePrediction,
  getCashFlowPrediction,
} = require("../controllers/predictionController");

const verifyToken = require("../middleware/authMiddleware");

// Protect all predictions endpoints with token verification
router.use(verifyToken);

router.get("/expense", getExpensePrediction);
router.get("/revenue", getRevenuePrediction);
router.get("/cashflow", getCashFlowPrediction);

module.exports = router;
