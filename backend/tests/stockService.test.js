const { describe, it, beforeEach } = require("node:test");
const assert = require("node:assert");
const stockService = require("../services/stockService");

describe("Stock Service Integration & Error Handling Suite", () => {
  beforeEach(() => {
    stockService.clearCache();
  });

  it("correctly identifies NSE (.NS) and BSE (.BO) exchanges", () => {
    assert.deepStrictEqual(stockService.determineExchange("RELIANCE"), ["RELIANCE", ".NS"]);
    assert.deepStrictEqual(stockService.determineExchange("tcs.ns"), ["TCS", ".NS"]);
    assert.deepStrictEqual(stockService.determineExchange("infy.bo"), ["INFY", ".BO"]);
  });

  it("calculates Indian Market Status with IST timestamp", () => {
    const status = stockService.getIndianMarketStatus();
    assert.strictEqual(typeof status.isOpen, "boolean");
    assert.ok(status.statusText.includes("Market"));
    assert.ok(status.dataDelayNotice.includes("delayed"));
    assert.ok(status.istTime.includes("+05:30"));
  });

  it("exposes configurable environment constants without secrets", () => {
    assert.ok(stockService.CONFIG.STOCK_API_BASE_URL);
    assert.ok(stockService.CONFIG.STOCK_API_COOKIE_URL);
    assert.strictEqual(typeof stockService.CONFIG.STOCK_API_TIMEOUT_MS, "number");
    assert.strictEqual(typeof stockService.CONFIG.STOCK_API_CACHE_TTL_MS, "number");
  });

  it("retrieves top Indian stock recommendations with genuine quotes", async () => {
    const data = await stockService.getStockRecommendations();
    assert.ok(["OPEN", "CLOSED"].includes(data.marketStatus));
    assert.strictEqual(Array.isArray(data.stocks), true);
    assert.ok(data.stocks.length >= 6);

    const reliance = data.stocks.find((s) => s.symbol === "RELIANCE.NS");
    assert.ok(reliance, "Reliance should be in recommendations");
    assert.ok(reliance.name.toLowerCase().includes("reliance"));
    assert.strictEqual(typeof reliance.price, "number");
    assert.ok(reliance.price > 100);
    assert.ok(typeof reliance.change === "string");
    assert.ok(typeof reliance.percentChange === "string");
    assert.strictEqual(typeof reliance.isPositive, "boolean");
  });

  it("retrieves batch quotes for multiple NSE/BSE symbols", async () => {
    const symbols = ["TCS.NS", "INFY.NS"];
    const quotes = await stockService.getQuoteBatch(symbols);

    assert.ok(quotes["TCS.NS"], "TCS quote should be present");
    assert.ok(quotes["INFY.NS"], "Infosys quote should be present");
    assert.strictEqual(typeof quotes["TCS.NS"].lastPrice, "number");
    assert.strictEqual(typeof quotes["INFY.NS"].lastPrice, "number");
    assert.ok(quotes["TCS.NS"].lastPrice > 500);
  });

  it("searches stocks by company name and symbol", async () => {
    const results = await stockService.searchStocks("tata");
    assert.strictEqual(Array.isArray(results), true);
    assert.ok(results.length > 0);
    assert.ok(results.some((r) => r.symbol.includes("TCS") || r.symbol.includes("TATA")));
  });

  it("fetches single stock detailed fundamentals", async () => {
    const detail = await stockService.getStockDetail("INFY.NS");
    assert.ok(detail);
    assert.strictEqual(detail.cleanSymbol, "INFY");
    assert.strictEqual(detail.exchange, "NSE");
    assert.ok(detail.name.toLowerCase().includes("infosys"));
    assert.strictEqual(typeof detail.price, "number");
    assert.ok(detail.price > 100);
  });

  it("handles non-existent or invalid symbols without fabricating prices", async () => {
    const detail = await stockService.getStockDetail("NON_EXISTENT_XYZ_123.NS");
    assert.strictEqual(detail, null, "Detail should be null for invalid stock");

    const batch = await stockService.getQuoteBatch(["NON_EXISTENT_XYZ_123.NS"]);
    assert.deepStrictEqual(batch, {}, "Batch should not fabricate a price for an invalid stock");
  });

  it("defines StockServiceError with status and details", () => {
    const err = new stockService.StockServiceError("Provider unreachable", 503, { code: "ECONNREFUSED" });
    assert.strictEqual(err.name, "StockServiceError");
    assert.strictEqual(err.status, 503);
    assert.strictEqual(err.details.code, "ECONNREFUSED");
    assert.strictEqual(err.message, "Provider unreachable");
  });
});
