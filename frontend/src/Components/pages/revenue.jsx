import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    // MenuItem,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

const API_BASE_URL = "https://ai-based-financial-adviser-project.onrender.com/api/revenues";

const createInitialForm = () => ({
    source: "",
    department_name: "",
    description: "",
    revenue_date: new Date().toISOString().split("T")[0],
    amount: "",
});

const normalizeRevenue = (item) => ({
    id: item.id ?? Date.now(),
    source: item.source ?? "",
    department_name: item.department_name ?? item.department ?? "",
    description: item.description ?? "",
    revenue_date: item.revenue_date ?? new Date().toISOString().split("T")[0],
    amount: Number(item.amount) || 0,
});

const RevenuePage = () => {
    const [revenues, setRevenues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [openCreate, setOpenCreate] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [selectedRevenue, setSelectedRevenue] = useState(null);
    const [newRevenue, setNewRevenue] = useState(createInitialForm());

    useEffect(() => {
        const fetchRevenues = async () => {
            setLoading(true);
            setError("");

            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(API_BASE_URL, {
                    headers: { Authorization: token },
                });

                if (response.data?.success) {
                    setRevenues((response.data.data || []).map(normalizeRevenue));
                } else {
                    setRevenues([]);
                    setError("Unable to load revenues from the server.");
                }
            } catch (fetchError) {
                setRevenues([]);
                setError(
                    fetchError.response?.data?.message ||
                    "Failed to load revenues from the online database."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchRevenues();
    }, []);

    const totalRevenue = useMemo(
        () => revenues.reduce((sum, item) => sum + Number(item.amount || 0), 0),
        [revenues]
    );

    const departmentCount = useMemo(
        () => new Set(revenues.map((item) => item.department_name.trim()).filter(Boolean)).size,
        [revenues]
    );

    const currentMonthRevenue = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        return revenues
            .filter((item) => {
                const revenueDate = new Date(item.revenue_date);
                return (
                    revenueDate.getMonth() + 1 === currentMonth &&
                    revenueDate.getFullYear() === currentYear
                );
            })
            .reduce((sum, item) => sum + Number(item.amount || 0), 0);
    }, [revenues]);

    const averageRevenue = useMemo(
        () => (revenues.length ? totalRevenue / revenues.length : 0),
        [revenues.length, totalRevenue]
    );

    const handleCreateChange = (field) => (event) => {
        const value = event.target.value;
        setNewRevenue((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleEditChange = (field) => (event) => {
        const value = event.target.value;
        setSelectedRevenue((prev) => {
            if (!prev) {
                return prev;
            }

            return {
                ...prev,
                [field]: value,
            };
        });
    };

    const openCreateDialog = () => {
        setNewRevenue(createInitialForm());
        setOpenCreate(true);
    };

    const closeCreateDialog = () => {
        setOpenCreate(false);
        setNewRevenue(createInitialForm());
    };

    const handleCreateRevenue = async () => {
        if (
            !newRevenue.source.trim() ||
            !newRevenue.revenue_date ||
            !newRevenue.amount
        ) {
            setError("Please fill in the required revenue fields.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                API_BASE_URL,
                {
                    source: newRevenue.source.trim(),
                    department_name: newRevenue.department_name.trim(),
                    description: newRevenue.description.trim(),
                    revenue_date: newRevenue.revenue_date,
                    amount: Number(newRevenue.amount),
                },
                {
                    headers: { Authorization: token },
                }
            );

            if (response.data?.success) {
                setRevenues((prev) => [normalizeRevenue(response.data.data), ...prev]);
                setNewRevenue(createInitialForm());
                setOpenCreate(false);
                setError("");
            }
        } catch (createError) {
            setError(
                createError.response?.data?.message || "Failed to save revenue to the server."
            );
        }
    };

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.delete(`${API_BASE_URL}/${id}`, {
                headers: { Authorization: token },
            });

            if (response.data?.success) {
                setRevenues((prev) => prev.filter((item) => item.id !== id));
            }
        } catch (deleteError) {
            setError(
                deleteError.response?.data?.message ||
                "Failed to delete revenue from the server."
            );
        }
    };

    const handleEdit = (revenue) => {
        setSelectedRevenue({ ...revenue });
        setOpenEdit(true);
    };

    const handleUpdateRevenue = async () => {
        if (!selectedRevenue) {
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await axios.put(
                `${API_BASE_URL}/${selectedRevenue.id}`,
                {
                    source: selectedRevenue.source.trim(),
                    department_name: selectedRevenue.department_name.trim(),
                    description: selectedRevenue.description.trim(),
                    revenue_date: selectedRevenue.revenue_date,
                    amount: Number(selectedRevenue.amount),
                },
                {
                    headers: { Authorization: token },
                }
            );

            if (response.data?.success) {
                setRevenues((prev) =>
                    prev.map((item) =>
                        item.id === selectedRevenue.id ? normalizeRevenue(response.data.data) : item
                    )
                );
                setOpenEdit(false);
                setSelectedRevenue(null);
                setError("");
            }
        } catch (updateError) {
            setError(
                updateError.response?.data?.message ||
                "Failed to update revenue on the server."
            );
        }
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
                minHeight: "100vh",
                px: { xs: 2, md: 3 },
                py: { xs: 2, md: 3 },
                mt: { xs: 8, md: 0 },
                background:
                    "linear-gradient(180deg, rgba(248,250,252,1) 0%, rgba(241,245,249,1) 100%)",
            }}
        >
            <Paper
                // elevation={0}
                sx={{
                    p: { xs: 2, md: 3 },
                    mb: 3,
                    borderRadius: "24px",
                    border: "1px solid rgba(148, 163, 184, 0.18)",

                }}
            >
                <Stack

                    sx={{
                        flexDirection: { xs: "column", md: "row" },
                        justifyContent: "space-between",
                        alignItems:
                            { xs: "flex-start", md: "center" }
                    }}

                >
                    <Box>
                        <Typography variant="h4" fontWeight={800}>
                            Revenues
                        </Typography>

                    </Box>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={openCreateDialog}
                        sx={{
                            display: "flex",
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
                    >
                        Add Revenue
                    </Button>

                </Stack>
            </Paper>

            <Stack sx={{ flexDirection: { md: "row", xs: "column" }, gap: "10px", mb: 3 }}>
                <Stack sx={{ width: "100%" }}>
                    <Card sx={cardStyle}>
                        <CardContent>
                            <Typography variant="body2" color="text.secondary">
                                Total Revenue
                            </Typography>
                            <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                                ₹{totalRevenue.toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Stack>
                <Stack sx={{ width: "100%" }}>
                    <Card sx={cardStyle}>
                        <CardContent>
                            <Typography variant="body2" color="text.secondary">
                                This Month
                            </Typography>
                            <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                                ₹{currentMonthRevenue.toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Stack>
                <Stack sx={{ width: "100%" }}>
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
                <Stack sx={{ width: "100%" }}>
                    <Card sx={cardStyle}>
                        <CardContent>
                            <Typography variant="body2" color="text.secondary">
                                Average Revenue
                            </Typography>
                            <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                                ₹{averageRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
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
                            Revenue Records
                        </Typography>
                    </Box>
                    <Chip label={`${revenues.length} records`} variant="outlined" />
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
                            Loading revenues from the database...
                        </Typography>
                    </Stack>
                ) : revenues.length === 0 ? (
                    <Box sx={{ py: 8, textAlign: "center", color: "text.secondary" }}>
                        <Typography variant="h6" fontWeight={700}>
                            No revenues yet
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                            Add the first revenue entry to begin tracking inflows.
                        </Typography>
                    </Box>
                ) : (
                    <Stack spacing={2}>
                        {revenues.map((item) => (
                            <Paper
                                key={item.id}
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    borderRadius: "16px",
                                    borderColor: "rgba(148, 163, 184, 0.25)",
                                }}
                            >
                                <Stack
                                    sx={{ flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", alignItems: { xs: "flex-start", md: "center" } }}


                                >
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={800} sx={{ fontSize: { md: "22px", xs: "16px" } }} >
                                            {item.source}
                                        </Typography>
                                        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
                                            <Chip label={item.department_name || "No department"} size="small" />
                                            <Chip label={item.revenue_date} size="small" variant="outlined" />
                                        </Stack>
                                        {item.description ? (
                                            <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 560, fontSize: "22px" }}>
                                                {item.description}
                                            </Typography>
                                        ) : null}
                                    </Box>

                                    <Stack sx={{ flexDirection: "row", alignItems: "center" }}>
                                        <Typography variant="h6" fontWeight={800} sx={{ mr: 1 }}>
                                            ₹{Number(item.amount || 0).toLocaleString()}
                                        </Typography>
                                        <IconButton onClick={() => handleEdit(item)} aria-label="edit revenue">
                                            <EditOutlinedIcon color="primary" />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(item.id)} aria-label="delete revenue">
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
                <DialogTitle>Add Revenue</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Source"
                        value={newRevenue.source}
                        onChange={handleCreateChange("source")}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Department Name"
                        value={newRevenue.department_name}
                        onChange={handleCreateChange("department_name")}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Revenue Date"
                        type="date"
                        value={newRevenue.revenue_date}
                        onChange={handleCreateChange("revenue_date")}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Amount"
                        type="number"
                        value={newRevenue.amount}
                        onChange={handleCreateChange("amount")}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Description"
                        multiline
                        rows={3}
                        value={newRevenue.description}
                        onChange={handleCreateChange("description")}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeCreateDialog}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreateRevenue}>
                        Create
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="sm">
                <DialogTitle>Edit Revenue</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Source"
                        value={selectedRevenue?.source || ""}
                        onChange={handleEditChange("source")}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Department Name"
                        value={selectedRevenue?.department_name || ""}
                        onChange={handleEditChange("department_name")}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Revenue Date"
                        type="date"
                        value={selectedRevenue?.revenue_date || ""}
                        onChange={handleEditChange("revenue_date")}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Amount"
                        type="number"
                        value={selectedRevenue?.amount || ""}
                        onChange={handleEditChange("amount")}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Description"
                        multiline
                        rows={3}
                        value={selectedRevenue?.description || ""}
                        onChange={handleEditChange("description")}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleUpdateRevenue}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default RevenuePage;