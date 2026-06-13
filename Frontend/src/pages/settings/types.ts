import type { DashboardThemeColors } from "../../theme";

export type DashboardBranding = {
  logoText: string;
  logoIcon: string | null;
  logoIconEnabled: boolean;
  logoTextEnabled: boolean;
  logoTextSize: number;
  logoTextWidth: number;
  sidebarWidth: number;
  sidebarHeight: number;
};

export type OrganizationUser = {
  _id: string;
  name: string;
  dashboardTheme?: Partial<DashboardThemeColors>;
  dashboardBranding?: DashboardBranding;
  dashboardFont?: string;
  dashboardAppearanceMode?: "light" | "dark" | "device";
};
