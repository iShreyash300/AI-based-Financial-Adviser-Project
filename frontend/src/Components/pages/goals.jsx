// ==============================
// Goals & Growth Planner Page
// ==============================

import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import FlagIcon from "@mui/icons-material/Flag";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import WarningIcon from "@mui/icons-material/Warning";
import SavingsIcon from "@mui/icons-material/Savings";
import RefreshIcon from "@mui/icons-material/Refresh";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CloseIcon from "@mui/icons-material/Close";

// ─── Constants ─────────────────────────────────────────────────────────────────
const API_BASE = "http://localhost:5000/api";
const GOALS_URL = `${API_BASE}/goals`;
const REC_URL = `${API_BASE}/growth-plan/recommendations`;

const CATEGORIES = [
  "General", "Savings", "Investment", "Debt Reduction",
  "Business Expansion", "Emergency Fund", "Revenue Target",
  "Expense Reduction", "Equipment", "Marketing", "Other",
];

const today = () => new Date().toISOString().split("T")[0];

const createEmptyForm = () => ({
  goal_title: "",
  title: "",
  description: "",
  target_amount: "",
  current_amount: "0",
  start_date: today(),
  target_date: "",
  category: "General",
});

// ─── Helpers ───────────────────────────────────────────────────────────────────
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: token } : {};
};

const statusColor = (status) => {
  if (status === "Completed") return { bg: "#e6f4ea", text: "#1e7e34", border: "#a3d9a5" };
  if (status === "On Track") return { bg: "#e3f0ff", text: "#1565c0", border: "#90caf9" };
  return { bg: "#fff3e0", text: "#e65100", border: "#ffcc80" };
};

const priorityColor = (priority) => {
  if (priority === "high") return "#f44336";
  if (priority === "medium") return "#ff9800";
  return "#4caf50";
};

const iconForType = (iconName) => {
  const map = {
    TrendingUp: <TrendingUpIcon />,
    TrendingDown: <TrendingDownIcon />,
    AccountBalance: <AccountBalanceIcon />,
    Flag: <FlagIcon />,
    CheckCircle: <CheckCircleIcon />,
    EmojiEvents: <EmojiEventsIcon />,
    Warning: <WarningIcon />,
    Savings: <SavingsIcon />,
  };
  return map[iconName] || <AutoAwesomeIcon />;
};

const fmt = (n) =>
  Number(n).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const getGoalTitle = (goal = {}) => goal?.goal_title || goal?.title || "Untitled Goal";

const normalizeGoalPayload = (form = {}) => ({
  title: form.title || form.goal_title || "",
  goal_title: form.goal_title || form.title || "",
  description: form.description || "",
  target_amount: form.target_amount,
  current_amount: form.current_amount ?? "0",
  start_date: form.start_date,
  target_date: form.target_date,
  category: form.category,
});

const normalizeGoalData = (goal = {}) => ({
  ...goal,
  title: goal.title || goal.goal_title || "",
  goal_title: goal.goal_title || goal.title || "",
});

// ─── Sub-components ────────────────────────────────────────────────────────────

