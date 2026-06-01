// ==============================
// App.js
// ==============================

import React, { lazy, Suspense } from "react";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Box, CircularProgress } from "@mui/material";

import Layout from "./Components/layouts/index";
// import Dashboard from "./Components/pages/deshboardPage";

// ================= LAZY IMPORT =================

const Home = lazy(() => import("./Components/pages/homePage"));

const AboutPage = lazy(() => import("./Components/pages/aboutPage"));

const ServicePage = lazy(() => import("./Components/pages/servicePage"));

const FeaturePage = lazy(() => import("./Components/pages/featurePage"));

const LoginPage = lazy(() => import("./Components/pages/loginPage"));

const SignupPage = lazy(() => import("./Components/pages/signupPage"));

const ForgetPassword = lazy(() => import("./Components/pages/forgetPassword"));

const Dashboard = lazy(() => import("./Components/pages/deshboardPage"));
const ExpensesPage = lazy(() => import("./Components/pages/expenses"));

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

            {/* ABOUT */}

            <Route
              path="/about"
              element={
                <Layout>
                  <AboutPage />
                </Layout>
              }
            />

            {/* SERVICES */}

            <Route
              path="/services"
              element={
                <Layout>
                  <ServicePage />
                </Layout>
              }
            />

            {/* FEATURES */}

            <Route
              path="/features"
              element={
                <Layout>
                  <FeaturePage />
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
                <Layout>
                  <Dashboard />
                </Layout>
              }
            />
            <Route
              path="/expenses"
              element={
                <Layout>
                  <ExpensesPage />
                </Layout>
              }
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </Box>
  );
}

export default App;
