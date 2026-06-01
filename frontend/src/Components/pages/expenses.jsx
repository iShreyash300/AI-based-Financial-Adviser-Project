import React, { useState } from "react";

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
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);

    const [open, setOpen] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        category: "",
        amount: "",
        date: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleAddExpense = () => {
        const newExpense = {
            id: Date.now(),
            ...formData,
        };

        setExpenses([...expenses, newExpense]);

        setFormData({
            title: "",
            category: "",
            amount: "",
            date: "",
        });

        setOpen(false);
    };

    const handleDelete = (id) => {
        setExpenses(expenses.filter((item) => item.id !== id));
    };

    const totalExpense = expenses.reduce(
        (sum, item) => sum + Number(item.amount),
        0
    );

    return (
        <Stack spacing={2} sx={{ p: 3 }}>
            <Stack
                direction="row"
                sx={{

                    justifyContent: "space-between",
                }}
            >
                <Typography variant="h4" fontWeight={700}>
                    Expenses
                </Typography>

                <Button
                    sx={{
                        display: { xs: "none", md: "block" },
                        borderRadius: "8px",
                        backgroundColor: "#6C63FF",
                        fontWeight: "bold",
                        cursor: "pointer",

                    }}
                    variant="contained"
                    onClick={() => setOpen(true)}
                >
                    Add Expense
                </Button>
            </Stack>

            <Stack
                sx={{
                    flexDirection: { xs: "column", md: "row" }, alignItems: "center",
                    justifyContent: { xs: "center", md: "space-between" }, gap: 2
                }}>
                <Grid item xs={12} md={4} sx={{ width: { md: "auto", xs: "100%" } }}>
                    <Card sx={{
                        backgroundColor: "white",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)"

                    }}  >
                        <CardContent>
                            <Typography color="text.secondary">
                                Total Expenses
                            </Typography>

                            <Typography variant="h5" fontWeight={700}>
                                ₹{totalExpense}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4} sx={{ width: { md: "auto", xs: "100%" } }}>
                    <Card
                        sx={{
                            backgroundColor: "white",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)"

                        }}
                    >
                        <CardContent>
                            <Typography color="text.secondary">
                                Total Transactions
                            </Typography>

                            <Typography variant="h5" fontWeight={700}>
                                {expenses.length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4} sx={{ width: { md: "auto", xs: "100%" } }}>
                    <Card
                        sx={{
                            backgroundColor: "white",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)"

                        }}

                    >
                        <CardContent>
                            <Typography color="text.secondary">
                                Categories
                            </Typography>

                            <Typography variant="h5" fontWeight={700}>
                                4
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Stack>
            <Button
                sx={{
                    display: { xs: "block", md: "none" },
                    borderRadius: "8px",
                    backgroundColor: "#6C63FF",
                    fontWeight: "bold",
                    cursor: "pointer",

                }}
                variant="contained"
                onClick={() => setOpen(true)}
            >
                Add Expense
            </Button>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Action</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {expenses.map((expense) => (
                            <TableRow key={expense.id}>
                                <TableCell>{expense.title}</TableCell>
                                <TableCell>
                                    <Box sx={{
                                        backgroundColor: "#92f48dbd",
                                        borderRadius: "22px",
                                        padding: "4px 8px",
                                        display: "inline-flex",
                                        width: "auto",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        height: "21px",
                                        fontSize: "12px",
                                        border: "3px solid #89ed5e",

                                    }} >
                                        {expense.category}
                                    </Box>
                                </TableCell>
                                <TableCell>₹{expense.amount}</TableCell>
                                <TableCell>{expense.date}</TableCell>

                                <TableCell>
                                    <IconButton
                                        color="error"
                                        onClick={() =>
                                            handleDelete(expense.id)
                                        }
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Add Expense</DialogTitle>

                <DialogContent>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                    />

                    <TextField
                        select
                        fullWidth
                        margin="normal"
                        label="Category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                    >
                        <MenuItem value="Food">Food</MenuItem>
                        <MenuItem value="Travel">Travel</MenuItem>
                        <MenuItem value="Shopping">Shopping</MenuItem>
                        <MenuItem value="Bills">Bills</MenuItem>
                    </TextField>

                    <TextField
                        fullWidth
                        margin="normal"
                        label="Amount"
                        name="amount"
                        type="number"
                        value={formData.amount}
                        onChange={handleChange}
                    />

                    <TextField
                        fullWidth
                        margin="normal"
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setOpen(false)}>
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        onClick={handleAddExpense}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
};

export default Expenses;