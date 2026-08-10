import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import RefreshIcon from "@mui/icons-material/Refresh";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";

// ─── Colour palette keyed on status ──────────────────────────────────────────
const STATUS_PALETTE = {
  Good: { primary: "#22c55e", bg: "#f0fdf4", chip: "#dcfce7", text: "#15803d", gradient: "linear-gradient(135deg,#22c55e,#16a34a)" },
  Average: { primary: "#f59e0b", bg: "#fffbeb", chip: "#fef3c7", text: "#b45309", gradient: "linear-gradient(135deg,#f59e0b,#d97706)" },
  Poor: { primary: "#ef4444", bg: "#fef2f2", chip: "#fee2e2", text: "#b91c1c", gradient: "linear-gradient(135deg,#ef4444,#dc2626)" },
};

// Metric bar colour ramps
const metricColor = (score) => {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#f59e0b";
  return "#ef4444";
};

// Degree of the stroke around the circular gauge SVG
const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// ─── Circular gauge (SVG-based, no external library) ─────────────────────────
const CircularGauge = ({ score, status }) => {
  const palette = STATUS_PALETTE[status] || STATUS_PALETTE.Poor;
  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;

  return (
    <Box sx={{ position: "relative", width: 160, height: 160, mx: "auto" }}>
      <svg width="160" height="160" style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle
          cx="80" cy="80" r={RADIUS}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="12"
        />
        {/* Progress arc */}
        <circle
          cx="80" cy="80" r={RADIUS}
          fill="none"
          stroke={palette.primary}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>

      {/* Centre label */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          sx={{
            fontSize: "2rem",
            fontWeight: 800,
            lineHeight: 1,
            color: palette.primary,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {score}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: "#6b7280", fontWeight: 600, letterSpacing: "0.04em" }}
        >
          / 100
        </Typography>
      </Box>
    </Box>
  );
};

// ─── Single metric row with labelled progress bar ─────────────────────────────
const MetricRow = ({ label, score, description, rawValue, rawSuffix = "%" }) => {
  const color = metricColor(score);
  return (
    <Box>
      <Stack sx={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}   >
        <Stack sx={{ flexDirection: "row", alignItems: "center", gap: { md: 0.5, xs: 0.6 } }}  >
          <Typography sx={{ fontSize: { md: "0.8rem", xs: "0.7rem" }, fontWeight: 600, color: "#374151" }}>
            {label}
          </Typography>
          <Tooltip title={description} arrow placement="top">
            <InfoOutlinedIcon sx={{ fontSize: "0.9rem", color: "#9ca3af", cursor: "pointer" }} />
          </Tooltip>
        </Stack>
        <Stack direction="row" alignItems="center" gap={1}>
          {rawValue !== null && rawValue !== undefined && (
            <Typography sx={{ fontSize: "0.72rem", color: "#9ca3af", fontWeight: 500 }}>
              {rawValue > 0 ? "+" : ""}{rawValue}{rawSuffix}
            </Typography>
          )}
          <Typography
            sx={{
              fontSize: "0.8rem",
              fontWeight: 700,
              color,
              minWidth: 32,
              textAlign: "right",
            }}
          >
            {score}
          </Typography>
        </Stack>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={score}
        sx={{
          height: 20,
          borderRadius: 99,
          backgroundColor: "#f3f4f6",
          "& .MuiLinearProgress-bar": {
            borderRadius: 99,
            background: `linear-gradient(90deg, ${color}99, ${color})`,
            transition: "transform 1s ease",
          },
        }}
      />
    </Box>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const FinancialHealthScoreCard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchHealth = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in to view your Financial Health Score.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await axios.get("https://ai-based-financial-adviser-project.onrender.com/api/financial-health", {
        headers: { Authorization: token },
      });
      if (res.data?.success) {
        setData(res.data.data);
        setLastUpdated(new Date());
      } else {
        setError("Failed to load financial data.");
      }
    } catch (err) {
      console.error("FinancialHealth fetch error:", err);
      setError(err.response?.data?.message || "Unable to reach the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + auto-refresh every 30 seconds
  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30_000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading && !data) {
    return (
      <Card sx={cardSx}>
        <CardContent>
          <Stack alignItems="center" justifyContent="center" minHeight={360} gap={2}>
            <CircularProgress size={40} sx={{ color: "#6C63FF" }} />
            <Typography variant="body2" color="text.secondary">
              Calculating your financial health…
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <Card sx={cardSx}>
        <CardContent>
          <Stack alignItems="center" justifyContent="center" minHeight={200} gap={1.5}>
            <MonitorHeartIcon sx={{ fontSize: 40, color: "#ef4444" }} />
            <Typography variant="body2" color="error" textAlign="center" fontWeight={600}>
              {error}
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  const { overall_score, status, message, metrics, period, raw } = data;
  const palette = STATUS_PALETTE[status] || STATUS_PALETTE.Poor;
  const m = metrics;

  const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const periodLabel = `${MONTH_NAMES[period.current_month - 1]} ${period.current_year}`;
  const isMonthly = raw.using_monthly_data;

  // Revenue growth arrow
  const growthRaw = m.revenue_growth.raw_value;
  const growthPositive = growthRaw === null ? null : growthRaw >= 0;

  return (
    <Card sx={cardSx}>
      <CardContent sx={{ p: 0, display: "flex", flexDirection: "column", justifyContent: "space-around" }}>

        {/* ── Header ─────────────────────────────────────────────────── */}
        <Box
          sx={{
            // background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)",
            borderRadius: "18px 18px 0 0",
            px: { md: 3, xs: 1.5 }, py: 2.5,
          }}
        >
          <Stack sx={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
          >
            <Stack sx={{ flexDirection: "row", alignItems: "center", gap: 1.5 }} >
              <Box
                sx={{
                  width: { md: 38, xs: 30 }, height: { md: 38, xs: 30 },
                  borderRadius: { md: "10px", xs: "5px" },
                  background: "rgba(23, 22, 22, 0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <MonitorHeartIcon sx={{ color: "#969191ff", fontSize: { md: 22, xs: 18 } }} />
              </Box>
              <Box  >
                <Typography sx={{ color: "#5B5FEF", fontWeight: 700, fontSize: { md: "1rem", xs: "0.85rem" }, lineHeight: 1.2 }}>
                  Financial Health Score
                </Typography>
                <Typography sx={{ color: "rgba(0, 0, 0, 0.63)", fontSize: "0.75rem" }}>
                  {isMonthly ? `Current month · ${periodLabel}` : "All-time average"}
                </Typography>
              </Box>
            </Stack>

            <Stack sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 1 }} >
              {/* Status badge */}
              <Chip
                label={status}
                size="small"
                sx={{
                  backgroundColor: palette.primary,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  height: 26,
                  letterSpacing: "0.03em",
                }}
              />
              {/* Refresh icon */}
              <Tooltip title={`Refreshes every 30 s${lastUpdated ? ` · Last: ${lastUpdated.toLocaleTimeString()}` : ""}`}>
                <RefreshIcon
                  onClick={fetchHealth}
                  sx={{
                    color: "#5B5FEF",
                    fontSize: 24,
                    cursor: "pointer",
                    animation: loading ? "spin 1s linear infinite" : "none",
                    "@keyframes spin": { from: { transform: "rotate(0deg)" }, to: { transform: "rotate(360deg)" } },
                    "&:hover": { color: "#3733b4ff" },
                    transition: "color 0.2s",
                  }}
                />
              </Tooltip>
            </Stack>
          </Stack>
        </Box>

        {/* ── Body ────────────────────────────────────────────────────── */}
        <Box sx={{ px: 3, py: 2.5 }}>
          <Stack
            sx={{ flexDirection: { md: "row", xs: "column" }, justifyContent: "space-around" }}

          >

            {/* Gauge + summary ──────────────────────────────────────────── */}
            <Stack
              sx={{ flexDirection: "column", gap: 3, mb: 2.5 }}
            >
              {/* Circular gauge */}
              <Box sx={{ flexShrink: 0 }}>
                <CircularGauge score={overall_score} status={status} />

                {/* Label below gauge */}
                <Box
                  sx={{
                    mt: 1.5, px: 2, py: 0.8,
                    borderRadius: "10px",
                    background: palette.bg,
                    border: `1.5px solid ${palette.primary}33`,
                    textAlign: "center",
                  }}
                >
                  <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: palette.text, letterSpacing: "0.04em" }}>
                    {status === "Good" ? "🟢 EXCELLENT" : status === "Average" ? "🟡 AVERAGE" : "🔴 NEEDS ATTENTION"}
                  </Typography>
                </Box>
              </Box>

              {/* Dynamic message + quick stats */}
              <Box sx={{ flex: 1 }}>
                <Box sx={{ minWidth: "22vw" }} >
                  <Typography
                    sx={{
                      fontSize: "0.82rem",
                      color: "#374151",
                      lineHeight: 1.65,
                      mb: 2,
                      fontStyle: "italic",
                    }}
                  >
                    "{message}"
                  </Typography>
                </Box>

                {/* Quick KPI chips */}
                <Stack
                  sx={{ flexDirection: "row", gap: 1.5, flexWrap: "wrap" }}
                >
                  <QuickStat
                    label="Revenue"
                    value={`₹${formatNum(raw.revenue)}`}
                    color="#6C63FF"
                  />
                  <QuickStat
                    label="Expenses"
                    value={`₹${formatNum(raw.expenses)}`}
                    color="#ef4444"
                  />
                  <QuickStat
                    label="Budget"
                    value={raw.budget > 0 ? `₹${formatNum(raw.budget)}` : "—"}
                    color="#f59e0b"
                  />
                  {growthRaw !== null && (
                    <QuickStat
                      label="MoM Growth"
                      value={
                        <Stack direction="row" alignItems="center" gap={0.3}>
                          {growthPositive
                            ? <TrendingUpIcon sx={{ fontSize: 13, color: "#22c55e" }} />
                            : <TrendingDownIcon sx={{ fontSize: 13, color: "#ef4444" }} />}
                          <span style={{ color: growthPositive ? "#22c55e" : "#ef4444" }}>
                            {growthRaw > 0 ? "+" : ""}{growthRaw}%
                          </span>
                        </Stack>
                      }
                      color="#374151"
                    />
                  )}
                </Stack>
              </Box>
            </Stack>



            {/* Metric progress bars ─────────────────────────────────────── */}
            <Stack sx={{ minWidth: "40vw", justifyContent: "space-evenly" }} >
              <Typography
                sx={{ fontSize: "0.95rem", fontWeight: 700, color: "#9ca3af", letterSpacing: "0.07em", mb: 1.5, textTransform: "uppercase" }}
              >
                Metric Breakdown
              </Typography>

              <Stack sx={{ gap: 2, }} >
                <MetricRow

                  label={m.profitability.label}
                  score={m.profitability.score}
                  description={m.profitability.description}
                  rawValue={m.profitability.raw_value}
                />
                <MetricRow
                  label={m.expense_ratio.label}
                  score={m.expense_ratio.score}
                  description={m.expense_ratio.description}
                  rawValue={m.expense_ratio.raw_value}
                />
                <MetricRow
                  label={m.revenue_growth.label}
                  score={m.revenue_growth.score}
                  description={m.revenue_growth.description}
                  rawValue={m.revenue_growth.raw_value}
                />
                <MetricRow
                  label={m.budget_efficiency.label}
                  score={m.budget_efficiency.score}
                  description={m.budget_efficiency.description}
                  rawValue={m.budget_efficiency.raw_value}
                />
                <MetricRow
                  label={m.cash_flow.label}
                  score={m.cash_flow.score}
                  description={m.cash_flow.description}
                  rawValue={m.cash_flow.raw_value}
                />
              </Stack>
            </Stack>
          </Stack>

          {/* Footer ────────────────────────────────────────────────────── */}
          <Stack


            sx={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px dashed #e5e7eb",
              mt: 2.5,
              pt: 2
            }}
          >
            <Typography sx={{ fontSize: { md: "0.9rem", xs: "0.7rem" }, color: "#909398ff" }}>
              Auto-refreshes every 30s
            </Typography>
            <Stack sx={{ flexDirection: "row", gap: 2, alignItems: "center" }}>
              <LegendDot color="#22c55e" label="Good (80-100)" />
              <LegendDot color="#f59e0b" label="Avg (60-79)" />
              <LegendDot color="#ef4444" label="Poor (<60)" />
            </Stack>
          </Stack>
        </Box>
      </CardContent>
    </Card >
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const cardSx = {
  borderRadius: "18px",
  boxShadow: "0 4px 32px rgba(0,0,0,0.10)",
  overflow: "hidden",
  width: "100%",
  background: "#fff",
  border: "1px solid #f1f5f9",
};

const formatNum = (n) => {
  if (!n && n !== 0) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("en-IN");
};

const QuickStat = ({ label, value, color }) => (
  <Box
    sx={{
      px: 1.5, py: 0.6,
      borderRadius: "8px",
      background: "#f8fafc",
      border: "1px solid #e5e7eb",
      display: "inline-flex",
      flexDirection: "column",
      gap: 0.2,
    }}
  >
    <Typography sx={{ fontSize: "0.62rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
      {label}
    </Typography>
    <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color }}>
      {value}
    </Typography>
  </Box>
);

const LegendDot = ({ color, label }) => (
  <Stack sx={{ flexDirection: "row", alignItems: "center", gap: { md: 0.4, xs: 0.6 } }} >
    <Box sx={{ width: { md: 8, xs: 10 }, height: { md: 8, xs: 10 }, borderRadius: "50%", background: color }} />
    <Typography sx={{ fontSize: { md: "0.82rem", xs: "0.7rem" }, color: "#9ca3af" }}>{label}</Typography>
  </Stack>
);

export default FinancialHealthScoreCard;
