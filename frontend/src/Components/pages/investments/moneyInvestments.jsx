import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Stack,
  Container,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import InvestmentSummaryCards from "../../investments/InvestmentSummaryCards";
import AIAdvisorCard from "../../investments/AIAdvisorCard";
import StockCard from "../../investments/StockCard";
import GoldCard from "../../investments/GoldCard";
import FDCard from "../../investments/FDCard";
import PortfolioAllocation from "../../investments/PortfolioAllocation";
import InvestmentSimulator from "../../investments/InvestmentSimulator";
import NewInvestmentModal from "../../investments/NewInvestmentModal";
import { myPortfolioData } from "../../../data/investmentMockData";

const InvestmentsDashboard = () => {
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [portfolio, setPortfolio] = useState(myPortfolioData);

  const handleAddInvestment = (newInv) => {
    setPortfolio([newInv, ...portfolio]);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 2 }, background: "#F8FAFC", minHeight: "100vh" }}>
      <Container maxWidth="xl" disableGutters>
        {/* Header Section */}
        <Stack

          sx={{
            mb: 3, flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2
          }}
        >
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <TrendingUpIcon sx={{ color: "#6366F1", fontSize: 32 }} />
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#111827", letterSpacing: "-0.5px" }}>
                Investments
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: "#6B7280", mt: 0.5, fontSize: "0.875rem" }}>
              Smart recommendations based on your financial data and market trends
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setNewModalOpen(true)}
            sx={{
              background: "#6366F1",
              color: "#ffffff",
              fontWeight: 600,
              fontSize: "0.875rem",
              textTransform: "none",
              py: 1.2,
              px: 2.5,
              borderRadius: "10px",
              boxShadow: "0px 4px 12px rgba(99, 102, 241, 0.25)",
              "&:hover": {
                background: "#4F46E5",
              },
            }}
          >
            New Investment
          </Button>
        </Stack>

        {/* 1. Summary Cards */}
        <InvestmentSummaryCards />

        {/* 2. AI Investment Advisor Banner */}
        <AIAdvisorCard />

        {/* 3. Asset Class Cards Grid (Stock, Gold, FD) */}
        <Grid container spacing={2.5} sx={{ mb: 3, width: "100%", flexDirection: { xs: "column", md: "row" }, flexWrap: "nowrap" }} >
          <Grid item xs={12} md={4} sx={{ display: "flex", width: "100%" }}>
            <StockCard />
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: "flex", width: "100%" }}>
            <GoldCard />
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: "flex", width: "100%" }}>
            <FDCard />
          </Grid>
        </Grid>

        {/* 4. Recommended Portfolio Allocation & Investment Simulator */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid item xs={12} lg={6}>
            <PortfolioAllocation />
          </Grid>
          <Grid item xs={12} lg={6}>
            <InvestmentSimulator />
          </Grid>
        </Grid>

        {/* Footer Note */}
        {/* <Typography variant="caption" sx={{ color: "#9CA3AF", fontSize: "0.75rem", display: "block", textAlign: "left", mt: 2 }}>
          Note: Market data is delayed by 15 minutes. Investments are subject to market risks. Past performance is not indicative of future results.
        </Typography> */}

        {/* Modal for + New Investment */}
        <NewInvestmentModal
          open={newModalOpen}
          onClose={() => setNewModalOpen(false)}
          onAddInvestment={handleAddInvestment}
        />
      </Container>
    </Box>
  );
};

export default InvestmentsDashboard;
