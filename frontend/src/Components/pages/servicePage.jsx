

import React from "react";

import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
} from "@mui/material";

const ServicePage = () => {
    const services = [
        "Financial Dashboard",
        "Expense Prediction",
        "AI Health Score",
        "PDF Financial Reports",
        "Savings Planner",
        "Investment Suggestions",
    ];

    return (
        <Box
            sx={{
                minHeight: "100vh",
                bgcolor: "#f5f7ff",
                px: { xs: 3, md: 10 },
                py: 8,
            }}
        >
            <Typography
                textAlign="center"
                sx={{
                    fontSize: {
                        xs: "2.5rem",
                        md: "4rem",
                    },
                    fontWeight: 800,
                    mb: 7,
                }}
            >
                Our Services
            </Typography>

            <Grid container spacing={4}>
                {services.map((item, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card
                            sx={{
                                borderRadius: "24px",
                                p: 2,
                                boxShadow:
                                    "0 10px 30px rgba(0,0,0,0.08)",
                            }}
                        >
                            <CardContent>
                                <Typography
                                    sx={{
                                        fontSize: "22px",
                                        fontWeight: 700,
                                        color: "#6C63FF",
                                        mb: 2,
                                    }}
                                >
                                    {item}
                                </Typography>

                                <Typography
                                    sx={{
                                        color: "#666",
                                        lineHeight: 1.8,
                                    }}
                                >
                                    Smart AI-based financial
                                    service for helping businesses
                                    improve financial growth and
                                    profitability.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default ServicePage;