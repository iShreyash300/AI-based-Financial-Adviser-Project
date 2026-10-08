import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Typography,
  IconButton,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddCardIcon from "@mui/icons-material/AddCard";

const NewInvestmentModal = ({ open, onClose, onAddInvestment }) => {
  const [type, setType] = useState("Stock Market");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !amount) return;

    const newInv = {
      id: Date.now(),
      name,
      type,
      investedAmount: Number(amount),
      currentValue: Number(amount),
      profitLoss: 0,
      returnPercent: "0.00%",
      isPositive: true,
      date,
    };

    if (onAddInvestment) {
      onAddInvestment(newInv);
    }

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setName("");
      setAmount("");
      onClose();
    }, 1200);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: { borderRadius: "20px", p: 1 },
      }}
    >
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <AddCardIcon sx={{ color: "#5B5FEF" }} />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Add New Investment
          </Typography>
        </Stack>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ borderBottom: "none", pt: 2 }}>
          {success ? (
            <Alert severity="success" sx={{ borderRadius: "12px", mb: 2 }}>
              Investment added successfully to your portfolio!
            </Alert>
          ) : null}

          <Stack spacing={2}>
            <TextField
              select
              label="Investment Type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              fullWidth
              InputProps={{ sx: { borderRadius: "12px" } }}
            >
              <MenuItem value="Stock Market">Stock Market</MenuItem>
              <MenuItem value="Gold">Gold (ETF / SGB)</MenuItem>
              <MenuItem value="Bank FD">Bank Fixed Deposit</MenuItem>
            </TextField>

            <TextField
              label="Investment / Asset Name"
              placeholder="e.g. Reliance Stock or SBI FD"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              InputProps={{ sx: { borderRadius: "12px" } }}
            />

            <TextField
              label="Invested Amount (₹)"
              type="number"
              placeholder="e.g. 15000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              fullWidth
              InputProps={{ sx: { borderRadius: "12px" } }}
            />

            <TextField
              label="Investment Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              InputProps={{ sx: { borderRadius: "12px" } }}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} sx={{ color: "#64748b", fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={success}
            sx={{
              background: "linear-gradient(135deg, #5B5FEF 0%, #7B61FF 100%)",
              borderRadius: "12px",
              fontWeight: 700,
              textTransform: "none",
              px: 3,
            }}
          >
            Save Investment
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default NewInvestmentModal;
