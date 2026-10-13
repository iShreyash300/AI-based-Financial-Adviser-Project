import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Stack,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
} from "@mui/material";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloseIcon from "@mui/icons-material/Close";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const formatCurrency = (val) => {
  if (val === null || val === undefined || isNaN(val)) return "N/A";
  return Number(val).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
};

const StockCard = ({ stocks: initialStocks }) => {
  const navigate = useNavigate();
  const [stocks, setStocks] = useState(initialStocks || []);
  const [loading, setLoading] = useState(!initialStocks);
  const [marketStatus, setMarketStatus] = useState("CLOSED");
  const [selectedStock, setSelectedStock] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (initialStocks && initialStocks.length > 0) {
      setStocks(initialStocks);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchLiveStocks = async () => {
      try {
        setLoading(true);
        const res = await api.get("/stocks/recommendations");
        if (isMounted && res.data?.success && res.data?.data?.stocks) {
          setStocks(res.data.data.stocks.slice(0, 3));
          setMarketStatus(res.data.data.marketStatus || "CLOSED");
        }
      } catch (err) {
        console.warn("Unable to fetch live stock data:", err.message);
        if (isMounted) {
          setStocks([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLiveStocks();
    return () => {
      isMounted = false;
    };
  }, [initialStocks]);

  const handleStockClick = (stock) => {
    setSelectedStock(stock);
    setDialogOpen(true);
  };

  const stockLogos = {
    "RELIANCE.NS": { bg: "#0F172A", text: "R" },
    "HDFCBANK.NS": { bg: "#DC2626", text: "H" },
    "TCS.NS": { bg: "#7C3AED", text: "T" },
    "INFY.NS": { bg: "#0284C7", text: "I" },
    "ICICIBANK.NS": { bg: "#EA580C", text: "I" },
    "TATAMOTORS.NS": { bg: "#2563EB", text: "T" },
    "SBIN.NS": { bg: "#0D9488", text: "S" },
    "BHARTIARTL.NS": { bg: "#E11D48", text: "B" },
    "ITC.NS": { bg: "#CA8A04", text: "I" },
  };

  const displayList = stocks && stocks.length > 0 ? stocks.slice(0, 3) : [];

  return (
    <>
      <Card
        elevation={0}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: "16px",
          border: "1px solid #F1F5F9",
          boxShadow: "0px 2px 12px rgba(0, 0, 0, 0.03)",
          background: "#ffffff",
        }}
      >
        <CardContent sx={{ p: 2.5, flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <Stack sx={{ mb: 2, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Stack sx={{ flexDirection: "row", gap: 1.5, alignItems: "flex-start" }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "12px",
                  background: "#EEF2FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#6366F1",
                }}
              >
                <ShowChartIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827", fontSize: "1rem" }}>
                  Stock Market
                </Typography>
                <Typography variant="caption" sx={{ color: "#6B7280", fontSize: "0.78rem" }}>
                  NSE & BSE • Delayed Data (~15m)
                </Typography>
              </Box>
            </Stack>

            <Chip
              label={marketStatus === "OPEN" ? "Market Open" : "Market Closed"}
              size="small"
              sx={{
                background: marketStatus === "OPEN" ? "#DCFCE7" : "#FEF3C7",
                color: marketStatus === "OPEN" ? "#166534" : "#D97706",
                fontWeight: 600,
                height: 22,
                fontSize: "0.725rem",
                borderRadius: "12px",
              }}
            />
          </Stack>

          {/* Top Recommendations Header */}
          <Stack sx={{ mb: 1.5, mt: 0.5, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#374151", fontSize: "0.8rem" }}>
              Top Stock Quotes
            </Typography>
            <Typography
              variant="caption"
              onClick={() => navigate("/investments/stocks")}
              sx={{ color: "#6366F1", fontWeight: 600, fontSize: "0.78rem", cursor: "pointer" }}
            >
              View All
            </Typography>
          </Stack>

          {/* Stock list */}
          <Stack sx={{ mb: 2, flex: 1, gap: 1.5 }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress size={24} sx={{ color: "#6366F1" }} />
              </Box>
            ) : displayList.length === 0 ? (
              <Box sx={{ py: 3, textAlign: "center" }}>
                <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                  No stock quotes available
                </Typography>
              </Box>
            ) : (
              displayList.map((item, idx) => {
                const isPos = item.isPositive !== false;
                const changeColor = isPos ? "#10B981" : "#EF4444";
                const logo = stockLogos[item.symbol] || { bg: "#475569", text: item.symbol?.charAt(0) || "S" };

                return (
                  <Box
                    key={item.symbol || idx}
                    sx={{
                      py: 1,
                      px: 1.5,
                      borderRadius: "10px",
                      background: "#F8FAFC",
                      border: "1px solid #F1F5F9",
                    }}
                  >
                    <Stack sx={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <Stack sx={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 1.2 }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "8px",
                            background: logo.bg,
                            color: "#fff",
                            fontWeight: 800,
                            fontSize: "0.75rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {logo.text}
                        </Box>
                        <Box sx={{ maxWidth: { xs: 110, sm: 140 }, overflow: "hidden" }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 700,
                              color: "#111827",
                              fontSize: "0.825rem",
                              lineHeight: 1.2,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#9CA3AF", fontSize: "0.7rem", fontWeight: 500 }}>
                            {item.symbol}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box sx={{ textAlign: "right" }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#111827", fontSize: "0.825rem", lineHeight: 1.2 }}>
                            {formatCurrency(item.price)}
                          </Typography>
                          <Stack direction="row" spacing={0.2} alignItems="center" justifyContent="flex-end">
                            {isPos ? (
                              <ArrowUpwardIcon sx={{ fontSize: 10, color: changeColor }} />
                            ) : (
                              <ArrowDownwardIcon sx={{ fontSize: 10, color: changeColor }} />
                            )}
                            <Typography variant="caption" sx={{ fontWeight: 600, color: changeColor, fontSize: "0.7rem" }}>
                              {item.percentChange || item.change || "0.00%"}
                            </Typography>
                          </Stack>
                        </Box>

                        <Stack sx={{ alignItems: "center", gap: 0.2 }}>
                          <Button
                            size="small"
                            onClick={() => handleStockClick(item)}
                            sx={{
                              borderRadius: "14px",
                              textTransform: "none",
                              fontWeight: 700,
                              background: "#DCFCE7",
                              color: "#15803D",
                              minWidth: "48px",
                              px: 1.5,
                              py: 0.2,
                              fontSize: "0.75rem",
                              boxShadow: "none",
                              "&:hover": {
                                background: "#BBF7D0",
                              },
                            }}
                          >
                            Buy
                          </Button>
                          <Typography variant="caption" sx={{ color: "#9CA3AF", fontSize: "0.625rem" }}>
                            {item.risk || "Moderate"}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Box>
                );
              })
            )}
          </Stack>

          {/* Bottom Button */}
          <Button
            fullWidth
            variant="outlined"
            endIcon={<ArrowForwardIcon fontSize="small" />}
            onClick={() => navigate("/investments/stocks")}
            sx={{
              color: "#6366F1",
              borderColor: "#E0E7FF",
              fontWeight: 600,
              fontSize: "0.825rem",
              textTransform: "none",
              justifyContent: "center",
              py: 1,
              borderRadius: "10px",
              "&:hover": {
                background: "#EEF2FF",
                borderColor: "#C7D2FE",
              },
            }}
          >
            View Stock Recommendations
          </Button>
        </CardContent>
      </Card>

      {/* Stock Details Modal */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ overflow: "hidden", pr: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: "1rem", lineHeight: 1.2 }}>
              {selectedStock?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {selectedStock?.symbol} • {marketStatus === "OPEN" ? "Delayed ~15m" : "Last Close"}
            </Typography>
          </Box>
          <IconButton onClick={() => setDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderBottom: "none" }}>
          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Current Price
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#111827" }}>
                {formatCurrency(selectedStock?.price)}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Price Change
              </Typography>
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
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Market Cap
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {selectedStock?.marketCap || "N/A"}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Sector
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {selectedStock?.sector || "General"}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                P/E Ratio
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {selectedStock?.peRatio || "N/A"}
              </Typography>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => setDialogOpen(false)}
            sx={{
              background: "#6366F1",
              borderRadius: "10px",
              fontWeight: 700,
              textTransform: "none",
            }}
          >
            Add to Watchlist
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StockCard;
