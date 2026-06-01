

import React from "react";

import {
    Box,
    Stack,
    // eslint-disable-next-line 
    Typography,
} from "@mui/material";
import RevenueChart from "../Charts/RevenueChart";
import CustomCard from "../ui/CustomCard";
import TotalExpensesBarChart from "../Charts/barChart";
import PieChart from "../Charts/PieChart";

import CardData from "../../S_Data/cardData";

const Dashboard = () => {
    return (
        <Box sx={{ p: 3, overflow: "hidden" }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}
                sx={{ flexWrap: "wrap", mb: 2, justifyContent: "center" }}>

                {CardData.map((card) => (
                    <CustomCard
                        key={card.title}
                        title={card.title}
                        amount={card.amount}
                        percentage={card.percentage}
                        subtitle={card.subtitle}
                        positive={card.positive}
                    />
                ))}
            </Stack>

            <Box sx={{
                display: { md: "grid", xs: "flex" },
                flexDirection: { xs: "column", md: "row" },
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 2
            }}>
                <Box>
                    <RevenueChart />
                </Box>
                <Box>
                    <TotalExpensesBarChart />
                </Box>
                <Box>
                    <PieChart />
                </Box>
                <Box>
                    <RevenueChart />
                </Box>
            </Box>
        </Box>
    );
};

export default Dashboard;