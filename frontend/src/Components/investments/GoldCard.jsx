import React from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Stack,
  Button,
  Chip,
  Divider,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
// import StarOutlineIcon from "@mui/icons-material/StarOutline";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import { useNavigate } from "react-router-dom";
import { goldData } from "../../data/investmentMockData";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const formatCurrency = (val) =>
  Number(val || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

const GoldCard = ({ data = goldData }) => {
  const navigate = useNavigate();

  const chartData = {
    labels: data.historicalPrices.map((d) => d.month),
    datasets: [
      {
        data: data.historicalPrices.map((d) => d.price),
        borderColor: "#F59E0B",
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 50);
          gradient.addColorStop(0, "rgba(245, 158, 11, 0.35)");
          gradient.addColorStop(1, "rgba(245, 158, 11, 0.0)");
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: { display: false },
      y: { display: false },
    },
  };

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: "16px",
        border: "1px solid #F1F5F9",
        boxShadow: "0px 2px 12px rgba(0, 0, 0, 0.03)",
        background: "#ffffff",
      }}
    >
      <CardContent sx={{ p: 2.5, flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Stack sx={{ mb: 2, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Stack sx={{ flexDirection: "row", gap: 1.5, alignItems: "center" }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "12px",
                background: "#FEF3C7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#D97706",
              }}
            >
              <WorkspacePremiumIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827", fontSize: "1rem" }}>
                Gold
              </Typography>
              <Typography variant="caption" sx={{ color: "#6B7280", fontSize: "0.78rem" }}>
                Invest in gold for stability
              </Typography>
            </Box>
          </Stack>

          <Chip
            label={data.risk}
            size="small"
            sx={{
              background: "#DCFCE7",
              color: "#15803D",
              fontWeight: 600,
              height: 22,
              fontSize: "0.725rem",
              borderRadius: "12px",
            }}
          />
        </Stack>

        {/* Current Gold Price & Sparkline */}
        <Stack sx={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", mb: 2, background: "#F8FAFC", p: 1.5, borderRadius: "12px" }}>
          <Box>
            <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 600, fontSize: "0.75rem", display: "block" }}>
              Current Gold Price
            </Typography>
            <Stack sx={{ flexDirection: "row", gap: 0.5, alignItems: "baseline" }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827", fontSize: "1.1rem" }}>
                {formatCurrency(data.currentPrice)}
              </Typography>
              <Typography variant="caption" sx={{ color: "#6B7280", fontSize: "0.725rem" }}>
                / 1 gram
              </Typography>
            </Stack>
            <Stack sx={{ flexDirection: "row", gap: "0.3", alignItems: "center" }}   >
              <ArrowUpwardIcon sx={{ fontSize: 11, color: "#10B981" }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: "#10B981", fontSize: "0.7rem" }}>
                {data.change} (24h change)
              </Typography>
            </Stack>
          </Box>
          <Box sx={{ width: 100, height: 45 }}>
            <Line data={chartData} options={chartOptions} />
          </Box>
        </Stack>

        {/* Recommended Option Box */}
        <Box
          sx={{
            p: 1.8,
            borderRadius: "12px",
            background: "#ffffff",
            border: "1px solid #E2E8F0",
            mb: 2,
            flex: 1,
          }}
        >
          <Stack sx={{ mb: 0.5, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 600, fontSize: "0.75rem" }}>
              Recommended Option
            </Typography>
            <Stack sx={{ flexDirection: "row", gap: 0.3, alignItems: "center" }}>
              {/* <StarOutlineIcon sx={{ fontSize: 14, color: "#166534" }} /> */}
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#166534", fontSize: "0.725rem" }}>
                Recommended
              </Typography>
            </Stack>
          </Stack>

          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#111827", fontSize: "0.875rem" }}>
            Gold ETF (SGB)
          </Typography>
          <Typography variant="caption" sx={{ color: "#9CA3AF", fontSize: "0.725rem", display: "block", mb: 1.5 }}>
            Better liquidity and zero making charges
          </Typography>

          <Divider sx={{ my: 1, borderStyle: "dashed" }} />

          <Stack sx={{ mt: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="caption" sx={{ color: "#6B7280", fontSize: "0.7rem", display: "block" }}>
                Suggested Investment
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#111827", fontSize: "0.8rem" }}>
                ₹15,000 - ₹20,000
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="caption" sx={{ color: "#6B7280", fontSize: "0.7rem", display: "block" }}>
                Allocation
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#111827", fontSize: "0.8rem" }}>
                20% - 25%
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Bottom Button */}
        <Button
          fullWidth
          variant="outlined"
          endIcon={<ArrowForwardIcon fontSize="small" />}
          onClick={() => navigate("/investments/gold")}
          sx={{
            color: "#6366F1",
            borderColor: "#E0E7FF",
            fontWeight: 600,
            fontSize: "0.825rem",
            textTransform: "none",
            justifyContent: "center",
            py: 1,
            borderRadius: "10px",
            "&:hover": {
              background: "#EEF2FF",
              borderColor: "#C7D2FE",
            },
          }}
        >
          View Gold Analysis
        </Button>
      </CardContent>
    </Card>
  );
};

export default GoldCard;
