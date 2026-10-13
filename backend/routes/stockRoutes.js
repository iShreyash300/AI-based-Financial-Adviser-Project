const express = require("express");
const router = express.Router();
const {
  listStocks,
  searchStocks,
  getRecommendations,
  getQuote,
  getBatchQuotes,
} = require("../controllers/stockController");
const verifyToken = require("../middleware/authMiddleware");

// All stock endpoints are protected by standard JWT verification
router.use(verifyToken);

// Stock listing & searching endpoints
router.get("/", listStocks);
router.get("/list", listStocks);
router.get("/search", searchStocks);
router.get("/recommendations", getRecommendations);

// Quote & Batch Quote endpoints
router.get("/quote", getQuote);
router.get("/quote/:symbol", (req, res, next) => {
  req.query.symbol = req.params.symbol;
  return getQuote(req, res, next);
});
router.get("/quotes", getBatchQuotes);

module.exports = router;
