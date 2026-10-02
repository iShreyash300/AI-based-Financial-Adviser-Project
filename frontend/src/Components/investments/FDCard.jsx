import React from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Stack,
  Button,
  Chip,
} from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router-dom";
import { bankFdData } from "../../data/investmentMockData";

const formatCurrency = (val) =>
  Number(val || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

const FDCard = ({ fds = bankFdData.slice(0, 3) }) => {
  const navigate = useNavigate();

  const bankLogos = {
    "HDFC Bank": { bg: "#004B8D", text: "H" },
    "ICICI Bank": { bg: "#F37021", text: "I" },
    "SBI Bank": { bg: "#0083CA", text: "S" },
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
                background: "#EFF6FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#3B82F6",
              }}
            >
              <AccountBalanceIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827", fontSize: "1rem" }}>
                Bank Fixed Deposits
              </Typography>
              <Typography variant="caption" sx={{ color: "#6B7280", fontSize: "0.78rem" }}>
                Safe returns with guaranteed income
              </Typography>
            </Box>
          </Stack>

          <Chip
            label="Low Risk"
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

        {/* Top FD Recommendations Header */}
        <Stack sx={{ mb: 1.5, mt: 0.5, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: "#374151", fontSize: "0.8rem" }}>
            Top FD Recommendations
          </Typography>
          <Typography
            variant="caption"
            onClick={() => navigate("/investments/fd")}
            sx={{ color: "#6366F1", fontWeight: 600, fontSize: "0.78rem", cursor: "pointer" }}
          >
            View All
          </Typography>
        </Stack>

        {/* FD Rows */}
        <Stack sx={{ mb: 2, flex: 1, gap: 1.5 }}>
          {fds.map((item, idx) => (
            <Box
              key={idx}
              sx={{
                py: 1,
                px: 1.5,
                borderRadius: "10px",
                background: "#F8FAFC",
                border: "1px solid #F1F5F9",
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "8px",
                      background: bankLogos[item.bankName]?.bg || "#3B82F6",
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: "0.75rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {bankLogos[item.bankName]?.text || "B"}
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#111827", fontSize: "0.825rem", lineHeight: 1.2 }}>
                      {item.bankName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#9CA3AF", fontSize: "0.7rem", fontWeight: 500 }}>
                      {item.tenure}
                    </Typography>
                  </Box>
                </Stack>

                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#111827", fontSize: "0.8rem", lineHeight: 1.2 }}>
                    {item.rate}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#9CA3AF", fontSize: "0.68rem" }}>
                    Interest Rate
                  </Typography>
                </Box>

                <Box sx={{ textAlign: "right" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#111827", fontSize: "0.825rem", lineHeight: 1.2 }}>
                    {formatCurrency(item.maturityOn1L)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#9CA3AF", fontSize: "0.68rem" }}>
                    Maturity Amount
                  </Typography>
                </Box>
              </Stack>
            </Box>
          ))}
        </Stack>

        {/* Bottom Button */}
        <Button
          fullWidth
          variant="outlined"
          endIcon={<ArrowForwardIcon fontSize="small" />}
          onClick={() => navigate("/investments/fd")}
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
          Compare All FDs
        </Button>
      </CardContent>
    </Card>
  );
};

export default FDCard;
