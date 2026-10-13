import React from "react";
import { Card, CardContent, Stack, Skeleton } from "@mui/material";

/**
 * KpiCardSkeleton
 * 
 * Provides an exact dimensional replica of the KpiCard component during loading states.
 * Guarantees zero Cumulative Layout Shift (CLS) by matching padding, border radius,
 * font metric heights, and icon dimensions.
 */
const KpiCardSkeleton = () => {
  return (
    <Card
      elevation={0}
      sx={{
        flex: 1,
        borderRadius: "18px",
        border: "1px solid #eee",
        background: "#ffffff",
        mt: 1,
        minWidth: { xs: "100%", sm: "calc(50% - 24px)", lg: "calc(25% - 24px)" },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack
          sx={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Text Metrics Column */}
          <Stack sx={{ flex: 1, pr: 1 }}>
            {/* Title Skeleton (e.g. TOTAL REVENUE) */}
            <Skeleton
              variant="text"
              width="60%"
              height={14}
              sx={{ mb: 0.8, transform: "none", borderRadius: "4px" }}
              animation="wave"
            />

            {/* Metric Value Skeleton (e.g. ₹1,25,000) */}
            <Skeleton
              variant="rounded"
              width="75%"
              height={30}
              sx={{ my: 0.6, borderRadius: "6px" }}
              animation="wave"
            />

            {/* Subtitle / Percentage Row Skeleton */}
            <Stack direction="row" alignItems="center" gap={1} sx={{ mt: 0.6 }}>
              <Skeleton
                variant="rounded"
                width={42}
                height={16}
                sx={{ borderRadius: "4px" }}
                animation="wave"
              />
              <Skeleton
                variant="text"
                width="40%"
                height={14}
                sx={{ transform: "none", borderRadius: "4px" }}
                animation="wave"
              />
            </Stack>
          </Stack>

          {/* Right Icon Container Skeleton (44x44) */}
          <Skeleton
            variant="rounded"
            width={44}
            height={44}
            sx={{ borderRadius: "12px", flexShrink: 0 }}
            animation="wave"
          />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default KpiCardSkeleton;
