import React from "react";
import { Box, Card, CardContent, Chip, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { recentInvestments } from "../../../data/investmentMockData";

const fmt = (n) =>
  Number(n || 0).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

const assetColors = { "Stock Market": "#6366F1", "Gold": "#F59E0B", "Bank FD": "#10B981" };
const assetBg = { "Stock Market": "#EEF2FF", "Gold": "#FFFBEB", "Bank FD": "#ECFDF5" };

const RecentInvestmentsTable = ({ investments = recentInvestments }) => {
  const navigate = useNavigate();

  return (
    <Card elevation={0} sx={{ borderRadius: "18px", border: "1px solid #F1F5F9", background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
      <CardContent sx={{ p: 3 }}>
        <Stack
          sx={{ mb: 2.5, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography sx={{ fontWeight: 800, color: "#111827", fontSize: "1rem" }}>Recent Investments</Typography>
            <Typography sx={{ color: "#9CA3AF", fontSize: "0.8rem", mt: 0.3 }}>Your latest investment transactions</Typography>
          </Box>
        </Stack>

        <TableContainer sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {["Asset Class", "Instrument", "Amount Invested", "Purchase Date", "Current Value", "Profit / Loss", "Actions"].map((h) => (
                  <TableCell key={h} sx={{ color: "#9CA3AF", fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: 0.4, borderBottom: "1px solid #F1F5F9", py: 1.5, whiteSpace: "nowrap" }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {investments.map((row) => (
                <TableRow key={row.id} sx={{ "&:hover": { background: "#FAFAFA" }, "&:last-child td": { borderBottom: 0 } }}>
                  <TableCell sx={{ py: 1.5, borderBottom: "1px solid #F9FAFB" }}>
                    <Chip label={row.assetClass} size="small" sx={{ background: assetBg[row.assetClass] || "#F3F4F6", color: assetColors[row.assetClass] || "#374151", fontWeight: 700, fontSize: "0.72rem", borderRadius: "8px" }} />
                  </TableCell>
                  <TableCell sx={{ py: 1.5, fontWeight: 600, color: "#111827", fontSize: "0.85rem", borderBottom: "1px solid #F9FAFB" }}>{row.instrument}</TableCell>
                  <TableCell sx={{ py: 1.5, fontWeight: 600, color: "#374151", fontSize: "0.85rem", borderBottom: "1px solid #F9FAFB" }}>{fmt(row.investedAmount)}</TableCell>
                  <TableCell sx={{ py: 1.5, color: "#6B7280", fontSize: "0.82rem", borderBottom: "1px solid #F9FAFB" }}>{row.purchaseDate}</TableCell>
                  <TableCell sx={{ py: 1.5, fontWeight: 700, color: "#111827", fontSize: "0.85rem", borderBottom: "1px solid #F9FAFB" }}>{fmt(row.currentValue)}</TableCell>
                  <TableCell sx={{ py: 1.5, borderBottom: "1px solid #F9FAFB" }}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: row.isPositive ? "#10B981" : "#EF4444" }}>
                        {row.isPositive ? "+" : "-"}{fmt(row.profitLoss)}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ py: 1.5, borderBottom: "1px solid #F9FAFB" }}>
                    <Typography onClick={() => navigate("/investments/portfolio")} sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#6366F1", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>View</Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Stack sx={{ mt: 2, flexDirection: "row", justifyContent: "flex-end" }}>
          <Typography onClick={() => navigate("/investments/portfolio")} sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#6366F1", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>
            View All Investments →
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default RecentInvestmentsTable;
