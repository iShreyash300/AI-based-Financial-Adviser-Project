const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const {
  getSummary,
  getCharts,
  getInsights,
  downloadReport,
} = require("../controllers/reportsController");

router.use(verifyToken);
router.get("/summary", getSummary);
router.get("/charts", getCharts);
router.get("/insights", getInsights);
router.get("/download", downloadReport);

module.exports = router;
