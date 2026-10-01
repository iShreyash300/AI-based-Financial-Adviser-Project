import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";

import { Box } from "@mui/material";


// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const RevenueChart = () => {

    // Chart Data
    const data = {
        labels: ["2021", "2022", "2023", "2024", "2025"],

        datasets: [
            {
                label: "Revenue",

                data: [10000, 15000, 22000, 30000, 45000],

                borderColor: "#1976d2",

                backgroundColor: "#1976d2",

                tension: 0.4,
            },
        ],
    };


    // Chart Options
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top",
            },

            title: {
                display: true,
                text: "Year-wise Revenue",
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
            <Line
                data={data}
                options={options}
            />
        </Box>
    );
};

export default RevenueChart;