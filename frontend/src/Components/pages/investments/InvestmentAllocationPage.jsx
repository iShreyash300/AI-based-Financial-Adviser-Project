import React from "react";
import { Box, Button, Container, Grid, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PieChartOutlinedIcon from "@mui/icons-material/PieChartOutlined";

import AllocationSummaryCards from "../../investments/allocation/AllocationSummaryCards";
import AllocationChartCard from "../../investments/allocation/AllocationChartCard";
import ExpectedReturnsCard from "../../investments/allocation/ExpectedReturnsCard";
import PerformanceChart from "../../investments/allocation/PerformanceChart";
import AssetWiseReturnChart from "../../investments/allocation/AssetWiseReturnChart";
import MonthlyReturnsCard from "../../investments/allocation/MonthlyReturnsCard";
import RecentInvestmentsTable from "../../investments/allocation/RecentInvestmentsTable";
import QuickActionsCard from "../../investments/allocation/QuickActionsCard";
import { allocationSummary } from "../../../data/investmentMockData";

const fmt = (n) =>
  Number(n || 0).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

const InvestmentAllocationPage = () => {
  return (
    <Box sx={{ p: { xs: 2, md: 3 }, background: "transparent", minHeight: "100vh" }}>
      <Container maxWidth="xl" disableGutters>

        {/* ?????? Page Header ?????*/}
        <Stack
          sx={{ mb: 3, flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, gap: 2 }}
        >
          <Box>
            <Stack sx={{ flexDirection: "row", gap: 1.5, alignItems: "center" }} >
              <PieChartOutlinedIcon sx={{ color: "#6366F1", fontSize: 30 }} />
              <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.5rem", md: "1.8rem" }, color: "#111827", letterSpacing: "-0.5px" }}>
                Investment Allocation
              </Typography>
            </Stack>
            <Typography sx={{ color: "#6B7280", fontSize: "0.9rem", mt: 0.5, ml: 0.5 }}>
              Plan and manage how your available money is allocated across different investment options.
            </Typography>
          </Box>

          <Stack sx={{ flexDirection: "row", gap: 2, alignItems: "center" }}>
            {/* Available to Invest badge */}
            <Box sx={{ background: "#ECFDF5", border: "1px solid #D1FAE5", borderRadius: "12px", px: 2, py: 1, textAlign: "right" }}>
              <Typography sx={{ fontSize: "0.7rem", color: "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>Available to Invest</Typography>
              <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: "#10B981" }}>{fmt(allocationSummary.availableToInvest)}</Typography>
              <Typography sx={{ fontSize: "0.7rem", color: "#9CA3AF" }}>{allocationSummary.availableNote}</Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                background: "#6366F1", color: "#fff", fontWeight: 600, fontSize: "0.875rem",
                textTransform: "none", py: 1.2, px: 2.5, borderRadius: "10px",
                boxShadow: "0 4px 12px rgba(99,102,241,0.25)",
                "&:hover": { background: "#4F46E5" },
                whiteSpace: "nowrap",
              }}
            >
              New Investment
            </Button>
          </Stack>
        </Stack>

        {/* ?????? Summary Cards ????? */}
        <AllocationSummaryCards />

        {/* ?????? Allocation Chart + Expected Returns ????????????????? */}
        <Grid container spacing={2.5} sx={{ mb: 3, flexDirection: "row", flexWrap: "nowrap" }}>
          <Grid item xs={12} lg={7}>
            <AllocationChartCard />
          </Grid>
          <Grid item xs={12} lg={5}>
            <ExpectedReturnsCard />
          </Grid>
        </Grid>

        {/* ?????? Performance Chart + Asset Wise Return ?????? */}
        <Grid container spacing={2.5} sx={{ mb: 3, flexDirection: "row", flexWrap: "nowrap" }}>
          <Grid item xs={12} md={7} sx={{ width: "45%" }} >
            <PerformanceChart />
          </Grid>
          <Grid item xs={12} md={5} sx={{ width: "55%" }}  >
            <AssetWiseReturnChart />
          </Grid>
        </Grid>

        {/* ?????? Monthly Returns + Quick Actions ??????????? */}
        <Grid container spacing={2.5} sx={{ mb: 3, flexDirection: "row", flexWrap: "nowrap" }}>
          <Grid item xs={12} md={7} sx={{ width: "50%" }}   >
            <MonthlyReturnsCard />
          </Grid>
          <Grid item xs={12} md={5} sx={{ width: "50%" }}   >
            <QuickActionsCard />
          </Grid>
        </Grid>

        {/* ?????? Recent Investments Table ??????????????????? */}
        <RecentInvestmentsTable />

      </Container>
    </Box>
  );
};

export default InvestmentAllocationPage;
