import React from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  Stack,
  Tooltip,
  IconButton,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import ShowChartIcon from "@mui/icons-material/ShowChart";

const formatCurrency = (val) => {
  if (val === null || val === undefined || isNaN(val)) return "N/A";
  return Number(val).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
};

// Known stock brand colors for top Indian equities
const STOCK_BRAND_COLORS = {
  "RELIANCE.NS": { bg: "linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%)", letter: "R" },
  "TCS.NS": { bg: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)", letter: "T" },
  "HDFCBANK.NS": { bg: "linear-gradient(135deg, #DC2626 0%, #991B1B 100%)", letter: "H" },
  "INFY.NS": { bg: "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)", letter: "I" },
  "ICICIBANK.NS": { bg: "linear-gradient(135deg, #EA580C 0%, #C2410C 100%)", letter: "I" },
  "TATAMOTORS.NS": { bg: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)", letter: "T" },
  "SBIN.NS": { bg: "linear-gradient(135deg, #0D9488 0%, #115E59 100%)", letter: "S" },
  "BHARTIARTL.NS": { bg: "linear-gradient(135deg, #E11D48 0%, #BE123C 100%)", letter: "B" },
  "ITC.NS": { bg: "linear-gradient(135deg, #D97706 0%, #B45309 100%)", letter: "I" },
  "WIPRO.NS": { bg: "linear-gradient(135deg, #9333EA 0%, #7E22CE 100%)", letter: "W" },
  "HINDUNILVR.NS": { bg: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)", letter: "H" },
  "LT.NS": { bg: "linear-gradient(135deg, #475569 0%, #334155 100%)", letter: "L" },
};

