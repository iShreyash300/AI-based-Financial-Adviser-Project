import React from "react";
import { Box, Card, CardContent, LinearProgress, Stack, Typography } from "@mui/material";
import { investmentAllocation, allocationSummary } from "../../../data/investmentMockData";

const fmt = (n) =>
  Number(n || 0).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

const ExpectedReturnsCard = ({ allocation = investmentAllocation, summary = allocationSummary }) => (
  <Card elevation={0} sx={{ borderRadius: "18px", border: "1px solid #F1F5F9", background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.03)", height: "100%" }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontWeight: 800, color: "#111827", fontSize: "1rem" }}>Expected Returns Based on Allocation</Typography>
        <Typography sx={{ color: "#9CA3AF", fontSize: "0.8rem", mt: 0.3 }}>Projected returns on your current allocation</Typography>
      </Box>

      <Stack spacing={2.5} sx={{ mb: 3 }}>
        {allocation.map((item) => (
          <Box key={item.assetClass}>
            <Stack sx={{ mb: 0.8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Stack sx={{ flexDirection: "row", alignItems: "center", gap: 1 }} >
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#374151" }}>{item.assetClass}</Typography>
                <Typography sx={{ fontSize: "0.75rem", color: "#9CA3AF" }}>{item.allocation}%</Typography>
              </Stack>
              <Stack sx={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#111827" }}>{fmt(item.currentValue)}</Typography>
                <Box sx={{ background: "#DCFCE7", color: "#15803D", px: 1, py: 0.2, borderRadius: "8px", fontSize: "0.75rem", fontWeight: 700 }}>
                  {item.returnPercentage.toFixed(2)}%
                </Box>
              </Stack>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={Math.min(item.returnPercentage * 4, 100)}
              sx={{
                height: 6, borderRadius: "6px",
                backgroundColor: "#F1F5F9",
                "& .MuiLinearProgress-bar": { backgroundColor: item.color, borderRadius: "6px" },
              }}
            />
          </Box>
        ))}
      </Stack>

      {/* Summary Panel */}
      <Box sx={{ background: "#F8FAFF", borderRadius: "14px", p: 2.5, border: "1px solid #EEF2FF" }}>
        <Stack sx={{ flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", gap: 2 }}

        >
          <Box>
            <Typography sx={{ fontSize: "0.75rem", color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, mb: 0.5 }}>
              Total Expected Value (1 Year)
            </Typography>
            <Typography sx={{ fontWeight: 800, fontSize: "1.3rem", color: "#111827" }}>{fmt(summary.currentValue)}</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: "0.75rem", color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, mb: 0.5 }}>
              Total Expected Profit
            </Typography>
            <Typography sx={{ fontWeight: 800, fontSize: "1.3rem", color: "#10B981" }}>
              {fmt(summary.totalProfit)}
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "#10B981", fontWeight: 700 }}>
              ▲ {summary.totalProfitPercent.toFixed(2)}%
            </Typography>
          </Box>
        </Stack>
        <Typography sx={{ fontSize: "0.7rem", color: "#9CA3AF", mt: 1.5, lineHeight: 1.5, fontStyle: "italic" }}>
          *Returns shown are estimates based on the current mock data and are not guaranteed.
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

export default ExpectedReturnsCard;
