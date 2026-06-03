import axios from "axios";
import { jwtDecode, JwtPayload } from "jwt-decode";

const { VITE_API_BASE_URL } = import.meta.env;

declare global {
  interface Window {
    setDashboardTheme?: any;
    setDashboardPrimaryColor?: any;
  }
}

const clearSessionStorage = () => {
  localStorage.removeItem("userId");
  localStorage.removeItem("role");
  localStorage.removeItem("authToken");
  localStorage.removeItem("mapOpeningLocation");
  localStorage.removeItem("dashboardTheme");
  window.setDashboardTheme?.(null);
  window.setDashboardPrimaryColor?.(null);
};

export const axiosInstance = axios.create({
  baseURL: `${VITE_API_BASE_URL}/api/v1`,
  withCredentials: true,
  // No default "Content-Type" here
});

// Add request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    // 1. Set the correct Content-Type based on whether we're sending FormData
    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    // 2. Handle JWT expiration logic - get token from localStorage
    let token = localStorage.getItem("authToken");

    // Debug: log token status
    console.log("[Axios Interceptor] URL:", config.url, "| Token exists:", !!token);

    if (token) {
      try {
        const decodedToken = jwtDecode<JwtPayload>(token);
        if (decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
          // Token has expired, log out the user
          clearSessionStorage();
          window.location.href = "/login"; // Redirect to login page
          return Promise.reject(new Error("Token expired"));
        }
        // Token is valid, add Authorization header
        config.headers["Authorization"] = `Bearer ${token}`;
      } catch (error) {
        // Invalid token, remove it
        console.error("[Axios Interceptor] Invalid token, removing:", error);
        localStorage.removeItem("authToken");
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized, log out the user
      clearSessionStorage();
      window.location.href = "/login"; // Redirect to login page
    }
    return Promise.reject(error);
  }
);
