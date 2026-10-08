import React, { useState } from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Stack,
  Button,
  Grid,
  TextField,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { simulatorRates } from "../../data/investmentMockData";

const formatCurrency = (val) =>
  Number(val || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

const InvestmentSimulator = () => {
  const [amount, setAmount] = useState(75000);
  const [years, setYears] = useState(3);
  const [results, setResults] = useState(null);

  const calculateReturns = (amt, y) => {
    const principal = Number(amt) || 0;
    const n = Number(y) || 1;

    const stockFV = Math.round(principal * Math.pow(1 + simulatorRates.stockMarket, n));
    const goldFV = Math.round(principal * Math.pow(1 + simulatorRates.gold, n));
    const fdFV = Math.round(principal * Math.pow(1 + simulatorRates.bankFd, n));

    return { principal, years: n, stockFV, goldFV, fdFV };
  };

  const handleSimulate = () => {
    const res = calculateReturns(amount, years);
    setResults(res);
  };

  const currentResults = results || calculateReturns(amount, years);

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: "16px",
        border: "1px solid #F1F5F9",
        boxShadow: "0px 2px 12px rgba(0, 0, 0, 0.03)",
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent sx={{ p: 2.5, flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827", fontSize: "0.95rem" }}>
            Investment Simulator
          </Typography>
          <Typography variant="caption" sx={{ color: "#6B7280", fontSize: "0.78rem" }}>
            See potential returns based on different scenarios
          </Typography>
        </Box>

        <Grid container spacing={2.5} sx={{ flex: 1 }}>
          {/* Left Form Controls */}
          <Grid item xs={12} sm={4}>
            <Stack spacing={1.5}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "#374151", mb: 0.5, display: "block" }}>
                  Invest Amount
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    sx: { borderRadius: "8px", fontSize: "0.85rem", background: "#F8FAFC" },
                  }}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "#374151", mb: 0.5, display: "block" }}>
                  Time Period
                </Typography>
                <TextField
                  fullWidth
                  select
                  size="small"
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  InputProps={{
                    sx: { borderRadius: "8px", fontSize: "0.85rem", background: "#F8FAFC" },
                  }}
                >
                  <MenuItem value={1}>1 Year</MenuItem>
                  <MenuItem value={3}>3 Years</MenuItem>
                  <MenuItem value={5}>5 Years</MenuItem>
                </TextField>
              </Box>

              <Button
                fullWidth
                variant="contained"
                onClick={handleSimulate}
                sx={{
                  background: "#6366F1",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: "0.825rem",
                  textTransform: "none",
                  py: 1,
                  borderRadius: "8px",
                  boxShadow: "none",
                  "&:hover": { background: "#4F46E5" },
                }}
              >
                Simulate
              </Button>
            </Stack>
          </Grid>

          {/* Right Simulation Table */}
          <Grid item xs={12} sm={8}>
            <Box sx={{ width: "100%", background: "#F8FAFC", p: 1.5, borderRadius: "10px", border: "1px solid #F1F5F9" }}>
              {/* Header */}
              <Grid container sx={{ borderBottom: "1px solid #E2E8F0", pb: 1, mb: 1 }}>
                <Grid item xs={5}>
                  <Typography variant="caption" sx={{ color: "#9CA3AF", fontWeight: 600, fontSize: "0.7rem" }}>
                    Asset Class
                  </Typography>
                </Grid>
                <Grid item xs={3.5} sx={{ textAlign: "center" }}>
                  <Typography variant="caption" sx={{ color: "#9CA3AF", fontWeight: 600, fontSize: "0.7rem" }}>
                    Expected Return
                  </Typography>
                </Grid>
                <Grid item xs={3.5} sx={{ textAlign: "right" }}>
                  <Typography variant="caption" sx={{ color: "#9CA3AF", fontWeight: 600, fontSize: "0.7rem" }}>
                    Estimated Value
                  </Typography>
                </Grid>
              </Grid>

              {/* Rows */}
              <Stack spacing={1}>
                <Grid container alignItems="center">
                  <Grid item xs={5}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: "#111827", fontSize: "0.78rem" }}>
                      Stock Market (Moderate)
                    </Typography>
                  </Grid>
                  <Grid item xs={3.5} sx={{ textAlign: "center" }}>
                    <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 500, fontSize: "0.78rem" }}>
                      12.5%
                    </Typography>
                  </Grid>
                  <Grid item xs={3.5} sx={{ textAlign: "right" }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: "#111827", fontSize: "0.78rem" }}>
                      {formatCurrency(currentResults.stockFV)}
                    </Typography>
                  </Grid>
                </Grid>

                <Grid container alignItems="center">
                  <Grid item xs={5}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: "#111827", fontSize: "0.78rem" }}>
                      Gold
                    </Typography>
                  </Grid>
                  <Grid item xs={3.5} sx={{ textAlign: "center" }}>
                    <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 500, fontSize: "0.78rem" }}>
                      6.8%
                    </Typography>
                  </Grid>
                  <Grid item xs={3.5} sx={{ textAlign: "right" }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: "#111827", fontSize: "0.78rem" }}>
                      {formatCurrency(currentResults.goldFV)}
                    </Typography>
                  </Grid>
                </Grid>

                <Grid container alignItems="center">
                  <Grid item xs={5}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: "#111827", fontSize: "0.78rem" }}>
                      Bank FD
                    </Typography>
                  </Grid>
                  <Grid item xs={3.5} sx={{ textAlign: "center" }}>
                    <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 500, fontSize: "0.78rem" }}>
                      7.0%
                    </Typography>
                  </Grid>
                  <Grid item xs={3.5} sx={{ textAlign: "right" }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: "#111827", fontSize: "0.78rem" }}>
                      {formatCurrency(currentResults.fdFV)}
                    </Typography>
                  </Grid>
                </Grid>
              </Stack>
            </Box>
          </Grid>
        </Grid>

        {/* Bottom Link */}
        <Box sx={{ textAlign: "right", mt: 2 }}>
          <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center">
            <Typography
              variant="caption"
              sx={{
                color: "#6366F1",
                fontWeight: 600,
                fontSize: "0.8rem",
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              View Detailed Simulation
            </Typography>
            <ArrowForwardIcon sx={{ fontSize: 14, color: "#6366F1" }} />
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

export default InvestmentSimulator;
