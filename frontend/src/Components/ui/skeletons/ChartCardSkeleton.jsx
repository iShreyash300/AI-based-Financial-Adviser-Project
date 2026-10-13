import React from "react";
import { Card, Stack, Box, Skeleton } from "@mui/material";

/**
 * ChartCanvasSkeleton
 * Renders realistic chart geometry skeletons matching the actual visualization type:
 * - 'bar': Staggered column skeletons with a baseline
 * - 'line': Smooth wave-like placeholder with horizontal grid guides
 * - 'pie': Centered circular/donut skeleton with legend items
 */
const ChartCanvasSkeleton = ({ type = "bar" }) => {
  if (type === "pie") {
    return (
      <Box
        sx={{
          height: 220,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        {/* Donut / Pie Skeleton */}
        <Box sx={{ position: "relative", width: 140, height: 140 }}>
          <Skeleton
            variant="circular"
            width={140}
            height={140}
            animation="wave"
            sx={{ bgcolor: "#f1f5f9" }}
          />
          {/* Inner cutout for donut aesthetic */}
          <Box
            sx={{
              position: "absolute",
              top: "22%",
              left: "22%",
              width: "56%",
              height: "56%",
              borderRadius: "50%",
              bgcolor: "#ffffff",
            }}
          />
        </Box>

        {/* Legend Skeletons */}
        <Stack direction="row" spacing={1.5} sx={{ justifyContent: "center", width: "100%" }}>
          <Skeleton variant="rounded" width={55} height={12} sx={{ borderRadius: "4px" }} animation="wave" />
          <Skeleton variant="rounded" width={65} height={12} sx={{ borderRadius: "4px" }} animation="wave" />
          <Skeleton variant="rounded" width={50} height={12} sx={{ borderRadius: "4px" }} animation="wave" />
        </Stack>
      </Box>
    );
  }

  if (type === "line") {
    return (
      <Box
        sx={{
          height: 220,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          pt: 1,
          pb: 1,
        }}
      >
        {/* Horizontal grid guide lines */}
        {[1, 2, 3, 4].map((i) => (
          <Skeleton
            key={i}
            variant="text"
            width="100%"
            height={2}
            sx={{ transform: "none", bgcolor: "#f1f5f9" }}
            animation="wave"
          />
        ))}

        {/* Dynamic Wave Representation */}
        <Box sx={{ display: "flex", alignItems: "flex-end", height: 130, gap: 2, px: 1 }}>
          {[35, 60, 45, 80, 65, 90, 75].map((h, idx) => (
            <Box
              key={idx}
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.8,
              }}
            >
              <Skeleton
                variant="circular"
                width={8}
                height={8}
                animation="wave"
                sx={{ bgcolor: idx % 2 === 0 ? "#5B5FEF33" : "#ef444433" }}
              />
              <Skeleton
                variant="rounded"
                width="80%"
                height={`${h}%`}
                sx={{ borderRadius: "6px 6px 0 0", opacity: 0.4 }}
                animation="wave"
              />
            </Box>
          ))}
        </Box>

        {/* X-axis labels */}
        <Stack direction="row" justifyContent="space-between" sx={{ px: 1, pt: 1 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton
              key={i}
              variant="rounded"
              width={28}
              height={10}
              sx={{ borderRadius: "3px" }}
              animation="wave"
            />
          ))}
        </Stack>
      </Box>
    );
  }

  // Default: Bar Chart Skeleton
  const barHeights = [45, 75, 30, 90, 60, 85];
  return (
    <Box
      sx={{
        height: 220,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        gap: 1.5,
        pt: 2,
      }}
    >
      {/* Bars Container */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-around",
          height: 160,
          gap: 1.5,
          px: 1,
          borderBottom: "1px solid #f1f5f9",
          pb: 0.5,
        }}
      >
        {barHeights.map((h, idx) => (
          <Stack
            key={idx}
            direction="row"
            spacing={0.5}
            alignItems="flex-end"
            sx={{ flex: 1, height: "100%", justifyContent: "center" }}
          >
            {/* Primary Bar */}
            <Skeleton
              variant="rounded"
              width="45%"
              height={`${h}%`}
              sx={{ borderRadius: "5px 5px 0 0", bgcolor: "#5B5FEF22" }}
              animation="wave"
            />
            {/* Secondary Comparison Bar */}
            <Skeleton
              variant="rounded"
              width="45%"
              height={`${Math.max(20, h - 25)}%`}
              sx={{ borderRadius: "5px 5px 0 0", bgcolor: "#f59e0b22" }}
              animation="wave"
            />
          </Stack>
        ))}
      </Box>

      {/* Axis Labels */}
      <Stack direction="row" sx={{ justifyContent: "space-around", px: 1 }}>
        {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((m) => (
          <Skeleton
            key={m}
            variant="rounded"
            width={30}
            height={10}
            sx={{ borderRadius: "3px" }}
            animation="wave"
          />
        ))}
      </Stack>
    </Box>
  );
};

/**
 * ChartCardSkeleton
 * Provides unified Skeleton UI for ChartCard widgets across the dashboard.
 * Matches 1:1 dimensions (height: 100%, p: 2.5, header + 220px canvas) ensuring zero CLS.
 */
const ChartCardSkeleton = ({ title = "Loading Chart...", type = "bar" }) => {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: "18px",
        border: "1px solid #eee",
        p: 2.5,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#ffffff",
      }}
    >
      {/* Header Row: Title & Chip Skeletons */}
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
        <Skeleton
          variant="rounded"
          width={150}
          height={20}
          sx={{ borderRadius: "4px" }}
          animation="wave"
        />
        <Skeleton
          variant="rounded"
          width={65}
          height={22}
          sx={{ borderRadius: "12px" }}
          animation="wave"
        />
      </Stack>

      {/* Chart Canvas Area (Strict 220px height) */}
      <Box sx={{ height: 220 }}>
        <ChartCanvasSkeleton type={type} />
      </Box>
    </Card>
  );
};

export default ChartCardSkeleton;
