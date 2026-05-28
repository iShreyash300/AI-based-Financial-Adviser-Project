

import React from "react";
import { useNavigate } from "react-router-dom";


import {
    Box,
    Button,
    Grid,
    Stack,
    Typography,
    Card,
    CardContent,
} from "@mui/material";

import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";


const HomePage = () => {

    const navigate = useNavigate();
    const features = [
        {
            title: "Expense Tracking",
            icon: <AccountBalanceWalletOutlinedIcon />,
        },
        {
            title: "Revenue Analysis",
            icon: <TrendingUpOutlinedIcon />,
        },
        {
            title: "AI Insights",
            icon: <InsightsOutlinedIcon />,
        },
        {
            title: "Budget Planning",
            icon: <SavingsOutlinedIcon />,
        },
    ];

    return (
        <Box sx={{ bgcolor: "#f5f7ff" }}>
            {/* HERO SECTION */}

            <Box
                sx={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    px: { xs: 3, md: 10 },
                    py: 5,
                }}
            >
                <Grid container spacing={5} alignItems="center">
                    {/* LEFT */}

                    <Grid item xs={12} md={6}>
                        <Typography
                            sx={{
                                fontSize: {
                                    xs: "2.5rem",
                                    md: "4.5rem",
                                },
                                fontWeight: 800,
                                lineHeight: 1.1,
                                color: "#111",
                            }}
                        >
                            AI-Based
                            <br />
                            Financial
                            <span style={{ color: "#6C63FF" }}>
                                {" "}
                                Advisor
                            </span>
                        </Typography>

                        <Typography
                            sx={{
                                mt: 3,
                                color: "#666",
                                lineHeight: 1.8,
                                fontSize: {
                                    xs: "14px",
                                    md: "17px",
                                },
                                maxWidth: "550px",
                            }}
                        >
                            Smart business finance system
                            that tracks expenses, predicts
                            revenue, analyzes financial
                            patterns, and provides AI-powered
                            financial insights.
                        </Typography>

                        <Stack
                            direction={{
                                xs: "column",
                                sm: "row",
                            }}
                            spacing={2}
                            mt={4}
                        >
                            <Button
                                variant="contained"
                                sx={{
                                    height: "52px",
                                    px: 4,
                                    borderRadius: "14px",
                                    textTransform: "none",
                                    fontSize: "16px",
                                    fontWeight: 700,
                                    background:
                                        "linear-gradient(90deg,#5B5FEF,#7B61FF)",
                                }}
                                onClick={() =>
                                    navigate("/signup")
                                }
                            >
                                Register Now
                            </Button>

                            <Button
                                variant="outlined"
                                sx={{
                                    height: "52px",
                                    px: 4,
                                    borderRadius: "14px",
                                    textTransform: "none",
                                    fontSize: "16px",
                                    fontWeight: 700,
                                    borderColor: "#6C63FF",
                                    color: "#6C63FF",
                                }}
                            >
                                Sign In
                            </Button>
                        </Stack>
                    </Grid>

                    {/* RIGHT */}

                    <Grid item xs={12} md={6}>
                        <Box
                            component="img"
                            src="https://cdn-icons-png.flaticon.com/512/4727/4727496.png"
                            alt="finance"
                            sx={{
                                width: "50%",
                                maxWidth: "500px",
                                display: "block",
                                mx: "auto",
                            }}
                        />
                    </Grid>
                </Grid>
            </Box>

            {/* FEATURES */}

            <Box
                sx={{
                    px: { xs: 3, md: 10 },
                    py: 8,
                }}
            >
                <Typography
                    textAlign="center"
                    sx={{
                        fontSize: "2.5rem",
                        fontWeight: 800,
                        mb: 6,
                    }}
                >
                    Main Features
                </Typography>

                <Grid container spacing={3}>
                    {features.map((item, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <Card
                                sx={{
                                    borderRadius: "20px",
                                    p: 2,
                                    boxShadow:
                                        "0 10px 30px rgba(0,0,0,0.08)",
                                    textAlign: "center",
                                }}
                            >
                                <CardContent>
                                    <Box
                                        sx={{
                                            width: 70,
                                            height: 70,
                                            borderRadius: "20px",
                                            bgcolor: "#f0edff",
                                            color: "#6C63FF",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            mx: "auto",
                                            mb: 2,
                                            fontSize: "2rem",
                                        }}
                                    >
                                        {item.icon}
                                    </Box>

                                    <Typography
                                        sx={{
                                            fontWeight: 700,
                                            fontSize: "18px",
                                        }}
                                    >
                                        {item.title}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Box>
    );
};

export default HomePage;