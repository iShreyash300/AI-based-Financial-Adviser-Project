import React from "react";
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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import { useNavigate } from "react-router-dom";
import { aiAdvisorData } from "../../../data/investmentMockData";

const formatCurrency = (val) =>
  Number(val || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

const AIRecommendationsPage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, background: "#f5f7fb", minHeight: "100vh" }}>
      <Container maxWidth="xl" disableGutters>
        {/* Navigation */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/investments")}
            sx={{ color: "#7B61FF", textTransform: "none", fontWeight: 700 }}
          >
            Back to Dashboard
          </Button>
        </Stack>

        {/* Title */}
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#111827" }}>
                AI Investment Recommendation Report
              </Typography>
              <Chip
                icon={<AutoAwesomeIcon sx={{ color: "#FFD700 !important" }} />}
                label="AI v2.4 Engine"
                sx={{
                  background: "linear-gradient(135deg, #1e1b4b 0%, #311b92 100%)",
                  color: "#FFD700",
                  fontWeight: 800,
                }}
              />
            </Stack>
            <Typography variant="body1" sx={{ color: "#6b7280" }}>
              Personalized asset distribution generated from your budget surplus, risk capacity, and goals
            </Typography>
          </Box>
        </Stack>

        {/* Input Parameters Summary */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: "20px", background: "#fff", border: "1px solid #eef2f6", mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
            ANALYSIS PARAMETERS
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">Available Surplus to Invest</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#7B61FF", mt: 0.5 }}>
                {formatCurrency(aiAdvisorData.availableAmount)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">Evaluated Risk Profile</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#1e293b", mt: 0.5 }}>
                {aiAdvisorData.riskProfile} Risk
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">Suggested Horizon</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#1e293b", mt: 0.5 }}>
                {aiAdvisorData.investmentPeriod}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Allocation Rationale Cards */}
        <Typography variant="h5" sx={{ fontWeight: 800, color: "#1e293b", mb: 2 }}>
          Recommended Portfolio Breakdown & Rationale
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Stock Market */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: "20px",
                background: "#fff",
                border: "1px solid rgba(123, 97, 255, 0.3)",
                height: "100%",
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <ShowChartIcon sx={{ color: "#7B61FF", fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>Stock Market</Typography>
                </Stack>
                <Chip label="50% Allocation" sx={{ background: "#7B61FF", color: "#fff", fontWeight: 800 }} />
              </Stack>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#1e293b", mb: 1 }}>
                {formatCurrency(37500)}
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1e293b", mb: 0.5 }}>
                Why this recommendation:
              </Typography>
              <Typography variant="body2" sx={{ color: "#475569", lineHeight: 1.6 }}>
                Equities offer strong long-term wealth compounding (12.5% expected annual growth). Allocated across top-tier bluechip stocks like Reliance, HDFC Bank, and TCS to minimize single-stock volatility.
              </Typography>
            </Paper>
          </Grid>

          {/* Gold */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: "20px",
                background: "#fff",
                border: "1px solid rgba(255, 184, 0, 0.4)",
                height: "100%",
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <WorkspacePremiumIcon sx={{ color: "#d97706", fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>Gold (ETF / SGB)</Typography>
                </Stack>
                <Chip label="20% Allocation" sx={{ background: "#FFB800", color: "#fff", fontWeight: 800 }} />
              </Stack>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#1e293b", mb: 1 }}>
                {formatCurrency(15000)}
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1e293b", mb: 0.5 }}>
                Why this recommendation:
              </Typography>
              <Typography variant="body2" sx={{ color: "#475569", lineHeight: 1.6 }}>
                Gold acts as a safe-haven cushion against equity market drawdowns and inflation. Sovereign Gold Bonds add an extra 2.5% fixed interest return on top of gold price appreciation.
              </Typography>
            </Paper>
          </Grid>

          {/* Bank FD */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: "20px",
                background: "#fff",
                border: "1px solid rgba(0, 200, 83, 0.3)",
                height: "100%",
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <AccountBalanceIcon sx={{ color: "#00C853", fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>Bank Fixed Deposit</Typography>
                </Stack>
                <Chip label="30% Allocation" sx={{ background: "#00C853", color: "#fff", fontWeight: 800 }} />
              </Stack>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#1e293b", mb: 1 }}>
                {formatCurrency(22500)}
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1e293b", mb: 0.5 }}>
                Why this recommendation:
              </Typography>
              <Typography variant="body2" sx={{ color: "#475569", lineHeight: 1.6 }}>
                Guarantees capital protection and provides immediate emergency liquidity. 2-Year tenure locked in at ~7.10% p.a. interest ensures steady predictable growth.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AIRecommendationsPage;
