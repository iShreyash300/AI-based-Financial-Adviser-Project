import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TelemetryChart from "../Charts/TelemetryChart";

// Brand Logo
const FinAiLogo = ({ size = 32 }) => (
  <div className="flex items-center gap-3 select-none">
    <div className="w-10 h-10 rounded-xl bg-[#0d4a2b] flex items-center justify-center flex-shrink-0">
      <svg className="w-6 h-6 text-[#f5f6f6]" viewBox="0 0 24 24" fill="#f5f6f6">
        <rect x="4" y="11" width="3.5" height="9" rx="1.5" />
        <rect x="10.25" y="5" width="3.5" height="15" rx="1.5" />
        <rect x="16.5" y="8" width="3.5" height="12" rx="1.5" />
      </svg>
    </div>
    <span className="font-extrabold text-2xl tracking-tight text-slate-900">
      FinAI
    </span>
  </div>
);

const HomePage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  const navLinks = [
    { label: "Features", active: true, href: "#features" },
    { label: "Revenue Forecasting", active: false, href: "#forecast" },
    { label: "AI Advisory", active: false, href: "#advisory" },
    { label: "Pricing", active: false, href: "#pricing" },
    { label: "Resources", active: false, href: "#resources" },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased overflow-x-hidden">
      {/* ============================================================ */}
      {/* 1. TOP NAVIGATION BAR */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/95 border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">
            {/* Logo */}
            <div
              onClick={() => navigate("/")}
              className="cursor-pointer flex items-center"
            >
              <FinAiLogo size={34} />
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5">
              {navLinks.map((link) =>
                link.active ? (
                  <a
                    key={link.label}
                    href={link.href}
                    className="inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-sm hover:bg-emerald-100 transition-colors"
                  >
                    {link.label}
                  </a>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-slate-600 font-medium text-sm hover:text-emerald-700 transition-colors"
                  >
                    {link.label}
                  </a>
                )
              )}
            </nav>

            {/* Desktop Right Actions */}
            <div className="hidden md:flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-slate-700 hover:text-emerald-700 font-semibold text-sm transition-colors px-2 py-1"
              >
                Login
              </button>

              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm px-6 py-2.5 rounded-full shadow-sm hover:shadow-md hover:shadow-emerald-700/20 transition-all active:scale-[0.98]"
              >
                Get Started
              </button>

              {/* Profile icon avatar button */}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-9 h-9 rounded-full border border-slate-300 flex items-center justify-center text-slate-500 hover:text-emerald-700 hover:border-emerald-600 hover:bg-emerald-50/50 transition-all"
                aria-label="User account"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 text-slate-800 hover:text-emerald-700 focus:outline-none"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative ml-auto w-4/5 max-w-sm h-full bg-white shadow-2xl p-6 flex flex-col z-10">
            <div className="flex items-center justify-between pb-5 border-b border-slate-100">
              <FinAiLogo size={28} />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="mt-6 flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${link.active
                    ? "bg-emerald-50 text-emerald-800 font-bold"
                    : "text-slate-700 hover:bg-slate-50 hover:text-emerald-700"
                    }`}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-slate-100 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/login");
                }}
                className="w-full py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 text-sm"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/signup");
                }}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm shadow-sm"
              >
                Get Started Free
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. HERO SECTION */}
      {/* ============================================================ */}
      <section className="relative pt-8 pb-16 md:pt-14 md:pb-24 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(16,185,129,0.18)_0%,rgba(236,253,245,0.4)_40%,#ffffff_85%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">

            {/* HERO LEFT COLUMN */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              {/* Badge */}
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50/90 border border-emerald-500/30 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                  <span className="text-[11px] font-extrabold text-emerald-800 tracking-wider uppercase">
                    AUTONOMOUS FINANCIAL ENGINE V2.4
                  </span>
                  <span className="text-[11px] text-slate-400 font-light hidden sm:inline">|</span>
                  <span className="text-[11px] font-semibold text-emerald-700 hidden sm:inline">
                    Zero-touch setup
                  </span>
                </div>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-[62px] font-black tracking-tight leading-[1.08] text-slate-900">
                AI-Powered <br />
                Financial <br />
                Intelligence <br />
                for{" "}
                <span className="text-emerald-600">
                  Your Business
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl">
                Track expenses, forecast revenue, monitor financial health, and
                get institutional-grade AI recommendations all in one beautifully
                simple workspace.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className="inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-base px-7 py-3.5 rounded-xl shadow-lg shadow-emerald-700/25 hover:shadow-emerald-700/35 transition-all active:scale-[0.98]"
                >
                  <span>Register Now — Free</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => setVideoModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-base px-6 py-3.5 rounded-xl shadow-xs transition-all"
                >
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Watch 90s Overview</span>
                </button>
              </div>

              {/* Trust Badges Row */}
              <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-start gap-2.5">
                  <svg className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">SOC-2 Type II</p>
                    <p className="text-[11px] text-slate-500">Institutional Certified</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <svg className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">256-Bit</p>
                    <p className="text-[11px] text-slate-500">Bank-Grade Encryption</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <svg className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">100+ Banks</p>
                    <p className="text-[11px] text-slate-500">Real-Time Telemetry Sync</p>
                  </div>
                </div>
              </div>
            </div>

            {/* HERO RIGHT COLUMN (Predictive Telemetry Card) */}
            <div className="lg:col-span-6">
              <div className="relative max-w-xl mx-auto">
                {/* Glow backdrop effect */}
                <div className="absolute inset-0 bg-emerald-400/20 blur-3xl rounded-full transform -translate-y-4" />

                {/* Card Container */}
                <div className="relative bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-900/5 p-6 sm:p-8">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                      <p className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase mb-1">
                        PREDICTIVE TELEMETRY
                      </p>
                      <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                        Year-wise Revenue & AI Forecast
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="inline-flex items-center gap-1 h-[26px] px-2.5 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        +34.8% YoY
                      </span>

                      <span className="inline-flex items-center h-[26px] px-2.5 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold">
                        2021 – 2025
                      </span>
                    </div>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">Projected Total Revenue</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                          $142,500
                        </span>
                        <span className="inline-flex items-center text-[11px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                          ARR
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">Forecast Accuracy Score</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
                          99.4%
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          p-value &lt; 0.01
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Telemetry Chart */}
                  <div className="mb-5">
                    <TelemetryChart />
                  </div>

                  {/* Copilot Note Box */}
                  <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-2xl p-3.5 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-bold text-emerald-900">
                          Autonomous Copilot Note
                        </span>
                        <span className="text-[11px] font-bold text-emerald-700">
                          Active Rebalance
                        </span>
                      </div>
                      <p className="text-[11.5px] leading-relaxed text-emerald-950">
                        Operating expenses decreased by <strong className="font-bold text-emerald-900">12%</strong> following
                        automated vendor reconciliation across 14 enterprise SaaS subscriptions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. MAIN FEATURES SECTION */}
      {/* ============================================================ */}
      <section id="features" className="py-16 md:py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 flex flex-col items-center">
            <div className="inline-flex items-center px-4 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-[11px] font-extrabold tracking-wider uppercase mb-3.5">
              ENTERPRISE FINANCIAL SUITE
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight text-slate-900 mb-4">
              Main Features
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Built for modern finance teams and high-growth founders. Replace fragmented
              spreadsheets with continuous algorithmic forecasting.
            </p>
          </div>

          {/* Responsive Features Grid: 1 col on mobile, 2 on tablet, 4 on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Card 1: Expense Tracking */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                  </svg>
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 mb-2">
                  Expense Tracking
                </h3>

                <p className="text-slate-600 text-xs leading-relaxed mb-6">
                  Real-time automated ledger categorization, smart receipt optical
                  scanning, and proactive recurring charge anomaly alerts.
                </p>
              </div>

              {/* Widget: Live Transaction Stream */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2">
                  LIVE TRANSACTION STREAM
                </p>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-700 font-semibold truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                      <span className="truncate">Cloud Infrastructure</span>
                    </div>
                    <span className="font-bold text-rose-500 flex-shrink-0">-$1,240.00</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-700 font-semibold truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                      <span className="truncate">SaaS Productivity Tools</span>
                    </div>
                    <span className="font-bold text-rose-500 flex-shrink-0">-$450.00</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Revenue Analysis */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 mb-2">
                  Revenue Analysis
                </h3>

                <p className="text-slate-600 text-xs leading-relaxed mb-6">
                  Multi-stream income aggregation, MRR and ARR growth monitoring,
                  customer cohort lifetime value, and variance alerting.
                </p>
              </div>

              {/* Widget: Actual vs Projected Bar Chart */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                    ACTUAL VS PROJECTED
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700">
                    +18.4% YoY
                  </span>
                </div>

                <div className="flex items-end justify-between h-11 pt-1 gap-1.5">
                  {[
                    { label: "Q1", height: "42%", bg: "bg-emerald-200" },
                    { label: "Q2", height: "60%", bg: "bg-emerald-300" },
                    { label: "Q3", height: "78%", bg: "bg-emerald-400" },
                    { label: "Q4", height: "98%", bg: "bg-emerald-500" },
                  ].map((bar) => (
                    <div key={bar.label} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        style={{ height: bar.height }}
                        className={`w-full rounded-t ${bar.bg} transition-all duration-300`}
                      />
                      <span className="text-[9px] font-semibold text-slate-400">
                        {bar.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Card 3: AI Insights Analysis */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 mb-2">
                  AI Insights Analysis
                </h3>

                <p className="text-slate-600 text-xs leading-relaxed mb-6">
                  Autonomous financial copilot providing continuous runway
                  projections, cash burn threshold warnings, and tax efficiency advice.
                </p>
              </div>

              {/* Widget: Runway Health */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                    RUNWAY HEALTH
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700">
                    • Optimal
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xl font-black text-slate-900">
                    22 Months
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                    98% Conf.
                  </span>
                </div>

                <p className="text-[10.5px] text-slate-500 mt-1">
                  At current $14.2k monthly burn
                </p>
              </div>
            </div>

            {/* Card 4: Budget Planning */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 mb-2">
                  Budget Planning
                </h3>

                <p className="text-slate-600 text-xs leading-relaxed mb-6">
                  Departmental envelope limits, velocity thresholds, automated
                  deviation notifications, and zero-sum corporate governance.
                </p>
              </div>

              {/* Widget: Engineering Cap Progress */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                    ENGINEERING CAP
                  </span>
                  <span className="text-[11px] font-bold text-slate-900">
                    $34,000 / $50,000
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-1.5">
                  <div className="w-[68%] h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" />
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 font-semibold">68% Utilized</span>
                  <span className="text-emerald-700 font-bold">Safe Margin</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. CALL TO ACTION (CTA) BANNER */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 md:mb-24">
        <div className="bg-gradient-to-br from-emerald-50 via-emerald-50/70 to-emerald-100/60 border border-emerald-300 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 shadow-sm">
          {/* Left copy */}
          <div className="flex items-center gap-4 max-w-2xl">
            <div className="w-13 h-13 rounded-2xl bg-emerald-700 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-700/30 p-3">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight mb-1">
                Ready to automate your financial stack?
              </h3>
              <p className="text-emerald-800 text-xs sm:text-sm">
                Join 4,200+ founders and institutional teams operating with real-time financial certainty.
              </p>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm px-7 py-3 rounded-xl shadow-md shadow-emerald-700/20 transition-all text-center whitespace-nowrap active:scale-[0.98]"
            >
              Get Started Free
            </button>

            <a
              href="#pricing"
              className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-sm px-6 py-3 rounded-xl transition-all text-center whitespace-nowrap"
            >
              Compare Plans
            </a>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. FOOTER */}
      {/* ============================================================ */}
      <footer className="bg-white border-t border-slate-100 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2">
            {/* Col 1: Brand */}
            <div className="md:col-span-5 flex flex-col  items-center gap-2">
              <FinAiLogo size={32} />

              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-sm">
                AI-Powered Financial Intelligence for high-growth enterprises.
                Real-time predictive telemetry, algorithmic forecasting, and
                institutional capital optimization.
              </p>

              <div className="flex flex-wrap items-center gap-3 p-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px] font-semibold">
                  • SOC-2 Type II Certified
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-semibold">
                  🔒 256-Bit Bank Encryption
                </span>
              </div>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>© 2025 FinAI Technologies Inc. Institutional Financial Intelligence. All rights reserved.</p>

            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
              <span>Global Telemetry: Systems Operational</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ============================================================ */}
      {/* 6. OVERVIEW VIDEO / DEMO MODAL */}
      {/* ============================================================ */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setVideoModalOpen(false)}
          />

          <div className="relative w-full max-w-2xl bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 z-10">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FinAiLogo size={24} />
                <span className="text-sm font-bold text-slate-200">FinAI 90-Second Walkthrough</span>
              </div>
              <button
                type="button"
                onClick={() => setVideoModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="my-6 rounded-2xl bg-slate-800/80 border border-slate-700/60 p-8 flex flex-col items-center justify-center text-center min-h-[260px]">
              <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-4 shadow-lg shadow-emerald-600/30">
                <svg className="w-8 h-8 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <h4 className="text-xl font-extrabold text-white mb-2">
                Next-Gen Autonomous Financial Engine
              </h4>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
                Explore how FinAI syncs real-time banking telemetry, forecasts MRR and ARR with 99.4%
                precision, and delivers continuous algorithmic portfolio advice.
              </p>
              <button
                type="button"
                onClick={() => {
                  setVideoModalOpen(false);
                  navigate("/signup");
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-md"
              >
                Start Free Trial Today
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;