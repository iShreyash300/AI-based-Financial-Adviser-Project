import React from "react";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import { investmentAllocation } from "../../../data/investmentMockData";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const AssetWiseReturnChart = ({ allocation = investmentAllocation }) => {
  const chartData = {
    labels: allocation.map((a) => a.assetClass),
    datasets: [{
      label: "Return %",
      data: allocation.map((a) => a.returnPercentage),
      backgroundColor: allocation.map((a) => a.color),
      borderRadius: 8, borderSkipped: false,
    }],
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false, indexAxis: "x",
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => ` Return: ${ctx.raw.toFixed(2)}%` } },
      datalabels: { display: false },
    },
    scales: {
      y: { beginAtZero: true, max: 20, grid: { color: "#F1F5F9" }, ticks: { callback: (v) => v + "%", color: "#9CA3AF", font: { size: 11 } } },
      x: { grid: { display: false }, ticks: { color: "#374151", font: { size: 12, weight: 600 } } },
    },
  };

  return (
    <Card elevation={0} sx={{ borderRadius: "18px", border: "1px solid #F1F5F9", background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.03)", height: "100%" }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontWeight: 800, color: "#111827", fontSize: "1rem" }}>Asset Wise Return (%)</Typography>
          <Typography sx={{ color: "#9CA3AF", fontSize: "0.8rem", mt: 0.3 }}>Returns percentage by asset class</Typography>
        </Box>
        <Box sx={{ height: 200 }}>
          <Bar data={chartData} options={chartOptions} />
        </Box>
        <Stack direction="row" justifyContent="space-around" sx={{ mt: 2 }}>
          {allocation.map((item) => (
            <Box key={item.assetClass} sx={{ textAlign: "center" }}>
              <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: item.color }}>{item.returnPercentage.toFixed(2)}%</Typography>
              <Typography sx={{ fontSize: "0.72rem", color: "#9CA3AF", fontWeight: 500 }}>{item.assetClass}</Typography>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default AssetWiseReturnChart;
