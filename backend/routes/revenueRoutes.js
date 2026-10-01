const express = require("express");
const router = express.Router();

const {
  getRevenues,
  createRevenue,
  updateRevenue,
  deleteRevenue,
} = require("../controllers/revenueController");

const verifyToken = require("../middleware/authMiddleware");

router.use(verifyToken);

router.get("/", getRevenues);
router.post("/", createRevenue);
router.put("/:id", updateRevenue);
router.delete("/:id", deleteRevenue);

module.exports = router;
