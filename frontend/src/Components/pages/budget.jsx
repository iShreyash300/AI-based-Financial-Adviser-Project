import React, { useState, useEffect } from "react";

import {
    Box,
    Paper,
    Typography,
    Stack,
    Button,
    LinearProgress,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

const BudgetPage = () => {
    const [budgets, setBudgets] = useState([]);

    const [openCreate, setOpenCreate] =
        useState(false);

    const [openEdit, setOpenEdit] =
        useState(false);

    const [selectedBudget, setSelectedBudget] =
        useState(null);

    const [newBudget, setNewBudget] =
        useState({
            department: "",
            budget: "",
            spent: 0,
            month: "",
        });

    // LOAD LOCAL STORAGE

    useEffect(() => {
        const data =
            localStorage.getItem("budgets");

        if (data) {
            setBudgets(JSON.parse(data));
        }
    }, []);

    // SAVE LOCAL STORAGE

    useEffect(() => {
        localStorage.setItem(
            "budgets",
            JSON.stringify(budgets)
        );
    }, [budgets]);

    // CREATE

    const handleCreateBudget = () => {
        if (
            !newBudget.department ||
            !newBudget.budget ||
            !newBudget.month
        )
            return;

        const budgetObj = {
            id: Date.now(),
            department:
                newBudget.department,
            budget: Number(
                newBudget.budget
            ),
            spent: Number(
                newBudget.spent
            ),
            month: newBudget.month,
        };

        setBudgets([
            ...budgets,
            budgetObj,
        ]);

        setNewBudget({
            department: "",
            budget: "",
            spent: 0,
            month: "",
        });

        setOpenCreate(false);
    };

    // DELETE

    const handleDelete = (id) => {
        setBudgets(
            budgets.filter(
                (item) => item.id !== id
            )
        );
    };

    // EDIT

    const handleEdit = (budget) => {
        setSelectedBudget(budget);
        setOpenEdit(true);
    };

    // UPDATE

    const handleUpdateBudget = () => {
        setBudgets(
            budgets.map((item) =>
                item.id === selectedBudget.id
                    ? selectedBudget
                    : item
            )
        );

        setOpenEdit(false);
    };

    // SUMMARY

    const totalBudget =
        budgets.reduce(
            (sum, item) =>
                sum + item.budget,
            0
        );

    const totalSpent =
        budgets.reduce(
            (sum, item) =>
                sum + item.spent,
            0
        );

    const remaining =
        totalBudget - totalSpent;

    const utilization =
        totalBudget > 0
            ? (
                (totalSpent /
                    totalBudget) *
                100
            ).toFixed(0)
            : 0;

    const cardStyle = {
        width: "100%",
        p: 3,
        borderRadius: "16px",
        boxShadow:
            "0 5px 20px rgba(0,0,0,0.08)",
    };

    return (
        <Box p={3}>
            {/* HEADER */}

            <Stack
                sx={{
                    flexDirection: { md: "row", xs: 'column' },
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 3,
                    gap: { xs: 2, md: 0 },
                    mt: { xs: 8, md: 0 }
                }}
            >
                <Typography
                    variant="h6"
                    fontWeight={700}
                >
                    Budget Management
                </Typography>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() =>
                        setOpenCreate(true)
                    }
                    sx={{
                        width: { md: "200px", xs: "100%" },
                        height: "45px",
                        px: 4,
                        borderRadius: "10px",
                        textTransform: "none",
                        backgroundColor: "#6C63FF",
                        fontWeight: "bold",
                        cursor: "pointer",
                    }}
                >
                    Create Budget
                </Button>
            </Stack>

            {/* CARDS */}

            <Stack
                sx={{
                    flexDirection: { md: "row", xs: "column" },
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 3,
                    gap: "10px"
                }} >
                <Stack sx={{ width: "100%" }}>
                    <Paper sx={cardStyle}>
                        <Typography>
                            Total Budget
                        </Typography>

                        <Typography variant="h5">
                            ₹
                            {totalBudget.toLocaleString()}
                        </Typography>
                    </Paper>
                </Stack>

                <Stack sx={{ width: "100%" }}>
                    <Paper sx={cardStyle}>
                        <Typography>
                            Total Spent
                        </Typography>

                        <Typography variant="h5">
                            ₹
                            {totalSpent.toLocaleString()}
                        </Typography>
                    </Paper>
                </Stack>

                <Stack sx={{ width: "100%" }}>
                    <Paper sx={cardStyle}>
                        <Typography>
                            Remaining
                        </Typography>

                        <Typography variant="h5">
                            ₹
                            {remaining.toLocaleString()}
                        </Typography>
                    </Paper>
                </Stack>

                <Stack sx={{ width: "100%" }}>
                    <Paper sx={cardStyle}>
                        <Typography>
                            Utilization
                        </Typography>

                        <Typography variant="h5">
                            {utilization}%
                        </Typography>
                    </Paper>
                </Stack>
            </Stack>

            {/* BUDGET LIST */}
            <Stack sx={{ p: 3 }} >

                <Paper
                    sx={{
                        p: 3,
                        borderRadius: "16px",
                    }}
                >
                    <Typography
                        variant="h6"
                        mb={3}
                    >
                        Department Budgets
                    </Typography>

                    {budgets.map((item) => {
                        const percent = (
                            (item.spent /
                                item.budget) *
                            100
                        ).toFixed(0);

                        return (
                            <Box
                                key={item.id}
                                sx={{
                                    p: 2,
                                    mb: 2,
                                    border:
                                        "1px solid #eee",
                                    borderRadius:
                                        "12px",
                                }}
                            >
                                <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                >
                                    <Box>
                                        <Typography fontWeight={600}>
                                            {
                                                item.department
                                            }
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Month :
                                            {item.month}
                                        </Typography>
                                    </Box>

                                    <Stack
                                        direction="row"
                                    >
                                        <IconButton
                                            onClick={() =>
                                                handleEdit(
                                                    item
                                                )
                                            }
                                        >
                                            <EditOutlinedIcon color="primary" />
                                        </IconButton>

                                        <IconButton
                                            onClick={() =>
                                                handleDelete(
                                                    item.id
                                                )
                                            }
                                        >
                                            <DeleteOutlineOutlinedIcon color="error" />
                                        </IconButton>
                                    </Stack>
                                </Stack>

                                <Box mt={2}>
                                    <LinearProgress
                                        variant="determinate"
                                        value={
                                            percent >
                                                100
                                                ? 100
                                                : percent
                                        }
                                        sx={{
                                            height: 10,
                                            borderRadius:
                                                "10px",
                                        }}
                                    />

                                    <Typography mt={1}>
                                        ₹
                                        {item.spent.toLocaleString()}
                                        {" / "}₹
                                        {item.budget.toLocaleString()}
                                    </Typography>
                                </Box>
                            </Box>
                        );
                    })}
                </Paper>
            </Stack>
            {/* CREATE DIALOG */}

            <Dialog
                open={openCreate}
                onClose={() =>
                    setOpenCreate(false)
                }
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    Create Budget
                </DialogTitle>

                <DialogContent>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Department"
                        value={
                            newBudget.department
                        }
                        onChange={(e) =>
                            setNewBudget({
                                ...newBudget,
                                department:
                                    e.target.value,
                            })
                        }
                    />

                    <TextField
                        fullWidth
                        margin="normal"
                        label="Budget Amount"
                        type="number"
                        value={
                            newBudget.budget
                        }
                        onChange={(e) =>
                            setNewBudget({
                                ...newBudget,
                                budget:
                                    e.target.value,
                            })
                        }
                    />

                    <TextField
                        fullWidth
                        margin="normal"
                        label="Spent Amount"
                        type="number"
                        value={
                            newBudget.spent
                        }
                        onChange={(e) =>
                            setNewBudget({
                                ...newBudget,
                                spent:
                                    e.target.value,
                            })
                        }
                    />

                    <TextField
                        fullWidth
                        margin="normal"
                        type="month"
                        value={
                            newBudget.month
                        }
                        onChange={(e) =>
                            setNewBudget({
                                ...newBudget,
                                month:
                                    e.target.value,
                            })
                        }
                    />
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={() =>
                            setOpenCreate(false)
                        }
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        onClick={
                            handleCreateBudget
                        }
                    >
                        Create
                    </Button>
                </DialogActions>
            </Dialog>

            {/* EDIT DIALOG */}

            <Dialog
                open={openEdit}
                onClose={() =>
                    setOpenEdit(false)
                }
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    Edit Budget
                </DialogTitle>

                <DialogContent>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Department"
                        value={
                            selectedBudget
                                ?.department || ""
                        }
                        onChange={(e) =>
                            setSelectedBudget({
                                ...selectedBudget,
                                department:
                                    e.target.value,
                            })
                        }
                    />

                    <TextField
                        fullWidth
                        margin="normal"
                        label="Budget"
                        type="number"
                        value={
                            selectedBudget
                                ?.budget || ""
                        }
                        onChange={(e) =>
                            setSelectedBudget({
                                ...selectedBudget,
                                budget: Number(
                                    e.target.value
                                ),
                            })
                        }
                    />

                    <TextField
                        fullWidth
                        margin="normal"
                        label="Spent"
                        type="number"
                        value={
                            selectedBudget
                                ?.spent || ""
                        }
                        onChange={(e) =>
                            setSelectedBudget({
                                ...selectedBudget,
                                spent: Number(
                                    e.target.value
                                ),
                            })
                        }
                    />
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={() =>
                            setOpenEdit(false)
                        }
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        onClick={
                            handleUpdateBudget
                        }
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BudgetPage;