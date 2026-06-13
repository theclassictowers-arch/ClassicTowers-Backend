import type { DashboardBranding } from "./types";

export const LOGO_TEXT_MAX_LENGTH = 15;
export const LOGO_TEXT_MIN_SIZE = 8;
export const LOGO_TEXT_MAX_SIZE = 16;

export const DEFAULT_DASHBOARD_BRANDING: DashboardBranding = {
  logoText: "Classic Towers",
  logoIcon: null,
  logoIconEnabled: true,
  logoTextEnabled: true,
  logoTextSize: 12,
  logoTextWidth: 165,
  sidebarWidth: 240,
  sidebarHeight: 100,
};
