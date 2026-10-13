
import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
} from "@mui/material";

const CustomCard = ({
  title,
  amount,
  percentage,
  subtitle,
  positive = true,
  loading = false,
}) => {
  if (loading) {
    return (
      <Card
        sx={{
          borderRadius: "16px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          p: 1,
          width: "100%",
          height: "auto",
        }}
      >
        <CardContent>
          <Skeleton variant="text" width="50%" height={16} sx={{ mb: 1, transform: "none" }} animation="wave" />
          <Skeleton variant="rounded" width="70%" height={26} sx={{ my: 0.5, borderRadius: "4px" }} animation="wave" />
          <Box display="flex" alignItems="center" gap={1} mt={1}>
            <Skeleton variant="rounded" width={40} height={16} sx={{ borderRadius: "4px" }} animation="wave" />
            <Skeleton variant="text" width="40%" height={16} sx={{ transform: "none" }} animation="wave" />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        borderRadius: "16px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        p: 1,
        width: "100%",
        height: "auto",
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