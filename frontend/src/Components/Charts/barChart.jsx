import React from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";
import { Box } from "@mui/material";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
        {
            label: "Total Expenses",
            data: [12000, 19000, 15000, 22000, 18000, 25000],
            borderRadius: 10,
        },
    ],
};

const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: "top",
        },
        title: {
            display: true,
            text: "Total Expenses",
        },
    },
};

const BarChart = () => {
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
            <Bar
                data={data}
                options={options}
            />
        </Box>

    )
    // return <Bar data={data} options={options} />;
};

export default BarChart;