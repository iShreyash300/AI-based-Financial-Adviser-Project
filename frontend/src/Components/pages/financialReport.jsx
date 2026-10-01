import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Grid,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
    Divider,
    Paper,
    Alert,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import BarChartIcon from "@mui/icons-material/BarChart";
import InsightsIcon from "@mui/icons-material/Insights";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend);

const API_BASE = "https://ai-based-financial-adviser-project.onrender.com/api/reports";

const reportFilters = [
    { value: "this_month", label: "This Month" },
    { value: "last_3_months", label: "Last 3 Months" },
    { value: "last_6_months", label: "Last 6 Months" },
    { value: "last_12_months", label: "Last 12 Months" },
    { value: "custom", label: "Custom Range" },
];

const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: token } : {};
};

const currency = (value) =>
    Number(value || 0).toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    });

const FinancialReportPage = () => {
    const [filter, setFilter] = useState("this_month");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [insights, setInsights] = useState([]);
    const [periodLabel, setPeriodLabel] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    const [summary, setSummary] = useState({
        totalRevenue: 0,
        totalExpenses: 0,
        netProfitLoss: 0,
        profitMargin: 0,
        budgetUtilization: 0,
        financialHealthScore: 0,
    });

    const [charts, setCharts] = useState({
        revenueTrend: [],
        expenseTrend: [],
        revenueVsExpense: [],
        expenseCategoryBreakdown: [],
    });

    const buildQuery = useCallback(() => {
        const params = new URLSearchParams();
        params.append("filter", filter);
        if (filter === "custom" && fromDate && toDate) {
            params.append("fromDate", fromDate);
            params.append("toDate", toDate);
        }
        return params.toString();
    }, [filter, fromDate, toDate]);

    const fetchReport = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const query = buildQuery();
            const [summaryRes, chartsRes, insightsRes] = await Promise.all([
                axios.get(`${API_BASE}/summary?${query}`, { headers: getAuthHeader() }),
                axios.get(`${API_BASE}/charts?${query}`, { headers: getAuthHeader() }),
                axios.get(`${API_BASE}/insights?${query}`, { headers: getAuthHeader() }),
            ]);

            if (summaryRes.data.success) {
                setSummary(
                    summaryRes.data.data || {
                        totalRevenue: 0,
                        totalExpenses: 0,
                        netProfitLoss: 0,
                        profitMargin: 0,
                        budgetUtilization: 0,
                        financialHealthScore: 0,
                    }
                );
            }
            if (chartsRes.data.success) {
                setCharts(chartsRes.data.data);
                setPeriodLabel(chartsRes.data.data.period || periodLabel);
            }
            if (insightsRes.data.success) {
                setInsights(insightsRes.data.data.insights || []);
                setPeriodLabel(insightsRes.data.data.period || periodLabel);
            }
        } catch (fetchError) {
            setError(fetchError.response?.data?.message || "Failed to load report data.");
        } finally {
            setLoading(false);
        }
    }, [buildQuery, periodLabel]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const summaryCards = useMemo(() => [
        {
            title: "Total Revenue",
            value: currency(summary?.totalRevenue ?? 0),
        },
        {
            title: "Total Expenses",
            value: currency(summary?.totalExpenses ?? 0),
        },
        {
            title: "Net Profit / Loss",
            value: currency(summary?.netProfitLoss ?? 0),
        },
        {
            title: "Profit Margin",
            value: `${Number(summary?.profitMargin ?? 0).toFixed(1)}%`,
        },
        {
            title: "Budget Utilization",
            value: `${Number(summary?.budgetUtilization ?? 0).toFixed(1)}%`,
        },
        {
            title: "Health Score",
            value: `${Number(summary?.financialHealthScore ?? 0).toFixed(1)} / 100`,
        },
    ], [summary]);

    const revenueTrendConfig = useMemo(() => {
        // const labels = charts?.revenueTrend?.map((item) => item.month) || [];
        const labels = (charts?.revenueTrend || []).map((item) => item.month)
        const revenueData = charts?.revenueTrend?.map((item) => item.total) || [];
        return {
            labels,
            datasets: [
                {
                    label: "Revenue",
                    data: revenueData,
                    borderColor: "#5B5FEF",
                    backgroundColor: "rgba(91,95,239,0.2)",
                    tension: 0.4,
                },
            ],
        };
    }, [charts]);

    const expenseTrendConfig = useMemo(() => {
        const labels = charts?.expenseTrend?.map((item) => item.month) || [];
        const expenseData = charts?.expenseTrend?.map((item) => item.total) || [];
        return {
            labels,
            datasets: [
                {
                    label: "Expenses",
                    data: expenseData,
                    borderColor: "#ff6b4c",
                    backgroundColor: "rgba(255,107,76,0.2)",
                    tension: 0.4,
                },
            ],
        };
    }, [charts]);

    const revenueVsExpenseConfig = useMemo(() => {
        const labels = charts?.revenueVsExpense?.map((item) => item.month) || [];
        const revenueData = charts?.revenueVsExpense?.map((item) => item.revenue) || [];
        const expenseData = charts?.revenueVsExpense?.map((item) => item.expense) || [];
        return {
            labels,
            datasets: [
                {
                    label: "Revenue",
                    data: revenueData,
                    backgroundColor: "#5B5FEF",
                },
                {
                    label: "Expenses",
                    data: expenseData,
                    backgroundColor: "#ffb300",
                },
            ],
        };
    }, [charts]);

    const expenseCategoryConfig = useMemo(() => {
        const labels = charts?.expenseCategoryBreakdown?.map((item) => item.category) || [];
        const values = charts?.expenseCategoryBreakdown?.map((item) => item.total) || [];
        return {
            labels,
            datasets: [
                {
                    data: values,
                    backgroundColor: ["#5B5FEF", "#ffb300", "#4caf50", "#f44336", "#9c27b0", "#2196f3", "#00bcd4", "#ff9800"],
                },
            ],
        };
    }, [charts]);

    const downloadPdf = async () => {
        try {
            const query = buildQuery();
            const response = await axios.get(`${API_BASE}/download?${query}`, {
                headers: getAuthHeader(),
                responseType: "blob",
            });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "financial-report.pdf");
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (downloadError) {
            setError(downloadError.response?.data?.message || "Unable to download PDF.");
        }
    };

    return (
        <Box sx={{ width: "100%", p: { xs: 2, md: 4 } }}>
            <Stack spacing={2}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                        Financial Report
                    </Typography>
                    <Typography color="text.secondary">
                        Live financial insights powered by your Neon PostgreSQL data.
                    </Typography>
                </Box>

                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={8}>
                        <Stack sx={{ flexDirection: { xs: "column", sm: "row" }, gap: 2 }} >
                            <Select value={filter} onChange={(e) => setFilter(e.target.value)} size="small">
                                {reportFilters.map((item) => (
                                    <MenuItem key={item.value} value={item.value}>
                                        {item.label}
                                    </MenuItem>
                                ))}
                            </Select>
                            {filter === "custom" && (
                                <>
                                    <TextField
                                        label="From"
                                        type="date"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                        size="small"
                                    />
                                    <TextField
                                        label="To"
                                        type="date"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                        size="small"
                                    />
                                </>
                            )}
                            <Button variant="contained" onClick={fetchReport} sx={{ height: 40 }}>
                                Refresh
                            </Button>
                        </Stack>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={downloadPdf}
                            fullWidth
                        >
                            Download PDF
                        </Button>
                    </Grid>
                </Grid>

                <Divider />

                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : (
                    <>
                        <Typography variant="subtitle2" color="text.secondary">
                            Period: {periodLabel}
                        </Typography>
                        <Stack sx={{ flexDirection: { xs: "column", md: "row" }, gap: 2, width: "100%" }}>
                            {summaryCards.map((card) => (
                                <Stack md={4} key={card.title} sx={{ width: "100%", justifyContent: "center" }}>
                                    <Card sx={{ minHeight: 100, borderRadius: 3 }}>
                                        <CardContent>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                {card.title}
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 700, mt: 1 }}>
                                                {card.value}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Stack>
                            ))}
                        </Stack>

                        <Stack sx={{ mt: 1, flexDirection: { md: "row", xs: "column" }, flexWrap: "wrap", gap: 2 }}>
                            <Stack md={5.9}>
                                <Paper sx={{ p: 2, borderRadius: 3, minHeight: 360 }}>
                                    <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                                        <BarChartIcon color="primary" />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                            Revenue Trend
                                        </Typography>
                                    </Stack>
                                    <Box sx={{ height: 280 }}>
                                        <Line data={revenueTrendConfig} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                                    </Box>
                                </Paper>
                            </Stack>
                            <Stack md={6}>
                                <Paper sx={{ p: 2, borderRadius: 3, minHeight: 360 }}>
                                    <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                                        <BarChartIcon color="error" />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                            Expense Trend
                                        </Typography>
                                    </Stack>
                                    <Box sx={{ height: 280 }}>
                                        <Line data={expenseTrendConfig} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                                    </Box>
                                </Paper>
                            </Stack>
                            <Stack >
                                <Paper sx={{ p: 2, borderRadius: 3, minHeight: 360 }}>
                                    <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                                        <InsightsIcon color="secondary" />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                            Revenue vs Expense
                                        </Typography>
                                    </Stack>
                                    <Box sx={{ height: 280 }}>
                                        <Bar data={revenueVsExpenseConfig} options={{ responsive: true }} />
                                    </Box>
                                </Paper>
                            </Stack>
                            <Stack >
                                <Paper sx={{ p: 2, borderRadius: 3, minHeight: 360 }}>
                                    <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                                        <CalendarMonthIcon color="success" />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                            Expense Category Breakdown
                                        </Typography>
                                    </Stack>
                                    <Box sx={{ height: 280 }}>
                                        <Pie data={expenseCategoryConfig} options={{ responsive: true, plugins: { legend: { position: "bottom" } } }} />
                                    </Box>
                                </Paper>
                            </Stack>
                        </Stack>

                        <Paper sx={{ p: 3, borderRadius: 3, mt: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                                AI Insights
                            </Typography>
                            <Stack container spacing={2}>
                                {insights.map((insight) => (
                                    <Stack item xs={12} md={6} key={insight.title}>
                                        <Card sx={{ height: "100%", borderRadius: 3, boxShadow: "none", border: "1px solid #f0f0f0" }}>
                                            <CardContent>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    {insight.title}
                                                </Typography>
                                                <Typography variant="body2" sx={{ mt: 1, color: "#333" }}>
                                                    {insight.message}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Stack>
                                ))}
                            </Stack>
                        </Paper>
                    </>
                )}
            </Stack>
        </Box>
    );
};

export default FinancialReportPage;
