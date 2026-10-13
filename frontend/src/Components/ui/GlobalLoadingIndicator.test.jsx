import React from "react";
import { render, screen, act } from "@testing-library/react";
import GlobalLoadingIndicator, { SHOW_DELAY_MS, MIN_VISIBLE_MS } from "./GlobalLoadingIndicator";
import { LoadingProvider, loadingManager } from "../../context/LoadingContext";

describe("GlobalLoadingIndicator", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    loadingManager.reset();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
      loadingManager.reset();
    });
    jest.useRealTimers();
  });

  const renderComponent = () =>
    render(
      <LoadingProvider>
        <GlobalLoadingIndicator />
      </LoadingProvider>
    );

  test("does NOT show indicator initially when activeRequests is 0", () => {
    renderComponent();
    expect(screen.queryByTestId("global-loading-indicator")).not.toBeInTheDocument();
  });

  test("does NOT show indicator for ultra-fast requests (< 150ms)", () => {
    renderComponent();

    // Start request
    act(() => {
      loadingManager.startRequest();
    });

    // Advance 100ms (less than SHOW_DELAY_MS)
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(screen.queryByTestId("global-loading-indicator")).not.toBeInTheDocument();

    // Finish request
    act(() => {
      loadingManager.stopRequest();
    });

    // Advance past SHOW_DELAY_MS
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(screen.queryByTestId("global-loading-indicator")).not.toBeInTheDocument();
  });

  test("shows indicator after 150ms delay for ongoing request", () => {
    renderComponent();

    act(() => {
      loadingManager.startRequest();
    });

    // 140ms: still not visible
    act(() => {
      jest.advanceTimersByTime(140);
    });
    expect(screen.queryByTestId("global-loading-indicator")).not.toBeInTheDocument();

    // +20ms: total 160ms (exceeds SHOW_DELAY_MS) -> visible
    act(() => {
      jest.advanceTimersByTime(20);
    });
    const indicator = screen.getByTestId("global-loading-indicator");
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveAttribute("data-visible", "true");
  });

  test("enforces minimum visible time (450ms) once shown before hiding", () => {
    renderComponent();

    // Start request
    act(() => {
      loadingManager.startRequest();
    });

    // Wait until it appears (150ms)
    act(() => {
      jest.advanceTimersByTime(SHOW_DELAY_MS + 20);
    });
    const indicator = screen.getByTestId("global-loading-indicator");
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveAttribute("data-visible", "true");

    // Request finishes quickly after becoming visible (e.g., 50ms later)
    act(() => {
      jest.advanceTimersByTime(50);
      loadingManager.stopRequest();
    });

    // Should STILL be visible because MIN_VISIBLE_MS has not elapsed
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(screen.getByTestId("global-loading-indicator")).toHaveAttribute("data-visible", "true");

    // Advance past remaining MIN_VISIBLE_MS
    act(() => {
      jest.advanceTimersByTime(MIN_VISIBLE_MS);
    });
    // Now visible state is false and element is faded out (opacity: 0)
    const hiddenIndicator = screen.getByTestId("global-loading-indicator");
    expect(hiddenIndicator).toHaveAttribute("data-visible", "false");
    expect(hiddenIndicator).toHaveStyle("opacity: 0");
  });

  test("handles multiple simultaneous requests correctly", () => {
    renderComponent();

    // Start Request 1
    act(() => {
      loadingManager.startRequest();
    });

    // Wait until visible
    act(() => {
      jest.advanceTimersByTime(SHOW_DELAY_MS + 20);
    });
    expect(screen.getByTestId("global-loading-indicator")).toHaveAttribute("data-visible", "true");

    // Start Request 2
    act(() => {
      loadingManager.startRequest();
    });

    // Finish Request 1 (Request 2 still active)
    act(() => {
      loadingManager.stopRequest();
    });

    // Indicator must stay visible because activeRequests > 0
    act(() => {
      jest.advanceTimersByTime(MIN_VISIBLE_MS + 100);
    });
    expect(screen.getByTestId("global-loading-indicator")).toHaveAttribute("data-visible", "true");

    // Finish Request 2
    act(() => {
      loadingManager.stopRequest();
    });

    // Advances past MIN_VISIBLE_MS: indicator transitions to hidden
    act(() => {
      jest.advanceTimersByTime(MIN_VISIBLE_MS);
    });
    const hiddenIndicator = screen.getByTestId("global-loading-indicator");
    expect(hiddenIndicator).toHaveAttribute("data-visible", "false");
    expect(hiddenIndicator).toHaveStyle("opacity: 0");
  });

  test("has pointer-events none to ensure non-blocking UI", () => {
    renderComponent();

    act(() => {
      loadingManager.startRequest();
    });
    act(() => {
      jest.advanceTimersByTime(SHOW_DELAY_MS + 20);
    });

    const indicator = screen.getByTestId("global-loading-indicator");
    expect(indicator).toHaveStyle("pointer-events: none");
  });
});
