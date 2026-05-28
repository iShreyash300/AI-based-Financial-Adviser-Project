
import React from "react";

import {
    Box,
    Grid,
    Paper,
    Typography,
} from "@mui/material";

const FeaturePage = () => {
    const data = [
        "Expense Tracking",
        "Budget Management",
        "Revenue Prediction",
        "Profit/Loss Analysis",
        "AI Insights",
        "Financial Reports",
    ];

    return (
        <Box
            sx={{
                minHeight: "100vh",
                bgcolor: "#fff",
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
                Platform Features
            </Typography>

            <Grid container spacing={4}>
                {data.map((item, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 4,
                                borderRadius: "20px",
                                border: "1px solid #eee",
                                transition: "0.3s",

                                "&:hover": {
                                    transform: "translateY(-5px)",
                                    boxShadow:
                                        "0 10px 30px rgba(0,0,0,0.08)",
                                },
                            }}
                        >
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
                                    lineHeight: 1.7,
                                }}
                            >
                                Advanced AI-powered feature for
                                managing business financial
                                operations effectively.
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default FeaturePage;