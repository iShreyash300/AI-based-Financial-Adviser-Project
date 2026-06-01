

import React from "react";
import { useNavigate } from "react-router-dom";
import Linerchart from "../Charts/RevenueChart"


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
            title: "AI Insights Analysis",
            icon: <InsightsOutlinedIcon />,
        },
        {
            title: "Budget Planning",
            icon: <SavingsOutlinedIcon />,
        },
    ];

    return (
        <Box sx={{ bgcolor: "#f5f7ff", p: 5 }}>
            {/* <Box sx={{ bgcolor: "#060606" }}> */}
            {/* HERO SECTION */}

            <Box
                sx={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    // px: { xs: 3, md: 10 },
                    // py: 5,
                }}
            >
                <Stack spacing={5} alignItems="center" direction={{ xs: "column", sm: "row" }}>
                    {/* LEFT */}

                    <Stack sx={{ width: { xs: "100%", md: "50%" } }} direction={{ xs: "column", sm: "column" }} spacing={5} alignItems="center">
                        <Typography
                            sx={{
                                fontSize: {
                                    xs: "26px",
                                    md: "3.75rem",
                                },
                                fontWeight: 800,
                                lineHeight: 1.1,
                                color: "#111",
                            }}
                        >
                            AI-Powered Financial
                            Intelligence for
                            <br />

                            <span style={{ color: "#6C63FF" }}>
                                {" "}
                                Your Business
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
                            Track expenses, forecast revenue, monitor financial health, and get AI recommendations all in one beautifully simple workspace.
                        </Typography>


                        <Button
                            variant="contained"
                            sx={{
                                width: { md: "200px", xs: "100%" },
                                height: "45px",
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
                    </Stack>
                    <Stack sx={{ width: { xs: "100%", md: "50%" } }} direction={{ xs: "column", sm: "column" }} spacing={5} alignItems="center">
                        <Linerchart />
                    </Stack>
                    {/* RIGHT */}


                </Stack>
            </Box>

            {/* FEATURES */}

            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    px: { xs: 3, md: 10 },
                    py: 8,
                }}
            >
                <Typography
                    textAlign="center"
                    sx={{
                        fontSize: { md: "2.5rem", xs: "2rem" },
                        fontWeight: 800,
                        mb: 6,
                    }}
                >
                    Main Features
                </Typography>

                <Grid sx={{ justifyContent: "center" }} container spacing={3}>
                    {features.map((item, index) => (
                        <Grid sx={{ width: { md: "200px", xs: "100%" }, }} item xs={12} sm={6} md={3} key={index}>
                            <Card
                                sx={{
                                    borderRadius: "20px",
                                    p: 2,
                                    boxShadow:
                                        "0 10px 30px rgba(0,0,0,0.08)",
                                    textAlign: "center",
                                    height: { md: "35vh", xs: "auto" },
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
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