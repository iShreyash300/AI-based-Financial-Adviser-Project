const { describe, it } = require("node:test");
const assert = require("node:assert");
const stockController = require("../controllers/stockController");
const stockService = require("../services/stockService");

// Mock Express response helper
function createMockRes() {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
  return res;
}

describe("Stock Endpoints Controller & Validation Suite", () => {
  describe("listStocks (/api/stocks)", () => {
    it("returns paginated list of supported stocks with default pagination", async () => {
      const req = { query: {} };
      const res = createMockRes();

      await stockController.listStocks(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(Array.isArray(res.body.data), true);
      assert.ok(res.body.data.length <= 10);
      assert.strictEqual(res.body.pagination.page, 1);
      assert.strictEqual(res.body.pagination.limit, 10);
      assert.ok(res.body.pagination.total > 0);
      assert.ok(res.body.pagination.totalPages >= 1);
    });

    it("respects custom pagination parameters", async () => {
      const req = { query: { page: "2", limit: "5" } };
      const res = createMockRes();

      await stockController.listStocks(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.pagination.page, 2);
      assert.strictEqual(res.body.pagination.limit, 5);
      assert.ok(res.body.data.length <= 5);
    });

    it("rejects invalid page parameter with 400", async () => {
      const req = { query: { page: "0" } };
      const res = createMockRes();

      await stockController.listStocks(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes("Invalid page"));
    });

    it("rejects invalid limit parameter with 400", async () => {
      const req = { query: { limit: "100" } }; // exceeds max 50
      const res = createMockRes();

      await stockController.listStocks(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes("Invalid limit"));
    });

    it("rejects search queries exceeding maximum length with 400", async () => {
      const req = { query: { q: "A".repeat(101) } };
      const res = createMockRes();

      await stockController.listStocks(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes("Search query exceeds"));
    });
  });

  describe("searchStocks (/api/stocks/search)", () => {
    it("returns empty array for empty search query", async () => {
      const req = { query: { q: "" } };
      const res = createMockRes();

      await stockController.searchStocks(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.deepStrictEqual(res.body.data, []);
    });

    it("returns matching stocks for valid query", async () => {
      const req = { query: { q: "reliance" } };
      const res = createMockRes();

      await stockController.searchStocks(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(res.body.data.some((item) => item.symbol.includes("RELIANCE")));
    });
  });

  describe("getQuote (/api/stocks/quote)", () => {
    it("rejects missing symbol with 400", async () => {
      const req = { query: {}, params: {} };
      const res = createMockRes();

      await stockController.getQuote(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes("required"));
    });

    it("rejects invalid symbol format with 400", async () => {
      const req = { query: { symbol: "BAD SYMBOL<script>" }, params: {} };
      const res = createMockRes();

      await stockController.getQuote(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes("Invalid stock symbol format"));
    });

    it("returns 404 for non-existent stock symbol", async () => {
      const req = { query: { symbol: "NON_EXISTENT_XYZ_123.NS" }, params: {} };
      const res = createMockRes();

      await stockController.getQuote(req, res);

      assert.strictEqual(res.statusCode, 404);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes("No market data available"));
    });

    it("returns genuine quote and market status for valid symbol", async () => {
      const req = { query: { symbol: "INFY.NS" }, params: {} };
      const res = createMockRes();

      await stockController.getQuote(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.cleanSymbol, "INFY");
      assert.strictEqual(typeof res.body.data.price, "number");
      assert.ok(["OPEN", "CLOSED"].includes(res.body.data.marketStatus));
    });
  });

  describe("getBatchQuotes (/api/stocks/quotes)", () => {
    it("rejects empty symbols with 400", async () => {
      const req = { query: { symbols: "" } };
      const res = createMockRes();

      await stockController.getBatchQuotes(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.success, false);
    });

    it("rejects batch exceeding max size (25) with 400", async () => {
      const longList = Array.from({ length: 26 }, (_, i) => `SYM${i}.NS`).join(",");
      const req = { query: { symbols: longList } };
      const res = createMockRes();

      await stockController.getBatchQuotes(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes("exceeds maximum limit of 25"));
    });

    it("rejects invalid symbols in batch with 400", async () => {
      const req = { query: { symbols: "TCS.NS,INVALID#SYM" } };
      const res = createMockRes();

      await stockController.getBatchQuotes(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes("Invalid symbol format"));
    });

    it("returns batch quotes for valid symbols", async () => {
      const req = { query: { symbols: "TCS.NS,INFY.NS" } };
      const res = createMockRes();

      await stockController.getBatchQuotes(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.quotes["TCS.NS"]);
      assert.ok(res.body.data.quotes["INFY.NS"]);
      assert.strictEqual(typeof res.body.data.quotes["TCS.NS"].lastPrice, "number");
      assert.ok(["OPEN", "CLOSED"].includes(res.body.data.marketStatus));
    });
  });

  describe("getRecommendations (/api/stocks/recommendations)", () => {
    it("returns benchmark Indian recommendations with market status", async () => {
      const req = {};
      const res = createMockRes();

      await stockController.getRecommendations(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(Array.isArray(res.body.data.stocks));
      assert.ok(res.body.data.stocks.length >= 6);
      assert.ok(["OPEN", "CLOSED"].includes(res.body.data.marketStatus));
    });
  });
});
