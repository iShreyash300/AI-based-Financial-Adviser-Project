import React from "react";
import { Box, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router-dom";

const ACTIONS = [
  { label: "Invest in Stock Market", sub: "Explore stocks", icon: <ShowChartIcon />, color: "#6366F1", bg: "#EEF2FF", route: "/investments/stocks" },
  { label: "Invest in Gold", sub: "Explore gold investment options", icon: <WorkspacePremiumIcon />, color: "#F59E0B", bg: "#FFFBEB", route: "/investments/gold" },
  { label: "Compare Bank FDs", sub: "Compare FD rates", icon: <AccountBalanceIcon />, color: "#10B981", bg: "#ECFDF5", route: "/investments/fd" },
  { label: "AI Recommendations", sub: "Get personalized investment suggestions", icon: <AutoAwesomeIcon />, color: "#8B5CF6", bg: "#F5F3FF", route: "/investments/recommendations" },
];

const QuickActionsCard = () => {
  const navigate = useNavigate();

  return (
    <Card elevation={0} sx={{ borderRadius: "18px", border: "1px solid #F1F5F9", background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ mb: 2.5 }}>
          <Typography sx={{ fontWeight: 800, color: "#111827", fontSize: "1rem" }}>Quick Actions</Typography>
          <Typography sx={{ color: "#9CA3AF", fontSize: "0.8rem", mt: 0.3 }}>Navigate to investment options</Typography>
        </Box>
        <Grid container spacing={4} sx={{ flexDirection: "column" }} >
          {ACTIONS.map((action) => (
            <Grid item xs={12} sm={6} key={action.label}>
              <Box
                onClick={() => navigate(action.route)}
                role="button"
                aria-label={action.label}
                sx={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  p: 2, borderRadius: "14px", border: `1px solid ${action.bg}`,
                  background: action.bg, cursor: "pointer",
                  transition: "all 0.2s", "&:hover": { transform: "translateY(-2px)", boxShadow: `0 4px 16px ${action.color}22` },
                }}
              >
                <Stack sx={{ flexDirection: "row", alignItems: "center", gap: 1.5 }} >
                  <Box sx={{ width: 40, height: 40, borderRadius: "12px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: action.color, fontSize: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                    {action.icon}
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#111827" }}>{action.label}</Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: "#6B7280" }}>{action.sub}</Typography>
                  </Box>
                </Stack>
                <ArrowForwardIcon sx={{ color: action.color, fontSize: 18 }} />
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default QuickActionsCard;
