import React, { useState } from "react";
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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router-dom";
import { stocksData } from "../../../data/investmentMockData";

const formatCurrency = (val) =>
  Number(val || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });

const StockRecommendationsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStock, setSelectedStock] = useState(null);

  const filteredStocks = stocksData.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.sector.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

        <Stack sx={{ mb: 3, flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#111827" }}>
              Stock Market Recommendations
            </Typography>
            <Typography variant="body1" sx={{ color: "#6b7280", mt: 0.5 }}>
              Handpicked Indian equities with strong fundamentals and growth potential
            </Typography>
          </Box>

          <TextField
            placeholder="Search stock by name, symbol or sector..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ width: { xs: "100%", sm: 320 }, mt: { xs: 2, sm: 0 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              sx: { borderRadius: "12px", background: "#fff" },
            }}
          />
        </Stack>

        {/* Stock List Grid */}
        <Grid container spacing={3} alignItems="stretch" sx={{ justifyContent: "space-around" }} >
          {filteredStocks.map((stock, idx) => (
            <Grid item xs={12} md={6} lg={4} key={idx} sx={{ display: "flex" }}>
              <Paper
                // elevation={0}
                sx={{
                  p: 3,
                  borderRadius: "18px",
                  border: "1px solid #eef2f6",
                  background: "#fff",
                  boxShadow: "0px 4px 20px rgba(0,0,0,0.03)",
                  transition: "transform 0.2s, boxShadow 0.2s",
                  display: "flex",
                  flexDirection: "column",
                  justify: "space-between",
                  width: "100%",
                  minHeight: "270px",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0px 8px 25px rgba(123, 97, 255, 0.1)",
                  },
                }}
              >
                <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <Stack sx={{ mb: 1.5, justifyContent: "space-between", alignItems: "flex-start", flexDirection: "row", minHeight: "44px" }}>
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
                        {stock.symbol} • {stock.sector}
                      </Typography>
                    </Box>
                    <Chip
                      label={stock.risk}
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
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "#00C853" }}>
                        {stock.change} Today
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sx={{ textAlign: "right" }}>
                      <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>
                        1 Year Return
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: "#00C853", fontSize: "1.1rem" }}>
                        {stock.yearReturn}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#64748b" }}>
                        P/E: {stock.peRatio}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                <Stack sx={{ flexDirection: "row", gap: 1.5, width: "100%", mt: "auto", pt: 1 }} >
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
          ))}
        </Grid>

        {/* Modal for Details */}
        <Dialog
          open={Boolean(selectedStock)}
          onClose={() => setSelectedStock(null)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: "20px", p: 1 } }}
        >
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {selectedStock?.name} ({selectedStock?.symbol})
            </Typography>
            <IconButton onClick={() => setSelectedStock(null)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ borderBottom: "none" }}>
            <Stack sx={{ gap: 2 }}  >
              <Box sx={{ p: 2, borderRadius: "12px", background: "#f8fafc" }}>
                <Stack sx={{ flexDirection: "row", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Current Price</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{formatCurrency(selectedStock?.price)}</Typography>
                </Stack>
                <Stack sx={{ flexDirection: "row", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Market Cap</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{selectedStock?.marketCap}</Typography>
                </Stack>
                <Stack sx={{ flexDirection: "row", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Sector</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{selectedStock?.sector}</Typography>
                </Stack>
                <Stack sx={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">Risk Grade</Typography>
                  <Chip label={selectedStock?.risk} size="small" color="primary" />
                </Stack>
              </Box>

              <Box sx={{ p: 2, borderRadius: "12px", background: "#ecfdf5", border: "1px solid #a7f3d0" }}>
                <Stack sx={{ flexDirection: "row", gap: 1, alignItems: "center", mb: 0.5 }}>
                  <CheckCircleIcon sx={{ color: "#059669", fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#065f46" }}>
                    AI Recommendation Rationale
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ color: "#047857", fontSize: "0.85rem" }}>
                  Selected for robust cash flows, market leadership in its sector, and favorable risk-reward ratio matching your portfolio targets.
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
