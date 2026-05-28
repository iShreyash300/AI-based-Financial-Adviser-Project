

import React from "react";

import {
    Box,
    Grid,
    Typography,
} from "@mui/material";

const AboutPage = () => {
    return (
        <Box
            sx={{
                minHeight: "100vh",
                bgcolor: "#f8f9ff",
                px: { xs: 3, md: 10 },
                py: 8,
            }}
        >
            <Grid container spacing={6} alignItems="center">
                <Grid item xs={12} md={6}>
                    <Typography
                        sx={{
                            fontSize: {
                                xs: "2.5rem",
                                md: "4rem",
                            },
                            fontWeight: 800,
                            mb: 3,
                        }}
                    >
                        About Our
                        <span style={{ color: "#6C63FF" }}>
                            {" "}
                            Platform
                        </span>
                    </Typography>

                    <Typography
                        sx={{
                            color: "#666",
                            lineHeight: 1.9,
                            fontSize: "16px",
                        }}
                    >
                        AI-Based Business Financial
                        Advisor helps businesses track
                        expenses, analyze financial data,
                        predict future growth, and improve
                        decision-making using AI-powered
                        insights.
                    </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Box
                        component="img"
                        src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                        alt="about"
                        sx={{
                            width: "100%",
                            maxWidth: "450px",
                            display: "block",
                            mx: "auto",
                        }}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default AboutPage;