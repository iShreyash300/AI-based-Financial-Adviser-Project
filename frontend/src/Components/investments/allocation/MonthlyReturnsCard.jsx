import React from "react";
import { Box, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import { monthlyReturns } from "../../../data/investmentMockData";

const fmt = (n) =>
  Number(Math.abs(n) || 0).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

const StatBox = ({ label, sublabel, value, percent, isPositive }) => (
  <Box sx={{ background: "#F8FAFC", borderRadius: "14px", p: 2, border: "1px solid #F1F5F9" }}>
    <Typography sx={{ fontSize: "0.72rem", color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4, mb: 0.5 }}>{label}</Typography>
    {sublabel && <Typography sx={{ fontSize: "0.75rem", color: "#6B7280", fontWeight: 500, mb: 0.5 }}>{sublabel}</Typography>}
    <Typography sx={{ fontWeight: 800, fontSize: "1.2rem", color: isPositive ? "#111827" : "#EF4444" }}>
      {isPositive ? "" : "-"}{fmt(value)}
    </Typography>
    <Stack sx={{ mt: 0.4, flexDirection: "row", alignItems: "center", gap: 0.4 }}>
      {isPositive
        ? <TrendingUpIcon sx={{ fontSize: 14, color: "#10B981" }} />
        : <TrendingDownIcon sx={{ fontSize: 14, color: "#EF4444" }} />}
      <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: isPositive ? "#10B981" : "#EF4444" }}>
        {isPositive ? "+" : ""}{percent.toFixed(2)}%
      </Typography>
    </Stack>
  </Box>
);

const MonthlyReturnsCard = ({ data = monthlyReturns }) => (
  <Card elevation={0} sx={{ borderRadius: "18px", border: "1px solid #F1F5F9", background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.03)", height: "100%" }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontWeight: 800, color: "#111827", fontSize: "1rem" }}>Monthly Returns</Typography>
        <Typography sx={{ color: "#9CA3AF", fontSize: "0.8rem", mt: 0.3 }}>Month-wise performance summary</Typography>
      </Box>
      <Grid container spacing={2} sx={{ flexDirection: "column" }} >
        <Grid item xs={12} sm={4}>
          <StatBox label="This Month Return" value={data.thisMonth.value} percent={data.thisMonth.percent} isPositive={data.thisMonth.isPositive} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatBox label="Best Month" sublabel={data.bestMonth.label} value={data.bestMonth.value} percent={data.bestMonth.percent} isPositive={data.bestMonth.isPositive} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatBox label="Worst Month" sublabel={data.worstMonth.label} value={data.worstMonth.value} percent={data.worstMonth.percent} isPositive={data.worstMonth.isPositive} />
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

export default MonthlyReturnsCard;
