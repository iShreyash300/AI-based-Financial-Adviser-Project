import React from "react";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    Title,
} from "chart.js";
import { Pie } from "react-chartjs-2";
import { Box } from "@mui/material";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, Title);

const PieChart = () => {
    // Chart Data
    const data = {
        labels: ["Savings", "Investments", "Expenses", "Utilities"],
        datasets: [
            {
                label: "Budget Distribution",
                data: [30, 25, 35, 10],
                backgroundColor: [
                    "#1976d2",
                    "#388e3c",
                    "#f57c00",
                    "#7b1fa2",
                ],
                borderColor: ["#fff"],
                borderWidth: 2,
                borderRadius: 5,
            },
        ],
    };

    // Chart Options
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom",
            },
            title: {
                display: true,
                text: "Budget Distribution",
                font: {
                    size: 14,
                },
            },
        },
    };

    return (
        <Box
            sx={{
                p: 2,
                bgcolor: "#fafafd",
                boxShadow: "0px 0px 3px 0px #e8e6e6",
                borderRadius: "12px",
                height: { xs: 240, md: 280 },
                width: "100%",
                display: "flex",
                alignItems: "center",
            }}
        >
            <Pie data={data} options={options} />
        </Box>
    );
};

export default PieChart;
