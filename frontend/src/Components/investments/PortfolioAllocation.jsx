import React, { useState } from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Stack,
  Grid,
  Chip,
  Snackbar,
  Alert,
} from "@mui/material";
import { aiAdvisorData } from "../../data/investmentMockData";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const formatCurrency = (val) =>
  Number(val || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

const PortfolioAllocation = ({ data = aiAdvisorData.portfolioAllocation }) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Customize colors to match screenshot: Green, Orange, Indigo
  const colors = ["#6366F1", "#F59E0B", "#10B981"];
  const updatedData = data.map((item, i) => ({
    ...item,
    color: colors[i % colors.length],
  }));

  const totalAmount = updatedData.reduce((acc, item) => acc + item.amount, 0);

  const chartData = {
    labels: updatedData.map((item) => item.label),
    datasets: [
      {
        data: updatedData.map((item) => item.percentage),
        backgroundColor: updatedData.map((item) => item.color),
        borderWidth: 2,
        borderColor: "#ffffff",
        hoverOffset: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "75%",
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const index = context.dataIndex;
            const item = updatedData[index];
            return ` ${item.label}: ${item.percentage}% (${formatCurrency(item.amount)})`;
          },
        },
      },
    },
  };

  const riskChips = {
    "Stock Market": { label: "Moderate - High", bg: "#FEF3C7", text: "#D97706" },
    "Gold": { label: "Low - Moderate", bg: "#DCFCE7", text: "#15803D" },
    "Bank FD": { label: "Low", bg: "#ECFDF5", text: "#047857" },
  };

  const handleRebalance = () => {
    setSnackbarOpen(true);
  };

  return (
    <>
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
          <Stack sx={{ mb: 2, flexDirection: { xs: "column", md: "row", gap: 1, alignItems: "center", justifyContent: "space-between" } }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827", fontSize: "0.95rem" }}>
              Recommended Portfolio Allocation
            </Typography>
            <Chip
              label="AI Suggested"
              size="small"
              sx={{
                background: "#EFF6FF",
                color: "#3B82F6",
                fontWeight: 600,
                height: 20,
                fontSize: "0.7rem",
                borderRadius: "10px",
              }}
            />
          </Stack>

          <Grid container sx={{ flex: 1, gap: 2, alignItems: "center" }}>
            {/* Doughnut Chart with Center Text */}
            <Grid item xs={12} sm={4}>
              <Box sx={{ position: "relative", height: 180, display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Doughnut data={chartData} options={chartOptions} />
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                    pointerEvents: "none",
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#111827", lineHeight: 1.1 }}>
                    {formatCurrency(totalAmount)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#9CA3AF", fontSize: "0.7rem", fontWeight: 500 }}>
                    Total
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Breakdown Table */}
            <Grid item xs={12} sm={8}>
              <Box sx={{ width: "100%" }}>
                {/* Table Header */}
                <Grid container sx={{ borderBottom: "1px solid #F1F5F9", pb: 1, mb: 1.5, gap: 0.5 }}>
                  <Grid item xs={3.5}>
                    <Typography variant="caption" sx={{ color: "#9CA3AF", fontWeight: 600, fontSize: "0.7rem" }}>
                      Asset Class
                    </Typography>
                  </Grid>
                  <Grid item xs={2.5} sx={{ textAlign: "center" }}>
                    <Typography variant="caption" sx={{ color: "#9CA3AF", fontWeight: 600, fontSize: "0.7rem" }}>
                      Recommended %
                    </Typography>
                  </Grid>
                  <Grid item xs={2.5} sx={{ textAlign: "right" }}>
                    <Typography variant="caption" sx={{ color: "#9CA3AF", fontWeight: 600, fontSize: "0.7rem" }}>
                      Amount
                    </Typography>
                  </Grid>
                  <Grid item xs={3.5} sx={{ textAlign: "right" }}>
                    <Typography variant="caption" sx={{ color: "#9CA3AF", fontWeight: 600, fontSize: "0.7rem" }}>
                      Risk Level
                    </Typography>
                  </Grid>
                </Grid>

                {/* Table Rows */}
                <Stack sx={{ gap: 1.5, flexDirection: "column" }}>
                  {updatedData.map((item, idx) => (
                    <Grid container key={idx} sx={{ alignItems: "center", gap: 1 }}>
                      <Grid item xs={3.5}>
                        <Stack sx={{ flexDirection: "row", gap: 1, alignItems: "center" }}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: item.color,
                              flexShrink: 0,
                            }}
                          />
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#111827", fontSize: "0.8rem" }}>
                            {item.label}
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={2.5} sx={{ textAlign: "center" }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151", fontSize: "0.8rem" }}>
                          {item.percentage}%
                        </Typography>
                      </Grid>
                      <Grid item xs={2.5} sx={{ textAlign: "right" }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#111827", fontSize: "0.8rem" }}>
                          {formatCurrency(item.amount)}
                        </Typography>
                      </Grid>
                      <Grid item xs={3.5} sx={{ textAlign: "right" }}>
                        <Chip
                          label={riskChips[item.label]?.label || item.risk}
                          size="small"
                          sx={{
                            background: riskChips[item.label]?.bg || "#FEF3C7",
                            color: riskChips[item.label]?.text || "#D97706",
                            fontWeight: 600,
                            height: 20,
                            fontSize: "0.675rem",
                            borderRadius: "10px",
                          }}
                        />
                      </Grid>
                    </Grid>
                  ))}
                </Stack>
              </Box>
            </Grid>
          </Grid>

          {/* Bottom Rebalance Link */}
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Typography
              variant="caption"
              onClick={handleRebalance}
              sx={{
                color: "#6366F1",
                fontWeight: 600,
                fontSize: "0.8rem",
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Rebalance Portfolio
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          variant="filled"
          sx={{ borderRadius: "12px", fontWeight: 700, background: "#6366F1" }}
        >
          Portfolio rebalancing recommendation applied!
        </Alert>
      </Snackbar>
    </>
  );
};

export default PortfolioAllocation;
