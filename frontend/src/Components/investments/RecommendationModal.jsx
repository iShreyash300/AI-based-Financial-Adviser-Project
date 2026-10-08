import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
  Chip,
  Paper,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import { useNavigate } from "react-router-dom";
import { aiAdvisorData } from "../../data/investmentMockData";

const formatCurrency = (val) =>
  Number(val || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

const RecommendationModal = ({ open, onClose }) => {
  const navigate = useNavigate();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          p: 1,
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "10px",
              background: "linear-gradient(135deg, #5B5FEF 0%, #7B61FF 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
            }}
          >
            <AutoAwesomeIcon />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            AI Recommended Portfolio
          </Typography>
        </Stack>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ borderBottom: "none", pt: 2 }}>
        <Typography variant="body2" sx={{ color: "#6c757d", mb: 2.5 }}>
          Based on your monthly surplus, moderate risk tolerance, and 3-year horizon, here is your customized investment strategy:
        </Typography>

        <Stack spacing={2} sx={{ mb: 3 }}>
          {aiAdvisorData.portfolioAllocation.map((item, idx) => (
            <Paper
              key={idx}
              elevation={0}
              sx={{
                p: 2,
                borderRadius: "14px",
                border: `1px solid ${item.color}30`,
                background: `${item.color}08`,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 12, height: 12, borderRadius: "50%", background: item.color }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1e293b" }}>
                    {item.label}
                  </Typography>
                  <Chip
                    label={`${item.percentage}%`}
                    size="small"
                    sx={{
                      background: item.color,
                      color: "#fff",
                      fontWeight: 700,
                      height: 22,
                    }}
                  />
                </Stack>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#1e293b" }}>
                  {formatCurrency(item.amount)}
                </Typography>
              </Stack>

              <Typography variant="body2" sx={{ color: "#475569", fontSize: "0.85rem" }}>
                {idx === 0
                  ? aiAdvisorData.explanations.stockMarket
                  : idx === 1
                  ? aiAdvisorData.explanations.gold
                  : aiAdvisorData.explanations.bankFd}
              </Typography>
            </Paper>
          ))}
        </Stack>

        <Box
          sx={{
            p: 2,
            borderRadius: "14px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
            <CheckCircleOutlinedIcon sx={{ color: "#00C853", fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1e293b" }}>
              Expected Annual Return: 9.8% - 11.2%
            </Typography>
          </Stack>
          <Typography variant="caption" sx={{ color: "#64748b" }}>
            Rebalance quarterly to maintain risk parameters. Estimated growth value in 3 years: ~₹98,500.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button onClick={onClose} sx={{ color: "#64748b", fontWeight: 600 }}>
          Close
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            onClose();
            navigate("/investments/recommendations");
          }}
          sx={{
            background: "linear-gradient(135deg, #5B5FEF 0%, #7B61FF 100%)",
            borderRadius: "12px",
            fontWeight: 700,
            textTransform: "none",
            px: 3,
          }}
        >
          View Full AI Analysis →
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecommendationModal;
