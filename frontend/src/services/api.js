import axios from "axios";
import { loadingManager } from "../context/LoadingContext";

const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

export const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (isLocalhost
    ? "http://localhost:5000/api"
    : "https://ai-based-financial-adviser-project-v1.onrender.com/api");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper to determine whether a request is a user action (Save, Add, Update, Delete)
export const isUserActionRequest = (config) => {
  if (config?.userAction !== undefined) return Boolean(config.userAction);
  const method = (config?.method || "get").toLowerCase();
  return ["post", "put", "patch", "delete"].includes(method);
};

// Helper to extract clean endpoint key for tracking initial vs background loads
export const getEndpointKey = (config) => {
  const url = config?.url || "";
  return url.split("?")[0].toLowerCase();
};

// Request interceptor: tracks loading and automatically injects auth token from localStorage
api.interceptors.request.use(
  (config) => {
    const isAction = isUserActionRequest(config);
    const endpointKey = getEndpointKey(config);

    // Classify request: userAction vs backgroundRefresh vs initialLoad
    let requestType = "initialLoad";
    if (isAction) {
      requestType = "userAction";
    } else if (loadingManager.hasEndpointLoaded(endpointKey)) {
      requestType = "backgroundRefresh";
    } else {
      requestType = "initialLoad";
    }

    const requestMeta = {
      type: requestType,
      endpointKey,
      url: config.url,
      method: (config.method || "get").toUpperCase(),
    };

    config._loadingMeta = requestMeta;
    config._loadingTracked = true;

    loadingManager.startRequest(requestMeta);

    try {
      const token = localStorage.getItem("token");
      // Preserve existing Authorization header if explicitly set; otherwise attach stored token
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = token;
      }
      return config;
    } catch (err) {
      if (config._loadingTracked) {
        loadingManager.stopRequest(config._loadingMeta);
        config._loadingTracked = false;
      }
      throw err;
    }
  },
  (error) => {
    if (error?.config?._loadingTracked) {
      loadingManager.stopRequest(error.config._loadingMeta);
      error.config._loadingTracked = false;
    }
    return Promise.reject(error);
  },
  { synchronous: true }
);

// Response interceptor: stops loading tracking, passes response through unchanged and forwards errors
api.interceptors.response.use(
  (response) => {
    const meta = response?.config?._loadingMeta || {};
    if (response?.config?._loadingTracked) {
      loadingManager.stopRequest(meta);
      response.config._loadingTracked = false;
    }

    // When a GET data fetch succeeds, mark endpoint as loaded for subsequent background refresh identification
    if (
      meta.endpointKey &&
      meta.type !== "userAction" &&
      response?.status >= 200 &&
      response?.status < 300
    ) {
      loadingManager.markEndpointLoaded(meta.endpointKey);
    }

    // Retain standard Axios response so caller code contracts (response.data) remain identical
    return response;
  },
  (error) => {
    const meta = error?.config?._loadingMeta || {};
    if (error?.config?._loadingTracked) {
      loadingManager.stopRequest(meta);
      error.config._loadingTracked = false;
    }
    // Failed requests do not mark endpoint as loaded, so retries can remain initial loads if needed
    // Keep error.response intact so existing catch blocks (e.g. err.response?.data?.message) function as expected
    return Promise.reject(error);
  }
);

export default api;
