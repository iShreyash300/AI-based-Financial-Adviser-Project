import React, { useState } from "react";
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
} from "@mui/material";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloseIcon from "@mui/icons-material/Close";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { useNavigate } from "react-router-dom";
import { stocksData } from "../../data/investmentMockData";

const formatCurrency = (val) =>
  Number(val || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });

const StockCard = ({ stocks = stocksData.slice(0, 3) }) => {
  const navigate = useNavigate();
  const [selectedStock, setSelectedStock] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleStockClick = (stock) => {
    setSelectedStock(stock);
    setDialogOpen(true);
  };

  const stockLogos = {
    "RELIANCE.NS": { bg: "#0F172A", text: "R", color: "#fff" },
    "HDFCBANK.NS": { bg: "#DC2626", text: "H", color: "#fff" },
    "TCS.NS": { bg: "#7C3AED", text: "T", color: "#fff" },
  };

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
                  Invest in top performing stocks
                </Typography>
              </Box>
            </Stack>

            <Chip
              label="Moderate - High"
              size="small"
              sx={{
                background: "#FEF3C7",
                color: "#D97706",
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
              Top Stock Recommendations
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
            {stocks.map((item, idx) => (
              <Box
                key={idx}
                sx={{
                  py: 1,
                  px: 1.5,
                  borderRadius: "10px",
                  background: "#F8FAFC",
                  border: "1px solid #F1F5F9",
                }}
              >
                <Stack sx={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }} >
                  <Stack sx={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 1.2 }} >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "8px",
                        background: stockLogos[item.symbol]?.bg || "#3B82F6",
                        color: "#fff",
                        fontWeight: 800,
                        fontSize: "0.75rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {stockLogos[item.symbol]?.text || "S"}
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#111827", fontSize: "0.825rem", lineHeight: 1.2 }}>
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
                        <ArrowUpwardIcon sx={{ fontSize: 10, color: "#10B981" }} />
                        <Typography variant="caption" sx={{ fontWeight: 600, color: "#10B981", fontSize: "0.7rem" }}>
                          {item.change}
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
                        {item.risk}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </Box>
            ))}
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

      {/* Demo Stock Details Modal */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {selectedStock?.name}
          </Typography>
          <IconButton onClick={() => setDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderBottom: "none" }}>
          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Symbol
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {selectedStock?.symbol}
              </Typography>
            </Stack>
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
                1Y Return
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#10B981" }}>
                {selectedStock?.yearReturn}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Sector
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {selectedStock?.sector}
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
