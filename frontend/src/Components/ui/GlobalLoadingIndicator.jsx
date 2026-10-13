import React, { useState, useEffect, useRef } from "react";
import { Box, LinearProgress, Fade } from "@mui/material";
import { useLoading } from "../../context/LoadingContext";

export const SHOW_DELAY_MS = 150;
export const MIN_VISIBLE_MS = 450;

/**
 * GlobalLoadingIndicator
 * Thin, non-blocking MUI LinearProgress bar rendered at the top of the viewport.
 * Features:
 * - Anti-flicker: 150ms delay before showing (fast requests won't flash).
 * - Minimum display time: stays visible for at least 450ms once shown.
 * - Smooth MUI Fade transition.
 * - Non-blocking: pointerEvents set to "none" so UI interactions are never hindered.
 */
const GlobalLoadingIndicator = () => {
  const { isLoading } = useLoading();
  const [visible, setVisible] = useState(false);

  const showTimerRef = useRef(null);
  const hideTimerRef = useRef(null);
  const showStartTimeRef = useRef(null);

  useEffect(() => {
    if (isLoading) {
      // If a hide countdown was active, cancel it immediately so progress continues seamlessly
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }

      // If already visible, nothing to schedule
      if (visible) {
        return;
      }

      // Schedule showing after SHOW_DELAY_MS to ignore ultra-fast responses
      if (!showTimerRef.current) {
        showTimerRef.current = setTimeout(() => {
          showStartTimeRef.current = Date.now();
          setVisible(true);
          showTimerRef.current = null;
        }, SHOW_DELAY_MS);
      }
    } else {
      // Cancel pending show timer if request finished before SHOW_DELAY_MS elapsed
      if (showTimerRef.current) {
        clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
      }

      if (visible) {
        // Enforce MIN_VISIBLE_MS so the indicator doesn't appear and vanish abruptly
        const elapsed = showStartTimeRef.current
          ? Date.now() - showStartTimeRef.current
          : MIN_VISIBLE_MS;
        const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);

        if (hideTimerRef.current) {
          clearTimeout(hideTimerRef.current);
        }

        hideTimerRef.current = setTimeout(() => {
          setVisible(false);
          showStartTimeRef.current = null;
          hideTimerRef.current = null;
        }, remaining);
      }
    }
  }, [isLoading, visible]);

  // Timers cleanup on unmount
  useEffect(() => {
    return () => {
      if (showTimerRef.current) clearTimeout(showTimerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  return (
    <Fade in={visible} timeout={{ enter: 200, exit: 300 }} unmountOnExit>
      <Box
        data-testid="global-loading-indicator"
        data-visible={visible}
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: (theme) =>
            theme?.zIndex?.tooltip ? theme.zIndex.tooltip + 100 : 9999,
          pointerEvents: "none",
        }}
      >
        <LinearProgress
          sx={{
            height: 3,
            backgroundColor: "rgba(25, 118, 210, 0.15)",
            "& .MuiLinearProgress-bar": {
              borderRadius: "0 2px 2px 0",
              transition: "transform 0.2s linear",
            },
          }}
        />
      </Box>
    </Fade>
  );
};

export default GlobalLoadingIndicator;
