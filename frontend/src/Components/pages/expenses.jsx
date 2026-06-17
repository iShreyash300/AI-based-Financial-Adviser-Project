import React, { useState, useEffect } from "react";
import axios from "axios";

import {
    Box,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    IconButton,
    MenuItem,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Paper,
    Chip,
    CircularProgress,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

// Schema Constants
const CATEGORIES = [
    "Ads Spend",
    "Cloud Hosting",
    "Food Supply",
    "Fuel",
    "Maintenance",
    "Salary",
    "Rent",
    "Inventory",
    "Software Tools"
];

const DEPARTMENTS = [
    "Sales",
    "Marketing",
    "Operations",
    "Finance",
    "Production",
    "Support",
    "Logistics Ops",
    "Client Sales",
    "Retail Sales",
    "Digital Marketing",
    "Customer Support"
];

const PAYMENT_METHODS = [
    { value: "cash", label: "Cash" },
    { value: "upi", label: "UPI" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "credit_card", label: "Credit Card" },
    { value: "debit_card", label: "Debit Card" }
];

const RECURRING_FREQUENCIES = [
    { value: "one_time", label: "One Time" },
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" }
];

// Badge Style Helpers
const getCategoryStyle = (category) => {
    switch (category) {
        case "Ads Spend": return { color: "#3f51b5", border: "1px solid #3f51b5", backgroundColor: "#e8eaf6" };
        case "Cloud Hosting": return { color: "#00bcd4", border: "1px solid #00bcd4", backgroundColor: "#e0f7fa" };
        case "Food Supply": return { color: "#4caf50", border: "1px solid #4caf50", backgroundColor: "#e8f5e9" };
        case "Fuel": return { color: "#ff9800", border: "1px solid #ff9800", backgroundColor: "#fff3e0" };
        case "Maintenance": return { color: "#795548", border: "1px solid #795548", backgroundColor: "#efebe9" };
        case "Salary": return { color: "#9c27b0", border: "1px solid #9c27b0", backgroundColor: "#f3e5f5" };
        case "Rent": return { color: "#e91e63", border: "1px solid #e91e63", backgroundColor: "#fce4ec" };
        case "Inventory": return { color: "#607d8b", border: "1px solid #607d8b", backgroundColor: "#eceff1" };
        case "Software Tools": return { color: "#009688", border: "1px solid #009688", backgroundColor: "#e0f2f1" };
        default: return { color: "#6c757d", border: "1px solid #6c757d", backgroundColor: "#f8f9fa" };
    }
};

const getPaymentMethodLabel = (pm) => {
    const found = PAYMENT_METHODS.find(item => item.value === pm);
    return found ? found.label : pm;
};

const getFrequencyLabel = (freq) => {
    const found = RECURRING_FREQUENCIES.find(item => item.value === freq);
    return found ? found.label : freq;
};

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [open, setOpen] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        department: "",
        amount: "",
        payment_method: "",
        recurring_frequency: "",
        date: "",
    });

    // FETCH EXPENSES FROM DB
    const fetchExpenses = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:5000/api/expenses", {
                headers: { Authorization: token },
            });
            if (response.data && response.data.success) {
                setExpenses(response.data.data);
            }
        } catch (err) {
            console.error("Error fetching expenses:", err);
            setError(err.response?.data?.message || "Failed to load expenses from server.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // SAVE NEW EXPENSE TO DB
    const handleAddExpense = async () => {
        // Validation
        if (
            !formData.title.trim() ||
            !formData.amount ||
            !formData.category ||
            !formData.department ||
            !formData.payment_method ||
            !formData.recurring_frequency ||
            !formData.date
        ) {
            alert("Please fill in all required fields.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                "http://localhost:5000/api/expenses",
                {
                    ...formData,
                    amount: Number(formData.amount),
                },
                {
                    headers: { Authorization: token },
                }
            );

            if (response.data && response.data.success) {
                // Prepend new expense
                setExpenses([response.data.data, ...expenses]);

                // Reset Form
                setFormData({
                    title: "",
                    description: "",
                    category: "",
                    department: "",
                    amount: "",
                    payment_method: "",
                    recurring_frequency: "",
                    date: "",
                });

                setOpen(false);
            }
        } catch (err) {
            console.error("Error adding expense:", err);
            alert(err.response?.data?.message || "Failed to save expense.");
        }
    };

    // DELETE EXPENSE FROM DB
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this expense?")) return;
        try {
            const token = localStorage.getItem("token");
            const response = await axios.delete(`http://localhost:5000/api/expenses/${id}`, {
                headers: { Authorization: token },
            });
            if (response.data && response.data.success) {
                setExpenses(expenses.filter((item) => item.id !== id));
            }
        } catch (err) {
            console.error("Error deleting expense:", err);
            alert(err.response?.data?.message || "Failed to delete expense.");
        }
    };

    const totalExpense = expenses.reduce(
        (sum, item) => sum + Number(item.amount),
        0
    );

    const uniqueCategories = new Set(expenses.map((item) => item.category)).size;

    return (
        <Stack spacing={3} sx={{ p: 3, mt: { xs: 8, md: 0 } }}>
            {/* Header */}
            <Stack
                direction="row"
                sx={{
                    justifyContent: { md: "space-between", xs: "center" },
                    alignItems: "center",
                }}
            >
                <Typography variant="h4" fontWeight={700}>
                    Expenses
                </Typography>

                <Button
                    sx={{
                        display: { xs: "none", md: "flex" },
                        borderRadius: "10px",
                        backgroundColor: "#6C63FF",
                        fontWeight: "bold",
                        textTransform: "none",
                        px: 3,
                        py: 1,
                        cursor: "pointer",
                        "&:hover": {
                            backgroundColor: "#574eeb",
                        },
                    }}
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpen(true)}
                >
                    Add Expense
                </Button>
            </Stack>

            {/* Summary Cards */}
            <Stack sx={{ flexDirection: { md: "row", xs: "column" }, justifyContent: "center", alignItems: "center", gap: "10px" }} >
                <Stack sx={{ width: "100%" }} >
                    <Card
                        sx={{
                            backgroundColor: "white",
                            borderRadius: "16px",
                            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",

                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Typography color="text.secondary" variant="subtitle2" fontWeight={600} gutterBottom>
                                Total Expenses
                            </Typography>
                            <Typography variant="h4" fontWeight={700} color="text.primary">
                                ₹{totalExpense.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </Typography>
                        </CardContent>
                    </Card>
                </Stack>

                <Stack sx={{ width: "100%" }} >
                    <Card
                        sx={{
                            backgroundColor: "white",
                            borderRadius: "16px",
                            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Typography color="text.secondary" variant="subtitle2" fontWeight={600} gutterBottom>
                                Total Transactions
                            </Typography>
                            <Typography variant="h4" fontWeight={700} color="text.primary">
                                {expenses.length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Stack>

                <Stack sx={{ width: "100%" }} >
                    <Card
                        sx={{
                            backgroundColor: "white",
                            borderRadius: "16px",
                            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Typography color="text.secondary" variant="subtitle2" fontWeight={600} gutterBottom>
                                Active Categories
                            </Typography>
                            <Typography variant="h4" fontWeight={700} color="text.primary">
                                {uniqueCategories}
                            </Typography>
                        </CardContent>
                    </Card>
                </Stack>
            </Stack>

            {/* Mobile Add Button */}
            <Button
                sx={{
                    display: { xs: "flex", md: "none" },
                    borderRadius: "10px",
                    backgroundColor: "#6C63FF",
                    fontWeight: "bold",
                    textTransform: "none",
                    py: 1.5,
                    cursor: "pointer",
                    "&:hover": {
                        backgroundColor: "#574eeb",
                    },
                }}
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpen(true)}
            >
                Add Expense
            </Button>

            {/* Expenses Table */}
            <TableContainer component={Paper} sx={{ borderRadius: "16px", boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)", overflow: "hidden" }}>
                <Table>
                    <TableHead sx={{ backgroundColor: "#f8f9fa" }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Title & Description</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Payment Method</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Frequency</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600 }}>Action</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                                    <CircularProgress size={30} sx={{ color: "#6C63FF", mb: 1 }} />
                                    <Typography variant="body2" color="text.secondary">
                                        Loading expenses from database...
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                                    <Typography color="error" fontWeight={600} gutterBottom>
                                        {error}
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        onClick={fetchExpenses}
                                        sx={{ mt: 1, textTransform: "none", borderRadius: "8px" }}
                                    >
                                        Retry
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ) : expenses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                                    <Typography color="text.secondary">No expenses found. Click "Add Expense" to get started.</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            expenses.map((expense) => {
                                const catStyle = getCategoryStyle(expense.category);
                                return (
                                    <TableRow key={expense.id} hover>
                                        <TableCell>
                                            <Box>
                                                <Typography fontWeight={600} variant="body2">
                                                    {expense.title}
                                                </Typography>
                                                {expense.description && (
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5, maxWidth: "250px" }}>
                                                        {expense.description}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box
                                                sx={{
                                                    ...catStyle,
                                                    borderRadius: "22px",
                                                    padding: "4px 12px",
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: "12px",
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {expense.category}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={expense.department}
                                                size="small"
                                                variant="outlined"
                                                sx={{ fontWeight: 500 }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
                                                {getPaymentMethodLabel(expense.payment_method)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {getFrequencyLabel(expense.recurring_frequency)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600}>
                                                ₹{Number(expense.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {expense.date}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDelete(expense.id)}
                                                size="small"
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add Expense Dialog */}
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    sx: { borderRadius: "16px" }
                }}
            >
                <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Add New Expense</DialogTitle>

                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Amount (₹)"
                                name="amount"
                                type="number"
                                value={formData.amount}
                                onChange={handleChange}
                                required
                                inputProps={{ min: 0, step: "0.01" }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                fullWidth
                                label="Category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                            >
                                {CATEGORIES.map((cat) => (
                                    <MenuItem key={cat} value={cat}>
                                        {cat}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                fullWidth
                                label="Department"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                required
                            >
                                {DEPARTMENTS.map((dept) => (
                                    <MenuItem key={dept} value={dept}>
                                        {dept}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                fullWidth
                                label="Payment Method"
                                name="payment_method"
                                value={formData.payment_method}
                                onChange={handleChange}
                                required
                            >
                                {PAYMENT_METHODS.map((pm) => (
                                    <MenuItem key={pm.value} value={pm.value}>
                                        {pm.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                fullWidth
                                label="Recurring Frequency"
                                name="recurring_frequency"
                                value={formData.recurring_frequency}
                                onChange={handleChange}
                                required
                            >
                                {RECURRING_FREQUENCIES.map((rf) => (
                                    <MenuItem key={rf.value} value={rf.value}>
                                        {rf.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Expense Date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Add optional details..."
                            />
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
                    <Button
                        onClick={() => setOpen(false)}
                        sx={{ color: "text.secondary", fontWeight: 600, textTransform: "none" }}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        onClick={handleAddExpense}
                        sx={{
                            borderRadius: "8px",
                            backgroundColor: "#6C63FF",
                            fontWeight: "bold",
                            textTransform: "none",
                            px: 3,
                            "&:hover": {
                                backgroundColor: "#574eeb",
                            },
                        }}
                    >
                        Save Expense
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack >
    );
};

export default Expenses;