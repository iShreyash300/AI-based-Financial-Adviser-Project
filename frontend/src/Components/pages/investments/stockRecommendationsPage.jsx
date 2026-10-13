import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Stack,
  Container,
  Paper,
  Chip,
  Divider,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";

const formatCurrency = (val) => {
  if (val === null || val === undefined || isNaN(val)) return "N/A";
  return Number(val).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
};

const INITIAL_CARD_COUNT = 6;

const StockRecommendationsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [marketInfo, setMarketInfo] = useState({
    status: "CLOSED",
    message: "Market Closed",
    delayNotice: "Data is delayed by ~15 minutes or reflects the last closing session.",
  });
  const [selectedStock, setSelectedStock] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchTimeoutRef = useRef(null);

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
      setError(
        err.response?.data?.message ||
          "Unable to connect to live stock market feed. Please check your connection and try refreshing."
      );
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
          // If we got matching symbols, fetch batch quotes for top 12 search results
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
    setIsExpanded(false); // Reset expansion state when searching
  };

  // Compile raw list: either search results or loaded recommendations
  const rawStockList = (() => {
    const query = searchTerm.trim().toLowerCase();
    if (query.length >= 2 && searchResults.length > 0) {
      return searchResults;
    }
    if (query.length >= 2 && searchResults.length === 0 && !searching) {
      // User typed something but no search API results, try filtering loaded stocks
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

  // Display only first 6 if not expanded; show all if expanded
  const hasMoreStocks = uniqueStocks.length > INITIAL_CARD_COUNT;
  const visibleStocks = isExpanded ? uniqueStocks : uniqueStocks.slice(0, INITIAL_CARD_COUNT);

  const isMarketOpen = marketInfo.status === "OPEN";

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
            background: isMarketOpen ? "linear-gradient(90deg, #F0FDF4 0%, #DCFCE7 100%)" : "linear-gradient(90deg, #FFFBEB 0%, #FEF3C7 100%)",
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
              {searchTerm.trim()
                ? `We couldn't find any Indian equities matching "${searchTerm}". Try searching by ticker symbol (e.g. RELIANCE, TCS, INFY) or company name.`
                : "No stock market data is currently available. Please click Refresh to reload."}
            </Typography>
            {searchTerm.trim() && (
              <Button
                variant="text"
                onClick={() => setSearchTerm("")}
                sx={{ mt: 2, color: "#7B61FF", fontWeight: 700, textTransform: "none" }}
              >
                Clear Search
              </Button>
            )}
          </Paper>
        )}

        {/* Stock List Grid */}
        {!loading && visibleStocks.length > 0 && (
          <>
            <Grid container spacing={3} alignItems="stretch" sx={{ justifyContent: "space-around" }}>
              {visibleStocks.map((stock, idx) => {
                const isPos = stock.isPositive !== false;
                const changeColor = isPos ? "#00C853" : "#EF4444";

                return (
                  <Grid item xs={12} md={6} lg={4} key={stock.symbol || idx} sx={{ display: "flex" }}>
                    <Paper
                      sx={{
                        p: 3,
                        borderRadius: "18px",
                        border: "1px solid #eef2f6",
                        background: "#fff",
                        boxShadow: "0px 4px 20px rgba(0,0,0,0.03)",
                        transition: "transform 0.2s, boxShadow 0.2s",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        width: "100%",
                        minHeight: "270px",
                        "&:hover": {
                          transform: "translateY(-3px)",
                          boxShadow: "0px 8px 25px rgba(123, 97, 255, 0.1)",
                        },
                      }}
                    >
                      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                        <Stack
                          sx={{
                            mb: 1.5,
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            flexDirection: "row",
                            minHeight: "44px",
                          }}
                        >
                          <Box sx={{ pr: 1, overflow: "hidden" }}>
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 800,
                                color: "#1e293b",
                                fontSize: "1rem",
                                lineHeight: 1.2,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {stock.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, display: "block", mt: 0.3 }}>
                              {stock.symbol} • {stock.sector || "General"}
                            </Typography>
                          </Box>
                          <Chip
                            label={stock.risk || "Moderate"}
                            size="small"
                            sx={{
                              background: "rgba(123, 97, 255, 0.1)",
                              color: "#7B61FF",
                              fontWeight: 700,
                              whiteSpace: "nowrap",
                              flexShrink: 0,
                            }}
                          />
                        </Stack>

                        <Divider sx={{ my: 1.5 }} />

                        <Grid container spacing={2} sx={{ mb: 2, flex: 1, alignItems: "center", justifyContent: "space-between" }}>
                          <Grid item xs={6}>
                            <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>
                              Current Price
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: "#1e293b", fontSize: "1.1rem" }}>
                              {formatCurrency(stock.price)}
                            </Typography>
                            <Stack direction="row" spacing={0.3} alignItems="center">
                              {isPos ? (
                                <ArrowUpwardIcon sx={{ fontSize: 13, color: changeColor }} />
                              ) : (
                                <ArrowDownwardIcon sx={{ fontSize: 13, color: changeColor }} />
                              )}
                              <Typography variant="caption" sx={{ fontWeight: 700, color: changeColor }}>
                                {stock.change} ({stock.percentChange})
                              </Typography>
                            </Stack>
                          </Grid>
                          <Grid item xs={6} sx={{ textAlign: "right" }}>
                            <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>
                              1 Year Return
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: "#00C853", fontSize: "1.1rem" }}>
                              {stock.yearReturn || "N/A"}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#64748b" }}>
                              P/E: {stock.peRatio || "N/A"}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>

                      <Stack sx={{ flexDirection: "row", gap: 1.5, width: "100%", mt: "auto", pt: 1 }}>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => setSelectedStock(stock)}
                          sx={{
                            borderRadius: "10px",
                            borderColor: "#7B61FF",
                            color: "#7B61FF",
                            fontWeight: 700,
                            textTransform: "none",
                            whiteSpace: "nowrap",
                            px: 1.5,
                            fontSize: "0.85rem",
                            height: "40px",
                          }}
                        >
                          View Details
                        </Button>
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={() => setSelectedStock(stock)}
                          sx={{
                            background: "linear-gradient(135deg, #5B5FEF 0%, #7B61FF 100%)",
                            borderRadius: "10px",
                            fontWeight: 700,
                            textTransform: "none",
                            whiteSpace: "nowrap",
                            px: 1.5,
                            fontSize: "0.85rem",
                            height: "40px",
                          }}
                        >
                          Buy Stock
                        </Button>
                      </Stack>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>

            {/* See More / Show Less Button */}
            {hasMoreStocks && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4, mb: 2 }}>
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
                    : `See More (${uniqueStocks.length - INITIAL_CARD_COUNT} More Stocks)`}
                </Button>
              </Box>
            )}
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
              onClick={() => setSelectedStock(null)}
              sx={{ background: "linear-gradient(135deg, #5B5FEF 0%, #7B61FF 100%)", borderRadius: "10px" }}
            >
              Simulate Buy Order
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default StockRecommendationsPage;
