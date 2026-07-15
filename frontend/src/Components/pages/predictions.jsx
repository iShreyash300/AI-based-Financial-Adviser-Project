import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  Alert,
  IconButton,
  Tooltip as MuiTooltip,
} from "@mui/material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

const API_BASE_URL = "http://localhost:5000/api/predictions";

const PredictionsPage = () => {
  const [tabValue, setTabValue] = useState(0); // 0: Expense, 1: Revenue, 2: Cash Flow
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [predictionData, setPredictionData] = useState(null);

  const tabEndpoints = ["expense", "revenue", "cashflow"];

  const fetchPredictions = async (type) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/${type}`, {
        headers: { Authorization: token },
      });

      if (response.data?.success) {
        setPredictionData(response.data.data);
      } else {
        setError("Unable to load prediction calculations from server.");
      }
    } catch (err) {
      console.error(`Error fetching ${type} predictions:`, err);
      setError(
        err.response?.data?.message ||
        "Failed to connect to the prediction servers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions(tabEndpoints[tabValue]);
  }, [tabValue]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleRefresh = () => {
    fetchPredictions(tabEndpoints[tabValue]);
  };

  // Setup Chart Data & Options
  const getChartConfig = () => {
    if (!predictionData || !predictionData.chartData) return { data: {}, options: {} };

    const { chartData } = predictionData;
    const labels = chartData.map((d) => d.month);

    // Build actuals dataset
    const actuals = chartData.map((d, idx) => {
      // Connect to the prediction point: actual line ends at the 6th element, but let's include it
      if (d.type === "actual") return d.amount;
      return null;
    });

    // Build projected dataset (starts at last actual to make a connected line)
    const projections = chartData.map((d, idx) => {
      if (d.type === "predicted") return d.amount;
      if (idx === chartData.length - 2) return d.amount; // Last actual index
      return null;
    });

    const isNegativeCashFlow = tabValue === 2 && predictionData.predictedAmount < 0;

    const data = {
      labels,
      datasets: [
        {
          label: "Historical Actuals",
          data: actuals,
          borderColor: tabValue === 0 ? "#5B5FEF" : tabValue === 1 ? "#00C49F" : "#0088FE",
          backgroundColor: tabValue === 0 ? "rgba(91, 95, 239, 0.05)" : tabValue === 1 ? "rgba(0, 196, 159, 0.05)" : "rgba(0, 136, 254, 0.05)",
          tension: 0.35,
          borderWidth: 3.5,
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
        },
        {
          label: "AI Projection",
          data: projections,
          borderColor: isNegativeCashFlow ? "#FF4D4F" : "#FF6584",
          backgroundColor: "transparent",
          tension: 0.35,
          borderWidth: 3.5,
          borderDash: [6, 6],
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: isNegativeCashFlow ? "#FF4D4F" : "#FF6584",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: {
            font: { family: "Inter, sans-serif", weight: 600, size: 12 },
            color: "#475569",
            usePointStyle: true,
            boxWidth: 8,
          },
        },
        tooltip: {
          padding: 12,
          backgroundColor: "#1E293B",
          titleFont: { family: "Inter, sans-serif", size: 13, weight: 700 },
          bodyFont: { family: "Inter, sans-serif", size: 12 },
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || "";
              if (label) label += ": ";
              if (context.parsed.y !== null) {
                label += "₹" + context.parsed.y.toLocaleString("en-IN", { minimumFractionDigits: 2 });
              }
              return label;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { family: "Inter, sans-serif", size: 11, weight: 500 },
            color: "#64748B",
          },
        },
        y: {
          grid: { color: "rgba(148, 163, 184, 0.12)" },
          ticks: {
            font: { family: "Inter, sans-serif", size: 11 },
            color: "#64748B",
            callback: function (value) {
              return "₹" + value.toLocaleString("en-IN", { maximumFractionDigits: 0 });
            },
          },
        },
      },
    };

    return { data, options };
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return { bg: "#FEF2F2", text: "#EF4444", border: "rgba(239, 68, 68, 0.2)" };
      case "medium":
        return { bg: "#FFFBEB", text: "#F59E0B", border: "rgba(245, 158, 11, 0.2)" };
      case "low":
        return { bg: "#EFF6FF", text: "#3B82F6", border: "rgba(59, 130, 246, 0.2)" };
      default:
        return { bg: "#F8FAFC", text: "#64748B", border: "rgba(100, 116, 139, 0.2)" };
    }
  };

  const getRecommendationIcon = (type) => {
    switch (type) {
      case "expense_reduction":
      case "risk_alert":
        return <TrendingDownIcon sx={{ color: "#EF4444" }} />;
      case "investment_tip":
        return <TrendingUpIcon sx={{ color: "#10B981" }} />;
      case "budget_advice":
        return <InfoOutlinedIcon sx={{ color: "#F59E0B" }} />;
      default:
        return <LightbulbOutlinedIcon sx={{ color: "#3B82F6" }} />;
    }
  };

  const { data: chartData, options: chartOptions } = getChartConfig();

  const isExpense = tabValue === 0;
  const isRevenue = tabValue === 1;
  const isCashFlow = tabValue === 2;

  // Header metric colors based on page state
  const getThemeColor = () => {
    if (isExpense) return "#5B5FEF";
    if (isRevenue) return "#00C49F";
    return "#0088FE";
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        px: { xs: 2, md: 4 },
        py: { xs: 3, md: 4 },
        mt: { xs: 8, md: 0 },
        background: "linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)",
      }}
    >
      {/* HEADER SECTION */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 4 },
          mb: 4,
          borderRadius: "24px",
          border: "1px solid rgba(148, 163, 184, 0.15)",
          background: "#ffffff",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.02)",
        }}
      >
        <Stack
          sx={{
            flexDirection: { xs: "column", md: "row" }

          }}

        >
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h4" fontWeight={800} color="#1E293B">
                AI Financial Predictions
              </Typography>
              <Chip
                icon={<WorkspacePremiumIcon />}
                label="Predictive Engine v1.2"
                size="small"
                sx={{
                  background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "11px",
                  "& .MuiChip-icon": { color: "#fff" },
                }}
              />
            </Stack>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Real-time cash forecasting and machine-learning recommendations generated from actual ledger balances.
            </Typography>
          </Box>
          <IconButton
            onClick={handleRefresh}
            disabled={loading}
            sx={{
              backgroundColor: "rgba(108, 99, 255, 0.08)",
              color: "#6C63FF",
              "&:hover": { backgroundColor: "rgba(108, 99, 255, 0.15)" },
              borderRadius: "12px",
              p: 1.5,
              cursor: "pointer",
            }}
          >
            <AutorenewIcon className={loading ? "spin-animation" : ""} />
          </IconButton>
        </Stack>

        <Divider sx={{ my: 3 }} />

        {/* TABS */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: "48px",
            "& .MuiTabs-indicator": {
              backgroundColor: getThemeColor(),
              height: "3px",
              borderRadius: "3px",
            },
          }}
        >
          <Tab
            label="Expense Prediction"
            sx={{
              fontWeight: 700,
              fontSize: "15px",
              textTransform: "none",
              color: "#64748B",
              "&.Mui-selected": { color: "#5B5FEF" },
            }}
          />
          <Tab
            label="Revenue Prediction"
            sx={{
              fontWeight: 700,
              fontSize: "15px",
              textTransform: "none",
              color: "#64748B",
              "&.Mui-selected": { color: "#00C49F" },
            }}
          />
          <Tab
            label="Cash Flow Prediction"
            sx={{
              fontWeight: 700,
              fontSize: "15px",
              textTransform: "none",
              color: "#64748B",
              "&.Mui-selected": { color: "#0088FE" },
            }}
          />
        </Tabs>
      </Paper>

      {/* MAIN CONTAINER */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: "14px" }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Stack sx={{ py: 12, alignItems: "center", justifyContent: "center" }}>
          <CircularProgress size={50} sx={{ color: getThemeColor() }} />
          <Typography sx={{ mt: 2, fontWeight: 600 }} color="text.secondary">
            Recalculating regression coefficients and AI insights...
          </Typography>
        </Stack>
      ) : predictionData ? (
        <Stack container spacing={4}>

          {/* LEFT SIDE: PREDICTED AMOUNT & MONTHLY LINE CHART */}
          <Stack >
            <Stack>

              {/* KPI CARD */}
              <Card
                elevation={0}
                sx={{
                  borderRadius: "24px",
                  border: "1px solid rgba(148, 163, 184, 0.15)",
                  boxShadow: "0 10px 35px rgba(15, 23, 42, 0.03)",
                  overflow: "hidden",
                }}
              >

                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="body2" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "1px" }}>
                        Projected Amount ({predictionData.predictedMonth})
                      </Typography>
                      <Typography variant="h3" fontWeight={850} color="#1E293B" sx={{ mt: 1.5, letterSpacing: "-1px" }}>
                        ₹{predictionData.predictedAmount.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Stack sx={{ flexDirection: "row" }} alignItems="center" spacing={0.5} >
                        {predictionData.growthPercentage >= 0 ? (
                          <Chip
                            icon={<TrendingUpIcon />}
                            label={`+${predictionData.growthPercentage}%`}
                            size="small"
                            sx={{
                              backgroundColor: "#ECFDF5",
                              color: "#10B981",
                              fontWeight: 700,
                              "& .MuiChip-icon": { color: "#10B981" },
                            }}
                          />
                        ) : (
                          <Chip
                            icon={<TrendingDownIcon />}
                            label={`${predictionData.growthPercentage}%`}
                            size="small"
                            sx={{
                              backgroundColor: "#FEF2F2",
                              color: "#EF4444",
                              fontWeight: 700,
                              "& .MuiChip-icon": { color: "#EF4444" },
                            }}
                          />
                        )}
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1, fontWeight: 500 }}>
                        vs. current month actual
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider sx={{ my: 3 }} />

                  <Stack sx={{ flexDirection: "row", gap: "20px" }} >
                    <Stack >
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        CONFIDENCE SCORE
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                        <Typography variant="h6" fontWeight={700} color="#334155">
                          {predictionData.confidenceScore}%
                        </Typography>
                        <MuiTooltip title="Based on historical volatility and linearity of historical data. Higher values indicate more stable historical trends.">
                          <IconButton size="small" sx={{ p: 0 }}>
                            <InfoOutlinedIcon sx={{ fontSize: 16, color: "#94A3B8" }} />
                          </IconButton>
                        </MuiTooltip>
                      </Stack>
                    </Stack>
                    <Stack item xs={6} sx={{ borderLeft: "1px solid #E2E8F0" }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        {isExpense ? "MONTHLY BUDGET" : isRevenue ? "INFLOW STABILITY" : "NET CASH TARGET"}
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color="#334155" sx={{ mt: 0.5 }}>
                        {isExpense
                          ? predictionData.budgetAmount > 0
                            ? `₹${predictionData.budgetAmount.toLocaleString("en-IN")}`
                            : "Not Set"
                          : isRevenue
                            ? "High"
                            : predictionData.predictedAmount >= 0
                              ? "Surplus"
                              : "Deficit"
                        }
                      </Typography>
                    </Stack>
                  </Stack>

                  {/* LINE CHART */}

                </CardContent>
              </Card>
            </Stack>
            <Card
              elevation={0}
              sx={{
                borderRadius: "24px",
                border: "1px solid rgba(148, 163, 184, 0.15)",
                boxShadow: "0 10px 35px rgba(15, 23, 42, 0.03)",
                p: 3,
              }}
            >
              <CardContent>
                <Typography variant="h6" fontWeight={800} color="#1E293B" sx={{ mb: 3 }}>
                  Monthly Forecast Visualizer
                </Typography>
                <Box sx={{ height: 320, width: "100%", position: "relative" }}>
                  <Line data={chartData} options={chartOptions} />
                </Box>
              </CardContent>
            </Card>
          </Stack>

          {/* RIGHT SIDE: PREDICTION SUMMARY & AI RECOMMENDATIONS */}
          <Grid item xs={12} lg={5}>
            <Stack spacing={4}>

              {/* SUMMARY CARD */}
              <Card
                elevation={0}
                sx={{
                  borderRadius: "24px",
                  border: "1px solid rgba(148, 163, 184, 0.15)",
                  boxShadow: "0 10px 35px rgba(15, 23, 42, 0.03)",
                  backgroundColor: "#ffffff",
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" fontWeight={800} color="#1E293B" sx={{ mb: 2 }}>
                    AI Prediction Summary
                  </Typography>
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: "16px",
                      backgroundColor: "rgba(108, 99, 255, 0.03)",
                      border: "1px dashed rgba(108, 99, 255, 0.25)",
                    }}
                  >
                    <Typography variant="body1" color="#475569" sx={{ lineHeight: "1.7", fontWeight: 500 }}>
                      {predictionData.summary}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* KEY INSIGHTS / AI RECOMMENDATIONS */}
              <Card
                elevation={0}
                sx={{
                  borderRadius: "24px",
                  border: "1px solid rgba(148, 163, 184, 0.15)",
                  boxShadow: "0 10px 35px rgba(15, 23, 42, 0.03)",
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" fontWeight={800} color="#1E293B" sx={{ mb: 3 }}>
                    AI Recommendations & Key Insights
                  </Typography>

                  {(!predictionData.recommendations || predictionData.recommendations.length === 0) ? (
                    <Box sx={{ py: 4, textAlign: "center" }}>
                      <LightbulbOutlinedIcon sx={{ fontSize: 40, color: "#94A3B8" }} />
                      <Typography sx={{ mt: 1, fontWeight: 600 }} color="text.secondary">
                        No critical actions needed
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Historical data shows a stable and positive outlook.
                      </Typography>
                    </Box>
                  ) : (
                    <Stack spacing={3}>
                      {predictionData.recommendations.map((rec, index) => {
                        const style = getPriorityColor(rec.priority);
                        return (
                          <Paper
                            key={index}
                            elevation={0}
                            sx={{
                              p: 2.5,
                              borderRadius: "18px",
                              backgroundColor: style.bg,
                              border: `1px solid ${style.border}`,
                              transition: "all 0.2s ease-in-out",
                              "&:hover": {
                                transform: "translateY(-2px)",
                                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.04)",
                              },
                            }}
                          >
                            <Stack direction="row" spacing={2} alignItems="flex-start">
                              <Box
                                sx={{
                                  p: 1,
                                  borderRadius: "10px",
                                  backgroundColor: "#fff",
                                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                {getRecommendationIcon(rec.recommendation_type)}
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                  <Typography
                                    variant="subtitle2"
                                    fontWeight={700}
                                    sx={{
                                      textTransform: "capitalize",
                                      color: "#1E293B",
                                    }}
                                  >
                                    {rec.recommendation_type.replace("_", " ")}
                                  </Typography>
                                  <Chip
                                    label={rec.priority}
                                    size="small"
                                    sx={{
                                      backgroundColor: "#fff",
                                      color: style.text,
                                      borderColor: style.border,
                                      borderWidth: "1px",
                                      borderStyle: "solid",
                                      fontWeight: 800,
                                      textTransform: "uppercase",
                                      fontSize: "10px",
                                      height: "20px",
                                    }}
                                  />
                                </Stack>
                                <Typography variant="body2" color="#475569" sx={{ mt: 1.5, lineHeight: "1.6", fontWeight: 500 }}>
                                  {rec.message}
                                </Typography>
                              </Box>
                            </Stack>
                          </Paper>
                        );
                      })}
                    </Stack>
                  )}
                </CardContent>
              </Card>

            </Stack>
          </Grid>

        </Stack>
      ) : (
        <Alert severity="warning">No prediction data found.</Alert>
      )}

      {/* Spin animation for refresh button */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-animation {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </Box>
  );
};

export default PredictionsPage;
