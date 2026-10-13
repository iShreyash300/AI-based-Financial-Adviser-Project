
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import PieChartIcon from "@mui/icons-material/PieChart";
import SpeedIcon from "@mui/icons-material/Speed";
import ShieldIcon from "@mui/icons-material/Shield";
import { allocationSummary } from "../../../data/investmentMockData";

const fmt = (n) =>
  Number(n || 0).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

const SummaryCard = ({ title, value, sub, pct, isPositive, icon, iconBg, iconColor }) => (
  <Card elevation={0} sx={{
    borderRadius: "16px", border: "1px solid #F1F5F9", background: "#fff",
    boxShadow: "0 2px 12px rgba(0,0,0,0.03)", transition: "all 0.2s",
    "&:hover": { transform: "translateY(-2px)", boxShadow: "0 5px 20px rgba(0,0,0,0.06)" },
  }}>
    <CardContent sx={{ p: 2.5 }}>
      <Stack sx={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: "0.72rem", color: "#9CA3AF", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, mb: 0.8 }}>
            {title}
          </Typography>
          <Typography sx={{ fontWeight: 800, fontSize: "1.5rem", color: "#111827", letterSpacing: "-0.5px", lineHeight: 1.1 }}>{value}</Typography>
          <Stack sx={{ mt: 0.6, flexDirection: "row", alignItems: "center", gap: 0.4 }}>
            {pct !== undefined && (isPositive
              ? <TrendingUpIcon sx={{ fontSize: 13, color: "#10B981" }} />
              : <TrendingDownIcon sx={{ fontSize: 13, color: "#EF4444" }} />)}
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: pct !== undefined ? (isPositive ? "#10B981" : "#EF4444") : "#9CA3AF" }}>
              {sub}
            </Typography>
          </Stack>
        </Box>
        <Box sx={{ width: 44, height: 44, borderRadius: "14px", background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", color: iconColor, flexShrink: 0 }}>
          {icon}
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const AllocationSummaryCards = ({ summary = allocationSummary }) => {
  const cards = [
    { title: "Total Invested", value: fmt(summary.totalInvested), sub: summary.totalInvestedNote, icon: <AccountBalanceWalletIcon />, iconBg: "#EFF6FF", iconColor: "#3B82F6" },
    { title: "Current Value", value: fmt(summary.currentValue), sub: `▲ ${summary.currentValueChange.toFixed(2)}% from invested`, pct: summary.currentValueChange, isPositive: true, icon: <ShowChartIcon />, iconBg: "#ECFDF5", iconColor: "#10B981" },
    { title: "Total Profit / Loss", value: fmt(summary.totalProfit), sub: `▲ ${summary.totalProfitPercent.toFixed(2)}% overall returns`, pct: summary.totalProfitPercent, isPositive: true, icon: <PieChartIcon />, iconBg: "#F5F3FF", iconColor: "#8B5CF6" },
    { title: "Today's Change", value: fmt(summary.todayChange), sub: `▲ ${summary.todayChangePercent.toFixed(2)}%`, pct: summary.todayChangePercent, isPositive: true, icon: <SpeedIcon />, iconBg: "#FFF7ED", iconColor: "#F59E0B" },
    { title: "Risk Profile", value: summary.riskProfile, sub: summary.riskNote, icon: <ShieldIcon />, iconBg: "#FFFBEB", iconColor: "#D97706" },
  ];

  return (
    <Stack sx={{ mb: 3, gap: 2, flexDirection: { xs: "column", md: "row" } }}>
      {cards.map((card) => (
        <Stack key={card.title} sx={{ width: "100%" }} >
          <SummaryCard {...card} />
        </Stack>
      ))}
    </Stack>
  );
};

export default AllocationSummaryCards;
