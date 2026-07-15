const express = require("express");
const router = express.Router();

const { getFinancialHealth } = require("../controllers/financialHealthController");
const verifyToken = require("../middleware/authMiddleware");

// Protect with JWT
router.use(verifyToken);

router.get("/", getFinancialHealth);

module.exports = router;
