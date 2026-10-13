const stockService = require("../services/stockService");

const SYMBOL_REGEX = /^[A-Za-z0-9_.-]+$/;
const MAX_SEARCH_LENGTH = 100;
const MAX_BATCH_SIZE = 25;
const MAX_SYMBOL_LENGTH = 30;

/**
 * Handle service errors and return appropriate HTTP status
 */
function handleServiceError(res, error, defaultMessage = "Stock market operation failed") {
  console.error("Stock Controller Error:", error);

  if (error instanceof stockService.StockServiceError) {
    return res.status(error.status).json({
      success: false,
      message: error.message,
      ...(error.details ? { details: error.details } : {}),
    });
  }

  return res.status(500).json({
    success: false,
    message: defaultMessage,
    error: error.message,
  });
}

/**
 * GET /api/stocks
 * GET /api/stocks/list
 * List supported stocks with optional search and pagination
 */
const listStocks = async (req, res) => {
  try {
    const query = (req.query.q || "").trim();
    if (query.length > MAX_SEARCH_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Search query exceeds maximum length of ${MAX_SEARCH_LENGTH} characters.`,
      });
    }

    // Validate page
    const pageRaw = req.query.page !== undefined ? req.query.page : "1";
    const page = parseInt(pageRaw, 10);
    if (isNaN(page) || page < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid page parameter. Must be a positive integer >= 1.",
      });
    }

    // Validate limit
    const limitRaw = req.query.limit !== undefined ? req.query.limit : "10";
    const limit = parseInt(limitRaw, 10);
    if (isNaN(limit) || limit < 1 || limit > 50) {
      return res.status(400).json({
        success: false,
        message: "Invalid limit parameter. Must be an integer between 1 and 50.",
      });
    }

    let allItems = [];
    if (query) {
      allItems = await stockService.searchStocks(query);
    } else {
      allItems = stockService.getSupportedStocksList();
    }

    const total = allItems.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedItems = allItems.slice(startIndex, startIndex + limit);

    return res.json({
      success: true,
      data: paginatedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    return handleServiceError(res, error, "Failed to retrieve stock list.");
  }
};

/**
 * GET /api/stocks/search?q={query}
 * Dedicated search endpoint for autocomplete/live search
 */
const searchStocks = async (req, res) => {
  try {
    const query = (req.query.q || "").trim();
    if (query.length > MAX_SEARCH_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Search query exceeds maximum length of ${MAX_SEARCH_LENGTH} characters.`,
      });
    }

    if (!query) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const results = await stockService.searchStocks(query);
    return res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    return handleServiceError(res, error, "Failed to search stocks.");
  }
};

/**
 * GET /api/stocks/recommendations
 * Fetch benchmark Indian equities with live/delayed quotes
 */
const getRecommendations = async (req, res) => {
  try {
    const data = await stockService.getStockRecommendations();
    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return handleServiceError(res, error, "Unable to retrieve stock recommendations at this time.");
  }
};

/**
 * GET /api/stocks/quote?symbol={symbol}
 * GET /api/stocks/quote/:symbol
 * Fetch complete quote and fundamentals for a single stock
 */
const getQuote = async (req, res) => {
  try {
    const symbol = (req.query.symbol || req.params.symbol || "").trim();

    if (!symbol) {
      return res.status(400).json({
        success: false,
        message: "Stock symbol is required (e.g. ?symbol=RELIANCE.NS)",
      });
    }

    if (symbol.length > MAX_SYMBOL_LENGTH || !SYMBOL_REGEX.test(symbol)) {
      return res.status(400).json({
        success: false,
        message: `Invalid stock symbol format. Allowed characters: letters, numbers, dots, and hyphens (max ${MAX_SYMBOL_LENGTH} chars).`,
      });
    }

    const detail = await stockService.getStockDetail(symbol);
    if (!detail) {
      return res.status(404).json({
        success: false,
        message: `No market data available for symbol '${symbol}'. Stock may be delisted or invalid.`,
      });
    }

    const marketStatus = stockService.getIndianMarketStatus();

    return res.json({
      success: true,
      data: {
        ...detail,
        marketStatus: marketStatus.isOpen ? "OPEN" : "CLOSED",
        marketMessage: marketStatus.statusText,
        dataDelayNotice: marketStatus.dataDelayNotice,
      },
    });
  } catch (error) {
    return handleServiceError(res, error, "Failed to retrieve stock quote.");
  }
};

/**
 * GET /api/stocks/quotes?symbols={s1,s2,...}
 * Batch quote fetcher with batch size and symbol validation
 */
const getBatchQuotes = async (req, res) => {
  try {
    const rawSymbols = req.query.symbols || "";
    if (!rawSymbols.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a comma-separated list of symbols (e.g. ?symbols=TCS.NS,INFY.NS)",
      });
    }

    const symbols = rawSymbols
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    if (symbols.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid stock symbols provided.",
      });
    }

    if (symbols.length > MAX_BATCH_SIZE) {
      return res.status(400).json({
        success: false,
        message: `Batch size exceeds maximum limit of ${MAX_BATCH_SIZE} symbols. Requested: ${symbols.length}.`,
      });
    }

    // Validate symbol format
    const invalidSymbols = symbols.filter((s) => s.length > MAX_SYMBOL_LENGTH || !SYMBOL_REGEX.test(s));
    if (invalidSymbols.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid symbol format detected: ${invalidSymbols.join(", ")}. Allowed characters: letters, numbers, dots, hyphens.`,
      });
    }

    const quotes = await stockService.getQuoteBatch(symbols);
    const marketStatus = stockService.getIndianMarketStatus();

    return res.json({
      success: true,
      data: {
        quotes,
        marketStatus: marketStatus.isOpen ? "OPEN" : "CLOSED",
        marketMessage: marketStatus.statusText,
        dataDelayNotice: marketStatus.dataDelayNotice,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return handleServiceError(res, error, "Failed to retrieve batch stock quotes.");
  }
};

module.exports = {
  listStocks,
  searchStocks,
  getRecommendations,
  getQuote,
  getBatchQuotes,
};
