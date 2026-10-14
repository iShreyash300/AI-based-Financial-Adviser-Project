import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

// MUI icons for symbols only
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import MailOutlinedIcon from "@mui/icons-material/MailOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  // const [success, setSuccess] = useState("");
  // const [infoNotice, setInfoNotice] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
      return;
    }

    const savedEmail = localStorage.getItem("email");
    if (savedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: savedEmail,
        remember: true,
      }));
    }
  }, [navigate]);

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear field-specific error upon typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validation
  const validateForm = () => {
    let tempErrors = {};

    if (!formData.email) {
      tempErrors.email = "Work email is required";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
    ) {
      tempErrors.email = "Please enter a valid work email address";
    }

    if (!formData.password) {
      tempErrors.password = "Password is required";
    } else if (formData.password.length < 2) {
      tempErrors.password = "Password must be at least 6 characters";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Submit Function
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!validateForm()) return;

    setLoading(true);
    // setSuccess("");
    // setInfoNotice("");

    try {
      const response = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      // Save JWT Token
      localStorage.setItem("token", response.data.token);

      // Remember Me
      if (formData.remember) {
        localStorage.setItem("email", formData.email);
      } else {
        localStorage.removeItem("email");
      }

      // Save Login State & User Data
      localStorage.setItem("isLogin", true);
      localStorage.setItem(
        "user",
        JSON.stringify({
          email: formData.email,
        })
      );

      // setSuccess("Authentication successful. Redirecting to cockpit...");
      setErrors({});

      setTimeout(() => {
        navigate("/dashboard");
      }, 900);
    } catch (error) {
      // setSuccess(""); 
      setErrors({
        auth:
          error.response?.data?.message ||
          "Invalid email or password. Please verify your credentials.",
      });
    } finally {
      setLoading(false);
    }
  };

  // const handleSsoClick = (provider) => {
  //   setInfoNotice(
  //     `${provider} integration is enabled for Enterprise SSO. Please use work email credentials for direct demo access.`
  //   );
  // };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col lg:flex-row antialiased selection:bg-[#d1fae5] selection:text-[#065f46]">
      {/* ============================================================ */}
      {/* LEFT PANEL: Institutional Forest Green Cockpit Overview */}
      {/* ============================================================ */}
      <div className="w-full lg:w-[45%] xl:w-[42%] bg-[#0d4a2b] text-white p-8 sm:p-12 lg:p-14 flex flex-col justify-between relative overflow-hidden">
        {/* Ambient background glow circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#10b981]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#047857]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header & Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            {/* White rounded logo icon with green bars */}
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md shadow-black/10 flex-shrink-0">
              <svg className="w-6 h-6 text-[#0d4a2b]" viewBox="0 0 24 24" fill="currentColor">
                <rect x="4" y="11" width="3.5" height="9" rx="1.5" />
                <rect x="10.25" y="5" width="3.5" height="15" rx="1.5" />
                <rect x="16.5" y="8" width="3.5" height="12" rx="1.5" />
              </svg>
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              FinAI
            </span>

          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-black tracking-tight leading-[1.12] text-white mb-4">
            Institutional Financial <br />
            Cockpit at Your <br />
            Fingertips.
          </h1>

          {/* Subtitle */}
          <p className="text-white/75 text-sm sm:text-base leading-relaxed max-w-lg">
            Real-time predictive telemetry, automated zero-touch runway forecasting,
            and proactive algorithmic risk prevention for high-growth enterprises.
          </p>
        </div>

        {/* Predictive Telemetry Card (Bottom Left) */}
        <div className="relative z-10 mt-10 lg:mt-12">
          <div className="bg-[#07361e]/85 backdrop-blur-sm border border-emerald-500/25 rounded-2xl p-5 shadow-2xl shadow-black/20">
            {/* Card Top */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-[10px] font-extrabold text-emerald-400/90 tracking-wider uppercase mb-0.5">
                  PREDICTIVE TELEMETRY
                </p>
                <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                  Year-wise Revenue & AI Forecast
                </h4>
              </div>

              <span className="inline-flex items-center gap-1 h-[24px] px-2 rounded-full bg-[#dcfce7] text-[#15803d] text-[11px] font-bold flex-shrink-0">
                <TrendingUpIcon sx={{ fontSize: 13 }} />
                +34.8% YoY
              </span>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <p className="text-[11px] text-white/70 mb-0.5">Projected Total Revenue</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    $142,500
                  </span>
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                    ARR
                  </span>
                </div>
              </div>

              <div>
                <p className="text-[11px] text-white/70 mb-0.5">Forecast Accuracy Score</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-black text-[#34d399] tracking-tight">
                    99.4%
                  </span>
                  <span className="text-[10px] text-white/60">
                    p &lt; 0.01
                  </span>
                </div>
              </div>
            </div>

            {/* Chart Curve */}
            <div className="w-full h-16 relative mb-1">
              <svg viewBox="0 0 360 70" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="cockpitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 5 60 C 80 58, 140 48, 200 40 C 260 32, 300 20, 350 8 L 350 68 L 5 68 Z"
                  fill="url(#cockpitGradient)"
                />
                <path
                  d="M 5 60 C 80 58, 140 48, 200 40 C 260 32, 300 20, 350 8"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="2.5"
                />
                <circle cx="350" cy="8" r="4" fill="#34d399" />
                <circle cx="350" cy="8" r="7" fill="#34d399" fillOpacity="0.35" />
              </svg>
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between text-[10px] text-white/60 font-medium mb-3.5 px-1">
              <span>2022</span>
              <span>2023</span>
              <span>2024</span>
              <span className="text-[#34d399] font-bold">2025 (Target)</span>
            </div>


          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* RIGHT PANEL: Sign-in Form Container */}
      {/* ============================================================ */}
      <div className="w-full lg:w-[55%] xl:w-[58%] bg-white flex flex-col justify-between p-6 sm:p-10 lg:p-14 min-h-screen">
        {/* Top bar with Back to main portal link */}
        <div className="flex justify-end w-full mb-6 sm:mb-8">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#4b5563] hover:text-[#00875a] transition-colors group"
          >
            <ArrowBackIcon sx={{ fontSize: 16 }} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to main portal</span>
          </button>
        </div>

        {/* Centered Form Wrapper */}
        <div className="max-w-[440px] w-full mx-auto my-auto">
          {/* Form Header */}
          <div className="mb-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#064e3b] tracking-tight mb-2">
              Sign in
            </h2>
            <p className="text-[#64748b] text-sm leading-relaxed">
              Enter your business credentials to access your financial cockpit.
            </p>
          </div>
          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* WORK EMAIL ADDRESS */}
            <div>
              <label
                htmlFor="email"
                className="block text-[11px] font-bold text-[#334155] uppercase tracking-wider mb-1.5"
              >
                WORK EMAIL ADDRESS
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94a3b8]">
                  <MailOutlinedIcon sx={{ fontSize: 18 }} />
                </div>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="founder@company.com"
                  className={`w-full pl-10 pr-3.5 py-3 rounded-xl border text-sm text-[#0f172a] placeholder-[#94a3b8] bg-white transition-all focus:outline-none focus:ring-2 ${errors.email
                    ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200"
                    : "border-[#e2e8f0] focus:border-[#00875a] focus:ring-[#d1fae5]"
                    }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.email}</p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <label
                htmlFor="password"
                className="block text-[11px] font-bold text-[#334155] uppercase tracking-wider mb-1.5"
              >
                PASSWORD
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94a3b8]">
                  <LockOutlinedIcon sx={{ fontSize: 18 }} />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm text-[#0f172a] placeholder-[#94a3b8] bg-white transition-all focus:outline-none focus:ring-2 ${errors.password
                    ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200"
                    : "border-[#e2e8f0] focus:border-[#00875a] focus:ring-[#d1fae5]"
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#94a3b8] hover:text-[#334155]"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
                  ) : (
                    <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="inline-flex items-center gap-2 cursor-pointer text-[#4b5563] select-none">
                <input
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-slate-300 text-[#00875a] focus:ring-[#00875a]"
                />
                <span>Remember this device for 30 days</span>
              </label>

              <button
                type="button"
                onClick={() => navigate("/forgetPassword")}
                className="font-bold text-[#00875a] hover:text-[#00734d] hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 bg-[#00875a] hover:bg-[#00734d] active:scale-[0.99] text-white font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-emerald-700/20 hover:shadow-emerald-700/30 transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </div>
              ) : (
                <>
                  <span>Sign In to FinAI </span>
                  <ArrowForwardIcon sx={{ fontSize: 18 }} />
                </>
              )}
            </button>
          </form>

          {/* Sign up prompt */}
          <div className="mt-6 text-center text-xs sm:text-sm text-[#64748b]">
            <span>Don't have an enterprise account? </span>
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="font-bold text-[#00875a] hover:text-[#00734d] hover:underline cursor-pointer"
            >
              Sign-up
            </button>
          </div>
        </div>


      </div>
    </div>
  );
};

export default LoginPage;