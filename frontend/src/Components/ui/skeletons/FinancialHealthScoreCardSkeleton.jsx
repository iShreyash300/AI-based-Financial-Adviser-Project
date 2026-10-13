import React from "react";
import { Card, CardContent, Box, Stack, Skeleton } from "@mui/material";

/**
 * FinancialHealthScoreCardSkeleton
 * 
 * Replicates the multi-section architecture of FinancialHealthScoreCard:
 * - Header banner (icon, title, period, status badge, refresh icon)
 * - Gauge & insight column (circular gauge, status pill, quote block, 4 quick stat pills)
 * - Metric Breakdown column (5 detailed progress rows with labels & percentages)
 * - Footer (auto-refresh notice & legend color keys)
 * 
 * Prevents CLS by preserving identical dimensions and responsive flex arrangements.
 */
const FinancialHealthScoreCardSkeleton = () => {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: "18px",
        boxShadow: "0 4px 32px rgba(0,0,0,0.10)",
        overflow: "hidden",
        width: "100%",
        background: "#ffffff",
        border: "1px solid #f1f5f9",
      }}
    >
      <CardContent sx={{ p: 0 }}>
        {/* ─── Card Header Skeleton ────────────────────────────────────────── */}
        <Box sx={{ px: { md: 3, xs: 1.5 }, py: 2.5, borderBottom: "1px solid #f8fafc" }}>
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
            {/* Title & Icon */}
            <Stack direction="row" alignItems="center" gap={1.5}>
              <Skeleton
                variant="rounded"
                width={38}
                height={38}
                sx={{ borderRadius: "10px" }}
                animation="wave"
              />
              <Box>
                <Skeleton
                  variant="text"
                  width={160}
                  height={22}
                  sx={{ transform: "none", borderRadius: "4px" }}
                  animation="wave"
                />
                <Skeleton
                  variant="text"
                  width={110}
                  height={15}
                  sx={{ mt: 0.5, transform: "none", borderRadius: "4px" }}
                  animation="wave"
                />
              </Box>
            </Stack>

            {/* Status Chip & Refresh Icon */}
            <Stack direction="row" alignItems="center" gap={1.5}>
              <Skeleton
                variant="rounded"
                width={70}
                height={26}
                sx={{ borderRadius: "13px" }}
                animation="wave"
              />
              <Skeleton
                variant="circular"
                width={24}
                height={24}
                animation="wave"
              />
            </Stack>
          </Stack>
        </Box>

        {/* ─── Card Body Skeleton ──────────────────────────────────────────── */}
        <Box sx={{ px: 3, py: 2.5 }}>
          <Stack
            sx={{
              flexDirection: { md: "row", xs: "column" },
              justifyContent: "space-around",
              gap: { xs: 4, md: 3 },
            }}
          >
            {/* Left Column: Gauge, Status & Quick Stats */}
            <Stack sx={{ flexDirection: "column", gap: 2.5, mb: 1, alignItems: { xs: "center", md: "flex-start" } }}>
              {/* Circular Gauge Placeholder */}
              <Box sx={{ position: "relative", width: 160, height: 160, mx: "auto" }}>
                <Skeleton
                  variant="circular"
                  width={160}
                  height={160}
                  animation="wave"
                  sx={{ bgcolor: "#f1f5f9" }}
                />
                {/* Inner Cutout */}
                <Box
                  sx={{
                    position: "absolute",
                    top: "12%",
                    left: "12%",
                    width: "76%",
                    height: "76%",
                    borderRadius: "50%",
                    bgcolor: "#ffffff",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Skeleton variant="text" width={48} height={36} sx={{ transform: "none" }} animation="wave" />
                  <Skeleton variant="text" width={32} height={14} sx={{ transform: "none", mt: 0.5 }} animation="wave" />
                </Box>
              </Box>

              {/* Status Pill below Gauge */}
              <Skeleton
                variant="rounded"
                width={140}
                height={28}
                sx={{ borderRadius: "10px", mx: "auto" }}
                animation="wave"
              />

              {/* Insight / Advice Quote Placeholder */}
              <Box sx={{ minWidth: { md: "22vw", xs: "100%" } }}>
                <Skeleton variant="text" width="90%" height={16} sx={{ transform: "none", mb: 0.5 }} animation="wave" />
                <Skeleton variant="text" width="70%" height={16} sx={{ transform: "none", mb: 2 }} animation="wave" />

                {/* 4 Quick Stat Pills */}
                <Stack direction="row" sx={{ gap: 1.2, flexWrap: "wrap" }}>
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton
                      key={i}
                      variant="rounded"
                      width={80}
                      height={44}
                      sx={{ borderRadius: "8px" }}
                      animation="wave"
                    />
                  ))}
                </Stack>
              </Box>
            </Stack>

            {/* Right Column: 5 Metric Breakdown Progress Bars */}
            <Stack sx={{ minWidth: { md: "40vw", xs: "100%" }, justifyContent: "space-evenly" }}>
              <Skeleton
                variant="text"
                width={160}
                height={18}
                sx={{ mb: 2, transform: "none", borderRadius: "4px" }}
                animation="wave"
              />

              <Stack sx={{ gap: 2.2 }}>
                {[1, 2, 3, 4, 5].map((idx) => (
                  <Box key={idx}>
                    {/* Metric Row Labels */}
                    <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 0.8 }}>
                      <Skeleton variant="text" width="35%" height={16} sx={{ transform: "none" }} animation="wave" />
                      <Skeleton variant="text" width="20%" height={16} sx={{ transform: "none" }} animation="wave" />
                    </Stack>
                    {/* Linear Progress Bar Skeleton */}
                    <Skeleton
                      variant="rounded"
                      width="100%"
                      height={8}
                      sx={{ borderRadius: "4px" }}
                      animation="wave"
                    />
                  </Box>
                ))}
              </Stack>
            </Stack>
          </Stack>

          {/* ─── Card Footer Skeleton ────────────────────────────────────────── */}
          <Stack
            sx={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px dashed #e5e7eb",
              mt: 2.5,
              pt: 2,
            }}
          >
            <Skeleton variant="text" width={140} height={16} sx={{ transform: "none" }} animation="wave" />
            <Stack direction="row" gap={2} alignItems="center">
              {[1, 2, 3].map((i) => (
                <Stack key={i} direction="row" alignItems="center" gap={0.5}>
                  <Skeleton variant="circular" width={10} height={10} animation="wave" />
                  <Skeleton variant="text" width={55} height={14} sx={{ transform: "none" }} animation="wave" />
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

export default FinancialHealthScoreCardSkeleton;
