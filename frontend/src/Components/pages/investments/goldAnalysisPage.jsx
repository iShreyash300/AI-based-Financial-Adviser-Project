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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import { useNavigate } from "react-router-dom";
import { goldData } from "../../../data/investmentMockData";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const formatCurrency = (val) =>
  Number(val || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

const GoldAnalysisPage = () => {
  const navigate = useNavigate();

  const chartData = {
    labels: goldData.historicalPrices.map((d) => d.month),
    datasets: [
      {
        label: "Gold Price (₹ / gram)",
        data: goldData.historicalPrices.map((d) => d.price),
        borderColor: "#FFB800",
        backgroundColor: "rgba(255, 184, 0, 0.15)",
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointBackgroundColor: "#d97706",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      tooltip: {
        callbacks: {
          label: (context) => ` ₹${context.parsed.y} per gram`,
        },
      },
    },
    scales: {
      y: {
        min: 6000,
        ticks: {
          callback: (val) => `₹${val}`,
        },
      },
    },
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, background: "#f5f7fb", minHeight: "100vh" }}>
      <Container maxWidth="xl" disableGutters>
        {/* Navigation */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/investments")}
            sx={{ color: "#d97706", textTransform: "none", fontWeight: 700 }}
          >
            Back to Dashboard
          </Button>
        </Stack>

        <Stack
          sx={{ mb: 3, justifyContent: "space-between", alignItems: "flex-start", flexDirection: { xs: "column", sm: "row" } }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#111827" }}>
              Gold Market & ETF Analysis
            </Typography>
            <Typography variant="body1" sx={{ color: "#6b7280", mt: 0.5 }}>
              Hedge against market inflation and economic uncertainty with physical/digital gold assets
            </Typography>
          </Box>

          <Chip
            icon={<WorkspacePremiumIcon sx={{ color: "#d97706 !important" }} />}
            label="Low - Moderate Risk"
            sx={{
              background: "rgba(255, 184, 0, 0.15)",
              color: "#d97706",
              fontWeight: 800,
              px: 1,
              py: 2.2,
              fontSize: "0.9rem",
              borderRadius: "12px",
            }}
          />
        </Stack>

        {/* Top Summary Banner */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: "18px", background: "#fff", border: "1px solid #eef2f6" }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Live Gold Rate (24K Pure)
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#d97706", my: 1 }}>
                {formatCurrency(goldData.currentPrice)} <Typography component="span" variant="body1" color="text.secondary">/ gram</Typography>
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#00C853" }}>
                {goldData.change} Today (+₹40/g)
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: "18px", background: "#fff", border: "1px solid #eef2f6" }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Suggested Portfolio Allocation
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#1e293b", my: 1 }}>
                {goldData.allocation}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Target Investment: <strong>{goldData.suggestedInvestment}</strong>
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: "18px", background: "#fff", border: "1px solid #eef2f6" }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                AI Recommended Product
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#1e293b", my: 1 }}>
                {goldData.recommendedOption}
              </Typography>
              <Typography variant="caption" sx={{ color: "#059669", fontWeight: 700 }}>
                Zero storage hassle + 2.5% annual interest on SGBs
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Historical Price Trend Chart */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: "20px", background: "#fff", border: "1px solid #eef2f6", mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
            6-Month Gold Price Trend (₹ / Gram)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Historical movement demonstrating steady long-term capital preservation
          </Typography>
          <Box sx={{ height: 280 }}>
            <Line data={chartData} options={chartOptions} />
          </Box>
        </Paper>

        {/* Investment Instruments Comparison */}
        <Typography variant="h5" sx={{ fontWeight: 800, color: "#1e293b", mb: 2 }}>
          Gold Investment Options
        </Typography>

        <Grid container spacing={3}>
          {goldData.options.map((opt, idx) => (
            <Grid item xs={12} md={4} key={idx}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: "18px",
                  background: "#fff",
                  border: "1px solid #eef2f6",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Chip label={opt.tag} size="small" sx={{ background: "#fef3c7", color: "#b45309", fontWeight: 700, mb: 1.5 }} />
                  <Typography variant="h6" sx={{ fontWeight: 800, color: "#1e293b", mb: 1 }}>
                    {opt.name}
                  </Typography>

                  <Stack spacing={1.5} sx={{ my: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Expected Returns</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#d97706" }}>{opt.returnRate}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Tax Benefit & Features</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{opt.taxBenefit}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Min Investment</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{opt.minInvestment}</Typography>
                    </Box>
                  </Stack>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  sx={{
                    background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
                    borderRadius: "10px",
                    fontWeight: 700,
                    textTransform: "none",
                    mt: 2,
                  }}
                >
                  Invest in {opt.name.split(" ")[0]}
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default GoldAnalysisPage;
