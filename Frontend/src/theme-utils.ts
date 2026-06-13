export type DashboardThemeColors = {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
};

export const APP_FONT_OPTIONS = [
  {
    label: "Arial",
    value: "\"Arial\", \"Helvetica\", sans-serif",
  },
  {
    label: "Courier New",
    value: "\"Courier New\", Courier, monospace",
  },
  {
    label: "Times New Roman",
    value: "\"Times New Roman\", Times, serif",
  },
  {
    label: "Calibri",
    value: "\"Calibri\", \"Arial\", sans-serif",
  },
  {
    label: "Verdana",
    value: "\"Verdana\", \"Arial\", sans-serif",
  },
] as const;

export const DEFAULT_APP_FONT = APP_FONT_OPTIONS[0].value;

export const normalizeAppFont = (value?: string | null): string =>
  APP_FONT_OPTIONS.some((font) => font.value === value)
    ? String(value)
    : DEFAULT_APP_FONT;

export const DEFAULT_DASHBOARD_THEME: DashboardThemeColors = {
  primaryColor: "#0b70c2",
  backgroundColor: "#f5f7fb",
  textColor: "#0f172a",
};

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
  textColor: normalizeHexColor(
    input?.textColor,
    DEFAULT_DASHBOARD_THEME.textColor
  ),
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
