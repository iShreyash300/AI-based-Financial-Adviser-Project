import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
    Box,
    Alert,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    MenuItem,
    Paper,
    CircularProgress,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

const API_BASE_URL = "https://ai-based-financial-adviser-project.onrender.com/api/budgets";

const MONTHS = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
];

const getCurrentYear = () => new Date().getFullYear();

const getMonthLabel = (monthValue) => {
    const monthNumber = Number(monthValue);
    const month = MONTHS.find((item) => item.value === monthNumber);
    return month ? month.label : "Unknown";
};

const normalizeBudget = (item) => ({
    id: item.id ?? Date.now(),
    department_name: item.department_name ?? item.department ?? "",
    budget_month: Number(item.budget_month) || new Date().getMonth() + 1,
    budget_year: Number(item.budget_year) || getCurrentYear(),
    amount: Number(item.amount) || 0,
});

const createInitialForm = () => ({
    department_name: "",
    budget_month: String(new Date().getMonth() + 1),
    budget_year: String(getCurrentYear()),
    amount: "",
});

const BudgetPage = () => {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [openCreate, setOpenCreate] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [selectedBudget, setSelectedBudget] = useState(null);
    const [newBudget, setNewBudget] = useState(createInitialForm());

    useEffect(() => {
        const fetchBudgets = async () => {
            setLoading(true);
            setError("");

            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(API_BASE_URL, {
                    headers: { Authorization: token },
                });

                if (response.data?.success) {
                    setBudgets((response.data.data || []).map(normalizeBudget));
                } else {
                    setBudgets([]);
                    setError("Unable to load budgets from the server.");
                }
            } catch (fetchError) {
                setBudgets([]);
                setError(
                    fetchError.response?.data?.message ||
                    "Failed to load budgets from the online database."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchBudgets();
    }, []);

    const totalBudget = useMemo(
        () => budgets.reduce((sum, item) => sum + Number(item.amount || 0), 0),
        [budgets]
    );

    const departmentCount = useMemo(
        () => new Set(budgets.map((item) => item.department_name.trim()).filter(Boolean)).size,
        [budgets]
    );

    const currentPeriodBudget = useMemo(() => {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = getCurrentYear();

        return budgets
            .filter(
                (item) =>
                    Number(item.budget_month) === currentMonth &&
                    Number(item.budget_year) === currentYear
            )
            .reduce((sum, item) => sum + Number(item.amount || 0), 0);
    }, [budgets]);

    const averageBudget = useMemo(
        () => (budgets.length ? totalBudget / budgets.length : 0),
        [budgets.length, totalBudget]
    );

    const handleCreateChange = (field) => (event) => {
        const value = event.target.value;
        setNewBudget((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleEditChange = (field) => (event) => {
        const value = event.target.value;
        setSelectedBudget((prev) => {
            if (!prev) {
                return prev;
            }

            return {
                ...prev,
                [field]: value,
            };
        });
    };

    const handleCreateBudget = () => {
        if (
            !newBudget.department_name.trim() ||
            !newBudget.budget_month ||
            !newBudget.budget_year ||
            !newBudget.amount
        ) {
            return;
        }

        const createBudget = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.post(
                    API_BASE_URL,
                    {
                        department_name: newBudget.department_name.trim(),
                        budget_month: Number(newBudget.budget_month),
                        budget_year: Number(newBudget.budget_year),
                        amount: Number(newBudget.amount),
                    },
                    {
                        headers: { Authorization: token },
                    }
                );

                if (response.data?.success) {
                    setBudgets((prev) => [normalizeBudget(response.data.data), ...prev]);
                    setNewBudget(createInitialForm());
                    setOpenCreate(false);
                    setError("");
                }
            } catch (createError) {
                setError(
                    createError.response?.data?.message ||
                    "Failed to save budget to the server."
                );
            }
        };

        createBudget();
    };

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.delete(`${API_BASE_URL}/${id}`, {
                headers: { Authorization: token },
            });

            if (response.data?.success) {
                setBudgets((prev) => prev.filter((item) => item.id !== id));
            }
        } catch (deleteError) {
            setError(
                deleteError.response?.data?.message ||
                "Failed to delete budget from the server."
            );
        }
    };

    const handleEdit = (budget) => {
        setSelectedBudget({ ...budget });
        setOpenEdit(true);
    };

    const handleUpdateBudget = async () => {
        if (!selectedBudget) {
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await axios.put(
                `${API_BASE_URL}/${selectedBudget.id}`,
                {
                    department_name: selectedBudget.department_name.trim(),
                    budget_month: Number(selectedBudget.budget_month),
                    budget_year: Number(selectedBudget.budget_year),
                    amount: Number(selectedBudget.amount),
                },
                {
                    headers: { Authorization: token },
                }
            );

            if (response.data?.success) {
                setBudgets((prev) =>
                    prev.map((item) =>
                        item.id === selectedBudget.id
                            ? normalizeBudget(response.data.data)
                            : item
                    )
                );
                setOpenEdit(false);
                setSelectedBudget(null);
                setError("");
            }
        } catch (updateError) {
            setError(
                updateError.response?.data?.message ||
                "Failed to update budget on the server."
            );
        }
    };

    const openCreateDialog = () => {
        setNewBudget(createInitialForm());
        setOpenCreate(true);
    };

    const closeCreateDialog = () => {
        setOpenCreate(false);
        setNewBudget(createInitialForm());
    };

    const closeEditDialog = () => {
        setOpenEdit(false);
        setSelectedBudget(null);
    };

    const cardStyle = {
        height: "100%",
        borderRadius: "18px",
        boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)",
        border: "1px solid rgba(148, 163, 184, 0.18)",
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
                px: { xs: 2, md: 3 },
                py: { xs: 2, md: 3 },
                mt: { xs: 8, md: 0 },
                background:
                    "linear-gradient(180deg, rgba(248,250,252,1) 0%, rgba(241,245,249,1) 100%)",
            }}
        >

            <Stack
                sx={{ justifyContent: "space-between", alignItems: "center", flexDirection: "row", mb: 2, px: 1 }}
            >
                <Box>
                    <Typography variant="h4" fontWeight={700}>
                        Budgets
                    </Typography>
                </Box>

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
                    onClick={openCreateDialog}

                >
                    Create Budget
                </Button>
            </Stack>


            <Stack sx={{ flexDirection: { md: "row", xs: "column" }, gap: "10px", mb: 2 }}>
                <Stack sx={{ width: "100%" }}>
                    <Card sx={cardStyle}>
                        <CardContent>
                            <Typography variant="body2" color="text.secondary">
                                Total Budget
                            </Typography>
                            <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                                ₹{totalBudget.toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Stack>
                <Stack sx={{ width: "100%" }} >
                    <Card sx={cardStyle}>
                        <CardContent>
                            <Typography variant="body2" color="text.secondary">
                                This Month
                            </Typography>
                            <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                                ₹{currentPeriodBudget.toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Stack>
                <Stack sx={{ width: "100%" }} >
                    <Card sx={cardStyle}>
                        <CardContent>
                            <Typography variant="body2" color="text.secondary">
                                Departments Covered
                            </Typography>
                            <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                                {departmentCount}
                            </Typography>
                        </CardContent>
                    </Card>
                </Stack>
                <Stack sx={{ width: "100%" }} >
                    <Card sx={cardStyle}>
                        <CardContent>
                            <Typography variant="body2" color="text.secondary">
                                Average Allocation
                            </Typography>
                            <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                                ₹{averageBudget.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </Typography>
                        </CardContent>
                    </Card>
                </Stack>
            </Stack>

            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, md: 3 },
                    borderRadius: "20px",
                    border: "1px solid rgba(148, 163, 184, 0.18)",
                    boxShadow: "0 16px 40px rgba(15, 23, 42, 0.06)",
                }}
            >
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={1}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", md: "center" }}
                    sx={{ mb: 2 }}
                >
                    <Box>
                        <Typography variant="h6" fontWeight={800}>
                            Budgets Table
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Each entry corresponds to a budget record with department, month, year, and amount.
                        </Typography>
                    </Box>
                    <Chip label={`${budgets.length} records`} variant="outlined" />
                </Stack>

                <Divider sx={{ mb: 2 }} />

                {error ? (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                ) : null}

                {loading ? (
                    <Stack sx={{ py: 8, alignItems: "center" }}>
                        <CircularProgress />
                        <Typography sx={{ mt: 2 }} color="text.secondary">
                            Loading budgets from the database...
                        </Typography>
                    </Stack>
                ) : budgets.length === 0 ? (
                    <Box
                        sx={{
                            py: 8,
                            textAlign: "center",
                            color: "text.secondary",
                        }}
                    >
                        <Typography variant="h6" fontWeight={700}>
                            No budgets yet
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                            Create the first budget entry to match your schema structure.
                        </Typography>
                    </Box>
                ) : (
                    <Stack spacing={2}>
                        {budgets.map((item) => (
                            <Paper
                                key={item.id}
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    borderRadius: "16px",
                                    borderColor: "rgba(148, 163, 184, 0.25)",
                                }}
                            >
                                <Stack sx={{

                                    justifyContent: "space-between",
                                    alignItems: { xs: "flex-start", md: "center" },
                                    flexDirection: { xs: "column", md: "row" }
                                }}

                                >
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={800}
                                            sx={{ fontSize: { md: "18px", xs: "22px" } }}>
                                            {item.department_name}
                                        </Typography>
                                        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
                                            <Chip label={getMonthLabel(item.budget_month)} size="small" />
                                            <Chip label={item.budget_year} size="small" variant="outlined" />
                                        </Stack>
                                    </Box>

                                    <Stack sx={{ alignItems: "center", flexDirection: "row" }}>
                                        <Typography variant="h6" fontWeight={800} sx={{ mr: 1 }}>
                                            ₹{Number(item.amount || 0).toLocaleString()}
                                        </Typography>
                                        <IconButton onClick={() => handleEdit(item)} aria-label="edit budget">
                                            <EditOutlinedIcon color="primary" />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(item.id)} aria-label="delete budget">
                                            <DeleteOutlineOutlinedIcon color="error" />
                                        </IconButton>
                                    </Stack>
                                </Stack>
                            </Paper>
                        ))}
                    </Stack>
                )}
            </Paper>

            <Dialog open={openCreate} onClose={closeCreateDialog} fullWidth maxWidth="sm">
                <DialogTitle>Create Budget</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Department Name"
                        value={newBudget.department_name}
                        onChange={handleCreateChange("department_name")}
                    />
                    <TextField
                        fullWidth
                        select
                        margin="normal"
                        label="Budget Month"
                        value={newBudget.budget_month}
                        onChange={handleCreateChange("budget_month")}
                    >
                        {MONTHS.map((month) => (
                            <MenuItem key={month.value} value={month.value}>
                                {month.label}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Budget Year"
                        type="number"
                        value={newBudget.budget_year}
                        onChange={handleCreateChange("budget_year")}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Amount"
                        type="number"
                        value={newBudget.amount}
                        onChange={handleCreateChange("amount")}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeCreateDialog}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreateBudget}>
                        Create
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openEdit} onClose={closeEditDialog} fullWidth maxWidth="sm">
                <DialogTitle>Edit Budget</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Department Name"
                        value={selectedBudget?.department_name || ""}
                        onChange={handleEditChange("department_name")}
                    />
                    <TextField
                        fullWidth
                        select
                        margin="normal"
                        label="Budget Month"
                        value={selectedBudget?.budget_month || ""}
                        onChange={handleEditChange("budget_month")}
                    >
                        {MONTHS.map((month) => (
                            <MenuItem key={month.value} value={month.value}>
                                {month.label}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Budget Year"
                        type="number"
                        value={selectedBudget?.budget_year || ""}
                        onChange={handleEditChange("budget_year")}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Amount"
                        type="number"
                        value={selectedBudget?.amount || ""}
                        onChange={handleEditChange("amount")}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeEditDialog}>Cancel</Button>
                    <Button variant="contained" onClick={handleUpdateBudget}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BudgetPage;