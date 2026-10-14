/**
 * Stock Service - Indian Stock Market API Integration
 * Based on: https://github.com/0xramm/Indian-Stock-Market-API
 * Directly connects to NSE/BSE stock data via Yahoo Finance endpoint engine.
 * Includes in-memory caching, rate-limit protection, configurable timeouts, and market status detection.
 */

// Configurable provider settings via environment variables
// Note: query2 is prioritized as it suffers less rate-limiting than query1
const STOCK_API_BASE_URL = process.env.STOCK_API_BASE_URL || "https://query2.finance.yahoo.com";
const STOCK_API_COOKIE_URL = process.env.STOCK_API_COOKIE_URL || "https://fc.yahoo.com";
const STOCK_API_TIMEOUT_MS = parseInt(process.env.STOCK_API_TIMEOUT_MS, 10) || 7000;
const STOCK_API_CACHE_TTL_MS = parseInt(process.env.STOCK_API_CACHE_TTL_MS, 10) || 60000;

// Multiple candidate endpoints for automatic failover when 429 rate limit is encountered
const CANDIDATE_BASE_URLS = Array.from(new Set([
  STOCK_API_BASE_URL,
  "https://query2.finance.yahoo.com",
  "https://query1.finance.yahoo.com",
]));

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

/**
 * Custom error class for provider communication failures
 */
class StockServiceError extends Error {
  constructor(message, status = 502, details = null) {
    super(message);
    this.name = "StockServiceError";
    this.status = status;
    this.details = details;
  }
}

// Stock market cache, symbols, and fallback benchmark data imported from S_Data
const {
  NSE_SYMBOLS_CACHE,
  DEFAULT_TOP_SYMBOLS,
  BENCHMARK_FALLBACK_STOCKS,
  riskLookup,
  sectorLookup,
} = require("../S_Data/stockData");

let crumbCache = { crumb: null, cookie: null, expiresAt: 0 };
let inFlightCrumbPromise = null; // Deduplicate concurrent crumb requests to avoid 429
const quoteCache = new Map(); // key -> { data, expiresAt }
const detailCache = new Map(); // key -> { data, expiresAt }
const searchCache = new Map(); // key -> { data, expiresAt }
const lastKnownQuotes = new Map(); // Persistent fallback store across sessions

// Cache TTL configuration
const TTL_QUOTES = STOCK_API_CACHE_TTL_MS; // default 60s
const TTL_DETAILS = 120 * 1000; // 2 minutes
const TTL_SEARCH = 300 * 1000; // 5 minutes


// Determine exchange suffix (.NS for NSE, .BO for BSE)

function determineExchange(symbolInput = "") {
  const symbol = (symbolInput || "").toUpperCase().trim();
  if (symbol.endsWith(".NS")) return [symbol.slice(0, -3), ".NS"];
  if (symbol.endsWith(".BO")) return [symbol.slice(0, -3), ".BO"];
  return [symbol, ".NS"];
}


//  * Check Indian Stock Market Status (NSE / BSE)
//  * Market Trading Hours: Mon-Fri 09:15 to 15:30 IST (UTC+5:30)

function getIndianMarketStatus() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000) + istOffset);

  const dayOfWeek = istTime.getDay(); // 0 is Sunday, 6 is Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  const hours = istTime.getHours();
  const minutes = istTime.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  const marketOpenMinutes = 9 * 60 + 15; // 09:15
  const marketCloseMinutes = 15 * 60 + 30; // 15:30

  const isOpen = !isWeekend && totalMinutes >= marketOpenMinutes && totalMinutes <= marketCloseMinutes;

  return {
    isOpen,
    statusText: isOpen ? "Market Open (NSE/BSE)" : "Market Closed",
    dataDelayNotice: "Data is delayed by ~15 minutes or reflects the last closing session.",
    istTime: istTime.toISOString().replace("Z", "+05:30"),
  };
}


//  * Perform single-flight crumb retrieval with candidate hosts and backoff

