import React from "react";
import { render, act, renderHook } from "@testing-library/react";
import {
  loadingManager,
  LoadingProvider,
  useLoading,
  useSmartLoading,
} from "./LoadingContext";

describe("LoadingManager & LoadingContext", () => {
  beforeEach(() => {
    loadingManager.reset();
  });

  test("tracks concurrent active requests correctly", () => {
    expect(loadingManager.getActiveRequests()).toBe(0);
    expect(loadingManager.isLoading()).toBe(false);

    // Request A starts -> 1
    loadingManager.startRequest();
    expect(loadingManager.getActiveRequests()).toBe(1);
    expect(loadingManager.isLoading()).toBe(true);

    // Request B starts -> 2
    loadingManager.startRequest();
    expect(loadingManager.getActiveRequests()).toBe(2);
    expect(loadingManager.isLoading()).toBe(true);

    // Request A finishes -> 1
    loadingManager.stopRequest();
    expect(loadingManager.getActiveRequests()).toBe(1);
    expect(loadingManager.isLoading()).toBe(true);

    // Request B finishes -> 0
    loadingManager.stopRequest();
    expect(loadingManager.getActiveRequests()).toBe(0);
    expect(loadingManager.isLoading()).toBe(false);
  });

  test("never allows activeRequests counter to become negative", () => {
    expect(loadingManager.getActiveRequests()).toBe(0);

    // Extra stopRequest calls
    loadingManager.stopRequest();
    expect(loadingManager.getActiveRequests()).toBe(0);
    expect(loadingManager.isLoading()).toBe(false);

    loadingManager.stopRequest();
    expect(loadingManager.getActiveRequests()).toBe(0);
    expect(loadingManager.isLoading()).toBe(false);
  });

  test("subscribe notifies registered listeners on state changes", () => {
    const listener = jest.fn();
    const unsubscribe = loadingManager.subscribe(listener);

    loadingManager.startRequest();
    expect(listener).toHaveBeenCalledWith(1, true);

    loadingManager.stopRequest();
    expect(listener).toHaveBeenCalledWith(0, false);

    unsubscribe();
    loadingManager.startRequest();
    expect(listener).toHaveBeenCalledTimes(2); // Not called after unsubscribe
  });

  test("useLoading hook reflects activeRequests and isLoading inside LoadingProvider", () => {
    const wrapper = ({ children }) => <LoadingProvider>{children}</LoadingProvider>;
    const { result } = renderHook(() => useLoading(), { wrapper });

    expect(result.current.activeRequests).toBe(0);
    expect(result.current.isLoading).toBe(false);

    act(() => {
      loadingManager.startRequest();
    });
    expect(result.current.activeRequests).toBe(1);
    expect(result.current.isLoading).toBe(true);

    act(() => {
      loadingManager.startRequest();
    });
    expect(result.current.activeRequests).toBe(2);
    expect(result.current.isLoading).toBe(true);

    act(() => {
      loadingManager.stopRequest();
    });
    expect(result.current.activeRequests).toBe(1);
    expect(result.current.isLoading).toBe(true);

    act(() => {
      loadingManager.stopRequest();
    });
    expect(result.current.activeRequests).toBe(0);
    expect(result.current.isLoading).toBe(false);
  });

  test("useSmartLoading intelligently distinguishes initial skeleton vs background refresh", () => {
    const wrapper = ({ children }) => <LoadingProvider>{children}</LoadingProvider>;

    // 1. Initial Load: no data, request is active -> showSkeleton = true, isBackgroundRefreshing = false
    const { result: initialRes } = renderHook(
      () => useSmartLoading(null, true),
      { wrapper }
    );
    expect(initialRes.current.showSkeleton).toBe(true);
    expect(initialRes.current.isInitialLoading).toBe(true);
    expect(initialRes.current.isBackgroundRefreshing).toBe(false);

    // 2. Initial Load with empty array: no data yet, request active -> showSkeleton = true
    const { result: emptyRes } = renderHook(
      () => useSmartLoading([], true),
      { wrapper }
    );
    expect(emptyRes.current.showSkeleton).toBe(true);
    expect(emptyRes.current.isBackgroundRefreshing).toBe(false);

    // 3. Background Refresh: data already present, request is active -> showSkeleton = false, isBackgroundRefreshing = true
    const existingData = [{ id: 1, name: "Electricity" }];
    const { result: bgRes } = renderHook(
      () => useSmartLoading(existingData, true),
      { wrapper }
    );
    expect(bgRes.current.showSkeleton).toBe(false);
    expect(bgRes.current.isInitialLoading).toBe(false);
    expect(bgRes.current.isBackgroundRefreshing).toBe(true);

    // 4. Idle: data present, request inactive -> showSkeleton = false, isBackgroundRefreshing = false
    const { result: idleRes } = renderHook(
      () => useSmartLoading(existingData, false),
      { wrapper }
    );
    expect(idleRes.current.showSkeleton).toBe(false);
    expect(idleRes.current.isBackgroundRefreshing).toBe(false);
  });
});
