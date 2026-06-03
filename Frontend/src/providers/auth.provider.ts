import type { AuthProvider } from "@refinedev/core";
import { axiosInstance } from "../utils";
import {
  isDefaultDashboardTheme,
  normalizeDashboardTheme,
} from "../theme";

const { VITE_API_BASE_URL } = import.meta.env;
const DASHBOARD_THEME_STORAGE_KEY = "dashboardTheme";

declare global {
  interface Window {
    setDashboardPrimaryColor?: any;
    setDashboardTheme?: any;
  }
}

const syncDashboardTheme = (dashboardTheme: any) => {
  if (dashboardTheme === undefined || dashboardTheme === null) {
    localStorage.removeItem(DASHBOARD_THEME_STORAGE_KEY);
    window.setDashboardTheme?.(null);
    window.setDashboardPrimaryColor?.(null);
    return;
  }

  const parsedTheme = normalizeDashboardTheme(dashboardTheme);
  if (isDefaultDashboardTheme(parsedTheme)) {
    localStorage.removeItem(DASHBOARD_THEME_STORAGE_KEY);
    window.setDashboardTheme?.(null);
    window.setDashboardPrimaryColor?.(null);
    return;
  }

  localStorage.setItem(
    DASHBOARD_THEME_STORAGE_KEY,
    JSON.stringify(parsedTheme)
  );

  if (window.setDashboardTheme) {
    window.setDashboardTheme(parsedTheme);
    return;
  }

  if (window.setDashboardPrimaryColor) {
    window.setDashboardPrimaryColor(parsedTheme.primaryColor);
  }
};

export const useAuthProvider = (confirm: () => Promise<boolean>): AuthProvider => {
  return {
    login: async ({ email, password }) => {
      try {
        const { data } = await axiosInstance.post("/signin", {
          email,
          password,
        });

        const { userId, role, token, dashboardTheme } = data;
        localStorage.setItem("userId", userId);
        localStorage.setItem("role", role);
        if (token) {
          localStorage.setItem("authToken", token);
        }
        syncDashboardTheme(dashboardTheme);
        if (data?.mapOpeningLocation) {
          localStorage.setItem(
            "mapOpeningLocation",
            JSON.stringify(data.mapOpeningLocation)
          );
        } else {
          localStorage.removeItem("mapOpeningLocation");
        }

        // Update the role in the AuthContext
        if (window.setAuthRole) {
          window.setAuthRole(role);
        }

        return {
          success: true,
          redirectTo: "/",
          successNotification: {
            message: "Successfully logged in",
            description: "Welcome back!",
            type: "success",
          },
        };
      } catch (error) {
        return {
          success: false,
          error: {
            name: "Login Error",
            message:
              (error as any).response?.data?.message || "Unknown error occurred",
          },
        };
      }
    },

    register: async ({ name, email, password, role, teamLead }) => {
      try {
        await axiosInstance.post("/signup", {
          name,
          email,
          password,
          role,
          teamLead,
        });

        return {
          success: true,
          successNotification: {
            message: "Successfully registered!",
            description: "Check your email for verification",
            type: "success",
          },
        };
      } catch (error) {
        return {
          success: false,
          error: {
            name: "Register Error",
            message:
              (error as any).response?.data?.message || "Unknown error occurred",
          },
        };
      }
    },

    updatePassword: async ({ token, newPassword }) => {
      try {
        await axiosInstance.post("/reset-password", { token, newPassword });

        return {
          success: true,
          redirectTo: "/login",
          successNotification: {
            message: "Password reset successfully",
            description: "You can now login with your new password",
            type: "success",
          },
        };
      } catch (error) {
        return {
          success: false,
          error: {
            name: "Reset Password Error",
            message:
              (error as any).response?.data?.message ||
              "Invalid or expired reset token",
          },
        };
      }
    },

    forgotPassword: async ({ email }) => {
      try {
        await axiosInstance.post("/forgot-password", { email });

        return {
          success: true,
          successNotification: {
            message: "Password reset email sent",
            description: "Please check your inbox for reset link",
            type: "success",
          },
        };
      } catch (error) {
        return {
          success: false,
          error: {
            name: "Forgot Password Error",
            message:
              (error as any).response?.data?.message ||
              "Failed to send reset email",
          },
        };
      }
    },

    logout: async () => {
      const confirmed = await confirm();

      if (!confirmed) {
        // Return success without redirect to silently cancel (no error notification)
        return {
          success: true,
        };
      }

      const userId = localStorage.getItem("userId");

      if (userId) {
        try {
          await axiosInstance.post("/signout");
        } catch {
          // Silently ignore API errors - still proceed with logout
        }
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
        localStorage.removeItem("authToken");
        localStorage.removeItem("mapOpeningLocation");
        localStorage.removeItem(DASHBOARD_THEME_STORAGE_KEY);
        window.setDashboardTheme?.(null);
        window.setDashboardPrimaryColor?.(null);
      }

      return {
        success: true,
        redirectTo: "/login",
      };
    },

    onError: async (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
        localStorage.removeItem("authToken");
        localStorage.removeItem("mapOpeningLocation");
        localStorage.removeItem(DASHBOARD_THEME_STORAGE_KEY);
        window.setDashboardTheme?.(null);
        window.setDashboardPrimaryColor?.(null);
        return {
          logout: true,
          redirectTo: "/login",
        };
      }

      return { error };
    },

    check: async () => {
      try {
        const userId = localStorage.getItem("userId");

        if (!userId) {
          return {
            authenticated: false,
            logout: true,
          };
        }
        return {
          authenticated: true,
          logout: false,
        };
      } catch {
        return {
          authenticated: false,
          logout: true,
        };
      }
    },

    getPermissions: async () => null,

    getIdentity: async () => {
      const getRandomAvatar = () =>
        `https://randomuser.me/api/portraits/${
          Math.random() > 0.5 ? "men" : "women"
        }/${Math.floor(Math.random() * 99)}.jpg`;

      try {
        const userId = localStorage.getItem("userId");

        if (!userId) {
          return {
            id: 1,
            name: "N/A",
            avatar: getRandomAvatar(),
          };
        }

        const user = await axiosInstance.get(`/users/${userId}`);

        const { data } = user;
        if (!user) {
          return null;
        }
        if (data?.mapOpeningLocation) {
          localStorage.setItem(
            "mapOpeningLocation",
            JSON.stringify(data.mapOpeningLocation)
          );
        } else {
          localStorage.removeItem("mapOpeningLocation");
        }
        syncDashboardTheme(data?.dashboardTheme);

        const name = data.name || "N/A";
        const avatar =
          `${VITE_API_BASE_URL}${data.profilePicture}` || getRandomAvatar();

        return {
          id: 1,
          name,
          avatar,
        };
      } catch {
        return {
          id: 1,
          name: "N/A",
          avatar: getRandomAvatar(),
        };
      }
    },
  };
};
