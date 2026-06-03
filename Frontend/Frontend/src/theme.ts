import { RefineThemes } from "@refinedev/mui";
import {
  alpha,
  createTheme,
  darken,
  lighten,
  responsiveFontSizes,
} from "@mui/material/styles";
import gray from "@mui/material/colors/grey";

export type DashboardThemeColors = {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
};

export const DEFAULT_DASHBOARD_THEME: DashboardThemeColors = {
  primaryColor: "#0b70c2",
  backgroundColor: "#f5f7fb",
  textColor: "#0f172a",
};

export type DashboardThemePreset = {
  id: string;
  name: string;
  description: string;
  colors: DashboardThemeColors;
};

export const DASHBOARD_THEME_PRESETS: DashboardThemePreset[] = [
  {
    id: "tower-blue",
    name: "Tower Blue",
    description: "Clean control-room blue",
    colors: DEFAULT_DASHBOARD_THEME,
  },
  {
    id: "emerald-grid",
    name: "Emerald Grid",
    description: "Fresh, technical, and calm",
    colors: {
      primaryColor: "#059669",
      backgroundColor: "#f0fdf4",
      textColor: "#052e16",
    },
  },
  {
    id: "graphite-cyan",
    name: "Graphite Cyan",
    description: "Sharp dark dashboard feel",
    colors: {
      primaryColor: "#06b6d4",
      backgroundColor: "#111827",
      textColor: "#f8fafc",
    },
  },
  {
    id: "solar-amber",
    name: "Solar Amber",
    description: "Warm highlights with crisp text",
    colors: {
      primaryColor: "#d97706",
      backgroundColor: "#fffbeb",
      textColor: "#451a03",
    },
  },
  {
    id: "royal-indigo",
    name: "Royal Indigo",
    description: "Premium and focused",
    colors: {
      primaryColor: "#4f46e5",
      backgroundColor: "#eef2ff",
      textColor: "#111827",
    },
  },
  {
    id: "ruby-night",
    name: "Ruby Night",
    description: "Bold monitoring contrast",
    colors: {
      primaryColor: "#e11d48",
      backgroundColor: "#18181b",
      textColor: "#fafafa",
    },
  },
  {
    id: "teal-slate",
    name: "Teal Slate",
    description: "Modern and balanced",
    colors: {
      primaryColor: "#0f766e",
      backgroundColor: "#f8fafc",
      textColor: "#0f172a",
    },
  },
];

const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6})$/;

const normalizeHexColor = (
  value: string | null | undefined,
  fallback: string
): string => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();

  if (!HEX_COLOR_REGEX.test(normalized)) {
    return fallback;
  }

  return normalized;
};

export const normalizePrimaryColor = (value?: string | null): string =>
  normalizeHexColor(value, DEFAULT_DASHBOARD_THEME.primaryColor);

export const normalizeDashboardTheme = (
  input?: Partial<DashboardThemeColors> | null
): DashboardThemeColors => ({
  primaryColor: normalizeHexColor(
    input?.primaryColor,
    DEFAULT_DASHBOARD_THEME.primaryColor
  ),
  backgroundColor: normalizeHexColor(
    input?.backgroundColor,
    DEFAULT_DASHBOARD_THEME.backgroundColor
  ),
  textColor: normalizeHexColor(input?.textColor, DEFAULT_DASHBOARD_THEME.textColor),
});

export const isDefaultDashboardTheme = (
  input?: Partial<DashboardThemeColors> | null
): boolean => {
  const normalized = normalizeDashboardTheme(input);
  return (
    normalized.primaryColor === DEFAULT_DASHBOARD_THEME.primaryColor &&
    normalized.backgroundColor === DEFAULT_DASHBOARD_THEME.backgroundColor &&
    normalized.textColor === DEFAULT_DASHBOARD_THEME.textColor
  );
};

const LightTheme = createTheme({
  ...RefineThemes.Blue,
  components: {
    ...RefineThemes.Blue.components,
    MuiChip: {
      styleOverrides: {
        labelSmall: {
          lineHeight: "18px",
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        "main.MuiBox-root": {
          backgroundColor: gray[100],
        },
        body: {
          backgroundColor: "#000",
        },
      },
    },
    MuiTypography: {
      defaultProps: {
        variant: "body2",
      },
    },
  },
});

const DarkTheme = createTheme({
  ...RefineThemes.Blue,
  components: {
    ...RefineThemes.Blue.components,
    MuiChip: {
      styleOverrides: {
        labelSmall: {
          lineHeight: "18px",
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        "main.MuiBox-root": {
          backgroundColor: gray[100],
        },
        body: {
          backgroundColor: gray[100],
        },
      },
    },
    MuiTypography: {
      defaultProps: {
        variant: "body2",
      },
    },
  },
});

const DarkThemeWithResponsiveFontSizes = responsiveFontSizes(DarkTheme);
const LightThemeWithResponsiveFontSizes = responsiveFontSizes(LightTheme);

export const createAppTheme = (
  mode: "light" | "dark",
  dashboardThemeInput?: Partial<DashboardThemeColors> | null
) => {
  // Keep original app look when no explicit custom theme is active.
  if (!dashboardThemeInput || isDefaultDashboardTheme(dashboardThemeInput)) {
    return mode === "light"
      ? LightThemeWithResponsiveFontSizes
      : DarkThemeWithResponsiveFontSizes;
  }

  const dashboardTheme = normalizeDashboardTheme(dashboardThemeInput);
  const primaryColor = dashboardTheme.primaryColor;
  const backgroundColor = dashboardTheme.backgroundColor;
  const textColor = dashboardTheme.textColor;
  const paperBackground =
    mode === "dark" ? darken(backgroundColor, 0.12) : lighten(backgroundColor, 0.03);

  const baseTheme = createTheme({
    ...RefineThemes.Blue,
    palette: {
      ...RefineThemes.Blue.palette,
      mode,
      primary: {
        ...RefineThemes.Blue.palette.primary,
        main: primaryColor,
        light: lighten(primaryColor, 0.18),
        dark: darken(primaryColor, 0.22),
        contrastText: "#ffffff",
      },
      background: {
        default: backgroundColor,
        paper: paperBackground,
      },
      text: {
        primary: textColor,
        secondary: alpha(textColor, 0.74),
      },
    },
    components: {
      ...RefineThemes.Blue.components,
      MuiChip: {
        styleOverrides: {
          labelSmall: {
            lineHeight: "18px",
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          "main.MuiBox-root": {
            backgroundColor,
          },
          body: {
            backgroundColor,
            color: textColor,
          },
        },
      },
      MuiTypography: {
        defaultProps: {
          variant: "body2",
        },
      },
    },
  });

  return responsiveFontSizes(baseTheme);
};

export { LightThemeWithResponsiveFontSizes, DarkThemeWithResponsiveFontSizes };