const SummaryCard = ({ label, value, color, icon, sub }) => (
  <Card
    elevation={0}
    sx={{
      border: "1px solid #eee",
      borderRadius: "16px",
      background: `linear-gradient(135deg, ${color}18 0%, #fff 100%)`,
      transition: "transform 0.2s, box-shadow 0.2s",
      "&:hover": { transform: "translateY(-2px)", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" },
      height: "100%",
    }}
  >
    <CardContent sx={{ p: 2.5 }}>
      <Stack sx={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }} >
        <Box>
          <Typography sx={{ fontSize: "12px", color: "#888", fontWeight: 600, letterSpacing: 0.5, mb: 0.5 }}>
            {label.toUpperCase()}
          </Typography>
          <Typography sx={{ fontSize: "28px", fontWeight: 800, color: "#111", lineHeight: 1 }}>
            {value}
          </Typography>
          {sub && (
            <Typography sx={{ fontSize: "12px", color: "#aaa", mt: 0.5 }}>{sub}</Typography>
          )}
        </Box>
        <Box
          sx={{
            width: 44, height: 44, borderRadius: "12px",
            background: `${color}22`, display: "flex",
            alignItems: "center", justifyContent: "center", color,
          }}
        >
          {icon}
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const AnimatedProgress = ({ value, status }) => {
  const colors = {
    Completed: { bar: "#43a047", track: "#e6f4ea" },
    "On Track": { bar: "#1976d2", track: "#e3f0ff" },
    "At Risk": { bar: "#f57c00", track: "#fff3e0" },
  };
  const c = colors[status] || colors["At Risk"];

  return (
    <Box sx={{ position: "relative" }}>
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          height: 10, borderRadius: 5,
          backgroundColor: c.track,
          "& .MuiLinearProgress-bar": {
            backgroundColor: c.bar,
            borderRadius: 5,
            transition: "width 1s ease-in-out",
          },
        }}
      />
    </Box>
  );
};

