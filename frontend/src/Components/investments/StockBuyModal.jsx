import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  IconButton,
  Box,
  Divider,
  Alert,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

const formatCurrency = (val) => {
  if (val === null || val === undefined || isNaN(val)) return "₹0.00";
  return Number(val).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
};

const StockBuyModal = ({ open, stock, onClose, onOrderPlaced }) => {
  const [quantity, setQuantity] = useState(1);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setQuantity(1);
      setIsSuccess(false);
      setIsSubmitting(false);
    }
  }, [open, stock]);

  if (!stock) return null;

  const currentPrice = typeof stock.price === "number" ? stock.price : parseFloat(stock.price) || 0;
  const totalAmount = currentPrice * quantity;

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleConfirmOrder = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);

      const orderData = {
        id: Date.now(),
        symbol: stock.symbol,
        name: stock.name,
        quantity,
        price: currentPrice,
        totalAmount,
        // orderType,
        orderDate: new Date().toISOString(),
      };

      if (onOrderPlaced) {
        onOrderPlaced(orderData);
      }

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    }, 600);
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
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "10px",
              background: "rgba(99, 102, 241, 0.1)",
              color: "#6366F1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShoppingCartCheckoutIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              Simulate Buy Order
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748B" }}>
              NSE / BSE Delivery Trade
            </Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ borderBottom: "none", pt: 2 }}>
        {isSuccess ? (
          <Box sx={{ py: 3, textAlign: "center" }}>
            <CheckCircleIcon sx={{ fontSize: 56, color: "#10B981", mb: 1.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#065F46" }}>
              Order Placed Successfully!
            </Typography>
            <Typography variant="body2" sx={{ color: "#047857", mt: 0.5 }}>
              Bought {quantity} shares of {stock.symbol} at {formatCurrency(currentPrice)} each.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2.5}>
            {/* Stock Summary Box */}
            <Box
              sx={{
                p: 2,
                borderRadius: "14px",
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
              }}
            >
              <Stack
                direction="row"
                sx={{
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0F172A" }}>
                    {stock.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600 }}>
                    {stock.symbol} • {stock.sector || "General"}
                  </Typography>
                </Box>
                <Chip
                  label={formatCurrency(currentPrice)}
                  size="small"
                  sx={{
                    fontWeight: 800,
                    background: "#EEF2FF",
                    color: "#4F46E5",
                    fontSize: "0.85rem",
                  }}
                />
              </Stack>
            </Box>

            {/* Quantity Selector */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569", display: "block", mb: 1 }}>
                Number of Shares
              </Typography>
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ alignItems: "center" }}
              >
                <IconButton
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  sx={{
                    border: "1px solid #E2E8F0",
                    borderRadius: "10px",
                    width: 42,
                    height: 42,
                  }}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <TextField
                  type="number"
                  size="small"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  inputProps={{ min: 1, style: { textAlign: "center", fontWeight: 700 } }}
                  sx={{ flex: 1 }}
                />
                <IconButton
                  onClick={() => handleQuantityChange(1)}
                  sx={{
                    border: "1px solid #E2E8F0",
                    borderRadius: "10px",
                    width: 42,
                    height: 42,
                  }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Stack>

              {/* Quick Qty Chips */}
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                {[1, 5, 10, 25, 50].map((num) => (
                  <Chip
                    key={num}
                    label={`+${num}`}
                    size="small"
                    onClick={() => setQuantity(num)}
                    variant={quantity === num ? "filled" : "outlined"}
                    color={quantity === num ? "primary" : "default"}
                    sx={{ cursor: "pointer", fontWeight: 700, fontSize: "0.75rem" }}
                  />
                ))}
              </Stack>
            </Box>

            {/* Price Breakdown */}
            <Box sx={{ p: 2, borderRadius: "14px", background: "#F1F5F9" }}>
              <Stack direction="row" sx={{ justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2" sx={{ color: "#64748B" }}>
                  Estimated Price ({quantity} × {formatCurrency(currentPrice)})
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#0F172A" }}>
                  {formatCurrency(totalAmount)}
                </Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2" sx={{ color: "#64748B" }}>
                  Brokerage
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#16A34A" }}>
                  ₹0.00 (Free Delivery)
                </Typography>
              </Stack>
              <Divider sx={{ my: 1 }} />
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0F172A" }}>
                  Total Estimated Value
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#4F46E5" }}>
                  {formatCurrency(totalAmount)}
                </Typography>
              </Stack>
            </Box>

            <Alert severity="info" sx={{ borderRadius: "10px", py: 0.5, fontSize: "0.8rem" }}>
              This is a paper simulation trade for portfolio planning and strategy evaluation.
            </Alert>
          </Stack>
        )}
      </DialogContent>

      {!isSuccess && (
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} sx={{ color: "#64748B", textTransform: "none", fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmOrder}
            disabled={isSubmitting}
            sx={{
              background: "linear-gradient(135deg, #5B5FEF 0%, #7B61FF 100%)",
              borderRadius: "10px",
              fontWeight: 700,
              textTransform: "none",
              px: 3,
            }}
          >
            {isSubmitting ? "Executing..." : `Buy for ${formatCurrency(totalAmount)}`}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default StockBuyModal;