// Fallback dynamic palette based on symbol hash
const getStockLogo = (symbol = "") => {
  if (STOCK_BRAND_COLORS[symbol]) {
    return STOCK_BRAND_COLORS[symbol];
  }
  const cleanSym = symbol.replace(/\.NS|\.BO/i, "");
  const char = cleanSym.charAt(0).toUpperCase() || "S";
  const colors = [
    "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
    "linear-gradient(135deg, #059669 0%, #047857 100%)",
    "linear-gradient(135deg, #D97706 0%, #B45309 100%)",
    "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
    "linear-gradient(135deg, #EC4899 0%, #BE185D 100%)",
    "linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)",
  ];
  let hash = 0;
  for (let i = 0; i < cleanSym.length; i++) {
    hash = cleanSym.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % colors.length;
  return { bg: colors[colorIndex], letter: char };
};

const getRiskColor = (risk = "Moderate") => {
  const r = risk.toLowerCase();
  if (r.includes("low")) {
    return { bg: "rgba(16, 185, 129, 0.1)", text: "#059669", border: "rgba(16, 185, 129, 0.25)" };
  }
  if (r.includes("high")) {
    return { bg: "rgba(239, 68, 68, 0.1)", text: "#DC2626", border: "rgba(239, 68, 68, 0.25)" };
  }
  return { bg: "rgba(123, 97, 255, 0.1)", text: "#7B61FF", border: "rgba(123, 97, 255, 0.25)" };
};

const StockRecommendationCard = ({
  stock,
  onViewDetails,
  onBuyStock,
  isWatchlisted = false,
  onToggleWatchlist,
  customFormatCurrency,
}) => {
  if (!stock) return null;

  const isPos = stock.isPositive !== false;
  const changeColor = isPos ? "#16A34A" : "#EF4444";
  const changeBg = isPos ? "rgba(22, 163, 74, 0.08)" : "rgba(239, 68, 68, 0.08)";
  const logo = getStockLogo(stock.symbol);
  const riskStyle = getRiskColor(stock.risk);
  const formatter = customFormatCurrency || formatCurrency;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: "18px",
        border: "1px solid #E2E8F0",
        background: "#FFFFFF",
        boxShadow: "0px 2px 8px rgba(15, 23, 42, 0.04)",
        transition: "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        minHeight: { xs: "310px", sm: "330px" },
        boxSizing: "border-box",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0px 12px 28px rgba(123, 97, 255, 0.12)",
          borderColor: "#C7D2FE",
        },
      }}
    >
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top Header: Logo Avatar, Company & Symbol, Risk Badge & Watchlist */}
        <Stack
          direction="row"
          spacing={{ xs: 1, sm: 1.5 }}
          sx={{
            mb: { xs: 1.5, sm: 2 },
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Stack
            direction="row"
            spacing={{ xs: 1, sm: 1.5 }}
            sx={{
              minWidth: 0,
              flex: 1,
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                width: { xs: 38, sm: 44 },
                height: { xs: 38, sm: 44 },
                minWidth: { xs: 38, sm: 44 },
                borderRadius: "12px",
                background: logo.bg,
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: { xs: "0.95rem", sm: "1.1rem" },
                boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
              }}
            >
              {logo.letter}
            </Box>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Tooltip title={stock.name || ""} arrow placement="top">
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 800,
                    color: "#0F172A",
                    fontSize: { xs: "0.9rem", sm: "0.98rem" },
                    lineHeight: 1.3,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {stock.name}
                </Typography>
              </Tooltip>

              <Stack direction="row" spacing={1} sx={{ mt: 0.4, alignItems: "center" }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: "#64748B",
                    fontSize: "0.75rem",
                    fontFamily: "monospace",
                    letterSpacing: "0.3px",
                  }}
                >
                  {stock.symbol}
                </Typography>
                <Typography variant="caption" sx={{ color: "#CBD5E1" }}>
                  •
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#475569",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {stock.sector || "Equity"}
                </Typography>
              </Stack>
            </Box>
          </Stack>

          <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
            <Chip
              label={stock.risk || "Moderate"}
              size="small"
              sx={{
                background: riskStyle.bg,
                color: riskStyle.text,
                border: `1px solid ${riskStyle.border}`,
                fontWeight: 700,
                fontSize: "0.7rem",
                height: "22px",
                whiteSpace: "nowrap",
              }}
            />
            {onToggleWatchlist && (
              <IconButton
                size="small"
                onClick={() => onToggleWatchlist(stock)}
                title={isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist"}
                sx={{
                  color: isWatchlisted ? "#7B61FF" : "#94A3B8",
                  p: 0.5,
                  "&:hover": { color: "#7B61FF", background: "rgba(123, 97, 255, 0.08)" },
                }}
              >
                {isWatchlisted ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
              </IconButton>
            )}
          </Stack>
        </Stack>

        {/* Pricing & Key Metrics Container (Uniform height & styling) */}
        <Box
          sx={{
            p: 1.8,
            borderRadius: "14px",
            background: "#F8FAFC",
            border: "1px solid #EEF2F6",
            mb: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          {/* Price & Change Row */}
          <Stack
            direction="row"
            sx={{
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600, display: "block", fontSize: "0.72rem" }}>
                Current Price
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1.2rem", lineHeight: 1.2 }}>
                {formatter(stock.price)}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.4,
                px: 1.2,
                py: 0.4,
                borderRadius: "8px",
                background: changeBg,
              }}
            >
              {isPos ? (
                <ArrowUpwardIcon sx={{ fontSize: 13, color: changeColor }} />
              ) : (
                <ArrowDownwardIcon sx={{ fontSize: 13, color: changeColor }} />
              )}
              <Typography variant="caption" sx={{ fontWeight: 700, color: changeColor, fontSize: "0.78rem" }}>
                {stock.change} ({stock.percentChange})
              </Typography>
            </Box>
          </Stack>

          {/* Micro Metrics Grid: 1Y Return, P/E Ratio, Market Cap */}
          <Stack
            direction="row"
            sx={{
              pt: 1.2,
              borderTop: "1px dashed #E2E8F0",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ color: "#94A3B8", display: "block", fontSize: "0.7rem", fontWeight: 600 }}>
                1Y Return
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  color: stock.yearReturn && stock.yearReturn.includes("-") ? "#EF4444" : "#16A34A",
                }}
              >
                {stock.yearReturn || "N/A"}
              </Typography>
            </Box>

            <Box sx={{ flex: 1, textAlign: "center" }}>
              <Typography variant="caption" sx={{ color: "#94A3B8", display: "block", fontSize: "0.7rem", fontWeight: 600 }}>
                P/E Ratio
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#334155" }}>
                {stock.peRatio || "N/A"}
              </Typography>
            </Box>

            <Box sx={{ flex: 1, textAlign: "right" }}>
              <Typography variant="caption" sx={{ color: "#94A3B8", display: "block", fontSize: "0.7rem", fontWeight: 600 }}>
                Market Cap
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  color: "#334155",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {stock.marketCap || "N/A"}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>

      {/* Action Buttons Footer */}
      <Stack direction="row" spacing={1.5} sx={{ width: "100%", pt: 0.5 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={() => onViewDetails && onViewDetails(stock)}
          sx={{
            borderRadius: "10px",
            borderColor: "#C7D2FE",
            color: "#6366F1",
            fontWeight: 700,
            textTransform: "none",
            whiteSpace: "nowrap",
            px: 1.5,
            fontSize: "0.84rem",
            height: "38px",
            "&:hover": {
              borderColor: "#6366F1",
              background: "rgba(99, 102, 241, 0.05)",
            },
          }}
        >
          View Details
        </Button>
        <Button
          fullWidth
          variant="contained"
          onClick={() => onBuyStock && onBuyStock(stock)}
          startIcon={<ShowChartIcon sx={{ fontSize: 16 }} />}
          sx={{
            background: "linear-gradient(135deg, #5B5FEF 0%, #7B61FF 100%)",
            borderRadius: "10px",
            fontWeight: 700,
            textTransform: "none",
            whiteSpace: "nowrap",
            px: 1.5,
            fontSize: "0.84rem",
            height: "38px",
            boxShadow: "0 2px 8px rgba(123, 97, 255, 0.25)",
            "&:hover": {
              background: "linear-gradient(135deg, #4F46E5 0%, #6D28D9 100%)",
              boxShadow: "0 4px 12px rgba(123, 97, 255, 0.35)",
            },
          }}
        >
          Buy Stock
        </Button>
      </Stack>
    </Paper>
  );
};

export default StockRecommendationCard;
