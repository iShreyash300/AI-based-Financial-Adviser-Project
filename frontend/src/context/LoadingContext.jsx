import React, { createContext, useContext, useEffect, useState } from "react";

// ==========================================
// Centralized Smart Request-Tracking Loading Manager
// Usable both outside React (api.js interceptors) and inside React
// ==========================================

class LoadingManager {
  constructor() {
    this.activeRequests = 0; // Total active requests
    this.activeGlobalRequests = 0; // Data fetch requests (GET: initial load + background refresh)
    this.activeUserActions = 0; // User actions (POST, PUT, PATCH, DELETE mutations)
    this.activeInitialLoads = 0; // Requests where endpoint has no loaded data yet
    this.activeBackgroundRefreshes = 0; // Requests where endpoint has already loaded data before
    this.loadedEndpoints = new Set(); // Set of endpoints that have completed at least one successful fetch
    this.listeners = new Set();
  }

  // Increment active requests counter
  startRequest = (meta = {}) => {
    const parsedMeta = typeof meta === "string" ? { type: meta } : meta;
    const type = parsedMeta.type || "fetch";

    this.activeRequests += 1;

    if (type === "userAction") {
      this.activeUserActions += 1;
    } else {
      // Data fetch request (drives global progress indicator)
      this.activeGlobalRequests += 1;

      if (type === "backgroundRefresh") {
        this.activeBackgroundRefreshes += 1;
      } else {
        // Default to initialLoad for first-time or general fetches
        this.activeInitialLoads += 1;
      }
    }

    this.notify();
    return this.activeRequests;
  };

  // Decrement active requests counter, ensuring it never drops below 0
  stopRequest = (meta = {}) => {
    const parsedMeta = typeof meta === "string" ? { type: meta } : meta;
    const type = parsedMeta.type || "fetch";

    this.activeRequests = Math.max(0, this.activeRequests - 1);

    if (type === "userAction") {
      this.activeUserActions = Math.max(0, this.activeUserActions - 1);
    } else {
      this.activeGlobalRequests = Math.max(0, this.activeGlobalRequests - 1);

      if (type === "backgroundRefresh") {
        this.activeBackgroundRefreshes = Math.max(
          0,
          this.activeBackgroundRefreshes - 1
        );
      } else {
        this.activeInitialLoads = Math.max(
          0,
          this.activeInitialLoads - 1
        );
      }
    }

    this.notify();
    return this.activeRequests;
  };

  // Endpoint loading status tracking
  markEndpointLoaded = (endpointKey) => {
    if (endpointKey) {
      this.loadedEndpoints.add(endpointKey.toLowerCase());
      this.notify();
    }
  };

  hasEndpointLoaded = (endpointKey) => {
    if (!endpointKey) return false;
    return this.loadedEndpoints.has(endpointKey.toLowerCase());
  };

  clearLoadedEndpoints = () => {
    this.loadedEndpoints.clear();
    this.notify();
  };

  // Safe reset in case of unhandled edge cases / component unmounts
  reset = () => {
    this.activeRequests = 0;
    this.activeGlobalRequests = 0;
    this.activeUserActions = 0;
    this.activeInitialLoads = 0;
    this.activeBackgroundRefreshes = 0;
    this.loadedEndpoints.clear();
    this.notify();
  };

  // Get current active request counts
  getActiveRequests = () => {
    return this.activeRequests;
  };

  getActiveGlobalRequests = () => {
    return this.activeGlobalRequests;
  };

  getActiveUserActions = () => {
    return this.activeUserActions;
  };

  getActiveInitialLoads = () => {
    return this.activeInitialLoads;
  };

  getActiveBackgroundRefreshes = () => {
    return this.activeBackgroundRefreshes;
  };

  // Boolean indicator whether global data-fetching indicator should show (excludes user actions)
  isLoading = () => {
    return this.activeGlobalRequests > 0;
  };

  isUserActionLoading = () => {
    return this.activeUserActions > 0;
  };

  isInitialLoading = () => {
    return this.activeInitialLoads > 0;
  };

  isBackgroundRefreshing = () => {
    return this.activeBackgroundRefreshes > 0;
  };

  // Subscribe callback listener to active request changes
  subscribe = (listener) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  // Snapshot of current state for React
  getState = () => {
    return {
      activeRequests: this.activeRequests,
      activeGlobalRequests: this.activeGlobalRequests,
      activeUserActions: this.activeUserActions,
      activeInitialLoads: this.activeInitialLoads,
      activeBackgroundRefreshes: this.activeBackgroundRefreshes,
      isLoading: this.isLoading(),
      isGlobalLoading: this.isLoading(),
      isUserActionLoading: this.isUserActionLoading(),
      isInitialLoading: this.isInitialLoading(),
      isBackgroundRefreshing: this.isBackgroundRefreshing(),
    };
  };

  // Notify all registered listeners
  notify = () => {
    this.listeners.forEach((listener) => {
      try {
        listener(this.activeRequests, this.isLoading());
      } catch (err) {
        console.error("Error in loading manager listener:", err);
      }
    });
  };
}

// Singleton instance accessible across the entire application and by api.js
export const loadingManager = new LoadingManager();

// ==========================================
// React Context & Provider
// ==========================================

export const LoadingContext = createContext({
  activeRequests: 0,
  activeGlobalRequests: 0,
  activeUserActions: 0,
  activeInitialLoads: 0,
  activeBackgroundRefreshes: 0,
  isLoading: false,
  isGlobalLoading: false,
  isUserActionLoading: false,
  isInitialLoading: false,
  isBackgroundRefreshing: false,
  hasEndpointLoaded: () => false,
  markEndpointLoaded: () => {},
  startRequest: () => {},
  stopRequest: () => {},
  reset: () => {},
});

export const LoadingProvider = ({ children }) => {
  const [loadingState, setLoadingState] = useState(loadingManager.getState());

  useEffect(() => {
    // Subscribe to loadingManager updates
    const unsubscribe = loadingManager.subscribe(() => {
      setLoadingState(loadingManager.getState());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const value = {
    ...loadingState,
    hasEndpointLoaded: loadingManager.hasEndpointLoaded,
    markEndpointLoaded: loadingManager.markEndpointLoaded,
    startRequest: loadingManager.startRequest,
    stopRequest: loadingManager.stopRequest,
    reset: loadingManager.reset,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

// Custom Hook to consume global loading state in any React component
export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};

/**
 * useSmartLoading
 * Smart helper hook for components to distinguish:
 * - INITIAL LOAD: Component has no data yet -> show Skeleton
 * - BACKGROUND REFRESH: Component already has data -> keep content visible, show global LinearProgress
 * - USER ACTION: Button-level mutation -> no global page loader
 *
 * @param {any} data - Current component data
 * @param {boolean} [isFetching] - Optional local or global fetching flag
 * @returns {{ isInitialLoading: boolean, isBackgroundRefreshing: boolean, showSkeleton: boolean, hasData: boolean }}
 */
export const useSmartLoading = (data, isFetching) => {
  const { isGlobalLoading } = useLoading();
  const active = typeof isFetching === "boolean" ? isFetching : isGlobalLoading;

  const hasData =
    data !== null &&
    data !== undefined &&
    (!Array.isArray(data) || data.length > 0);

  return {
    isInitialLoading: active && !hasData,
    isBackgroundRefreshing: active && hasData,
    showSkeleton: active && !hasData,
    hasData,
  };
};

export default LoadingContext;