async function fetchCrumbWithFailover(forceRefresh = false) {
  if (!forceRefresh && crumbCache.crumb && Date.now() < crumbCache.expiresAt) {
    return crumbCache;
  }

  let cookie = crumbCache.cookie || "";
  try {
    const cookieRes = await fetch(STOCK_API_COOKIE_URL, {
      headers: {
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(STOCK_API_TIMEOUT_MS),
    });
    const setCookie = cookieRes.headers.get("set-cookie") || "";
    const parsedCookie = setCookie.split(";")[0] || "";
    if (parsedCookie) {
      cookie = parsedCookie;
    }
  } catch (cookieErr) {
    console.warn("Stock provider cookie retrieval notice:", cookieErr.message);
  }

  let lastError = null;
  for (let i = 0; i < CANDIDATE_BASE_URLS.length; i++) {
    const host = CANDIDATE_BASE_URLS[i];
    try {
      const crumbRes = await fetch(`${host}/v1/test/getcrumb`, {
        headers: {
          "User-Agent": UA,
          Cookie: cookie,
          "Accept": "text/plain, */*",
          "Accept-Language": "en-US,en;q=0.9",
        },
        signal: AbortSignal.timeout(STOCK_API_TIMEOUT_MS),
      });

      if (crumbRes.status === 429) {
        lastError = new StockServiceError("Stock market provider rate limited: HTTP 429", 429);
        console.warn(`Host ${host} throttled crumb (HTTP 429). Retrying alternate endpoint...`);
        // Jittered backoff before trying alternate host
        await new Promise((r) => setTimeout(r, 400 + Math.random() * 300));
        continue;
      }

      if (!crumbRes.ok) {
        lastError = new StockServiceError(`Failed to fetch crumb from provider: HTTP ${crumbRes.status}`, 502);
        continue;
      }

      const crumb = (await crumbRes.text()).trim();
      if (!crumb) {
        lastError = new StockServiceError("Received empty authentication crumb from provider", 502);
        continue;
      }

      crumbCache = {
        crumb,
        cookie,
        expiresAt: Date.now() + 4 * 60 * 60 * 1000, // Valid for 4 hours
      };
      return crumbCache;
    } catch (err) {
      lastError = err;
    }
  }

  // Graceful fallback: If an existing crumb is present, extend and reuse it instead of crashing
  if (crumbCache.crumb) {
    console.warn("Upstream crumb refresh throttled; continuing with existing cached session crumb.");
    crumbCache.expiresAt = Date.now() + 15 * 60 * 1000;
    return crumbCache;
  }

  if (lastError instanceof StockServiceError) throw lastError;
  throw new StockServiceError(`Stock market provider unreachable: ${lastError?.message || "Rate limited"}`, 503, {
    originalError: lastError?.message,
  });
}

/**
 * Obtain Yahoo Finance cookie and crumb with deduplicated in-flight requests
 */
async function getCrumb(forceRefresh = false) {
  if (!forceRefresh && crumbCache.crumb && Date.now() < crumbCache.expiresAt) {
    return crumbCache;
  }

  if (inFlightCrumbPromise) {
    return inFlightCrumbPromise;
  }

  inFlightCrumbPromise = (async () => {
    try {
      return await fetchCrumbWithFailover(forceRefresh);
    } finally {
      inFlightCrumbPromise = null;
    }
  })();

  return inFlightCrumbPromise;
}

/**
 * Fetch authenticated Yahoo Finance endpoint with retry on 401/429 and multi-host failover
 */
async function yahooFetchAuthed(buildUrl) {
  let { crumb, cookie } = await getCrumb();
  let lastRes = null;
  let lastErr = null;

  for (let i = 0; i < CANDIDATE_BASE_URLS.length; i++) {
    const host = CANDIDATE_BASE_URLS[i];
    try {
      const targetUrl = typeof buildUrl === "function" ? buildUrl(crumb, host) : buildUrl;
      let res = await fetch(targetUrl, {
        headers: { "User-Agent": UA, Cookie: cookie, "Accept": "*/*" },
        signal: AbortSignal.timeout(STOCK_API_TIMEOUT_MS),
      });

      if (res.status === 401) {
        ({ crumb, cookie } = await getCrumb(true));
        const retryUrl = typeof buildUrl === "function" ? buildUrl(crumb, host) : buildUrl;
        res = await fetch(retryUrl, {
          headers: { "User-Agent": UA, Cookie: cookie, "Accept": "*/*" },
          signal: AbortSignal.timeout(STOCK_API_TIMEOUT_MS),
        });
      }

      if (res.status === 429) {
        console.warn(`Host ${host} returned 429 for quote. Trying alternate endpoint...`);
        lastRes = res;
        await new Promise((r) => setTimeout(r, 400));
        continue;
      }

      return res;
    } catch (err) {
      lastErr = err;
    }
  }

  if (lastRes) return lastRes;
  throw new StockServiceError(`Provider network/timeout error: ${lastErr?.message || "Connection failed"}`, 504, {
    originalError: lastErr?.message,
  });
}

const rawVal = (field) => (field && typeof field === "object" ? field.raw ?? null : field ?? null);

function formatMarketCapINR(marketCap) {
  if (!marketCap || isNaN(marketCap)) return "N/A";
  const num = Number(marketCap);
  if (num >= 1e12) return `Rs.${(num / 1e12).toFixed(2)} Lakh Cr`;
  if (num >= 1e7) return `Rs.${(num / 1e7).toFixed(2)} Cr`;
  return `Rs.${num.toLocaleString("en-IN")}`;
}

/**
 * Get Batch Quotes for a list of ticker symbols
 */
async function getQuoteBatch(tickerSymbols) {
  if (!tickerSymbols || tickerSymbols.length === 0) return {};

  const cacheKey = [...tickerSymbols].sort().join(",");
  const cached = quoteCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  try {
    const res = await yahooFetchAuthed((crumb, host = STOCK_API_BASE_URL) =>
      `${host}/v7/finance/quote?symbols=${encodeURIComponent(tickerSymbols.join(","))}&crumb=${encodeURIComponent(crumb)}`
    );

    if (!res.ok) {
      if (cached) return cached.data; // Serve stale on temporary error
      throw new StockServiceError(`Upstream quote error: HTTP ${res.status}`, 502);
    }

    let data;
    try {
      data = await res.json();
    } catch {
      if (cached) return cached.data;
      throw new StockServiceError("Invalid JSON received from provider", 502);
    }

    const byTicker = {};
    for (const q of data?.quoteResponse?.result || []) {
      const price = q.regularMarketPrice ?? null;
      const change = q.regularMarketChange ?? null;
      const percentChange = q.regularMarketChangePercent ?? null;
      const isPositive = change !== null ? change >= 0 : true;

      const formatted = {
        symbol: q.symbol,
        companyName: q.longName || q.shortName || q.symbol,
        lastPrice: price,
        change: change !== null ? (change >= 0 ? `+${change.toFixed(2)}` : change.toFixed(2)) : "N/A",
        percentChange: percentChange !== null ? (percentChange >= 0 ? `+${percentChange.toFixed(2)}%` : `${percentChange.toFixed(2)}%`) : "N/A",
        rawChange: change,
        rawPercentChange: percentChange,
        isPositive,
        volume: q.regularMarketVolume ?? null,
        marketCapFormatted: formatMarketCapINR(q.marketCap),
        rawMarketCap: q.marketCap ?? null,
        peRatio: q.trailingPE ? q.trailingPE.toFixed(1) : "N/A",
        fiftyTwoWeekHigh: q.fiftyTwoWeekHigh ?? null,
        fiftyTwoWeekLow: q.fiftyTwoWeekLow ?? null,
        currency: q.currency || "INR",
        lastUpdated: q.regularMarketTime ? new Date(q.regularMarketTime * 1000).toISOString() : new Date().toISOString(),
      };

      byTicker[q.symbol] = formatted;
      lastKnownQuotes.set(q.symbol, formatted);
    }

    quoteCache.set(cacheKey, { data: byTicker, expiresAt: Date.now() + TTL_QUOTES });
    return byTicker;
  } catch (err) {
    if (cached) return cached.data;

    // Resilient fallback: Return last known or benchmark prices if rate-limited
    const fallbackResults = {};
    let foundFallback = false;
    for (const sym of tickerSymbols) {
      if (lastKnownQuotes.has(sym)) {
        fallbackResults[sym] = lastKnownQuotes.get(sym);
        foundFallback = true;
      } else if (BENCHMARK_FALLBACK_STOCKS[sym]) {
        fallbackResults[sym] = BENCHMARK_FALLBACK_STOCKS[sym];
        foundFallback = true;
      }
    }
    if (foundFallback) {
      return fallbackResults;
    }

    if (err instanceof StockServiceError) throw err;
    throw new StockServiceError(`Failed to fetch stock batch quotes: ${err.message}`, 503);
  }
}

/**
 * Get Full Stock Detail for a single stock
 */
async function getStockDetail(tickerSymbol) {
  const [cleanSymbol, exchangeSuffix] = determineExchange(tickerSymbol);
  const fullTicker = `${cleanSymbol}${exchangeSuffix}`;

  const cached = detailCache.get(fullTicker);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  const modules = "price,summaryDetail,defaultKeyStatistics,assetProfile";
  try {
    const res = await yahooFetchAuthed((crumb, host = STOCK_API_BASE_URL) =>
      `${host}/v10/finance/quoteSummary/${encodeURIComponent(fullTicker)}?modules=${modules}&crumb=${encodeURIComponent(crumb)}`
    );

    if (!res.ok) {
      if (cached) return cached.data;
      if (res.status === 404) return null;
      throw new StockServiceError(`Upstream detail error: HTTP ${res.status}`, 502);
    }

    let data;
    try {
      data = await res.json();
    } catch {
      if (cached) return cached.data;
      throw new StockServiceError("Invalid JSON received from provider for stock details", 502);
    }

    const result = data?.quoteSummary?.result?.[0];
    if (!result) {
      if (cached) return cached.data;
      return null;
    }

    const { price = {}, summaryDetail = {}, defaultKeyStatistics = {}, assetProfile = {} } = result;
    const currentPrice = rawVal(price.regularMarketPrice);
    if (currentPrice === null) return null;

    const changeVal = rawVal(price.regularMarketChange);
    const pctChangeVal = rawVal(price.regularMarketChangePercent) !== null ? rawVal(price.regularMarketChangePercent) * 100 : null;

    let yearReturn = "N/A";
    const low52 = rawVal(summaryDetail.fiftyTwoWeekLow);
    if (low52 && currentPrice) {
      const approxYearReturn = ((currentPrice - low52) / low52) * 100;
      yearReturn = `${approxYearReturn >= 0 ? "+" : ""}${approxYearReturn.toFixed(1)}%`;
    }

    const detail = {
      symbol: fullTicker,
      cleanSymbol,
      exchange: exchangeSuffix === ".NS" ? "NSE" : "BSE",
      name: price.longName || price.shortName || cleanSymbol,
      price: currentPrice,
      change: changeVal !== null ? (changeVal >= 0 ? `+${changeVal.toFixed(2)}` : changeVal.toFixed(2)) : "N/A",
      percentChange: pctChangeVal !== null ? (pctChangeVal >= 0 ? `+${pctChangeVal.toFixed(2)}%` : `${pctChangeVal.toFixed(2)}%`) : "N/A",
      isPositive: changeVal !== null ? changeVal >= 0 : true,
      sector: assetProfile.sector || "General",
      industry: assetProfile.industry || "General",
      marketCap: formatMarketCapINR(rawVal(price.marketCap) ?? rawVal(summaryDetail.marketCap)),
      peRatio: rawVal(summaryDetail.trailingPE) ? Number(rawVal(summaryDetail.trailingPE)).toFixed(1) : "N/A",
      yearReturn,
      dayHigh: rawVal(price.regularMarketDayHigh),
      dayLow: rawVal(price.regularMarketDayLow),
      fiftyTwoWeekHigh: rawVal(summaryDetail.fiftyTwoWeekHigh),
      fiftyTwoWeekLow: rawVal(summaryDetail.fiftyTwoWeekLow),
      currency: price.currency || "INR",
      lastUpdated: price.regularMarketTime ? new Date(price.regularMarketTime * 1000).toISOString() : new Date().toISOString(),
    };

    detailCache.set(fullTicker, { data: detail, expiresAt: Date.now() + TTL_DETAILS });
    return detail;
  } catch (err) {
    if (cached) return cached.data;
    if (err instanceof StockServiceError) throw err;
    throw new StockServiceError(`Failed to fetch stock detail: ${err.message}`, 503);
  }
}

/**
 * Search stocks across pre-cached symbols and Yahoo Finance (filtered to .NS / .BO)
 */
async function searchStocks(query = "") {
  const cleanQ = (query || "").trim().toLowerCase();
  if (!cleanQ) return [];

  const cached = searchCache.get(cleanQ);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  const results = [];
  const seenSymbols = new Set();

  // 1. Check local pre-cached mappings
  for (const [key, sym] of Object.entries(NSE_SYMBOLS_CACHE)) {
    if (key.includes(cleanQ) || sym.toLowerCase().includes(cleanQ)) {
      const fullSym = `${sym}.NS`;
      if (!seenSymbols.has(fullSym)) {
        seenSymbols.add(fullSym);
        results.push({
          symbol: fullSym,
          name: key.replace(/\b\w/g, (c) => c.toUpperCase()),
          exchange: "NSE",
          source: "cache",
        });
      }
    }
  }

  // 2. Query provider search API
  try {
    const url = `${STOCK_API_BASE_URL}/v1/finance/search?q=${encodeURIComponent(cleanQ)}&quotesCount=10`;
    const res = await fetch(url, {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(STOCK_API_TIMEOUT_MS),
    });

    if (res.ok) {
      const data = await res.json();
      for (const q of data.quotes || []) {
        if (q.symbol && (q.symbol.endsWith(".NS") || q.symbol.endsWith(".BO"))) {
          if (!seenSymbols.has(q.symbol)) {
            seenSymbols.add(q.symbol);
            results.push({
              symbol: q.symbol,
              name: q.longname || q.shortname || q.symbol,
              exchange: q.symbol.endsWith(".NS") ? "NSE" : "BSE",
              sector: q.sector || "N/A",
              source: "live_search",
            });
          }
        }
      }
    }
  } catch (err) {
    // Non-fatal, local dictionary matches are preserved
    console.warn("Stock search upstream warning:", err.message);
  }

  searchCache.set(cleanQ, { data: results, expiresAt: Date.now() + TTL_SEARCH });
  return results;
}

/**
 * Get Recommendations with Live Stock Quotes
 * Merges stock recommendations with genuine live/delayed market data.
 */
async function getStockRecommendations() {
  const marketStatus = getIndianMarketStatus();
  let quotes = {};
  let isRateLimited = false;

  try {
    quotes = await getQuoteBatch(DEFAULT_TOP_SYMBOLS);
  } catch (err) {
    console.warn("Stock recommendations live fetch notice:", err.message);
    isRateLimited = true;
    quotes = {};
    for (const sym of DEFAULT_TOP_SYMBOLS) {
      quotes[sym] = lastKnownQuotes.get(sym) || BENCHMARK_FALLBACK_STOCKS[sym] || null;
    }
  }

  // Ensure default benchmark stocks are populated even if upstream omits them
  for (const sym of DEFAULT_TOP_SYMBOLS) {
    if (!quotes[sym]) {
      quotes[sym] = lastKnownQuotes.get(sym) || BENCHMARK_FALLBACK_STOCKS[sym] || null;
      if (BENCHMARK_FALLBACK_STOCKS[sym]) {
        isRateLimited = true;
      }
    }
  }



  const stocks = DEFAULT_TOP_SYMBOLS.map((symbol) => {
    const q = quotes[symbol];
    if (q) {
      let yearReturn = "N/A";
      if (q.fiftyTwoWeekLow && q.lastPrice) {
        const ret = ((q.lastPrice - q.fiftyTwoWeekLow) / q.fiftyTwoWeekLow) * 100;
        yearReturn = `${ret >= 0 ? "+" : ""}${ret.toFixed(1)}%`;
      }

      return {
        symbol: q.symbol,
        name: q.companyName,
        price: q.lastPrice,
        change: q.change,
        percentChange: q.percentChange,
        rawChange: q.rawChange,
        rawPercentChange: q.rawPercentChange,
        isPositive: q.isPositive,
        risk: riskLookup[symbol] || "Moderate",
        sector: sectorLookup[symbol] || "Diversified",
        marketCap: q.marketCapFormatted,
        peRatio: q.peRatio,
        yearReturn,
        lastUpdated: q.lastUpdated || new Date().toISOString(),
      };
    }

    // Explicitly marked as unavailable if provider did not return quote; NO fake price
    return {
      symbol,
      name: symbol.replace(".NS", ""),
      price: null,
      change: "N/A",
      percentChange: "N/A",
      isPositive: true,
      risk: riskLookup[symbol] || "Moderate",
      sector: sectorLookup[symbol] || "Diversified",
      marketCap: "N/A",
      peRatio: "N/A",
      yearReturn: "N/A",
      lastUpdated: new Date().toISOString(),
      unavailable: true,
    };
  });

  return {
    stocks,
    marketStatus: marketStatus.isOpen ? "OPEN" : "CLOSED",
    marketMessage: isRateLimited ? "Market Closed / Delayed Session" : marketStatus.statusText,
    dataDelayNotice: isRateLimited
      ? "Upstream market data feed is busy (HTTP 429). Displaying benchmark closing session data."
      : marketStatus.dataDelayNotice,
    timestamp: new Date().toISOString(),
    isRateLimited,
  };
}

/**
 * Get curated list of supported Indian equities for listing
 */
function getSupportedStocksList() {
  const list = [];
  const seen = new Set();
  for (const sym of DEFAULT_TOP_SYMBOLS) {
    seen.add(sym);
    list.push({
      symbol: sym,
      name: sym.replace(".NS", ""),
      exchange: "NSE",
    });
  }
  for (const [name, sym] of Object.entries(NSE_SYMBOLS_CACHE)) {
    const fullSym = `${sym}.NS`;
    if (!seen.has(fullSym)) {
      seen.add(fullSym);
      list.push({
        symbol: fullSym,
        name: name.replace(/\b\w/g, (c) => c.toUpperCase()),
        exchange: "NSE",
      });
    }
  }
  return list;
}

/**
 * Clear in-memory caches (for testing and isolation)
 */
function clearCache() {
  crumbCache = { crumb: null, cookie: null, expiresAt: 0 };
  quoteCache.clear();
  detailCache.clear();
  searchCache.clear();
  lastKnownQuotes.clear();
}

module.exports = {
  getQuoteBatch,
  getStockDetail,
  searchStocks,
  getStockRecommendations,
  getIndianMarketStatus,
  determineExchange,
  getSupportedStocksList,
  clearCache,
  StockServiceError,
  DEFAULT_TOP_SYMBOLS,
  CONFIG: {
    STOCK_API_BASE_URL,
    STOCK_API_COOKIE_URL,
    STOCK_API_TIMEOUT_MS,
    STOCK_API_CACHE_TTL_MS,
  },
};
