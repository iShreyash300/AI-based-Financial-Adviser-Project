import React, { useState } from "react";

import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import { useNavigate } from "react-router-dom";

const ForgetPassword = () => {
    // ================= STATES =================
    const navigate = useNavigate();

    const [step, setStep] = useState(1);

    const [loading, setLoading] =
        useState(false);

    const [success, setSuccess] =
        useState("");

    const [errors, setErrors] = useState({});

    const [formData, setFormData] =
        useState({
            mobile: "",
            otp: "",
            newPassword: "",
        });

    // ================= HANDLE CHANGE =================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value,
        });

        setErrors({});
        setSuccess("");
    };

    // ================= VALIDATION =================

    const validateMobile = () => {
        let tempErrors = {};

        if (!formData.mobile) {
            tempErrors.mobile =
                "Mobile number is required";
        } else if (
            !/^[0-9]{10}$/.test(formData.mobile)
        ) {
            tempErrors.mobile =
                "Enter valid 10 digit mobile number";
        }

        setErrors(tempErrors);

        return Object.keys(tempErrors).length === 0;
    };

    const validateOTP = () => {
        let tempErrors = {};

        if (!formData.otp) {
            tempErrors.otp = "OTP is required";
        } else if (
            formData.otp.length !== 6
        ) {
            tempErrors.otp =
                "OTP must be 6 digits";
        }

        setErrors(tempErrors);

        return Object.keys(tempErrors).length === 0;
    };

    const validatePassword = () => {
        let tempErrors = {};

        if (!formData.newPassword) {
            tempErrors.newPassword =
                "Password is required";
        } else if (
            formData.newPassword.length < 6
        ) {
            tempErrors.newPassword =
                "Password must be at least 6 characters";
        }

        setErrors(tempErrors);

        return Object.keys(tempErrors).length === 0;
    };

    // ================= SEND OTP =================

    const handleSendOTP = () => {
        if (validateMobile()) {
            setLoading(true);

            setTimeout(() => {
                setLoading(false);

                setStep(2);

                setSuccess(
                    "OTP sent successfully to your mobile number"
                );
            }, 2000);
        }
    };

    // ================= VERIFY OTP =================

    const handleVerifyOTP = () => {
        if (validateOTP()) {
            setLoading(true);

            setTimeout(() => {
                setLoading(false);

                setStep(3);

                setSuccess(
                    "OTP Verified Successfully"
                );
            }, 2000);
        }
    };

    // ================= RESET PASSWORD =================
    const handleResetPassword = () => {
        if (validatePassword()) {
            setLoading(true);

            setTimeout(() => {
                setLoading(false);

                setSuccess(
                    "Password Reset Successfully"
                );

                setFormData({
                    mobile: "",
                    otp: "",
                    newPassword: "",
                });

                // Redirect to login page
                setTimeout(() => {
                    navigate("/login");
                }, 1500);

            }, 2000);
        }
    };

    // ================= INPUT STYLE =================

    const inputStyle = {
        "& .MuiOutlinedInput-root": {
            height: "48px",
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
    };

    return (
        <Box
            sx={{
                width: "100%",
                height: "100vh",
                bgcolor: "#f5f7ff",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 2,
            }}
        >
            {/* MAIN CARD */}

            <Box
                sx={{
                    width: "100%",
                    maxWidth: "420px",
                    bgcolor: "#fff",
                    borderRadius: "24px",
                    p: 4,
                    boxShadow:
                        "0 10px 40px rgba(0,0,0,0.1)",
                }}
            >
                {/* ICON */}

                <Box
                    sx={{
                        width: 80,
                        height: 80,
                        borderRadius: "20px",
                        background:
                            "linear-gradient(135deg,#5B5FEF,#7B61FF)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        mx: "auto",
                        mb: 3,
                    }}
                >
                    <LockResetOutlinedIcon
                        sx={{
                            color: "#fff",
                            fontSize: "2.5rem",
                        }}
                    />
                </Box>

                {/* TITLE */}

                <Typography
                    textAlign="center"
                    sx={{
                        fontSize: "2rem",
                        fontWeight: 800,
                        color: "#111",
                    }}
                >
                    Forgot Password
                </Typography>

                <Typography
                    textAlign="center"
                    sx={{
                        color: "#777",
                        mt: 1,
                        mb: 4,
                        fontSize: "14px",
                    }}
                >
                    Reset your password using
                    mobile verification
                </Typography>

                {/* SUCCESS */}

                {success && (
                    <Alert
                        severity="success"
                        sx={{ mb: 3 }}
                    >
                        {success}
                    </Alert>
                )}

                {/* STEP 1 */}

                {step === 1 && (
                    <Stack spacing={3}>
                        <Box>
                            <Typography
                                sx={{
                                    mb: 1,
                                    fontWeight: 600,
                                    fontSize: "14px",
                                }}
                            >
                                Mobile Number
                            </Typography>

                            <TextField
                                fullWidth
                                placeholder="Enter mobile number"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                error={!!errors.mobile}
                                helperText={errors.mobile}
                                sx={inputStyle}
                            />
                        </Box>

                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleSendOTP}
                            disabled={loading}
                            sx={{
                                height: "48px",
                                borderRadius: "12px",
                                textTransform: "none",
                                fontWeight: 700,
                                fontSize: "15px",
                                background:
                                    "linear-gradient(90deg,#5B5FEF,#7B61FF)",
                            }}
                        >
                            {loading ? (
                                <CircularProgress
                                    size={22}
                                    sx={{ color: "#fff" }}
                                />
                            ) : (
                                "Send OTP"
                            )}
                        </Button>
                    </Stack>
                )}

                {/* STEP 2 */}

                {step === 2 && (
                    <Stack spacing={3}>
                        <Box>
                            <Typography
                                sx={{
                                    mb: 1,
                                    fontWeight: 600,
                                    fontSize: "14px",
                                }}
                            >
                                Enter OTP
                            </Typography>

                            <TextField
                                fullWidth
                                placeholder="Enter 6 digit OTP"
                                name="otp"
                                value={formData.otp}
                                onChange={handleChange}
                                error={!!errors.otp}
                                helperText={errors.otp}
                                sx={inputStyle}
                            />
                        </Box>

                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleVerifyOTP}
                            disabled={loading}
                            sx={{
                                height: "48px",
                                borderRadius: "12px",
                                textTransform: "none",
                                fontWeight: 700,
                                fontSize: "15px",
                                background:
                                    "linear-gradient(90deg,#5B5FEF,#7B61FF)",
                            }}
                        >
                            {loading ? (
                                <CircularProgress
                                    size={22}
                                    sx={{ color: "#fff" }}
                                />
                            ) : (
                                "Verify OTP"
                            )}
                        </Button>
                    </Stack>
                )}

                {/* STEP 3 */}

                {step === 3 && (
                    <Stack spacing={3}>
                        <Box>
                            <Typography
                                sx={{
                                    mb: 1,
                                    fontWeight: 600,
                                    fontSize: "14px",
                                }}
                            >
                                New Password
                            </Typography>

                            <TextField
                                fullWidth
                                type="password"
                                placeholder="Enter new password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                error={
                                    !!errors.newPassword
                                }
                                helperText={
                                    errors.newPassword
                                }
                                sx={inputStyle}
                            />
                        </Box>

                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleResetPassword}
                            disabled={loading}
                            sx={{
                                height: "48px",
                                borderRadius: "12px",
                                textTransform: "none",
                                fontWeight: 700,
                                fontSize: "15px",
                                background:
                                    "linear-gradient(90deg,#5B5FEF,#7B61FF)",
                            }}
                        >
                            {loading ? (
                                <CircularProgress
                                    size={22}
                                    sx={{ color: "#fff" }}
                                />
                            ) : (
                                "Reset Password"
                            )}
                        </Button>
                    </Stack>
                )}
            </Box>
        </Box>
    );
};

export default ForgetPassword;