const GoalCard = ({ goal, onEdit, onDelete }) => {
  const sc = statusColor(goal.status);
  const daysLeft = Math.ceil((new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <Card
      // elevation={0}
      sx={{
        border: "1px solid #eee",
        borderRadius: "20px",
        height: "100%",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": { transform: "translateY(-3px)", boxShadow: "0 12px 32px rgba(0,0,0,0.09)" },
        position: "relative",
        overflow: "visible",
      }}
    >
      {/* Status stripe */}
      <Box
        sx={{ width: "100%" }}
      // sx={{
      //   position: "absolute", top: 0, left: 0, right: 0,
      //   height: 4, borderRadius: "20px 20px 0 0",
      //   background: sc.text,
      // }}
      />
      <CardContent sx={{ p: 2.5, pt: 3 }}>
        {/* Header row */}
        <Stack sx={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", mb: 2 }} >
          <Box sx={{ flex: 1, pr: 1 }}>
            <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#111", lineHeight: 1.3 }}>
              {getGoalTitle(goal)}
            </Typography>
            {goal.description && (
              <Typography sx={{ fontSize: "12px", color: "#999", mt: 0.3, lineHeight: 1.4 }}>
                {goal.description}
              </Typography>
            )}
          </Box>
          <Stack direction="row" spacing={0.5}>
            <Tooltip goal_title="Edit">
              <IconButton
                size="small"
                onClick={() => onEdit(goal)}
                sx={{ color: "#5B5FEF", "&:hover": { background: "#f0f0ff" } }}
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip goal_title="Delete">
              <IconButton
                size="small"
                onClick={() => onDelete(goal)}
                sx={{ color: "#f44336", "&:hover": { background: "#fff0f0" } }}
              >
                <DeleteOutlineOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Category + Status */}
        <Stack sx={{ flexDirection: "row", gap: 1, mb: 2, flexWrap: "wrap" }}>
          <Chip
            label={goal.category}
            size="small"
            sx={{ fontSize: "11px", background: "#f5f5ff", color: "#5B5FEF", fontWeight: 600 }}
          />
          <Chip
            label={goal.status}
            size="small"
            sx={{
              fontSize: "11px", fontWeight: 700,
              background: sc.bg, color: sc.text,
              border: `1px solid ${sc.border}`,
            }}
          />
        </Stack>

        {/* Progress */}
        <Box mb={1}>
          <Stack sx={{ flexDirection: "row", justifyContent: "space-between", mb: 0.8 }} >
            <Typography sx={{ fontSize: "12px", color: "#888", fontWeight: 600 }}>PROGRESS</Typography>
            <Typography sx={{ fontSize: "14px", fontWeight: 800, color: sc.text }}>
              {goal.progress}%
            </Typography>
          </Stack>
          <AnimatedProgress value={goal.progress} status={goal.status} />
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Amounts */}
        <Stack direction="row" justifyContent="space-between" mb={1}>
          <Box>
            <Typography sx={{ fontSize: "11px", color: "#aaa", fontWeight: 600 }}>CURRENT</Typography>
            <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#43a047" }}>
              {fmt(goal.current_amount)}
            </Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography sx={{ fontSize: "11px", color: "#aaa", fontWeight: 600 }}>TARGET</Typography>
            <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111" }}>
              {fmt(goal.target_amount)}
            </Typography>
          </Box>
        </Stack>

        {/* Dates */}
        <Stack sx={{ flexDirection: "row", justifyContent: "space-between", gap: 1 }}>
          <Typography sx={{ fontSize: "11px", color: "#bbb" }}>
            Started: {goal.start_date}
          </Typography>
          <Typography
            sx={{
              fontSize: "11px", fontWeight: 600,
              color: daysLeft < 0 ? "#f44336" : daysLeft < 30 ? "#f57c00" : "#aaa",
            }}
          >
            {daysLeft < 0
              ? `${Math.abs(daysLeft)}d overdue`
              : daysLeft === 0
                ? "Due today"
                : `${daysLeft}d left`}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

const RecommendationCard = ({ rec }) => (
  <Paper
    elevation={0}
    sx={{
      border: "1px solid #eee",
      borderRadius: "16px",
      p: 2,
      mb: 1.5,
      borderLeft: `4px solid ${priorityColor(rec.priority)}`,
      transition: "transform 0.2s, box-shadow 0.2s",
      "&:hover": { transform: "translateX(4px)", boxShadow: "0 4px 16px rgba(0,0,0,0.07)" },
    }}
  >
    <Stack direction="row" spacing={1.5} alignItems="flex-start">
      <Box
        sx={{
          width: 36, height: 36, borderRadius: "10px", flexShrink: 0,
          background: `${priorityColor(rec.priority)}18`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: priorityColor(rec.priority),
        }}
      >
        {iconForType(rec.icon)}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={0.3}>
          <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111" }}>
            {rec.goal_title}
          </Typography>
          <Chip
            label={rec.priority}
            size="small"
            sx={{
              fontSize: "10px", height: 18, fontWeight: 700,
              background: `${priorityColor(rec.priority)}18`,
              color: priorityColor(rec.priority),
            }}
          />
        </Stack>
        <Typography sx={{ fontSize: "12.5px", color: "#666", lineHeight: 1.5 }}>
          {rec.message}
        </Typography>
      </Box>
    </Stack>
  </Paper>
);

// ─── Goal Form Dialog ──────────────────────────────────────────────────────────
const GoalFormDialog = ({ open, onClose, onSubmit, initialValues, goal_title, loading }) => {
  const [form, setForm] = useState(initialValues || createEmptyForm());
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(initialValues || createEmptyForm());
      setErrors({});
    }
  }, [open, initialValues]);

  const validate = () => {
    const e = {};
    if (!form.goal_title.trim()) e.goal_title = "Title is required";
    if (!form.target_amount || isNaN(Number(form.target_amount)) || Number(form.target_amount) <= 0)
      e.target_amount = "Enter a valid positive amount";
    if (!form.start_date) e.start_date = "Start date is required";
    if (!form.target_date) e.target_date = "Target date is required";
    if (form.start_date && form.target_date && form.target_date <= form.start_date)
      e.target_date = "Target date must be after start date";
    return e;
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((f) => ({
      ...f,
      [field]: value,
      ...(field === "goal_title" ? { title: value } : {}),
      ...(field === "title" ? { goal_title: value } : {}),
    }));
    setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onSubmit(form);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: "20px", p: 1 } }}
    >
      <DialogTitle sx={{ fontWeight: 800, color: "#111", pb: 0 }}>
        {goal_title}
        <IconButton onClick={onClose} sx={{ position: "absolute", right: 16, top: 12 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2}>
          <TextField
            label="Goal Title *"
            value={form.goal_title}
            onChange={handleChange("goal_title")}
            error={!!errors.goal_title}
            helperText={errors.goal_title}
            fullWidth size="small"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
          />
          <TextField
            label="Description"
            value={form.description}
            onChange={handleChange("description")}
            fullWidth size="small" multiline rows={2}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
          />
          <Stack direction="row" spacing={2}>
            <TextField
              label="Target Amount ($) *"
              value={form.target_amount}
              onChange={handleChange("target_amount")}
              error={!!errors.target_amount}
              helperText={errors.target_amount}
              type="number" inputProps={{ min: 0 }}
              fullWidth size="small"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
            />
            <TextField
              label="Current Amount ($)"
              value={form.current_amount}
              onChange={handleChange("current_amount")}
              type="number" inputProps={{ min: 0 }}
              fullWidth size="small"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
            />
          </Stack>
          <TextField
            label="Category"
            value={form.category}
            onChange={handleChange("category")}
            select fullWidth size="small"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
          >
            {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </TextField>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Start Date *"
              value={form.start_date}
              onChange={handleChange("start_date")}
              error={!!errors.start_date}
              helperText={errors.start_date}
              type="date" fullWidth size="small"
              InputLabelProps={{ shrink: true }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
            />
            <TextField
              label="Target Date *"
              value={form.target_date}
              onChange={handleChange("target_date")}
              error={!!errors.target_date}
              helperText={errors.target_date}
              type="date" fullWidth size="small"
              InputLabelProps={{ shrink: true }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ borderRadius: "10px", color: "#888" }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          variant="contained"
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{
            borderRadius: "10px", fontWeight: 700, px: 3,
            background: "linear-gradient(90deg, #5B5FEF 0%, #7B61FF 100%)",
            "&:hover": { background: "linear-gradient(90deg, #4a4ede 0%, #6a50ee 100%)" },
          }}
        >
          {loading ? "Saving…" : "Save Goal"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Delete Confirmation Dialog ────────────────────────────────────────────────
const DeleteDialog = ({ open, onClose, onConfirm, goal, loading }) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
    PaperProps={{ sx: { borderRadius: "20px", p: 1 } }}
  >
    <DialogTitle sx={{ fontWeight: 800, color: "#111" }}>Delete Goal</DialogTitle>
    <DialogContent>
      <Typography sx={{ color: "#555" }}>
        Are you sure you want to delete <strong>"{getGoalTitle(goal)}"</strong>? This action cannot be undone.
      </Typography>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2 }}>
      <Button onClick={onClose} sx={{ borderRadius: "10px", color: "#888" }}>Cancel</Button>
      <Button
        onClick={onConfirm}
        disabled={loading}
        variant="contained"
        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
        sx={{
          borderRadius: "10px", fontWeight: 700,
          background: "#f44336", "&:hover": { background: "#d32f2f" },
        }}
      >
        {loading ? "Deleting…" : "Delete"}
      </Button>
    </DialogActions>
  </Dialog>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────
const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [recommendations, setRecs] = useState([]);
  const [recSummary, setRecSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recLoading, setRecLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDelLoading] = useState(false);
  const [error, setError] = useState("");
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

  // Dialogs
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  // Filter
  const [filter, setFilter] = useState("All");

  // ── Data fetching ────────────────────────────────────────────────────────────
  const fetchGoals = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(GOALS_URL, { headers: getAuthHeader() });
      setGoals((res.data.data || []).map(normalizeGoalData));
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to fetch goals.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecommendations = useCallback(async () => {
    setRecLoading(true);
    try {
      const res = await axios.get(REC_URL, { headers: getAuthHeader() });
      setRecs(res.data.data?.recommendations || []);
      setRecSummary(res.data.data?.summary || null);
    } catch (_) {
      setRecs([]);
    } finally {
      setRecLoading(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchGoals(), fetchRecommendations()]);
  }, [fetchGoals, fetchRecommendations]);

  useEffect(() => { refreshAll(); }, [refreshAll]);

  // ── Summary stats ─────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = goals.length;
    const completed = goals.filter((g) => g.status === "Completed").length;
    const onTrack = goals.filter((g) => g.status === "On Track").length;
    const atRisk = goals.filter((g) => g.status === "At Risk").length;
    const avgProgress = total > 0
      ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / total)
      : 0;
    return { total, completed, onTrack, atRisk, avgProgress };
  }, [goals]);

  // ── Filtered goals ────────────────────────────────────────────────────────────
  const filteredGoals = useMemo(() => {
    if (filter === "All") return goals;
    return goals.filter((g) => g.status === filter);
  }, [goals, filter]);

  // ── CRUD handlers ─────────────────────────────────────────────────────────────
  const handleCreate = async (form) => {
    setFormLoading(true);
    try {
      await axios.post(GOALS_URL, normalizeGoalPayload(form), { headers: getAuthHeader() });
      setOpenCreate(false);
      setSnack({ open: true, msg: "Goal created successfully!", severity: "success" });
      await refreshAll();
    } catch (err) {
      setSnack({ open: true, msg: err.response?.data?.message || "Failed to create goal.", severity: "error" });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (form) => {
    if (!selectedGoal) return;
    setFormLoading(true);
    try {
      await axios.put(`${GOALS_URL}/${selectedGoal.id}`, normalizeGoalPayload(form), { headers: getAuthHeader() });
      setOpenEdit(false);
      setSnack({ open: true, msg: "Goal updated successfully!", severity: "success" });
      await refreshAll();
    } catch (err) {
      setSnack({ open: true, msg: err.response?.data?.message || "Failed to update goal.", severity: "error" });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedGoal) return;
    setDelLoading(true);
    try {
      await axios.delete(`${GOALS_URL}/${selectedGoal.id}`, { headers: getAuthHeader() });
      setOpenDelete(false);
      setSnack({ open: true, msg: "Goal deleted.", severity: "info" });
      await refreshAll();
    } catch (err) {
      setSnack({ open: true, msg: err.response?.data?.message || "Failed to delete goal.", severity: "error" });
    } finally {
      setDelLoading(false);
    }
  };

  // ── Edit pre-fill ─────────────────────────────────────────────────────────────
  const editInitialValues = useMemo(() => {
    if (!selectedGoal) return createEmptyForm();
    return {
      goal_title: getGoalTitle(selectedGoal),
      title: getGoalTitle(selectedGoal),
      description: selectedGoal.description || "",
      target_amount: String(selectedGoal.target_amount || ""),
      current_amount: String(selectedGoal.current_amount || "0"),
      start_date: selectedGoal.start_date || today(),
      target_date: selectedGoal.target_date || "",
      category: selectedGoal.category || "General",
    };
  }, [selectedGoal]);

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <Box
      sx={{

        minHeight: "100vh",
        background: "#f8f9fc",
        p: { xs: 2, md: 3 },
      }}
    >
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <Stack
        sx={{ flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, gap: 2 }}
      >
        <Box>
          <Stack sx={{ flexDirection: "row", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 42, height: 42, borderRadius: "12px",
                background: "linear-gradient(135deg, #5B5FEF 0%, #7B61FF 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff",
              }}
            >
              <TrackChangesIcon />
            </Box>
            <Typography
              sx={{ fontSize: { xs: "22px", md: "26px" }, fontWeight: 800, color: "#111" }}
            >
              Goals & Growth Planner
            </Typography>
          </Stack>

        </Box>
        <Stack sx={{ flexDirection: "row", gap: 1 }} direction="row" spacing={1}>
          <Tooltip goal_title="Refresh data">
            <IconButton
              onClick={refreshAll}
              sx={{
                background: "#fff", border: "1px solid #eee", borderRadius: "12px",
                "&:hover": { background: "#f0f0ff" },
              }}
            >
              <RefreshIcon sx={{ color: "#5B5FEF" }} />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreate(true)}
            sx={{
              borderRadius: "12px", fontWeight: 700, px: 2.5,
              background: "linear-gradient(90deg, #5B5FEF 0%, #7B61FF 100%)",
              boxShadow: "0 4px 16px rgba(91,95,239,0.3)",
              "&:hover": {
                background: "linear-gradient(90deg, #4a4ede 0%, #6a50ee 100%)",
                boxShadow: "0 6px 20px rgba(91,95,239,0.4)",
              },
            }}
          >
            Add Goal
          </Button>
        </Stack>
      </Stack>

      {/* ── Error Banner ──────────────────────────────────────────────────────── */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: "12px" }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* ── Summary Cards ─────────────────────────────────────────────────────── */}
      <Stack sx={{ flexDirection: { md: "row", xs: "column" }, gap: 2, mt: 2 }}>
        {[
          { label: "Total Goals", value: stats.total, color: "#5B5FEF", icon: <TrackChangesIcon />, sub: `${stats.avgProgress}% avg progress` },
          { label: "Completed", value: stats.completed, color: "#43a047", icon: <CheckCircleIcon />, sub: "≥ 90% progress" },
          { label: "On Track", value: stats.onTrack, color: "#1976d2", icon: <TrendingUpIcon />, sub: "50–89% progress" },
          { label: "At Risk", value: stats.atRisk, color: "#f57c00", icon: <WarningIcon />, sub: "< 50% progress" },
        ].map((s) => (
          <Stack sx={{ width: "100%", justifyContent: "space-between" }} key={s.label}>
            <SummaryCard {...s} />
          </Stack>
        ))}
      </Stack>

      {/* ── Main Content: Goals + Recommendations ─────────────────────────────── */}
      <Stack spacing={3}>
        {/* Goals Section */}
        <Stack xs={12} lg={8}>
          {/* Filter chips */}
          <Stack sx={{ flexDirection: "row", gap: 1, flexWrap: "wrap", m: 2, justifyContent: "space-between" }} direction="row" spacing={1} mb={2} flexWrap="wrap">
            {["All", "Completed", "On Track", "At Risk"].map((f) => (
              <Chip
                key={f}
                label={`${f}${f === "All" ? ` (${stats.total})` : f === "Completed" ? ` (${stats.completed})` : f === "On Track" ? ` (${stats.onTrack})` : ` (${stats.atRisk})`}`}
                onClick={() => setFilter(f)}
                sx={{
                  fontWeight: 600, cursor: "pointer", mb: 0.5,
                  background: filter === f ? "linear-gradient(90deg, #5B5FEF 0%, #7B61FF 100%)" : "#fff",
                  color: filter === f ? "#fff" : "#555",
                  border: filter === f ? "none" : "1px solid #eee",
                  "&:hover": { opacity: 0.9 },
                }}
              />
            ))}
          </Stack>

          {/* Goal cards grid */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress sx={{ color: "#5B5FEF" }} />
            </Box>
          ) : filteredGoals.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                border: "2px dashed #e0e0e0", borderRadius: "20px",
                p: 6, textAlign: "center",
              }}
            >
              <TrackChangesIcon sx={{ fontSize: 56, color: "#ddd", mb: 2 }} />
              <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#bbb", mb: 1 }}>
                {filter === "All" ? "No goals yet" : `No ${filter} goals`}
              </Typography>
              <Typography sx={{ fontSize: "14px", color: "#ccc", mb: 3 }}>
                {filter === "All"
                  ? "Create your first financial goal to start tracking progress"
                  : `You don't have any ${filter.toLowerCase()} goals at the moment`}
              </Typography>
              {filter === "All" && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenCreate(true)}
                  sx={{
                    borderRadius: "12px", fontWeight: 700,
                    background: "linear-gradient(90deg, #5B5FEF 0%, #7B61FF 100%)",
                  }}
                >
                  Add Your First Goal
                </Button>
              )}
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {filteredGoals.map((goal) => (
                <Grid item xs={12} sm={6} key={goal.id}>
                  <GoalCard
                    goal={goal}
                    onEdit={(g) => { setSelectedGoal(g); setOpenEdit(true); }}
                    onDelete={(g) => { setSelectedGoal(g); setOpenDelete(true); }}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Stack>

        {/* AI Recommendations Panel */}
        <Grid item xs={12} lg={4}>
          <Paper
            elevation={0}
            sx={{
              border: "1px solid #eee",
              borderRadius: "20px",
              overflow: "hidden",
              position: { lg: "sticky" },
              top: { lg: 24 },
            }}
          >
            {/* Panel header */}
            <Box
              sx={{
                p: 2.5,
                background: "linear-gradient(135deg, #5B5FEF 0%, #7B61FF 100%)",
                color: "#fff",
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <AutoAwesomeIcon sx={{ fontSize: 20 }} />
                  <Typography sx={{ fontWeight: 800, fontSize: "15px" }}>
                    AI Recommendations
                  </Typography>
                </Stack>
                <Chip
                  label="Live"
                  size="small"
                  sx={{
                    background: "rgba(255,255,255,0.2)", color: "#fff",
                    fontSize: "10px", fontWeight: 700, height: 20,
                    animation: "pulse 2s infinite",
                  }}
                />
              </Stack>
              <Typography sx={{ fontSize: "12px", opacity: 0.8, mt: 0.5 }}>
                Generated from your live financial data
              </Typography>
            </Box>

            {/* Financial summary strip */}
            {recSummary && (
              <Box sx={{ background: "#fafafa", borderBottom: "1px solid #eee", p: 2 }}>
                <Grid container spacing={1}>
                  {[
                    { label: "Revenue", val: fmt(recSummary.total_revenue) },
                    { label: "Expenses", val: fmt(recSummary.total_expenses) },
                    { label: "Net Flow", val: fmt(recSummary.net_cash_flow) },
                    { label: "Exp Ratio", val: `${recSummary.expense_ratio}%` },
                  ].map((item) => (
                    <Grid item xs={6} key={item.label}>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography sx={{ fontSize: "10px", color: "#aaa", fontWeight: 600 }}>
                          {item.label}
                        </Typography>
                        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111" }}>
                          {item.val}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Recommendations list */}
            <Box sx={{ p: 2, maxHeight: { lg: "calc(100vh - 350px)" }, overflowY: "auto" }}>
              {recLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress size={32} sx={{ color: "#5B5FEF" }} />
                </Box>
              ) : recommendations.length === 0 ? (
                <Typography sx={{ textAlign: "center", color: "#bbb", py: 4, fontSize: "14px" }}>
                  Add financial data to generate AI recommendations
                </Typography>
              ) : (
                recommendations.map((rec) => (
                  <RecommendationCard key={rec.id} rec={rec} />
                ))
              )}
            </Box>
          </Paper>
        </Grid>
      </Stack>

      {/* ── Dialogs ─────────────────────────────────────────────────────────── */}
      <GoalFormDialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSubmit={handleCreate}
        goal_title="Create New Goal"
        loading={formLoading}
      />

      <GoalFormDialog
        open={openEdit}
        onClose={() => { setOpenEdit(false); setSelectedGoal(null); }}
        onSubmit={handleUpdate}
        initialValues={editInitialValues}
        goal_title="Edit Goal"
        loading={formLoading}
      />

      <DeleteDialog
        open={openDelete}
        onClose={() => { setOpenDelete(false); setSelectedGoal(null); }}
        onConfirm={handleDelete}
        goal={selectedGoal}
        loading={deleteLoading}
      />

      {/* ── Snackbar ────────────────────────────────────────────────────────── */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          sx={{ borderRadius: "12px", fontWeight: 600 }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>

      {/* Pulse animation keyframe */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </Box>
  );
};

export default GoalsPage;
