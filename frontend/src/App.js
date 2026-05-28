// ==============================
// App.js
// ==============================

import React, { lazy, Suspense } from "react";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Box, CircularProgress } from "@mui/material";

import Layout from "./Components/layouts/index";

// ================= LAZY IMPORT =================

const Home = lazy(() => import("./Components/pages/homePage"));

const AboutPage = lazy(() => import("./Components/pages/aboutPage"));

const ServicePage = lazy(() => import("./Components/pages/servicePage"));

const FeaturePage = lazy(() => import("./Components/pages/featurePage"));

const LoginPage = lazy(() => import("./Components/pages/loginPage"));

const SignupPage = lazy(() => import("./Components/pages/signupPage"));

const ForgetPassword = lazy(() => import("./Components/pages/forgetPassword"));

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
        height: "100vh",
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
          </Routes>
        </Suspense>
      </BrowserRouter>
    </Box>
  );
}

export default App;
