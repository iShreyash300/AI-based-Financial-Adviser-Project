import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

// MUI icons used for symbols only
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import MailOutlinedIcon from "@mui/icons-material/MailOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import PublishedWithChangesOutlinedIcon from "@mui/icons-material/PublishedWithChangesOutlined";

const SignupPage = () => {
    const navigate = useNavigate();

    // ================= STATES =================
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [success, setSuccess] = useState("");
    const [infoNotice, setInfoNotice] = useState("");
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        owner_name: "", // Full Name
        business_name: "", // Company / Workspace
        email: "",
        password: "",
        confirmPassword: "",
        terms: false,
    });

    // Calculate Password Strength (0 to 4)
    const passwordStrength = useMemo(() => {
        const pwd = formData.password;
        if (!pwd) return { score: 0, label: "" };

        let score = 0;
        if (pwd.length >= 6) score += 1;
        if (pwd.length >= 8) score += 1;
        if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) score += 1;
        if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

        let label = "Weak";
        if (score === 2) label = "Fair";
        if (score === 3) label = "Good";
        if (score >= 4) label = "Strong";

        return { score, label };
    }, [formData.password]);

    // Check if confirm password matches and is valid
    const passwordsMatch =
        Boolean(formData.confirmPassword) &&
        formData.password === formData.confirmPassword;

    // ================= HANDLE CHANGE =================
    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
        setSuccess("");
    };

    // ================= VALIDATION =================
    const validateForm = () => {
        let tempErrors = {};

        if (!formData.owner_name.trim()) {
            tempErrors.owner_name = "Full name is required";
        }

        if (!formData.business_name.trim()) {
            tempErrors.business_name = "Company / Workspace is required";
        }

        if (!formData.email.trim()) {
            tempErrors.email = "Work email is required";
        } else if (
            !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
        ) {
            tempErrors.email = "Invalid email address";
        }

        if (!formData.password) {
            tempErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            tempErrors.password = "Password must be at least 6 characters";
        }

        if (!formData.confirmPassword) {
            tempErrors.confirmPassword = "Confirm your password";
        } else if (formData.password !== formData.confirmPassword) {
            tempErrors.confirmPassword = "Passwords do not match";
        }

        if (!formData.terms) {
            tempErrors.terms = "Please accept the terms and conditions";
        }

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    // ================= SUBMIT =================
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        if (!validateForm()) {
            setSuccess("");
            return;
        }

        setLoading(true);
        setSuccess("");
        setInfoNotice("");

        try {
            const response = await api.post("/auth/signup", {
                business_name: formData.business_name,
                owner_name: formData.owner_name,
                email: formData.email,
                password: formData.password,
            });

            setSuccess(
                response.data.message ||
                "Account created successfully! Redirecting to login..."
            );

            setFormData({
                owner_name: "",
                business_name: "",
                email: "",
                password: "",
                confirmPassword: "",
                terms: false,
            });
            setErrors({});

            setTimeout(() => {
                navigate("/login");
            }, 1500);
        } catch (error) {
            console.error(error);
            setSuccess("");
            setErrors({
                api:
                    error.response?.data?.message ||
                    "Registration failed. Please check your details.",
            });
        } finally {
            setLoading(false);
        }
    };

    // const handleSsoClick = (provider) => {
    //     setInfoNotice(
    //         `${provider} registration is enabled for Enterprise workspaces. Use the work email form below for direct instant access.`
    //     );
    // };

    return (
        <div className="min-h-screen w-full bg-[#f0f8f3] flex flex-col lg:flex-row antialiased selection:bg-[#d1fae5] selection:text-[#065f46]">
            {/* ============================================================ */}
            {/* LEFT PANEL: Institutional Forest Green Cockpit Overview     */}
            {/* ============================================================ */}
            <div className="w-full lg:w-[48%] xl:w-[46%] bg-[#0B3D20] text-white p-8 sm:p-12 lg:p-14 flex flex-col justify-between relative overflow-hidden">
                {/* Subtle ambient lighting gradients */}
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#10b981]/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-10 right-0 w-80 h-80 bg-[#059669]/20 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col">
                    {/* Top Brand Bar */}
                    <div className="flex items-center justify-between gap-3 mb-10 sm:mb-14">
                        <div
                            onClick={() => navigate("/")}
                            className="flex items-center gap-3 cursor-pointer group"
                            title="Return to FinAI home"
                        >
                            {/* FinAI Brand Mark */}
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-black/20 group-hover:scale-105 transition-transform">
                                <svg
                                    className="w-6 h-6 text-[#0B3D20]"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M4 19h16v2H4zM4 10h4v7H4zm6-5h4v12h-4zm6 3h4v9h-4z" />
                                </svg>
                            </div>
                            <span className="text-2xl font-black tracking-tight text-white">
                                FinAI
                            </span>
                            <span className="text-[11px] font-semibold text-white/80 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                                v2.4 Enterprise
                            </span>
                        </div>

                        {/* Status Pill */}
                        <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-emerald-200 text-xs font-medium">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Autonomous Financial Intelligence</span>
                        </div>
                    </div>

                    {/* Institutional Cockpit Headline */}
                    <div className="max-w-xl">
                        <span className="text-emerald-300 text-xs font-bold tracking-widest uppercase block mb-3">
                            INSTITUTIONAL COCKPIT
                        </span>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-[1.15] tracking-tight">
                            Powering Tomorrow's
                            <br />
                            Financial Leaders.
                        </h1>
                        <p className="mt-4 text-emerald-100/80 text-sm sm:text-base leading-relaxed max-w-lg">
                            Join 4,200+ forward-thinking founders and institutional finance teams
                            transforming forecasting, runway tracking, and automated spend analytics.
                        </p>
                    </div>

                    {/* Live Simulation Deck Card */}
                    <div className="mt-8 sm:mt-10 bg-[#062c16]/75 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-2xl max-w-md w-full">
                        {/* Card Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-xs font-bold tracking-wider text-white uppercase">
                                    LIVE SIMULATION DECK
                                </span>
                            </div>
                            <span className="bg-white text-[#0B3D20] text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
                                Instant 14–Day Free Trial
                            </span>
                        </div>

                        {/* Metrics Row */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                                <p className="text-[11px] text-emerald-200/80 font-medium mb-1">
                                    Forecast Precision
                                </p>
                                <div className="flex items-baseline">
                                    <span className="text-xl font-bold text-white tracking-tight">
                                        99.4%
                                    </span>
                                    <span className="text-[11px] font-semibold text-emerald-300 ml-1.5">
                                        ±0.2%
                                    </span>
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                                <p className="text-[11px] text-emerald-200/80 font-medium mb-1">
                                    YoY Projected Scale
                                </p>
                                <div className="flex items-baseline">
                                    <span className="text-xl font-bold text-white tracking-tight">
                                        +34.8%
                                    </span>
                                    <span className="text-[10px] font-medium text-emerald-300/90 ml-1.5 whitespace-nowrap">
                                        Runway: 38mo
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Predictive Liquidity Trajectory Chart */}
                        <div className="pt-1">
                            <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-emerald-200/80 font-medium text-[11px]">
                                    Predictive Liquidity Trajectory
                                </span>
                                <span className="text-white font-semibold text-[11px]">
                                    Optimal Zone
                                </span>
                            </div>

                            <div className="relative w-full h-24">
                                <svg
                                    className="w-full h-full overflow-visible"
                                    viewBox="0 0 340 85"
                                    preserveAspectRatio="none"
                                >
                                    <defs>
                                        <linearGradient
                                            id="liquidityAreaGradient"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop offset="0%" stopColor="#34d399" stopOpacity="0.45" />
                                            <stop offset="100%" stopColor="#34d399" stopOpacity="0.0" />
                                        </linearGradient>
                                        <linearGradient
                                            id="liquidityLineGradient"
                                            x1="0"
                                            y1="0"
                                            x2="1"
                                            y2="0"
                                        >
                                            <stop offset="0%" stopColor="#a7f3d0" />
                                            <stop offset="100%" stopColor="#ffffff" />
                                        </linearGradient>
                                        <filter id="glowTarget" x="-50%" y="-50%" width="200%" height="200%">
                                            <feDropShadow
                                                dx="0"
                                                dy="0"
                                                stdDeviation="3"
                                                floodColor="#ffffff"
                                                floodOpacity="0.9"
                                            />
                                        </filter>
                                    </defs>

                                    {/* Gradient Area under curve */}
                                    <path
                                        d="M 30 65 Q 90 62, 150 56 T 270 28 T 320 20 L 320 85 L 30 85 Z"
                                        fill="url(#liquidityAreaGradient)"
                                    />

                                    {/* Glowing Stroke Curve */}
                                    <path
                                        d="M 30 65 Q 90 62, 150 56 T 270 28 T 320 20"
                                        fill="none"
                                        stroke="url(#liquidityLineGradient)"
                                        strokeWidth="2.75"
                                        strokeLinecap="round"
                                    />

                                    {/* Optimal Zone Target Point */}
                                    <circle
                                        cx="320"
                                        cy="20"
                                        r="4"
                                        fill="#ffffff"
                                        filter="url(#glowTarget)"
                                    />
                                    <circle
                                        cx="320"
                                        cy="20"
                                        r="8"
                                        fill="none"
                                        stroke="#ffffff"
                                        strokeWidth="1.5"
                                        opacity="0.6"
                                        className="animate-ping"
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* Reconciliation Footer Note */}
                        <div className="flex items-center justify-between pt-3 mt-1 border-t border-white/10 text-[11px] text-emerald-200/80">
                            <div className="flex items-center gap-1.5">
                                <PublishedWithChangesOutlinedIcon style={{ fontSize: "15px" }} />
                                <span>Automated reconciliation active</span>
                            </div>
                            <span className="font-medium text-white/90">Synced to ERP</span>
                        </div>
                    </div>
                </div>

                {/* Left Panel Footer */}
                <div className="relative z-10 pt-8 mt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-emerald-200/70 gap-2">
                    <div className="flex items-center gap-1.5">
                        <LockOutlinedIcon style={{ fontSize: "14px" }} />
                        <span>SOC-2 Type II Certified & 256–Bit Bank–Grade Encryption</span>
                    </div>
                    <span>© 2025 FinAI Inc.</span>
                </div>
            </div>

            {/* ============================================================ */}
            {/* RIGHT PANEL: Light Mint Background with Form Card          */}
            {/* ============================================================ */}
            <div className="w-full lg:w-[52%] xl:w-[54%] flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-12 relative">
                {/* Top Right Header: Already have an account? Sign in */}
                <div className="flex justify-end items-center mb-6 lg:mb-4">
                    <div className="text-xs sm:text-sm text-slate-600 font-medium flex items-center">
                        <span>Already have an account?</span>
                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="ml-1.5 text-[#0B3D20] font-bold hover:underline inline-flex items-center gap-1 transition-colors group"
                        >
                            <span>Sign in</span>
                            <ArrowForwardIcon
                                style={{ fontSize: "15px" }}
                                className="group-hover:translate-x-0.5 transition-transform"
                            />
                        </button>
                    </div>
                </div>

                {/* Center Card Container */}
                <div className="my-auto max-w-[530px] w-full mx-auto bg-white rounded-3xl p-7 sm:p-9 shadow-xl shadow-slate-200/60 border border-slate-100">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-6">
                        Create your account
                    </h2>





                    {/* Feedback Notices */}
                    {success && (
                        <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs sm:text-sm text-emerald-800">
                            <CheckCircleOutlinedIcon
                                style={{ fontSize: "18px" }}
                                className="text-emerald-600 shrink-0"
                            />
                            <span>{success}</span>
                        </div>
                    )}

                    {errors.api && (
                        <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs sm:text-sm text-rose-800">
                            <ErrorOutlinedIcon
                                style={{ fontSize: "18px" }}
                                className="text-rose-600 shrink-0"
                            />
                            <span>{errors.api}</span>
                        </div>
                    )}

                    {infoNotice && (
                        <div className="mb-4 p-3.5 bg-sky-50 border border-sky-200 rounded-xl text-xs sm:text-sm text-sky-800">
                            {infoNotice}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Row 1: Full Name & Company */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <label className="text-[11px] font-bold text-emerald-950 uppercase tracking-wide block mb-1.5">
                                    FULL NAME
                                </label>
                                <input
                                    type="text"
                                    name="owner_name"
                                    placeholder="Alex Morgan"
                                    value={formData.owner_name}
                                    onChange={handleChange}
                                    className={`w-full bg-[#f1f3f5] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 border transition-all focus:outline-none focus:bg-white ${errors.owner_name
                                        ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                                        : "border-slate-200/80 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                                        }`}
                                />
                                {errors.owner_name && (
                                    <p className="text-[11px] text-rose-500 mt-1 font-medium">
                                        {errors.owner_name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-[11px] font-bold text-emerald-950 uppercase tracking-wide block mb-1.5">
                                    COMPANY / WORKSPACE
                                </label>
                                <input
                                    type="text"
                                    name="business_name"
                                    placeholder="Acme Capital"
                                    value={formData.business_name}
                                    onChange={handleChange}
                                    className={`w-full bg-[#f1f3f5] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 border transition-all focus:outline-none focus:bg-white ${errors.business_name
                                        ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                                        : "border-slate-200/80 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                                        }`}
                                />
                                {errors.business_name && (
                                    <p className="text-[11px] text-rose-500 mt-1 font-medium">
                                        {errors.business_name}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Row 2: Work Email Address */}
                        <div>
                            <label className="text-[11px] font-bold text-emerald-950 uppercase tracking-wide block mb-1.5">
                                WORK EMAIL ADDRESS
                            </label>
                            <div
                                className={`flex items-center bg-[#f1f3f5] rounded-xl px-3.5 py-2.5 border transition-all ${errors.email
                                    ? "border-rose-400 bg-white ring-2 ring-rose-100"
                                    : "border-slate-200/80 focus-within:border-emerald-700 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100"
                                    }`}
                            >
                                <MailOutlinedIcon
                                    style={{ fontSize: "18px" }}
                                    className="text-slate-400 mr-2.5 shrink-0"
                                />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="alex@company.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-[11px] text-rose-500 mt-1 font-medium">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Row 3: Password & Confirm Password */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            {/* Password */}
                            <div>
                                <label className="text-[11px] font-bold text-emerald-950 uppercase tracking-wide block mb-1.5">
                                    PASSWORD
                                </label>
                                <div
                                    className={`flex items-center bg-[#f1f3f5] rounded-xl px-3.5 py-2.5 border transition-all ${errors.password
                                        ? "border-rose-400 bg-white ring-2 ring-rose-100"
                                        : "border-slate-200/80 focus-within:border-emerald-700 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100"
                                        }`}
                                >
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="At least 8 characters"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-slate-400 hover:text-slate-600 ml-1.5 focus:outline-none shrink-0"
                                        title={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? (
                                            <VisibilityOffOutlinedIcon style={{ fontSize: "18px" }} />
                                        ) : (
                                            <VisibilityOutlinedIcon style={{ fontSize: "18px" }} />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-[11px] text-rose-500 mt-1 font-medium">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="text-[11px] font-bold text-emerald-950 uppercase tracking-wide block mb-1.5">
                                    CONFIRM PASSWORD
                                </label>
                                <div
                                    className={`flex items-center bg-[#f1f3f5] rounded-xl px-3.5 py-2.5 border transition-all ${errors.confirmPassword
                                        ? "border-rose-400 bg-white ring-2 ring-rose-100"
                                        : "border-slate-200/80 focus-within:border-emerald-700 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100"
                                        }`}
                                >
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        placeholder="Repeat password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                                    />
                                    {passwordsMatch ? (
                                        <CheckCircleOutlinedIcon
                                            style={{ fontSize: "18px" }}
                                            className="text-emerald-600 ml-1.5 shrink-0"
                                        />
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirmPassword(!showConfirmPassword)
                                            }
                                            className="text-slate-400 hover:text-slate-600 ml-1.5 focus:outline-none shrink-0"
                                            title={
                                                showConfirmPassword ? "Hide password" : "Show password"
                                            }
                                        >
                                            {showConfirmPassword ? (
                                                <VisibilityOffOutlinedIcon
                                                    style={{ fontSize: "18px" }}
                                                />
                                            ) : (
                                                <VisibilityOutlinedIcon
                                                    style={{ fontSize: "18px" }}
                                                />
                                            )}
                                        </button>
                                    )}
                                </div>
                                {errors.confirmPassword && (
                                    <p className="text-[11px] text-rose-500 mt-1 font-medium">
                                        {errors.confirmPassword}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Password Strength Meter */}
                        {formData.password && (
                            <div className="flex items-center gap-2 pt-1">
                                <div className="grid grid-cols-4 gap-1.5 flex-1">
                                    {[1, 2, 3, 4].map((step) => {
                                        const isFilled = passwordStrength.score >= step;
                                        return (
                                            <div
                                                key={step}
                                                className={`h-1.5 rounded-full transition-all duration-300 ${isFilled
                                                    ? step <= 1
                                                        ? "bg-amber-400"
                                                        : "bg-[#0B3D20]"
                                                    : "bg-slate-200"
                                                    }`}
                                            />
                                        );
                                    })}
                                </div>
                                <span className="text-[11px] font-bold text-[#0B3D20] min-w-[45px] text-right">
                                    {passwordStrength.label}
                                </span>
                            </div>
                        )}

                        {/* Terms Checkbox */}
                        <div className="pt-2">
                            <label className="flex items-start gap-2.5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="terms"
                                    checked={formData.terms}
                                    onChange={handleChange}
                                    className="mt-0.5 w-4 h-4 rounded text-emerald-800 focus:ring-emerald-700 border-slate-300 rounded cursor-pointer accent-[#0B3D20]"
                                />
                                <span className="text-xs text-slate-600 leading-snug">
                                    I agree to FinAI's{" "}
                                    <span className="text-emerald-900 font-semibold hover:underline">
                                        Terms of Service
                                    </span>
                                    ,{" "}
                                    <span className="text-emerald-900 font-semibold hover:underline">
                                        Privacy Policy
                                    </span>
                                    , and Data Processing Addendum.
                                </span>
                            </label>
                            {errors.terms && (
                                <p className="text-[11px] text-rose-500 mt-1 font-medium pl-6">
                                    {errors.terms}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#0B3D20] hover:bg-[#082e18] text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <svg
                                            className="animate-spin h-5 w-5 text-white"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8v8H4z"
                                            />
                                        </svg>
                                        <span>Creating Enterprise Account...</span>
                                    </div>
                                ) : (
                                    <>
                                        <span>Create Enterprise Account</span>
                                        <ArrowForwardIcon
                                            style={{ fontSize: "17px" }}
                                            className="group-hover:translate-x-1 transition-transform"
                                        />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Bottom spacing helper */}
                <div className="hidden lg:block h-2" />
            </div>
        </div>
    );
};

export default SignupPage;