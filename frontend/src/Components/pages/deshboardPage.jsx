import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";
import FinancialHealthScoreCard from "../ui/FinancialHealthScoreCard";

import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import RefreshIcon from "@mui/icons-material/Refresh";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, ChartTooltip, Legend, Filler
);

// ─── Config ───────────────────────────────────────────────────────────────────
const API = "http://localhost:5000/api";
const getAuth = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: token } : {};
};
const fmt = (n) =>
  Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

const PIE_COLORS = [
  "#5B5FEF", "#f59e0b", "#22c55e", "#ef4444",
  "#8b5cf6", "#06b6d4", "#f97316", "#14b8a6",
];


const stackstyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",

}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
const KpiCard = ({ title, value, sub, pct, positive, icon, color, loading }) => (
  <Card
    elevation={0}
    sx={{
      flex: 1,
      borderRadius: "18px",
      border: "1px solid #eee",
      background: `linear-gradient(135deg, ${color}12 0%, #fff 100%)`,
      transition: "transform 0.2s, box-shadow 0.2s",
      "&:hover": { transform: "translateY(-3px)", boxShadow: "0 8px 28px rgba(0,0,0,0.09)" },
      gap: 2,
      mt: 1
    }}
  >
    <CardContent sx={{ p: 2.5 }}>
      <Stack sx={stackstyle}>
        <Stack >
          <Typography sx={{ fontSize: "11px", color: "#999", fontWeight: 700, letterSpacing: 0.6, mb: 0.5 }}>
            {title.toUpperCase()}
          </Typography>
          {loading ? (
            <CircularProgress size={20} sx={{ color, mt: 0.5 }} />
          ) : (
            <>
              <Typography sx={{ fontSize: "26px", fontWeight: 800, color: "#111", lineHeight: 1.1 }}>
                {value}
              </Typography>
              <Stack sx={{ flexDirection: "row", alignItems: "center", gap: 2, mt: 0.6 }} >
                {pct !== null && pct !== undefined && (
                  <>
                    {positive
                      ? <TrendingUpIcon sx={{ fontSize: 14, color: "#22c55e" }} />
                      : <TrendingDownIcon sx={{ fontSize: 14, color: "#ef4444" }} />}
                    <Typography sx={{ fontSize: "12px", fontWeight: 700, color: positive ? "#22c55e" : "#ef4444" }}>
                      {pct}%
                    </Typography>
                  </>
                )}
                <Typography sx={{ fontSize: "11px", color: "#aaa" }}>{sub}</Typography>
              </Stack>
            </>
          )}
        </Stack>
        <Box sx={{
          width: 44, height: 44, borderRadius: "12px",
          background: `${color}20`, display: "flex",
          alignItems: "center", justifyContent: "center", color,
        }}>
          {icon}
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

// ─── Chart wrapper ────────────────────────────────────────────────────────────
const ChartCard = ({ title, children, loading, chip }) => (
  <Card elevation={0} sx={{ borderRadius: "18px", border: "1px solid #eee", p: 2.5, height: "100%" }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
      <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#111" }}>{title}</Typography>
      {chip && (
        <Chip label={chip} size="small"
          sx={{ fontSize: "10px", background: "#f0f0ff", color: "#5B5FEF", fontWeight: 700 }} />
      )}
    </Stack>
    {loading
      ? <Stack alignItems="center" justifyContent="center" height={220}>
        <CircularProgress sx={{ color: "#5B5FEF" }} />
      </Stack>
      : <Box sx={{ height: 220 }}>{children}</Box>}
  </Card>
);

const EmptyChart = ({ msg }) => (
  <Stack alignItems="center" justifyContent="center" height={220}>
    <Typography color="#aaa" fontSize="13px" textAlign="center" px={2}>{msg}</Typography>
  </Stack>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loadingKpi, setLoadingKpi] = useState(true);
  const [loadingCharts, setLoadingCharts] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoadingKpi(true);
    setLoadingCharts(true);
    try {
      const [sumRes, chartRes] = await Promise.all([
        axios.get(`${API}/reports/summary`, { headers: getAuth() }),
        axios.get(`${API}/reports/charts`, { headers: getAuth() }),
      ]);
      if (sumRes.data?.success) setSummary(sumRes.data.data);
      if (chartRes.data?.success) setCharts(chartRes.data.data);
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setLoadingKpi(false);
      setLoadingCharts(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Derived KPI values ────────────────────────────────────────────────────
  const totalRevenue = summary?.totalRevenue ?? 0;
  const totalExpenses = summary?.totalExpenses ?? 0;
  const netProfit = summary?.netProfitLoss ?? 0;
  const profitMargin = summary?.profitMargin ?? 0;
  const budgetUtil = summary?.budgetUtilization ?? null;

  // ── Revenue + Expense Trend Line ─────────────────────────────────────────
  const revTrend = charts?.revenueTrend || [];
  const expTrend = charts?.expenseTrend || [];

  const revenueLineData = {
    labels: revTrend.map((r) => r.month || ""),
    datasets: [
      {
        label: "Revenue",
        data: revTrend.map((r) => r.total),
        borderColor: "#5B5FEF",
        backgroundColor: "rgba(91,95,239,0.10)",
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: "#5B5FEF",
      },
      {
        label: "Expenses",
        data: expTrend.map((r) => r.total),
        borderColor: "#ef4444",
        backgroundColor: "rgba(239,68,68,0.07)",
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: "#ef4444",
      },
    ],
  };
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "top" } },
    scales: {
      y: { beginAtZero: true, grid: { color: "#f3f4f6" } },
      x: { grid: { display: false } },
    },
  };

  // ── Revenue vs Expense Bar chart ──────────────────────────────────────────
  const rvE = charts?.revenueVsExpense || [];
  const barData = {
    labels: rvE.map((r) => r.month || ""),
    datasets: [
      { label: "Revenue", data: rvE.map((r) => r.revenue), backgroundColor: "#5B5FEF", borderRadius: 6 },
      { label: "Expenses", data: rvE.map((r) => r.expense), backgroundColor: "#f59e0b", borderRadius: 6 },
    ],
  };
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "top" } },
    scales: {
      y: { beginAtZero: true, grid: { color: "#f3f4f6" } },
      x: { grid: { display: false } },
    },
  };

  // ── Expense Category Pie ──────────────────────────────────────────────────
  const catBreakdown = charts?.expenseCategoryBreakdown || [];
  const pieData = {
    labels: catBreakdown.length > 0 ? catBreakdown.map((c) => c.category) : ["No Data"],
    datasets: [{
      data: catBreakdown.length > 0 ? catBreakdown.map((c) => c.total) : [1],
      backgroundColor: catBreakdown.length > 0 ? PIE_COLORS : ["#e5e7eb"],
      borderColor: "#fff",
      borderWidth: 2,
    }],
  };
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 11 } } } },
  };

  // ── Top Category Bar ──────────────────────────────────────────────────────
  const catBarData = {
    labels: catBreakdown.slice(0, 6).map((c) => c.category),
    datasets: [{
      label: "Amount",
      data: catBreakdown.slice(0, 6).map((c) => c.total),
      backgroundColor: PIE_COLORS.slice(0, 6),
      borderRadius: 6,
    }],
  };
  const catBarOptions = {
    ...barOptions,
    plugins: { ...barOptions.plugins, legend: { display: false } },
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, background: "#f8f9fc", minHeight: "100vh" }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <Stack sx={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }} mb={3}>
        <Box>
          <Typography sx={{ fontSize: { xs: "20px", md: "26px" }, fontWeight: 800, color: "#111" }}>
            Dashboard
          </Typography>
          <Typography sx={{ fontSize: "13px", color: "#aaa", mt: 0.3 }}>
            Live financial overview · {summary?.period ?? "Loading…"}
          </Typography>
        </Box>
        <Tooltip title="Refresh all data">
          <IconButton
            onClick={fetchAll}
            disabled={loadingKpi}
            sx={{
              background: "#fff", border: "1px solid #eee",
              borderRadius: "12px", "&:hover": { background: "#f0f0ff" },
            }}
          >
            <RefreshIcon sx={{ color: "#5B5FEF" }} />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
      <Stack sx={{ flexDirection: { xs: "column", sm: "row" }, gap: 3, mb: 3, flexWrap: "wrap" }}  >
        <KpiCard
          title="Total Revenue"
          value={`₹${fmt(totalRevenue)}`}
          sub="this period"
          pct={profitMargin !== 0 ? Math.abs(profitMargin).toFixed(1) : null}
          positive={true}
          icon={<TrendingUpIcon />}
          color="#5B5FEF"
          loading={loadingKpi}
        />
        <KpiCard
          title="Total Expenses"
          value={`₹${fmt(totalExpenses)}`}
          sub="this period"
          pct={budgetUtil !== null ? Math.abs(budgetUtil).toFixed(1) : null}
          positive={budgetUtil !== null ? budgetUtil < 80 : false}
          icon={<ReceiptLongIcon />}
          color="#ef4444"
          loading={loadingKpi}
        />
        <KpiCard
          title={netProfit >= 0 ? "Net Profit" : "Net Loss"}
          value={`₹${fmt(Math.abs(netProfit))}`}
          sub={netProfit >= 0 ? "profit this period" : "loss this period"}
          pct={profitMargin !== 0 ? Math.abs(profitMargin).toFixed(1) : null}
          positive={netProfit >= 0}
          icon={<AttachMoneyIcon />}
          color={netProfit >= 0 ? "#22c55e" : "#ef4444"}
          loading={loadingKpi}
        />
        <KpiCard
          title="Budget Utilization"
          value={budgetUtil !== null ? `${budgetUtil.toFixed(1)}%` : "No Budget"}
          sub="of total budget used"
          pct={null}
          positive={budgetUtil !== null ? budgetUtil < 90 : true}
          icon={<AccountBalanceWalletIcon />}
          color="#f59e0b"
          loading={loadingKpi}
        />
      </Stack>

      {/* ── Charts Grid ────────────────────────────────────────────────────── */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2,
          mb: 3,
          mt: 2,

        }}
      >
        <ChartCard title="Revenue & Expense Trend" loading={loadingCharts} chip="Monthly">
          {revTrend.length === 0
            ? <EmptyChart msg="No trend data yet. Add revenue & expenses to see monthly trends." />
            : <Line data={revenueLineData} options={lineOptions} />}
        </ChartCard>

        <ChartCard title="Revenue vs Expenses" loading={loadingCharts} chip="Comparison">
          {rvE.length === 0
            ? <EmptyChart msg="No comparison data available yet." />
            : <Bar data={barData} options={barOptions} />}
        </ChartCard>

        <ChartCard title="Expense Category Breakdown" loading={loadingCharts} chip="By Category">
          {catBreakdown.length === 0
            ? <EmptyChart msg="No expense category data yet. Add categorised expenses to see this chart." />
            : <Pie data={pieData} options={pieOptions} />}
        </ChartCard>

        <ChartCard title="Top Expense Categories" loading={loadingCharts} chip="Top 6">
          {catBreakdown.length === 0
            ? <EmptyChart msg="No expense category data yet." />
            : <Bar data={catBarData} options={catBarOptions} />}
        </ChartCard>
      </Box>

      {/* ── Financial Health Score ──────────────────────────────────────────── */}
      <Box>
        <FinancialHealthScoreCard />
      </Box>
    </Box>
  );
};

export default Dashboard;