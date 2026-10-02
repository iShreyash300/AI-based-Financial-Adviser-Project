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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SecurityIcon from "@mui/icons-material/Security";
import { useNavigate } from "react-router-dom";
import { bankFdData } from "../../../data/investmentMockData";

const formatCurrency = (val) =>
  Number(val || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

const FDComparisonPage = () => {
  const navigate = useNavigate();
  const [calcAmount, setCalcAmount] = useState(100000);
  const [calcTenure, setCalcTenure] = useState("2 Years");

  const getRateNumber = (rateStr) => parseFloat(rateStr.replace("%", ""));

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, background: "#f5f7fb", minHeight: "100vh" }}>
      <Container maxWidth="xl" disableGutters>
        {/* Navigation */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/investments")}
            sx={{ color: "#00C853", textTransform: "none", fontWeight: 700 }}
          >
            Back to Dashboard
          </Button>
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#111827" }}>
              Bank Fixed Deposits Comparison
            </Typography>
            <Typography variant="body1" sx={{ color: "#6b7280", mt: 0.5 }}>
              Compare guaranteed interest rates and maturity returns across major scheduled Indian banks
            </Typography>
          </Box>

          <Chip
            icon={<SecurityIcon sx={{ color: "#00C853 !important" }} />}
            label="DICGC Insured up to ₹5 Lakh"
            sx={{
              background: "rgba(0, 200, 83, 0.12)",
              color: "#00C853",
              fontWeight: 800,
              px: 1,
              py: 2.2,
              borderRadius: "12px",
            }}
          />
        </Stack>

        {/* Quick Calculator Bar */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: "18px", background: "#fff", border: "1px solid #eef2f6", mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
            FD Maturity Calculator
          </Typography>
          <Grid container spacing={2.5} alignItems="center">
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                label="Deposit Principal Amount (₹)"
                type="number"
                value={calcAmount}
                onChange={(e) => setCalcAmount(e.target.value)}
                InputProps={{ sx: { borderRadius: "12px" } }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label="Selected Tenure"
                value={calcTenure}
                onChange={(e) => setCalcTenure(e.target.value)}
                InputProps={{ sx: { borderRadius: "12px" } }}
              >
                <MenuItem value="1 Year">1 Year</MenuItem>
                <MenuItem value="2 Years">2 Years</MenuItem>
                <MenuItem value="3 Years">3 Years</MenuItem>
                <MenuItem value="5 Years">5 Years</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Box sx={{ p: 1.5, borderRadius: "12px", background: "rgba(0, 200, 83, 0.08)", textAlign: "center" }}>
                <Typography variant="caption" color="text.secondary">Top Rate Available</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#00C853" }}>
                  7.20% p.a.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Bank FD Comparison Table */}
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: "20px", border: "1px solid #eef2f6" }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ background: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>Bank Name</TableCell>

                <TableCell sx={{ fontWeight: 800 }}>Safety Rating</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Selected Rate ({calcTenure})</TableCell>

                <TableCell sx={{ fontWeight: 800 }}>Estimated Maturity ({formatCurrency(calcAmount)})</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bankFdData.map((bank, idx) => {
                const rateStr = bank.ratesByTenure[calcTenure] || bank.rate;
                const r = getRateNumber(rateStr) / 100;
                const yrs = parseInt(calcTenure) || 2;
                const matVal = Math.round(Number(calcAmount) * Math.pow(1 + r, yrs));

                return (
                  <TableRow key={idx} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "10px",
                            background: bank.color,
                            color: "#fff",
                            fontWeight: 800,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.8rem",
                          }}
                        >
                          {bank.logoText}
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                            {bank.bankName}
                          </Typography>
                          {bank.isRecommended && (
                            <Chip label="AI Recommended" size="small" color="success" sx={{ height: 18, fontSize: "0.65rem" }} />
                          )}
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Chip label={bank.rating} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                    </TableCell>

                    <TableCell>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#00C853" }}>
                        {rateStr} p.a.
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#1e293b" }}>
                        {formatCurrency(matVal)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#00C853", fontWeight: 700 }}>
                        + {formatCurrency(matVal - Number(calcAmount))} interest
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Button
                        variant="contained"
                        sx={{
                          background: "linear-gradient(135deg, #00C853 0%, #009624 100%)",
                          borderRadius: "10px",
                          fontWeight: 700,
                          textTransform: "none",
                        }}
                      >
                        Book FD
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
};

export default FDComparisonPage;
