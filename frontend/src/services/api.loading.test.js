import api from "./api";
import { loadingManager } from "../context/LoadingContext";

describe("api.js integration with LoadingManager", () => {
  let originalAdapter;

  beforeEach(() => {
    loadingManager.reset();
    localStorage.clear();
    originalAdapter = api.defaults.adapter;
  });

  afterEach(() => {
    api.defaults.adapter = originalAdapter;
    loadingManager.reset();
  });

  test("scenario 1: 1 successful request starts and stops loading", async () => {
    let requestsObservedDuringExecution = 0;

    api.defaults.adapter = async (config) => {
      requestsObservedDuringExecution = loadingManager.getActiveRequests();
      return {
        data: { success: true },
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      };
    };

    expect(loadingManager.getActiveRequests()).toBe(0);
    expect(loadingManager.isLoading()).toBe(false);

    const res = await api.get("/test-endpoint");

    expect(res.data).toEqual({ success: true });
    expect(requestsObservedDuringExecution).toBe(1);
    expect(loadingManager.getActiveRequests()).toBe(0);
    expect(loadingManager.isLoading()).toBe(false);
  });

  test("scenario 2: 1 failed request properly stops loading and never leaves state stuck", async () => {
    let requestsObservedDuringExecution = 0;

    api.defaults.adapter = async (config) => {
      requestsObservedDuringExecution = loadingManager.getActiveRequests();
      const error = new Error("Request failed with status code 500");
      error.config = config;
      error.response = {
        data: { message: "Internal server error" },
        status: 500,
        statusText: "Internal Server Error",
        headers: {},
        config,
      };
      throw error;
    };

    expect(loadingManager.getActiveRequests()).toBe(0);

    await expect(api.get("/fail-endpoint")).rejects.toThrow("Request failed with status code 500");

    expect(requestsObservedDuringExecution).toBe(1);
    expect(loadingManager.getActiveRequests()).toBe(0);
    expect(loadingManager.isLoading()).toBe(false);
  });

  test("scenario 3: 2 simultaneous requests maintain accurate counter and loading state", async () => {
    let resolverA, resolverB;
    const promiseA = new Promise((resolve) => {
      resolverA = resolve;
    });
    const promiseB = new Promise((resolve) => {
      resolverB = resolve;
    });

    api.defaults.adapter = async (config) => {
      if (config.url.includes("reqA")) {
        await promiseA;
        return { data: "resA", status: 200, statusText: "OK", headers: {}, config };
      }
      if (config.url.includes("reqB")) {
        await promiseB;
        return { data: "resB", status: 200, statusText: "OK", headers: {}, config };
      }
      return { data: "ok", status: 200, statusText: "OK", headers: {}, config };
    };

    const callA = api.get("/reqA");
    const callB = api.get("/reqB");

    // Both requests have started
    expect(loadingManager.getActiveRequests()).toBe(2);
    expect(loadingManager.isLoading()).toBe(true);

    // Resolve request A first
    resolverA();
    const resA = await callA;
    expect(resA.data).toBe("resA");

    // Counter drops to 1, still loading
    expect(loadingManager.getActiveRequests()).toBe(1);
    expect(loadingManager.isLoading()).toBe(true);

    // Resolve request B
    resolverB();
    const resB = await callB;
    expect(resB.data).toBe("resB");

    // Counter drops to 0, loading finished
    expect(loadingManager.getActiveRequests()).toBe(0);
    expect(loadingManager.isLoading()).toBe(false);
  });

  test("scenario 4: multiple successful requests track correctly", async () => {
    api.defaults.adapter = async (config) => {
      return {
        data: { url: config.url },
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      };
    };

    const promises = [
      api.get("/endpoint-1"),
      api.get("/endpoint-2"),
      api.get("/endpoint-3"),
      api.get("/endpoint-4"),
    ];

    expect(loadingManager.getActiveRequests()).toBe(4);
    expect(loadingManager.isLoading()).toBe(true);

    const results = await Promise.all(promises);
    expect(results).toHaveLength(4);

    expect(loadingManager.getActiveRequests()).toBe(0);
    expect(loadingManager.isLoading()).toBe(false);
  });

  test("scenario 5: mixed success and failure requests clean up completely", async () => {
    let resolveSuccess;
    const successPromise = new Promise((res) => {
      resolveSuccess = res;
    });

    let triggerFailure;
    const failureGate = new Promise((res) => {
      triggerFailure = res;
    });

    api.defaults.adapter = async (config) => {
      if (config.url.includes("success")) {
        await successPromise;
        return { data: { ok: true }, status: 200, statusText: "OK", headers: {}, config };
      }
      if (config.url.includes("failure")) {
        await failureGate;
        const err = new Error("Network error");
        err.config = config;
        throw err;
      }
      return { data: {}, status: 200, statusText: "OK", headers: {}, config };
    };

    const callSuccess = api.get("/success");
    const callFailure = api.get("/failure");

    expect(loadingManager.getActiveRequests()).toBe(2);
    expect(loadingManager.isLoading()).toBe(true);

    // Trigger failure first
    triggerFailure();
    await expect(callFailure).rejects.toThrow("Network error");

    // Counter is now 1 because success is still pending
    expect(loadingManager.getActiveRequests()).toBe(1);
    expect(loadingManager.isLoading()).toBe(true);

    // Trigger success
    resolveSuccess();
    const successRes = await callSuccess;
    expect(successRes.data).toEqual({ ok: true });

    // Both ended, counter back to 0
    expect(loadingManager.getActiveRequests()).toBe(0);
    expect(loadingManager.isLoading()).toBe(false);
  });

  test("preserves authorization token and headers correctly", async () => {
    localStorage.setItem("token", "Bearer test-jwt-token-123");

    let capturedHeaders = null;
    api.defaults.adapter = async (config) => {
      capturedHeaders = config.headers;
      return { data: { auth: true }, status: 200, statusText: "OK", headers: {}, config };
    };

    await api.get("/protected-route");

    expect(capturedHeaders.Authorization).toBe("Bearer test-jwt-token-123");
    expect(loadingManager.getActiveRequests()).toBe(0);
  });

  // ========================================================
  // TASK 13 SMART LOADING TESTS
  // ========================================================

  test("distinguishes INITIAL LOAD vs BACKGROUND REFRESH for an endpoint", async () => {
    let initialLoadsObserved = 0;
    let backgroundRefreshesObserved = 0;

    api.defaults.adapter = async (config) => {
      initialLoadsObserved = loadingManager.getActiveInitialLoads();
      backgroundRefreshesObserved = loadingManager.getActiveBackgroundRefreshes();
      return { data: { count: 10 }, status: 200, statusText: "OK", headers: {}, config };
    };

    // First call: initial load
    expect(loadingManager.hasEndpointLoaded("/reports/summary")).toBe(false);
    await api.get("/reports/summary");

    expect(initialLoadsObserved).toBe(1);
    expect(backgroundRefreshesObserved).toBe(0);
    expect(loadingManager.hasEndpointLoaded("/reports/summary")).toBe(true);

    // Second call: background refresh
    await api.get("/reports/summary");

    expect(initialLoadsObserved).toBe(0);
    expect(backgroundRefreshesObserved).toBe(1);
    expect(loadingManager.getActiveRequests()).toBe(0);
  });

  test("USER ACTIONS (POST, PUT, DELETE) do NOT trigger global LinearProgress loader", async () => {
    let globalLoadingDuringPost = null;
    let userActionActiveDuringPost = null;

    api.defaults.adapter = async (config) => {
      globalLoadingDuringPost = loadingManager.isLoading();
      userActionActiveDuringPost = loadingManager.isUserActionLoading();
      return { data: { success: true, id: "123" }, status: 201, statusText: "Created", headers: {}, config };
    };

    const promise = api.post("/expenses", { title: "Test", amount: 100 });

    // User action is active, but global loader remains false
    expect(loadingManager.isUserActionLoading()).toBe(true);
    expect(loadingManager.isLoading()).toBe(false);

    await promise;

    expect(globalLoadingDuringPost).toBe(false);
    expect(userActionActiveDuringPost).toBe(true);
    expect(loadingManager.getActiveUserActions()).toBe(0);
    expect(loadingManager.isLoading()).toBe(false);
  });

  test("handles background polling (e.g. FinancialHealthScoreCard) smoothly", async () => {
    api.defaults.adapter = async (config) => {
      return {
        data: { success: true, data: { score: 85 } },
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      };
    };

    // 1. Initial fetch
    await api.get("/financial-health");
    expect(loadingManager.hasEndpointLoaded("/financial-health")).toBe(true);

    // 2. Background polling interval trigger (30s later)
    let isBgRefresh = false;
    let isGlobalLoading = false;

    api.defaults.adapter = async (config) => {
      isBgRefresh = loadingManager.getActiveBackgroundRefreshes() > 0;
      isGlobalLoading = loadingManager.isLoading();
      return {
        data: { success: true, data: { score: 87 } },
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      };
    };

    const pollPromise = api.get("/financial-health");
    expect(loadingManager.getActiveBackgroundRefreshes()).toBe(1);
    expect(loadingManager.isLoading()).toBe(true);

    await pollPromise;
    expect(isBgRefresh).toBe(true);
    expect(isGlobalLoading).toBe(true);
    expect(loadingManager.getActiveRequests()).toBe(0);
  });
});
