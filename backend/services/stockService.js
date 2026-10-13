/**
 * Stock Service - Indian Stock Market API Integration
 * Based on: https://github.com/0xramm/Indian-Stock-Market-API
 * Directly connects to NSE/BSE stock data via Yahoo Finance endpoint engine.
 * Includes in-memory caching, rate-limit protection, configurable timeouts, and market status detection.
 */

// Configurable provider settings via environment variables
const STOCK_API_BASE_URL = process.env.STOCK_API_BASE_URL || "https://query1.finance.yahoo.com";
const STOCK_API_COOKIE_URL = process.env.STOCK_API_COOKIE_URL || "https://fc.yahoo.com";
const STOCK_API_TIMEOUT_MS = parseInt(process.env.STOCK_API_TIMEOUT_MS, 10) || 7000;
const STOCK_API_CACHE_TTL_MS = parseInt(process.env.STOCK_API_CACHE_TTL_MS, 10) || 60000;

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

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

// Popular NSE symbol mappings from 0xramm/Indian-Stock-Market-API
const NSE_SYMBOLS_CACHE = {
  "reliance": "RELIANCE",
  "reliance industries": "RELIANCE",
  "tcs": "TCS",
  "tata consultancy": "TCS",
  "infosys": "INFY",
  "infy": "INFY",
  "hdfc bank": "HDFCBANK",
  "hdfc": "HDFCBANK",
  "icici bank": "ICICIBANK",
  "icici": "ICICIBANK",
  "itc": "ITC",
  "bharti airtel": "BHARTIARTL",
  "airtel": "BHARTIARTL",
  "sbi": "SBIN",
  "state bank": "SBIN",
  "state bank of india": "SBIN",
  "wipro": "WIPRO",
  "hindustan unilever": "HINDUNILVR",
  "hul": "HINDUNILVR",
  "maruti": "MARUTI",
  "maruti suzuki": "MARUTI",
  "asian paints": "ASIANPAINT",
  "bajaj finance": "BAJFINANCE",
  "titan": "TITAN",
  "larsen toubro": "LT",
  "lt": "LT",
  "l&t": "LT",
  "ongc": "ONGC",
  "ntpc": "NTPC",
  "power grid": "POWERGRID",
  "coal india": "COALINDIA",
  "adani": "ADANIENT",
  "adani enterprises": "ADANIENT",
  "sun pharma": "SUNPHARMA",
  "dr reddy": "DRREDDY",
  "cipla": "CIPLA",
  "mahindra": "M&M",
  "m&m": "M&M",
  "tata motors": "TATAMOTORS",
};

// Default tracked recommendation symbols for the FinAI Investments UI
const DEFAULT_TOP_SYMBOLS = [
  "RELIANCE.NS",
  "HDFCBANK.NS",
  "TCS.NS",
  "INFY.NS",
  "ICICIBANK.NS",
  "TATAMOTORS.NS",
  "SBIN.NS",
  "BHARTIARTL.NS",
  "ITC.NS",
  "BAJFINANCE.NS",
  "HINDUNILVR.NS",
  "LT.NS",
];

// In-memory caches
let crumbCache = { crumb: null, cookie: null, expiresAt: 0 };
const quoteCache = new Map(); // key -> { data, expiresAt }
const detailCache = new Map(); // key -> { data, expiresAt }
const searchCache = new Map(); // key -> { data, expiresAt }

// Cache TTL configuration
const TTL_QUOTES = STOCK_API_CACHE_TTL_MS; // default 60s
const TTL_DETAILS = 120 * 1000; // 2 minutes
const TTL_SEARCH = 300 * 1000; // 5 minutes

/**
 * Determine exchange suffix (.NS for NSE, .BO for BSE)
 */
function determineExchange(symbolInput = "") {
  const symbol = (symbolInput || "").toUpperCase().trim();
  if (symbol.endsWith(".NS")) return [symbol.slice(0, -3), ".NS"];
  if (symbol.endsWith(".BO")) return [symbol.slice(0, -3), ".BO"];
  return [symbol, ".NS"];
}

/**
 * Check Indian Stock Market Status (NSE / BSE)
 * Market Trading Hours: Mon-Fri 09:15 to 15:30 IST (UTC+5:30)
 */
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

/**
 * Obtain Yahoo Finance cookie and crumb
 */
