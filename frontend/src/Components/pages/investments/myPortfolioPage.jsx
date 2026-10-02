import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Stack,
  Container,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import { myPortfolioData } from "../../../data/investmentMockData";
import NewInvestmentModal from "../../investments/NewInvestmentModal";

const formatCurrency = (val) =>
  Number(val || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

const MyPortfolioPage = () => {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(myPortfolioData);
  const [newModalOpen, setNewModalOpen] = useState(false);

  const totalInvested = portfolio.reduce((acc, item) => acc + item.investedAmount, 0);
  const totalCurrentValue = portfolio.reduce((acc, item) => acc + item.currentValue, 0);
  const totalProfitLoss = totalCurrentValue - totalInvested;
  const totalReturnPercent = ((totalProfitLoss / (totalInvested || 1)) * 100).toFixed(2);

  const handleAddInvestment = (newInv) => {
    setPortfolio([newInv, ...portfolio]);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, background: "#f5f7fb", minHeight: "100vh" }}>
      <Container maxWidth="xl" disableGutters>
        {/* Navigation */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/investments")}
            sx={{ color: "#7B61FF", textTransform: "none", fontWeight: 700 }}
          >
            Back to Dashboard
          </Button>
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#111827" }}>
              My Investment Holdings
            </Typography>
            <Typography variant="body1" sx={{ color: "#6b7280", mt: 0.5 }}>
              Track performance, returns, and historical investment transactions
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setNewModalOpen(true)}
            sx={{
              background: "linear-gradient(135deg, #5B5FEF 0%, #7B61FF 100%)",
              color: "#fff",
              fontWeight: 700,
              borderRadius: "14px",
              textTransform: "none",
              py: 1.2,
              px: 3,
            }}
          >
            + Add Investment
          </Button>
        </Stack>

        {/* Top Summary Banner */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: "18px", background: "#fff", border: "1px solid #eef2f6" }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Total Invested</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#1e293b", my: 0.5 }}>
                {formatCurrency(totalInvested)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: "18px", background: "#fff", border: "1px solid #eef2f6" }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Current Value</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#7B61FF", my: 0.5 }}>
                {formatCurrency(totalCurrentValue)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: "18px", background: "#fff", border: "1px solid #eef2f6" }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Total Profit / Loss</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: totalProfitLoss >= 0 ? "#00C853" : "#d32f2f", my: 0.5 }}>
                {formatCurrency(totalProfitLoss)} ({totalReturnPercent}%)
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Portfolio Table */}
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: "20px", border: "1px solid #eef2f6" }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ background: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>Investment Name</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Asset Class</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Invested Amount</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Current Value</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Profit / Loss</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Return %</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {portfolio.map((row) => (
                <TableRow key={row.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  <TableCell sx={{ fontWeight: 800, color: "#1e293b" }}>{row.name}</TableCell>
                  <TableCell>
                    <Chip label={row.type} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{formatCurrency(row.investedAmount)}</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "#1e293b" }}>{formatCurrency(row.currentValue)}</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: row.profitLoss >= 0 ? "#00C853" : "#d32f2f" }}>
                    {formatCurrency(row.profitLoss)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: row.profitLoss >= 0 ? "#00C853" : "#d32f2f" }}>
                    {row.returnPercent}
                  </TableCell>
                  <TableCell align="right" sx={{ color: "#64748b" }}>{row.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <NewInvestmentModal
          open={newModalOpen}
          onClose={() => setNewModalOpen(false)}
          onAddInvestment={handleAddInvestment}
        />
      </Container>
    </Box>
  );
};

export default MyPortfolioPage;
