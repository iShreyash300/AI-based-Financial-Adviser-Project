import React from "react";
import { Box, Card, CardContent, Chip, Grid, Stack, Typography } from "@mui/material";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { investmentAllocation, allocationSummary } from "../../../data/investmentMockData";

ChartJS.register(ArcElement, Tooltip, Legend);

const fmt = (n) =>
  Number(n || 0).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

const AllocationChartCard = ({ allocation = investmentAllocation, summary = allocationSummary }) => {
  const chartData = {
    labels: allocation.map((a) => a.assetClass),
    datasets: [{ data: allocation.map((a) => a.allocation), backgroundColor: allocation.map((a) => a.color), borderWidth: 3, borderColor: "#ffffff", hoverOffset: 6 }],
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false, cutout: "72%",
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => { const item = allocation[ctx.dataIndex]; return ` ${item.assetClass}: ${item.allocation}% (${fmt(item.investedAmount)})`; } } } },
  };

  const COL_HEADERS = ["Asset Class", "Allocation", "Amount", "Current Value", "Returns"];
  const COL_SIZES = [3, 2.2, 2.2, 2.2, 2.2];

  return (
    <Card elevation={0} sx={{ borderRadius: "18px", border: "1px solid #F1F5F9", background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
      <CardContent sx={{ p: 3 }}>
        <Stack sx={{ mb: 3, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography sx={{ fontWeight: 800, color: "#111827", fontSize: "1rem" }}>Investment Allocatison</Typography>
            <Typography sx={{ color: "#9CA3AF", fontSize: "0.8rem", mt: 0.3 }}>How your money is distributed</Typography>
          </Box>
          <Chip label="Current Allocation" size="small" sx={{ background: "#EFF6FF", color: "#3B82F6", fontWeight: 700, fontSize: "0.7rem", borderRadius: "10px" }} />
        </Stack>

        <Grid container spacing={3} sx={{ alignItems: "center", flexDirection: "row", flexWrap: "nowrap" }}>
          {/* Donut */}
          <Grid item xs={12} md={5}>
            <Box sx={{ position: "relative", height: 220, display: "flex", justifyContent: "center", alignItems: "center" }}>
              <Doughnut data={chartData} options={chartOptions} />
              <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", pointerEvents: "none" }}>
                <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: "#111827", lineHeight: 1.1 }}>{fmt(summary.totalInvested)}</Typography>
                <Typography sx={{ fontSize: "0.7rem", color: "#9CA3AF", fontWeight: 500 }}>Invested</Typography>
              </Box>
            </Box>
            <Stack sx={{ mt: 2, gap: 0.8 }}>
              {allocation.map((item) => (
                <Stack key={item.assetClass} direction="row" alignItems="center" justifyContent="space-between">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ width: 10, height: 10, borderRadius: "3px", background: item.color, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: "0.8rem", color: "#374151", fontWeight: 500 }}>{item.assetClass}</Typography>
                  </Stack>
                  <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#111827" }}>{item.allocation}%</Typography>
                </Stack>
              ))}
            </Stack>
          </Grid>

          {/* Table */}
          <Grid item xs={12} md={7}  >
            <Grid container sx={{ pb: 1.5, mb: 1, borderBottom: "1px solid #F1F5F9" }}>
              {COL_HEADERS.map((h, i) => (
                <Grid item xs={COL_SIZES[i]} key={h} sx={{ textAlign: i === 0 ? "left" : "center" }}>
                  <Typography sx={{ fontSize: "0.68rem", color: "#9CA3AF", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4 }}>{h}</Typography>
                </Grid>
              ))}
            </Grid>
            <Stack sx={{ gap: 1.5 }}>
              {allocation.map((item) => (
                <Grid container key={item.assetClass} alignItems="center">
                  <Grid item xs={3}><Stack direction="row" alignItems="center" spacing={1}><Box sx={{ width: 8, height: 8, borderRadius: "50%", background: item.color, flexShrink: 0 }} /><Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#111827" }}>{item.assetClass}</Typography></Stack></Grid>
                  <Grid item xs={2.2} sx={{ textAlign: "center" }}><Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151" }}>{item.allocation}%</Typography></Grid>
                  <Grid item xs={2.2} sx={{ textAlign: "center" }}><Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151" }}>{fmt(item.investedAmount)}</Typography></Grid>
                  <Grid item xs={2.2} sx={{ textAlign: "center" }}><Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#111827" }}>{fmt(item.currentValue)}</Typography></Grid>
                  <Grid item xs={2.2} sx={{ textAlign: "center" }}><Chip label={`+${item.returnPercentage.toFixed(2)}%`} size="small" sx={{ background: "#DCFCE7", color: "#15803D", fontWeight: 700, fontSize: "0.7rem", height: 20, borderRadius: "8px" }} /></Grid>
                </Grid>
              ))}
            </Stack>
            <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #F1F5F9" }}>
              <Grid container>
                <Grid item xs={3}><Typography sx={{ fontSize: "0.8rem", fontWeight: 800, color: "#111827" }}>Total</Typography></Grid>
                <Grid item xs={2.2} sx={{ textAlign: "center" }}><Typography sx={{ fontSize: "0.8rem", fontWeight: 800, color: "#111827" }}>100%</Typography></Grid>
                <Grid item xs={2.2} sx={{ textAlign: "center" }}><Typography sx={{ fontSize: "0.8rem", fontWeight: 800, color: "#111827" }}>{fmt(summary.totalInvested)}</Typography></Grid>
                <Grid item xs={2.2} sx={{ textAlign: "center" }}><Typography sx={{ fontSize: "0.8rem", fontWeight: 800, color: "#111827" }}>{fmt(summary.currentValue)}</Typography></Grid>
                <Grid item xs={2.2} sx={{ textAlign: "center" }}><Chip label={`+${summary.totalProfitPercent.toFixed(2)}%`} size="small" sx={{ background: "#DCFCE7", color: "#15803D", fontWeight: 800, fontSize: "0.7rem", height: 20, borderRadius: "8px" }} /></Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default AllocationChartCard;
