// ==============================
// App.js
// ==============================

import React, { lazy, Suspense } from "react";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Box, CircularProgress } from "@mui/material";

import Layout from "./components/layouts/index";

import ProtectedRoute from "../src/routers/ProtectedRoute";
// import Dashboard from "./Components/pages/deshboardPage";

// ================= LAZY IMPORT =================

const Home = lazy(() => import("./components/pages/homePage"));

const LoginPage = lazy(() => import("./components/pages/loginPage"));

const SignupPage = lazy(() => import("./components/pages/signupPage"));

const ForgetPassword = lazy(() => import("./components/pages/forgetPassword"));

const Dashboard = lazy(() => import("./components/pages/deshboardPage"));

const ExpensesPage = lazy(() => import("./components/pages/expenses"));

const BudgetPage = lazy(() => import("./components/pages/budget"));
const RevenuePage = lazy(() => import("./components/pages/revenue"));
const ProfilePage = lazy(() => import("./components/pages/profilePage"));
const PredictionsPage = lazy(() => import("./components/pages/predictions"));
const GoalsPage = lazy(() => import("./components/pages/goals"));
const FinancialReportPage = lazy(() => import("./components/pages/financialReport"));

// ================= LOADER =================

const Loader = () => {
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <CircularProgress />
    </Box>
  );
};

// ================= APP =================

function App() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#f5f7fb",
      }}
    >
      <BrowserRouter>
        <Suspense fallback={<Loader />}>
          <Routes>
            {/* HOME */}

            <Route
              path="/"
              element={
                <Layout>
                  <Home />
                </Layout>
              }
            />

            {/* LOGIN */}

            <Route path="/login" element={<LoginPage />} />

            {/* SIGNUP */}

            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgetPassword" element={<ForgetPassword />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProfilePage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/expenses"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ExpensesPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/budget"
              element={
                <Layout>
                  <BudgetPage />
                </Layout>
              }
            />
            <Route
              path="/revenues"
              element={
                <ProtectedRoute>
                  <Layout>
                    <RevenuePage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/predictions"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PredictionsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/goals"
              element={
                <ProtectedRoute>
                  <Layout>
                    <GoalsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Layout>
                    <FinancialReportPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </Box>
  );
}

export default App;
