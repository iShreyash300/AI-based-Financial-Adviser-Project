const express = require("express");
const router = express.Router();

const { getRecommendations } = require("../controllers/growthPlanController");
const verifyToken = require("../middleware/authMiddleware");

router.use(verifyToken);

router.get("/recommendations", getRecommendations);

module.exports = router;
