import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { ThemeProvider } from "@mui/material/styles";
import {
  createAppTheme,
  DEFAULT_DASHBOARD_THEME,
  isDefaultDashboardTheme,
  normalizeDashboardTheme,
  normalizePrimaryColor,
  type DashboardThemeColors,
} from "../theme";

const DASHBOARD_THEME_STORAGE_KEY = "dashboardTheme";

declare global {
  interface Window {
    setDashboardPrimaryColor?: any;
    setDashboardTheme?: any;
  }
}

interface ColorModeContextType {
  mode: "light" | "dark";
  toggleMode: () => void;
  dashboardTheme: DashboardThemeColors;
  setDashboardTheme: any;
  primaryColor: string;
  setPrimaryColor: any;
}

export const ColorModeContext = createContext<ColorModeContextType | undefined>(
  undefined
);

export const useColorModeContext = (): ColorModeContextType => {
  const context = useContext(ColorModeContext);
  if (!context)
    throw new Error("useColorMode must be used within a ContextProvider");
  return context;
};

const getStoredDashboardTheme = (): DashboardThemeColors | null => {
  const raw = localStorage.getItem(DASHBOARD_THEME_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<DashboardThemeColors>;
    const normalized = normalizeDashboardTheme(parsed);
    return isDefaultDashboardTheme(normalized) ? null : normalized;
  } catch {
    return null;
  }
};

export const ColorModeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mode, setMode] = useState<"light" | "dark">(() => {
    const localMode = localStorage.getItem("colorMode") as
      | "light"
      | "dark"
      | null;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    return localMode ?? (prefersDark ? "dark" : "light");
  });
  const [dashboardTheme, setDashboardThemeState] = useState<DashboardThemeColors | null>(
    () => getStoredDashboardTheme()
  );
  const resolvedDashboardTheme = dashboardTheme || DEFAULT_DASHBOARD_THEME;
  const primaryColor = resolvedDashboardTheme.primaryColor;

  const setDashboardTheme = useCallback((theme: Partial<DashboardThemeColors>) => {
    setDashboardThemeState((prev) => {
      const normalized = normalizeDashboardTheme({
        ...(prev || DEFAULT_DASHBOARD_THEME),
        ...theme,
      });

      return isDefaultDashboardTheme(normalized) ? null : normalized;
    });
  }, []);

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const setPrimaryColor = useCallback(
    (color: string) => {
      setDashboardTheme({
        primaryColor: normalizePrimaryColor(color),
      });
    },
    [setDashboardTheme]
  );

  useEffect(() => {
    localStorage.setItem("colorMode", mode);
  }, [mode]);

  useEffect(() => {
    if (!dashboardTheme) {
      localStorage.removeItem(DASHBOARD_THEME_STORAGE_KEY);
      return;
    }

    localStorage.setItem(
      DASHBOARD_THEME_STORAGE_KEY,
      JSON.stringify(dashboardTheme)
    );
  }, [dashboardTheme]);

  useEffect(() => {
    window.setDashboardPrimaryColor = (color: string | null) => {
      if (!color) {
        setDashboardThemeState(null);
        return;
      }

      setDashboardTheme({
        primaryColor: normalizePrimaryColor(color),
      });
    };

    window.setDashboardTheme = (
      theme: Partial<DashboardThemeColors> | null
    ) => {
      if (!theme) {
        setDashboardThemeState(null);
        return;
      }

      const normalized = normalizeDashboardTheme(theme);
      setDashboardThemeState(
        isDefaultDashboardTheme(normalized) ? null : normalized
      );
    };

    return () => {
      delete window.setDashboardPrimaryColor;
      delete window.setDashboardTheme;
    };
  }, [setDashboardTheme]);

  const value = useMemo(
    () => ({
      mode,
      toggleMode,
      dashboardTheme: resolvedDashboardTheme,
      setDashboardTheme,
      primaryColor,
      setPrimaryColor,
    }),
    [
      mode,
      toggleMode,
      resolvedDashboardTheme,
      setDashboardTheme,
      primaryColor,
      setPrimaryColor,
    ]
  );
  const theme = useMemo(
    () => createAppTheme(mode, dashboardTheme),
    [mode, dashboardTheme]
  );

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  );
};
