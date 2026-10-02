import React from "react";
import { Box, Card, CardContent, Grid, Typography, Stack } from "@mui/material";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import PieChartOutlinedIcon from "@mui/icons-material/PieChartOutlined";
import ShowChartOutlinedIcon from "@mui/icons-material/ShowChartOutlined";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { summaryData } from "../../data/investmentMockData";

const formatCurrency = (val) =>
  Number(val || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

const InvestmentSummaryCards = ({ data = summaryData }) => {
  const cards = [
    {
      title: "Available to Invest",
      amount: formatCurrency(data.availableToInvest),
      subtext: data.availableNote,
      icon: <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 24, color: "#10B981" }} />,
      iconBg: "#ECFDF5",
      isBadge: false,
    },
    {
      title: "Total Invested",
      amount: formatCurrency(data.totalInvested),
      subtext: data.investedNote,
      icon: <BarChartOutlinedIcon sx={{ fontSize: 24, color: "#3B82F6" }} />,
      iconBg: "#EFF6FF",
      isBadge: false,
    },
    {
      title: "Current Value",
      amount: formatCurrency(data.currentValue),
      subtext: "6.40% from invested",
      icon: <PieChartOutlinedIcon sx={{ fontSize: 24, color: "#8B5CF6" }} />,
      iconBg: "#F3E8FF",
      isBadge: true,
      isPositive: true,
    },
    {
      title: "Profit / Loss",
      amount: formatCurrency(data.profitLoss),
      subtext: "6.40% overall returns",
      icon: <ShowChartOutlinedIcon sx={{ fontSize: 24, color: "#F59E0B" }} />,
      iconBg: "#FFFBEB",
      isBadge: true,
      isPositive: true,
    },
  ];

  return (
    <Grid container sx={{ mb: 3, gap: 2.5, flexDirection: { xs: "column", sm: "row" } }}>
      {cards.map((card, idx) => (
        <Grid sx={{ flex: 1 }} item xs={12} sm={6} md={3} key={idx}>
          <Card
            elevation={0}
            sx={{
              p: 1,
              borderRadius: "16px",
              background: "#ffffff",
              border: "1px solid #F1F5F9",
              boxShadow: "0px 2px 12px rgba(0, 0, 0, 0.03)",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.06)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <CardContent sx={{ p: "16px !important" }}>
              <Stack sx={{ flexDirection: "row", gap: 2, alignItems: "center" }}  >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "14px",
                    background: card.iconBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {card.icon}
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "#6B7280", fontWeight: 500, fontSize: "0.825rem", mb: 0.2 }}
                  >
                    {card.title}
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 800, color: "#111827", fontSize: "1.4rem", letterSpacing: "-0.5px" }}
                  >
                    {card.amount}
                  </Typography>
                  {card.isBadge ? (
                    <Stack direction="row" spacing={0.3} alignItems="center" sx={{ mt: 0.3 }}>
                      <ArrowUpwardIcon sx={{ fontSize: 12, color: "#10B981" }} />
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 600, color: "#10B981", fontSize: "0.75rem" }}
                      >
                        {card.subtext}
                      </Typography>
                    </Stack>
                  ) : (
                    <Typography
                      variant="caption"
                      sx={{ color: "#9CA3AF", fontSize: "0.75rem", fontWeight: 500, mt: 0.3, display: "block" }}
                    >
                      {card.subtext}
                    </Typography>
                  )}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default InvestmentSummaryCards;
