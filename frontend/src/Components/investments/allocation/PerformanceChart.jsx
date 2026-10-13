import React from "react";
import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from "chart.js";
import { performanceHistory } from "../../../data/investmentMockData";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const fmt = (n) =>
  Number(n || 0).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

const PerformanceChart = ({ history = performanceHistory }) => {
  const chartData = {
    labels: history.map((h) => h.month),
    datasets: [
      {
        label: "Portfolio Value",
        data: history.map((h) => h.portfolioValue),
        borderColor: "#6366F1",
        backgroundColor: "rgba(99,102,241,0.08)",
        tension: 0.4, fill: true, pointRadius: 4,
        pointBackgroundColor: "#6366F1", pointBorderColor: "#fff", pointBorderWidth: 2,
      },
      {
        label: "Invested Amount",
        data: history.map((h) => h.investedAmount),
        borderColor: "#10B981",
        backgroundColor: "rgba(16,185,129,0.05)",
        tension: 0.4, fill: true, pointRadius: 4, borderDash: [5, 4],
        pointBackgroundColor: "#10B981", pointBorderColor: "#fff", pointBorderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: "top", labels: { usePointStyle: true, pointStyleWidth: 8, font: { size: 12, weight: 600 }, color: "#374151" } }, tooltip: { callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${fmt(ctx.raw)}` } } },
    scales: {
      y: { beginAtZero: false, grid: { color: "#F1F5F9" }, ticks: { callback: (v) => "Rs." + (v / 1000).toFixed(0) + "k", color: "#9CA3AF", font: { size: 11 } } },
      x: { grid: { display: false }, ticks: { color: "#9CA3AF", font: { size: 11 } } },
    },
  };

  return (
    <Card elevation={0} sx={{ borderRadius: "18px", border: "1px solid #F1F5F9", background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.03)", height: "100%" }}>
      <CardContent sx={{ p: 3 }}>
        <Stack sx={{ mb: 3, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography sx={{ fontWeight: 800, color: "#111827", fontSize: "1rem" }}>Performance Over Time</Typography>
            <Typography sx={{ color: "#9CA3AF", fontSize: "0.8rem", mt: 0.3 }}>Portfolio vs invested amount</Typography>
          </Box>
          <Chip label="6 Months" size="small" sx={{ background: "#F3F4F6", color: "#374151", fontWeight: 700, fontSize: "0.72rem", borderRadius: "10px" }} />
        </Stack>
        <Box sx={{ height: 220 }}>
          <Line data={chartData} options={chartOptions} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;
