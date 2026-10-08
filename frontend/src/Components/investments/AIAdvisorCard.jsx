import React, { useState } from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  Grid,
  Stack,
  Divider,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import { aiAdvisorData } from "../../data/investmentMockData";
import RecommendationModal from "./RecommendationModal";

const formatCurrency = (val) =>
  Number(val || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

const AIAdvisorCard = ({ data = aiAdvisorData }) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: "16px",
          background: "linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%)",
          border: "1px solid #E0E7FF",
          p: { xs: 1, sm: 1.5 },
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Grid container spacing={3} alignItems="center">
            {/* Left Content */}
            <Grid item xs={12} lg={6}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "14px",
                    background: "#E0E7FF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <SmartToyOutlinedIcon sx={{ color: "#6366F1", fontSize: 26 }} />
                </Box>
                <Box>
                  <Stack direction="row" spacing={0.8} alignItems="center">
                    <Typography variant="h6" sx={{ fontWeight: 800, color: "#1E1B4B", fontSize: "1.1rem" }}>
                      AI Investment Advisor
                    </Typography>
                    <AutoAwesomeIcon sx={{ color: "#818CF8", fontSize: 18 }} />
                  </Stack>
                  <Typography variant="body2" sx={{ color: "#4B5563", mt: 0.3, fontSize: "0.85rem" }}>
                    Get personalized investment recommendations based on your financial health, risk profile and goals.
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            {/* Middle Stats */}
            <Grid item xs={12} sm={8} lg={4}>
              <Stack
                direction="row"
                spacing={3}
                alignItems="center"
                divider={<Divider orientation="vertical" flexItem sx={{ borderColor: "#C7D2FE", my: 0.5 }} />}
                sx={{ justifyContent: { xs: "space-between", sm: "flex-start", lg: "center" } }}
              >
                <Box>
                  <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 500, display: "block" }}>
                    Risk Profile
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#D97706", fontSize: "0.95rem" }}>
                    {data.riskProfile}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 500, display: "block" }}>
                    Investment Period
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#2563EB", fontSize: "0.95rem", textAlign: "center" }}>
                    {data.investmentPeriod}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 500, display: "block" }}>
                    Available Amount
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#059669", fontSize: "0.95rem", textAlign: "center" }}>
                    {formatCurrency(data.availableAmount)}
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            {/* Right Button */}
            <Grid item xs={12} sm={4} lg={2} sx={{ display: "flex", justifyContent: { xs: "flex-start", sm: "flex-end" } }}>
              <Button
                variant="contained"
                startIcon={<AutoAwesomeIcon sx={{ fontSize: 18 }} />}
                onClick={() => setModalOpen(true)}
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
                  whiteSpace: "nowrap",
                  "&:hover": {
                    background: "#4F46E5",
                  },
                }}
              >
                Generate Recommendation
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <RecommendationModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export default AIAdvisorCard;
