
import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
} from "@mui/material";

const CustomCard = ({
  title,
  amount,
  percentage,
  subtitle,
  positive = true,
}) => {
  return (
    <Card
      sx={{
        borderRadius: "16px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        p: 1,
        minWidth: 220,
        height: "25vh",
      }}
    >
      <CardContent>
        {/* Title */}
        <Typography
          variant="body2"
          sx={{
            color: "#8a8a8a",
            fontWeight: 600,
            mb: 1,
          }}
        >
          {title}
        </Typography>

        {/* Amount */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
          }}
        >
          ₹{amount}
        </Typography>

        {/* Percentage + Subtitle */}
        <Box display="flex" alignItems="center" gap={1}>
          <Typography
            variant="body2"
            sx={{
              color: positive ? "green" : "red",
              fontWeight: 600,
            }}
          >
            {positive ? "▲" : "▼"} {percentage}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "#777",
            }}
          >
            {subtitle}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CustomCard;