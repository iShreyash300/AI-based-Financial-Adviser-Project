import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Container,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  Pagination,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RefreshIcon from "@mui/icons-material/Refresh";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import StockRecommendationCard from "../../investments/StockRecommendationCard";
import StockBuyModal from "../../investments/StockBuyModal";

const formatCurrency = (val) => {
  if (val === null || val === undefined || isNaN(val)) return "N/A";
  return Number(val).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
};

const INITIAL_CARD_COUNT = 6;

const CATEGORY_TABS = [
  { id: "ALL", label: "All Equities" },
  { id: "TECH", label: "Technology" },
  { id: "BANKING", label: "Banking & Finance" },
  { id: "ENERGY", label: "Energy & Auto" },
  { id: "WATCHLIST", label: "My Watchlist" },
];

const StockRecommendationsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [marketInfo, setMarketInfo] = useState({
    status: "CLOSED",
    message: "Market Closed",
    delayNotice: "Data is delayed by ~15 minutes or reflects the last closing session.",
  });

  // Modal states
  const [selectedStock, setSelectedStock] = useState(null);
  const [buyStock, setBuyStock] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Live search state
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchTimeoutRef = useRef(null);

  // User Watchlist stored in localStorage
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem("user_stock_watchlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleToggleWatchlist = (stock) => {
    const symbol = typeof stock === "string" ? stock : stock.symbol;
    setWatchlist((prev) => {
      const updated = prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol];
      try {
        localStorage.setItem("user_stock_watchlist", JSON.stringify(updated));
      } catch (err) {
        console.warn("Unable to save watchlist to localStorage", err);
      }
      return updated;
    });
  };

  const fetchStocks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/stocks/recommendations");
      if (res.data?.success && res.data?.data) {
        setStocks(res.data.data.stocks || []);
        setMarketInfo({
          status: res.data.data.marketStatus || "CLOSED",
          message: res.data.data.marketMessage || "Market Closed",
          delayNotice: res.data.data.dataDelayNotice || "Data is delayed by ~15m.",
        });
      } else {
        setStocks([]);
        setError("Failed to retrieve stock market recommendations from server.");
      }
    } catch (err) {
      console.error("Unable to fetch live stock data:", err);
      const rawMsg = err.response?.data?.message || "";
      let friendlyMsg =
        rawMsg ||
        "Unable to connect to live stock market feed. Please check your connection and try refreshing.";
      if (/429|crumb|rate limit/i.test(rawMsg)) {
        friendlyMsg =
          "The stock market data provider is temporarily rate-limiting requests (HTTP 429). Please wait a few seconds and click Retry.";
      }
      setError(friendlyMsg);
      setStocks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  // Live search debouncing
  useEffect(() => {
    const query = searchTerm.trim();
    if (!query || query.length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setSearching(true);
        const res = await api.get(`/stocks/search?q=${encodeURIComponent(query)}`);
        if (res.data?.success && Array.isArray(res.data.data)) {
          const found = res.data.data.slice(0, 12);
          if (found.length > 0) {
            const symbols = found.map((f) => f.symbol).join(",");
            const quotesRes = await api.get(`/stocks/quotes?symbols=${encodeURIComponent(symbols)}`);
            const quotesMap = quotesRes.data?.data?.quotes || {};

            const merged = found.map((f) => {
              const q = quotesMap[f.symbol];
              return {
                symbol: f.symbol,
                name: q?.companyName || f.name,
                price: q?.lastPrice ?? null,
                change: q?.change ?? "0.00",
                percentChange: q?.percentChange ?? "0.00%",
                isPositive: q?.isPositive ?? true,
                risk: "Moderate",
                sector: f.sector || "General",
                yearReturn: "N/A",
                marketCap: q?.marketCapFormatted || "N/A",
                peRatio: q?.peRatio || "N/A",
              };
            });
            setSearchResults(merged);
          } else {
            setSearchResults([]);
          }
        }
      } catch (e) {
        console.warn("Live search warning:", e.message);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setIsExpanded(false);
    setCurrentPage(1);
  };

  // Compile raw list: either search results or loaded recommendations
  const rawStockList = (() => {
    const query = searchTerm.trim().toLowerCase();
    if (query.length >= 2 && searchResults.length > 0) {
      return searchResults;
    }
    if (query.length >= 2 && searchResults.length === 0 && !searching) {
      return stocks.filter(
        (s) =>
          s.name?.toLowerCase().includes(query) ||
          s.symbol?.toLowerCase().includes(query) ||
          (s.sector && s.sector.toLowerCase().includes(query))
      );
    }
    return stocks;
  })();

  // Deduplicate stocks so each stock appears strictly once
  const uniqueStocks = [];
  const seenSymbols = new Set();
  for (const s of rawStockList) {
    if (s.symbol && !seenSymbols.has(s.symbol)) {
      seenSymbols.add(s.symbol);
      uniqueStocks.push(s);
    }
  }

  // Category Filtering
  const filteredStocks = uniqueStocks.filter((stock) => {
    if (activeCategory === "ALL") return true;
    if (activeCategory === "WATCHLIST") return watchlist.includes(stock.symbol);
    const sec = (stock.sector || "").toLowerCase();
    if (activeCategory === "TECH") {
      return sec.includes("tech") || sec.includes("software") || sec.includes("it");
    }
    if (activeCategory === "BANKING") {
      return sec.includes("bank") || sec.includes("finance");
    }
    if (activeCategory === "ENERGY") {
      return sec.includes("energy") || sec.includes("oil") || sec.includes("auto");
    }
    return true;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredStocks.length / INITIAL_CARD_COUNT) || 1;
  const hasMoreStocks = filteredStocks.length > INITIAL_CARD_COUNT;
  const visibleStocks = isExpanded
    ? filteredStocks
    : filteredStocks.slice((currentPage - 1) * INITIAL_CARD_COUNT, currentPage * INITIAL_CARD_COUNT);

  const isMarketOpen = marketInfo.status === "OPEN";

  const handleOrderSuccess = (order) => {
    setSnackbarMessage(
      `Simulated buy order placed for ${order.quantity} shares of ${order.symbol} (${formatCurrency(
        order.totalAmount
      )})!`
    );
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, background: "#f5f7fb", minHeight: "100vh" }}>
      <Container maxWidth="xl" disableGutters>
        {/* Navigation / Header */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/investments")}
            sx={{ color: "#7B61FF", textTransform: "none", fontWeight: 700 }}
          >
            Back to Dashboard
          </Button>
        </Stack>

        <Stack
          sx={{
            mb: 2.5,
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#111827" }}>
              Stock Market Recommendations
            </Typography>
            <Typography variant="body1" sx={{ color: "#6b7280", mt: 0.5 }}>
              Genuine Indian equities (NSE & BSE) data powered by Indian Stock Market API
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: { xs: "100%", sm: "auto" } }}>
            <TextField
              placeholder="Search by company name, symbol or sector..."
              value={searchTerm}
              onChange={handleSearchChange}
              size="small"
              sx={{ width: { xs: "100%", sm: 340 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {searching ? <CircularProgress size={18} color="inherit" /> : <SearchIcon color="action" />}
                  </InputAdornment>
                ),
                sx: { borderRadius: "12px", background: "#fff" },
              }}
            />
            <IconButton
              onClick={fetchStocks}
              disabled={loading}
              sx={{
                background: "#fff",
                border: "1px solid #eef2f6",
                borderRadius: "12px",
                "&:hover": { background: "#f0f0ff" },
              }}
              title="Refresh Quotes"
            >
              <RefreshIcon sx={{ color: "#7B61FF" }} />
            </IconButton>
          </Stack>
        </Stack>

        {/* Market Status & Data Notice Banner */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: "14px",
            background: isMarketOpen
              ? "linear-gradient(90deg, #F0FDF4 0%, #DCFCE7 100%)"
              : "linear-gradient(90deg, #FFFBEB 0%, #FEF3C7 100%)",
            border: `1px solid ${isMarketOpen ? "#BBF7D0" : "#FDE68A"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1.5,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip
              label={isMarketOpen ? "NSE/BSE Open" : "NSE/BSE Closed"}
              size="small"
              sx={{
                background: isMarketOpen ? "#16A34A" : "#D97706",
                color: "#fff",
                fontWeight: 700,
                fontSize: "12px",
              }}
            />
            <Typography variant="body2" sx={{ fontWeight: 600, color: isMarketOpen ? "#14532D" : "#78350F" }}>
              {marketInfo.message} • {marketInfo.delayNotice}
            </Typography>
          </Stack>

          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500 }}>
            Exchange Hours: Mon–Fri, 9:15 AM – 3:30 PM IST (Prices delayed by ~15m)
          </Typography>
        </Paper>

        {/* Category Tabs / Gallery Filter Bar */}
        {!loading && !error && uniqueStocks.length > 0 && (
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              mb: 3,
              overflowX: "auto",
              pb: 0.5,
              "&::-webkit-scrollbar": { height: 4 },
              "&::-webkit-scrollbar-thumb": { background: "#CBD5E1", borderRadius: 2 },
            }}
          >
            {CATEGORY_TABS.map((tab) => {
              const isActive = activeCategory === tab.id;
              const isWatchlistTab = tab.id === "WATCHLIST";
              const count = isWatchlistTab ? watchlist.length : null;

              return (
                <Chip
                  key={tab.id}
                  label={count !== null ? `${tab.label} (${count})` : tab.label}
                  icon={isWatchlistTab ? <BookmarkIcon sx={{ fontSize: 16 }} /> : undefined}
                  onClick={() => {
                    setActiveCategory(tab.id);
                    setIsExpanded(false);
                    setCurrentPage(1);
                  }}
                  variant={isActive ? "filled" : "outlined"}
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    px: 0.5,
                    py: 1.8,
                    cursor: "pointer",
                    borderRadius: "10px",
                    background: isActive ? "linear-gradient(135deg, #5B5FEF 0%, #7B61FF 100%)" : "#FFFFFF",
                    color: isActive ? "#FFFFFF" : "#475569",
                    borderColor: isActive ? "transparent" : "#E2E8F0",
                    boxShadow: isActive ? "0 2px 8px rgba(123, 97, 255, 0.25)" : "none",
                    "&:hover": {
                      background: isActive
                        ? "linear-gradient(135deg, #4F46E5 0%, #6D28D9 100%)"
                        : "#F8FAFC",
                    },
                  }}
                />
              );
            })}
          </Stack>
        )}

        {/* Error Alert State */}
        {error && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={fetchStocks} sx={{ fontWeight: 700 }}>
                Retry
              </Button>
            }
            sx={{ mb: 3, borderRadius: "12px" }}
          >
            {error}
          </Alert>
        )}

        {/* Loading Indicator */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 6 }}>
            <CircularProgress sx={{ color: "#7B61FF" }} />
          </Box>
        )}

        {/* Empty State */}
        {!loading && !error && visibleStocks.length === 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 5,
              borderRadius: "18px",
              textAlign: "center",
              background: "#fff",
              border: "1px dashed #cbd5e1",
              my: 4,
            }}
          >
            <SearchIcon sx={{ fontSize: 48, color: "#94a3b8", mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#334155", mb: 0.5 }}>
              No stocks found
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", maxWidth: 450, mx: "auto" }}>
              {activeCategory === "WATCHLIST"
                ? "You haven't bookmarked any stocks yet. Click the bookmark icon on any stock card to build your personal watchlist."
                : searchTerm.trim()
                  ? `We couldn't find any Indian equities matching "${searchTerm}". Try searching by ticker symbol (e.g. RELIANCE, TCS, INFY) or company name.`
                  : "No stock market data is currently available. Please click Refresh to reload."}
            </Typography>
            {activeCategory === "WATCHLIST" ? (
              <Button
                variant="text"
                onClick={() => setActiveCategory("ALL")}
                sx={{ mt: 2, color: "#7B61FF", fontWeight: 700, textTransform: "none" }}
              >
                Browse All Equities
              </Button>
            ) : searchTerm.trim() ? (
              <Button
                variant="text"
                onClick={() => setSearchTerm("")}
                sx={{ mt: 2, color: "#7B61FF", fontWeight: 700, textTransform: "none" }}
              >
                Clear Search
              </Button>
            ) : null}
          </Paper>
        )}

        {/* Stock Gallery Grid */}
        {!loading && visibleStocks.length > 0 && (
          <>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                },
                gap: 3,
                width: "100%",
                alignItems: "stretch",
              }}
            >
              {visibleStocks.map((stock, idx) => (
                <Box
                  key={stock.symbol || idx}
                  sx={{
                    width: "100%",
                    display: "flex",
                  }}
                >
                  <StockRecommendationCard
                    stock={stock}
                    onViewDetails={(s) => setSelectedStock(s)}
                    onBuyStock={(s) => setBuyStock(s)}
                    isWatchlisted={watchlist.includes(stock.symbol)}
                    onToggleWatchlist={handleToggleWatchlist}
                    customFormatCurrency={formatCurrency}
                  />
                </Box>
              ))}
            </Box>

            {/* Pagination & Expansion Controls */}
            <Stack
              sx={{
                mt: 4,
                mb: 2,
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: totalPages > 1 && !isExpanded ? "space-between" : "center",
                alignItems: "center",
                gap: 2,
              }}
            >
              {totalPages > 1 && !isExpanded && (
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(e, value) => {
                    setCurrentPage(value);
                    window.scrollTo({ top: 250, behavior: "smooth" });
                  }}
                  color="primary"
                  shape="rounded"
                  size="medium"
                  sx={{
                    "& .MuiPaginationItem-root": {
                      fontWeight: 700,
                      borderRadius: "10px",
                    },
                    "& .Mui-selected": {
                      background: "linear-gradient(135deg, #5B5FEF 0%, #7B61FF 100%) !important",
                      color: "#fff",
                    },
                  }}
                />
              )}

              {hasMoreStocks && (
                <Button
                  variant="outlined"
                  onClick={() => setIsExpanded((prev) => !prev)}
                  endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  sx={{
                    borderColor: "#7B61FF",
                    color: "#7B61FF",
                    fontWeight: 700,
                    textTransform: "none",
                    borderRadius: "12px",
                    px: 3.5,
                    py: 1.2,
                    fontSize: "0.95rem",
                    background: "#fff",
                    boxShadow: "0px 2px 8px rgba(123, 97, 255, 0.08)",
                    "&:hover": {
                      background: "rgba(123, 97, 255, 0.05)",
                      borderColor: "#5B5FEF",
                    },
                  }}
                >
                  {isExpanded
                    ? "Show Less"
                    : `See More (${filteredStocks.length - INITIAL_CARD_COUNT} More Stocks)`}
                </Button>
              )}
            </Stack>
          </>
        )}

        {/* Modal for Details */}
        <Dialog
          open={Boolean(selectedStock)}
          onClose={() => setSelectedStock(null)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: "20px", p: 1 } }}
        >
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box sx={{ overflow: "hidden", pr: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {selectedStock?.name} ({selectedStock?.symbol})
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b" }}>
                {marketInfo.message} • Delayed by ~15m
              </Typography>
            </Box>
            <IconButton onClick={() => setSelectedStock(null)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ borderBottom: "none" }}>
            <Stack sx={{ gap: 2 }}>
              <Box sx={{ p: 2, borderRadius: "12px", background: "#f8fafc" }}>
                <Stack sx={{ flexDirection: "row", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Current Price</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{formatCurrency(selectedStock?.price)}</Typography>
                </Stack>
                <Stack sx={{ flexDirection: "row", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Price Change</Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      color: selectedStock?.isPositive !== false ? "#10B981" : "#EF4444",
                    }}
                  >
                    {selectedStock?.change} ({selectedStock?.percentChange})
                  </Typography>
                </Stack>
                <Stack sx={{ flexDirection: "row", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Market Cap</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{selectedStock?.marketCap || "N/A"}</Typography>
                </Stack>
                <Stack sx={{ flexDirection: "row", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Sector</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{selectedStock?.sector || "General"}</Typography>
                </Stack>
                <Stack sx={{ flexDirection: "row", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">P/E Ratio</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{selectedStock?.peRatio || "N/A"}</Typography>
                </Stack>
                <Stack sx={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">Risk Grade</Typography>
                  <Chip label={selectedStock?.risk || "Moderate"} size="small" color="primary" />
                </Stack>
              </Box>

              <Box sx={{ p: 2, borderRadius: "12px", background: "#ecfdf5", border: "1px solid #a7f3d0" }}>
                <Stack sx={{ flexDirection: "row", gap: 1, alignItems: "center", mb: 0.5 }}>
                  <CheckCircleIcon sx={{ color: "#059669", fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#065f46" }}>
                    Market Intelligence Summary
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ color: "#047857", fontSize: "0.85rem" }}>
                  Large-cap Indian equity traded on NSE/BSE. Data reflects the latest delayed trading session. Evaluate against your asset allocation plan before investing.
                </Typography>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setSelectedStock(null)}>Close</Button>
            <Button
              variant="contained"
              onClick={() => {
                const target = selectedStock;
                setSelectedStock(null);
                setBuyStock(target);
              }}
              sx={{ background: "linear-gradient(135deg, #5B5FEF 0%, #7B61FF 100%)", borderRadius: "10px" }}
            >
              Simulate Buy Order
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal for Simulated Buy Order */}
        <StockBuyModal
          open={Boolean(buyStock)}
          stock={buyStock}
          onClose={() => setBuyStock(null)}
          onOrderPlaced={handleOrderSuccess}
        />

        {/* Notification Toast */}
        <Snackbar
          open={Boolean(snackbarMessage)}
          autoHideDuration={4000}
          onClose={() => setSnackbarMessage("")}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={() => setSnackbarMessage("")} severity="success" sx={{ width: "100%", borderRadius: "12px" }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default StockRecommendationsPage;
