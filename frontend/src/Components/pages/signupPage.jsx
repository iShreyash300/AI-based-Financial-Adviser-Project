import React, { useState } from "react";

import {
    Alert,
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    IconButton,
    InputAdornment,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import OtherHousesRoundedIcon from '@mui/icons-material/OtherHousesRounded';
import { useNavigate } from "react-router-dom";

import signupimg from "../../assetes/login.png";

const SignupPage = () => {
    // ================= STATES =================

    const navigate = useNavigate();
    const [showPassword, setShowPassword] =
        useState(false);

    const [
        showConfirmPassword,
        setShowConfirmPassword,
    ] = useState(false);

    const [success, setSuccess] = useState("");

    const [errors, setErrors] = useState({});


    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        terms: false,
    });

    // ================= HANDLE CHANGE =================

    const handleChange = (e) => {
        const { name, value, checked, type } =
            e.target;

        setFormData({
            ...formData,
            [name]:
                type === "checkbox" ? checked : value,
        });

        setSuccess("");
    };

    // ================= VALIDATION =================

    const validateForm = () => {
        let tempErrors = {};

        if (!formData.fullName) {
            tempErrors.fullName =
                "Full name is required";
        }

        if (!formData.email) {
            tempErrors.email = "Email is required";
        } else if (
            !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(
                formData.email
            )
        ) {
            tempErrors.email =
                "Invalid email address";
        }

        if (!formData.password) {
            tempErrors.password =
                "Password is required";
        } else if (formData.password.length < 6) {
            tempErrors.password =
                "Password must be at least 6 characters";
        }

        if (!formData.confirmPassword) {
            tempErrors.confirmPassword =
                "Confirm your password";
        } else if (
            formData.password !==
            formData.confirmPassword
        ) {
            tempErrors.confirmPassword =
                "Passwords do not match";
        }

        if (!formData.terms) {
            tempErrors.terms =
                "Accept terms & conditions";
        }

        setErrors(tempErrors);

        return Object.keys(tempErrors).length === 0;
    };

    // ================= SUBMIT =================

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            console.log(formData);

            setSuccess(
                "Account Created Successfully!"
            );

            setFormData({
                fullName: "",
                email: "",
                password: "",
                confirmPassword: "",
                terms: false,
            });

            setErrors({});
        } else {
            setSuccess("");
        }
    };

    // ================= INPUT STYLE =================

    const inputStyle = {
        "& .MuiOutlinedInput-root": {
            height: "45px",
            borderRadius: "12px",
            background: "#fafafa",

            "& fieldset": {
                borderColor: "#ddd",
            },

            "&:hover fieldset": {
                borderColor: "#7B61FF",
            },

            "&.Mui-focused fieldset": {
                borderColor: "#5B5FEF",
            },
        },

        "& .MuiFormHelperText-root": {
            marginLeft: "2px",
            fontSize: "11px",
        },
    };

    return (


        <Box sx={{
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        }} >
            <Box
                sx={{
                    width: "100%",
                    maxWidth: "950px",
                    height: { md: "93vh", sx: "auto" },
                    bgcolor: "#fff",
                    borderRadius: "24px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: {
                        xs: "column",
                        md: "row",
                    },
                    boxShadow:
                        "0 10px 40px rgba(0,0,0,0.12)",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                {/* LEFT SIDE */}

                <Box
                    sx={{
                        height: { md: "93vh", sx: "auto" },
                        flex: 1,
                        background:
                            "linear-gradient(135deg, #5B5FEF 0%, #7B61FF 50%, #9D7BFF 100%)",
                        color: "#fff",
                        p: {
                            xs: 3,
                            md: 5,
                        },
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
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



                    <Box>
                        <Typography
                            sx={{
                                fontWeight: 800,
                                fontSize: {
                                    xs: "2.5rem",
                                    md: "2.4rem",
                                },
                                lineHeight: 1.1,
                                mb: 2,
                            }}
                        >
                            Create Account!
                            <br />
                            With FinAi
                        </Typography>

                        <Typography
                            sx={{
                                opacity: 0.9,
                                fontSize: {
                                    xs: "14px",
                                    md: "16px",
                                },
                                lineHeight: 1.6,
                                maxWidth: "320px",
                            }}
                        >
                            Join our financial dashboard and
                            manage your business smarter.
                        </Typography>
                    </Box>

                    {/* IMAGE */}

                    <Box
                        component="img"
                        src={signupimg}
                        alt="signup"
                        sx={{
                            width: {
                                xs: "170px",
                                md: "260px",
                            },
                            objectFit: "contain",
                            alignSelf: "center",
                        }}
                    />
                </Box>

                {/* RIGHT SIDE */}

                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{
                        flex: 1,
                        p: {
                            xs: 3,
                            md: 4,
                        },
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                    }}
                >
                    {/* TITLE */}

                    <Typography
                        sx={{
                            fontWeight: 700,
                            fontSize: {
                                xs: "1.8rem",
                                md: "2rem",
                            },
                            mb: 1,
                            color: "#111",
                        }}
                    >
                        Sign up
                    </Typography>

                    {/* SUCCESS */}

                    {success && (
                        <Alert
                            severity="success"
                            sx={{
                                mb: 2,
                                py: 0,
                                fontSize: "13px",
                            }}
                        >
                            {success}
                        </Alert>
                    )}

                    {/* FORM */}

                    <Stack spacing={1}>
                        {/* FULL NAME */}

                        <Box>
                            <Typography
                                sx={{
                                    fontSize: "14px",
                                    mb: 0.5,
                                    fontWeight: 600,
                                }}
                            >
                                Full Name
                            </Typography>

                            <TextField
                                fullWidth
                                name="fullName"
                                placeholder="Enter your full name"
                                value={formData.fullName}
                                onChange={handleChange}
                                error={!!errors.fullName}
                                helperText={errors.fullName}
                                sx={inputStyle}
                            />
                        </Box>

                        {/* EMAIL */}

                        <Box>
                            <Typography
                                sx={{
                                    fontSize: "14px",
                                    mb: 0.5,
                                    fontWeight: 600,
                                }}
                            >
                                Email Address
                            </Typography>

                            <TextField
                                fullWidth
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                error={!!errors.email}
                                helperText={errors.email}
                                sx={inputStyle}
                            />
                        </Box>

                        {/* PASSWORD */}

                        <Box>
                            <Typography
                                sx={{
                                    fontSize: "14px",
                                    mb: 0.5,
                                    fontWeight: 600,
                                }}
                            >
                                Password
                            </Typography>

                            <TextField
                                fullWidth
                                name="password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                error={!!errors.password}
                                helperText={errors.password}
                                sx={inputStyle}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() =>
                                                    setShowPassword(
                                                        !showPassword
                                                    )
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

                        {/* CONFIRM PASSWORD */}

                        <Box>
                            <Typography
                                sx={{
                                    fontSize: "14px",
                                    mb: 0.5,
                                    fontWeight: 600,
                                }}
                            >
                                Confirm Password
                            </Typography>

                            <TextField
                                fullWidth
                                name="confirmPassword"
                                type={
                                    showConfirmPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Confirm password"
                                value={
                                    formData.confirmPassword
                                }
                                onChange={handleChange}
                                error={
                                    !!errors.confirmPassword
                                }
                                helperText={
                                    errors.confirmPassword
                                }
                                sx={inputStyle}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() =>
                                                    setShowConfirmPassword(
                                                        !showConfirmPassword
                                                    )
                                                }
                                            >
                                                {showConfirmPassword ? (
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

                        {/* TERMS */}

                        <Stack sx={{ flexDirection: "column" }}>
                            <Stack sx={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%" }} >
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            name="terms"
                                            checked={formData.terms}
                                            onChange={handleChange}
                                            size="small"
                                        />
                                    }
                                    label={
                                        <Typography sx={{ fontSize: "15px" }}>
                                            I accept Terms &
                                            Conditions
                                        </Typography>
                                    }
                                />

                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    sx={{
                                        width: "40%",
                                        height: "40px",
                                        borderRadius: "12px",
                                        textTransform: "none",
                                        fontSize: "15px",
                                        fontWeight: 700,
                                        background:
                                            "linear-gradient(90deg, #5B5FEF 0%, #7B61FF 100%)",

                                        "&:hover": {
                                            background:
                                                "linear-gradient(90deg, #4D52E8 0%, #694BFF 100%)",
                                        },
                                    }}
                                >
                                    Create Account
                                </Button>

                            </Stack>

                            {errors.terms && (
                                <Typography
                                    sx={{
                                        color: "red",
                                        fontSize: "11px",
                                    }}
                                >
                                    {errors.terms}
                                </Typography>
                            )}


                        </Stack>

                    </Stack>

                    <Typography

                        sx={{
                            color: "#666",
                            fontSize: "13px",
                            textAlign: "center",
                            mt: .5,

                        }}
                    >
                        Already have an account?{" "}
                        <span
                            style={{
                                color: "#6C63FF",
                                fontWeight: "bold",
                                cursor: "pointer",
                            }}
                            onClick={() =>
                                navigate("/login")
                            }
                        >
                            Sign in
                        </span>
                    </Typography>
                </Box>
            </Box>
        </Box>

    );
};

export default SignupPage;