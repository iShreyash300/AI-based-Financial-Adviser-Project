import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    Stack,
    TextField,
    Typography,
    InputAdornment,
    IconButton,
    Alert,
} from "@mui/material";


import { useNavigate } from "react-router-dom";

import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import OtherHousesRoundedIcon from '@mui/icons-material/OtherHousesRounded';

import loginimg from '../../assetes/login.png'

const LoginPage = () => {

    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState("");

    // eslint-disable-next-line
    const [rememberMe, setRememberMe] = useState(false);

    useEffect(() => {
        const savedEmail = localStorage.getItem("email");
        const savedPassword = localStorage.getItem("password");

        if (savedEmail && savedPassword) {
            setFormData({
                email: savedEmail,
                password: savedPassword,
            });

            setRememberMe(true);
        }
    }, []);


    const [formData, setFormData] = useState({
        email: "",
        password: "",
        remember: false,
    });

    // Handle Input Change
    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;

        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    // Validation
    const validateForm = () => {
        let tempErrors = {};

        // Email Validation
        if (!formData.email) {
            tempErrors.email = "Email is required";
        } else if (
            !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
        ) {
            tempErrors.email = "Invalid email address";
        }

        // Password Validation
        if (!formData.password) {
            tempErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            tempErrors.password = "Password must be at least 6 characters";
        }

        setErrors(tempErrors);

        return Object.keys(tempErrors).length === 0;
    };

    // Submit Function
    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {

            // static login for demo 

            if (
                formData.email === "admin@gmail.com" &&
                formData.password === "admin@456"
            ) {

                // remember me functionality

                if (formData.remember) {
                    localStorage.setItem("email", formData.email);
                    localStorage.setItem("password", formData.password);
                } else {
                    localStorage.removeItem("email");
                    localStorage.removeItem("password");
                }

                // save login state

                localStorage.setItem("isLogin", true);

                // save user data in local storage

                localStorage.setItem(
                    "user",
                    JSON.stringify({
                        name: "Domo Admin",
                        role: "Admin",
                        email: formData.email,
                    })
                );

                setSuccess("Login Successful!");

                setErrors({});

                // deshboard page nevigate 

                setTimeout(() => {
                    navigate("/dashboard");
                }, 1500);

            } else {

                setErrors({
                    password: "Invalid Email or Password",
                });

                setSuccess("");
            }
        }
    };

    return (
        <>

            <Box

                sx={{
                    width: "100%",
                    // maxWidth: "1200px",
                    height: "100vh",
                    bgcolor: "#fff",
                    // borderRadius: "25px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                }}
            >
                {/* Left Side */}
                <Box
                    sx={{
                        flex: 1,
                        background:
                            "linear-gradient(180deg, #5B5FEF 0%, #7B61FF 100%)",
                        color: "#fff",
                        p: 3,

                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: { xs: "center", md: "flex-start" },
                        textAlign: { xs: "center", md: "left" },
                    }}
                >
                    <Box
                        sx={{ width: "50px", height: "50px", cursor: "pointer" }}
                        onClick={() =>
                            navigate("/")
                        }
                    >
                        <OtherHousesRoundedIcon />
                    </Box>


                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 700,
                            mb: 2,
                            fontSize: { xs: "2rem", md: "3rem" },
                        }}
                    >
                        Welcome Back!
                    </Typography>

                    <Typography
                        sx={{
                            opacity: 0.9,
                            maxWidth: "350px",
                            mb: 5,
                            fontSize: { xs: "14px", md: "16px" },
                        }}
                    >
                        Sign in to your financial dashboard and manage your business
                        smarter.
                    </Typography>

                    <Box
                        component="img"
                        src={loginimg}
                        alt="login"
                        sx={{
                            width: { xs: "180px", md: "280px" },
                            mx: { xs: "auto", md: 0 },
                        }}
                    />
                </Box>

                {/* Right Side */}
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{
                        flex: 1,
                        p: { xs: 3, md: 7 },
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        minHeight: { xs: "auto", md: "100%" },
                        overflowY: { xs: "auto", md: "visible" },
                    }}
                >
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            mb: 1,
                            fontSize: { xs: "2rem", md: "2.5rem" },
                        }}
                    >
                        Sign in
                    </Typography>

                    <Typography
                        sx={{
                            color: "#777",
                            mb: 4,
                            fontSize: "14px",
                        }}
                    >
                        Enter your credentials to access your account
                    </Typography>

                    {/* Success Message */}
                    {success && (
                        <Alert severity="success" sx={{ mb: 3 }}>
                            {success}
                        </Alert>
                    )}

                    <Stack spacing={3}>
                        <Box>
                            <Typography
                                sx={{
                                    mb: 1,
                                    fontWeight: 600,
                                    fontSize: "14px",
                                }}
                            >
                                Email Address
                            </Typography>

                            <TextField
                                fullWidth
                                placeholder="Enter your email"
                                variant="outlined"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                error={!!errors.email}
                                helperText={errors.email}

                            />
                        </Box>

                        <Box>
                            <Typography
                                sx={{
                                    mb: 1,
                                    fontWeight: 600,
                                    fontSize: "14px",
                                }}
                            >
                                Password
                            </Typography>

                            <TextField
                                fullWidth
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                error={!!errors.password}
                                helperText={errors.password}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() =>
                                                    setShowPassword(!showPassword)
                                                }
                                            >
                                                {showPassword ? (
                                                    <VisibilityOffOutlinedIcon />
                                                ) : (
                                                    <VisibilityOutlinedIcon />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>

                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            flexWrap="wrap"
                        >
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name="remember"
                                        checked={formData.remember}
                                        onChange={handleChange}
                                    />
                                }
                                label="Remember me"
                            />

                            <Typography
                                onClick={() => navigate("/forgetPassword")}
                                sx={{
                                    color: "#6C63FF",
                                    cursor: "pointer",
                                    fontWeight: 600,
                                    fontSize: "14px",
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                Forgot Password?
                            </Typography>
                        </Stack>

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            sx={{
                                py: 1.5,
                                borderRadius: "12px",
                                textTransform: "none",
                                fontSize: "16px",
                                fontWeight: 600,
                                background:
                                    "linear-gradient(90deg, #5B5FEF 0%, #7B61FF 100%)",
                            }}
                        >
                            Sign In
                        </Button>

                        <Typography
                            textAlign="center"
                            sx={{
                                color: "#666",
                                fontSize: "14px",
                                cursor: "pointer",
                            }}
                            onClick={() => navigate("/signup")}
                        >
                            Don't have an account?{" "}
                            <span
                                style={{
                                    color: "#6C63FF",
                                    fontWeight: "bold",
                                    cursor: "pointer",
                                }}
                            >
                                Sign up
                            </span>
                        </Typography>
                    </Stack>
                </Box>
            </Box>
        </>

    );
};

export default LoginPage;