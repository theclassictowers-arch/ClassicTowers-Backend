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
  DEFAULT_APP_FONT,
  DEFAULT_DASHBOARD_THEME,
  isDefaultDashboardTheme,
  normalizeAppFont,
  normalizeDashboardTheme,
  normalizePrimaryColor,
  type DashboardThemeColors,
} from "../theme";

const DASHBOARD_THEME_STORAGE_KEY = "dashboardTheme";
const APP_FONT_STORAGE_KEY = "appFontFamily";
type ColorModePreference = "light" | "dark" | "device";

declare global {
  interface Window {
    setDashboardPrimaryColor?: any;
    setDashboardTheme?: any;
    setDashboardAppearanceMode?: any;
    setDashboardFont?: any;
  }
}

interface ColorModeContextType {
  mode: "light" | "dark";
  modePreference: ColorModePreference;
  setModePreference: React.Dispatch<ColorModePreference>;
  toggleMode: () => void;
  dashboardTheme: DashboardThemeColors;
  setDashboardTheme: any;
  primaryColor: string;
  setPrimaryColor: any;
  fontFamily: string;
  setFontFamily: React.Dispatch<string>;
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
  const getSystemMode = () =>
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  const [systemMode, setSystemMode] = useState<"light" | "dark">(
    getSystemMode
  );
  const [modePreference, setModePreferenceState] =
    useState<ColorModePreference>(() => {
      const localMode = localStorage.getItem("colorMode") as
        | ColorModePreference
        | null;
      return localMode === "light" || localMode === "dark" || localMode === "device"
        ? localMode
        : "device";
  });
  const mode = modePreference === "device" ? systemMode : modePreference;
  const [dashboardTheme, setDashboardThemeState] = useState<DashboardThemeColors | null>(
    () => getStoredDashboardTheme()
  );
  const [fontFamily, setFontFamilyState] = useState<string>(() =>
    normalizeAppFont(localStorage.getItem(APP_FONT_STORAGE_KEY) || DEFAULT_APP_FONT)
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
    setModePreferenceState((prev) => {
      const resolvedMode = prev === "device" ? getSystemMode() : prev;
      return resolvedMode === "light" ? "dark" : "light";
    });
  }, []);

  const setModePreference = useCallback((preference: ColorModePreference) => {
    setModePreferenceState(
      preference === "light" || preference === "dark" || preference === "device"
        ? preference
        : "device"
    );
  }, []);

  const setPrimaryColor = useCallback(
    (color: string) => {
      setDashboardTheme({
        primaryColor: normalizePrimaryColor(color),
      });
    },
    [setDashboardTheme]
  );

  const setFontFamily = useCallback((value: string) => {
    setFontFamilyState(normalizeAppFont(value));
  }, []);

  useEffect(() => {
    localStorage.setItem("colorMode", modePreference);
  }, [modePreference]);

  useEffect(() => {
    localStorage.setItem(APP_FONT_STORAGE_KEY, fontFamily);
  }, [fontFamily]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => setSystemMode(mediaQuery.matches ? "dark" : "light");

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

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
    document.documentElement.style.setProperty(
      "--app-bg-color",
      resolvedDashboardTheme.backgroundColor
    );
  }, [resolvedDashboardTheme.backgroundColor]);

  useEffect(() => {
    document.documentElement.style.setProperty("--app-font-family", fontFamily);
  }, [fontFamily]);

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

    window.setDashboardAppearanceMode = (preference: ColorModePreference) => {
      setModePreference(preference);
    };

    window.setDashboardFont = (font: string | null) => {
      setFontFamily(font || DEFAULT_APP_FONT);
    };

    return () => {
      delete window.setDashboardPrimaryColor;
      delete window.setDashboardTheme;
      delete window.setDashboardAppearanceMode;
      delete window.setDashboardFont;
    };
  }, [setDashboardTheme, setFontFamily, setModePreference]);

  const value = useMemo(
    () => ({
      mode,
      modePreference,
      setModePreference,
      toggleMode,
      dashboardTheme: resolvedDashboardTheme,
      setDashboardTheme,
      primaryColor,
      setPrimaryColor,
      fontFamily,
      setFontFamily,
    }),
    [
      mode,
      modePreference,
      setModePreference,
      toggleMode,
      resolvedDashboardTheme,
      setDashboardTheme,
      primaryColor,
      setPrimaryColor,
      fontFamily,
      setFontFamily,
    ]
  );
  const theme = useMemo(
    () => createAppTheme(mode, dashboardTheme, fontFamily),
    [mode, dashboardTheme, fontFamily]
  );

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  );
};