async function getCrumb(forceRefresh = false) {
  if (!forceRefresh && crumbCache.crumb && Date.now() < crumbCache.expiresAt) {
    return crumbCache;
  }

  try {
    const cookieRes = await fetch(STOCK_API_COOKIE_URL, {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(STOCK_API_TIMEOUT_MS),
    });
    const setCookie = cookieRes.headers.get("set-cookie") || "";
    const cookie = setCookie.split(";")[0] || "";

    const crumbRes = await fetch(`${STOCK_API_BASE_URL}/v1/test/getcrumb`, {
      headers: { "User-Agent": UA, Cookie: cookie },
      signal: AbortSignal.timeout(STOCK_API_TIMEOUT_MS),
    });

    if (!crumbRes.ok) {
      throw new StockServiceError(`Failed to fetch crumb from provider: HTTP ${crumbRes.status}`, 502);
    }

    const crumb = (await crumbRes.text()).trim();
    if (!crumb) {
      throw new StockServiceError("Received empty authentication crumb from provider", 502);
    }

    crumbCache = {
      crumb,
      cookie,
      expiresAt: Date.now() + 50 * 60 * 1000, // 50 mins
    };
    return crumbCache;
  } catch (err) {
    if (crumbCache.crumb) {
      return crumbCache;
    }
    if (err instanceof StockServiceError) throw err;
    throw new StockServiceError(`Stock market provider unreachable: ${err.message}`, 503, { originalError: err.message });
  }
}

/**
 * Fetch authenticated Yahoo Finance endpoint with retry on 401
 */
async function yahooFetchAuthed(buildUrl) {
  let { crumb, cookie } = await getCrumb();
  let res;
  try {
    res = await fetch(buildUrl(crumb), {
      headers: { "User-Agent": UA, Cookie: cookie },
      signal: AbortSignal.timeout(STOCK_API_TIMEOUT_MS),
    });
  } catch (err) {
    throw new StockServiceError(`Provider network/timeout error: ${err.message}`, 504, { originalError: err.message });
  }

  if (res.status === 401) {
    ({ crumb, cookie } = await getCrumb(true));
    try {
      res = await fetch(buildUrl(crumb), {
        headers: { "User-Agent": UA, Cookie: cookie },
        signal: AbortSignal.timeout(STOCK_API_TIMEOUT_MS),
      });
    } catch (err) {
      throw new StockServiceError(`Provider network/timeout error on retry: ${err.message}`, 504, { originalError: err.message });
    }
  }

  return res;
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
    const res = await yahooFetchAuthed((crumb) =>
      `${STOCK_API_BASE_URL}/v7/finance/quote?symbols=${encodeURIComponent(tickerSymbols.join(","))}&crumb=${encodeURIComponent(crumb)}`
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

      byTicker[q.symbol] = {
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
    }

    quoteCache.set(cacheKey, { data: byTicker, expiresAt: Date.now() + TTL_QUOTES });
    return byTicker;
  } catch (err) {
    if (cached) return cached.data;
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
    const res = await yahooFetchAuthed((crumb) =>
      `${STOCK_API_BASE_URL}/v10/finance/quoteSummary/${encodeURIComponent(fullTicker)}?modules=${modules}&crumb=${encodeURIComponent(crumb)}`
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
  const quotes = await getQuoteBatch(DEFAULT_TOP_SYMBOLS);

  const riskLookup = {
    "RELIANCE.NS": "Medium Risk",
    "HDFCBANK.NS": "Medium Risk",
    "TCS.NS": "Medium Risk",
    "INFY.NS": "Low - Medium Risk",
    "ICICIBANK.NS": "Medium Risk",
    "TATAMOTORS.NS": "High Risk",
    "SBIN.NS": "Medium Risk",
    "BHARTIARTL.NS": "Medium Risk",
    "ITC.NS": "Low - Medium Risk",
    "BAJFINANCE.NS": "Medium - High Risk",
    "HINDUNILVR.NS": "Low Risk",
    "LT.NS": "Medium Risk",
  };

  const sectorLookup = {
    "RELIANCE.NS": "Conglomerate / Energy",
    "HDFCBANK.NS": "Banking & Finance",
    "TCS.NS": "IT Services",
    "INFY.NS": "IT Services",
    "ICICIBANK.NS": "Banking & Finance",
    "TATAMOTORS.NS": "Automotive",
    "SBIN.NS": "Public Sector Banking",
    "BHARTIARTL.NS": "Telecom",
    "ITC.NS": "FMCG / Conglomerate",
    "BAJFINANCE.NS": "Financial Services (NBFC)",
    "HINDUNILVR.NS": "Consumer Goods (FMCG)",
    "LT.NS": "Infrastructure / Engineering",
  };

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
        lastUpdated: q.lastUpdated,
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
    marketMessage: marketStatus.statusText,
    dataDelayNotice: marketStatus.dataDelayNotice,
    timestamp: new Date().toISOString(),
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
