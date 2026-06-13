import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { axiosInstance } from "../utils";

const DEFAULT_LOGO_TEXT = "Classic Towers";
const LOGO_TEXT_MAX_LENGTH = 15;
const LOGO_TEXT_MIN_SIZE = 8;
const LOGO_TEXT_MAX_SIZE = 16;

const clampNumber = (value: unknown, min: number, max: number, fallback: number) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue >= min && numberValue <= max
    ? numberValue
    : fallback;
};

const normalizeLogoText = (value?: string) =>
  String(value || DEFAULT_LOGO_TEXT)
    .trim()
    .slice(0, LOGO_TEXT_MAX_LENGTH);

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

type BrandingContextType = {
  branding: DashboardBranding;
  setBranding: React.Dispatch<Partial<DashboardBranding> | null>;
};

const BrandingContext = createContext<BrandingContextType | undefined>(
  undefined
);

const normalizeBranding = (
  branding?: Partial<DashboardBranding> | null
): DashboardBranding => ({
  logoText: normalizeLogoText(branding?.logoText),
  logoIcon: branding?.logoIcon || null,
  logoIconEnabled: branding?.logoIconEnabled !== false,
  logoTextEnabled: branding?.logoTextEnabled !== false,
  logoTextSize: clampNumber(
    branding?.logoTextSize,
    LOGO_TEXT_MIN_SIZE,
    LOGO_TEXT_MAX_SIZE,
    12
  ),
  logoTextWidth:
    Number.isFinite(Number(branding?.logoTextWidth)) &&
    Number(branding?.logoTextWidth) >= 60 &&
    Number(branding?.logoTextWidth) <= 220
      ? Number(branding?.logoTextWidth)
      : 165,
  sidebarWidth:
    Number.isFinite(Number(branding?.sidebarWidth)) &&
    Number(branding?.sidebarWidth) >= 150 &&
    Number(branding?.sidebarWidth) <= 250
      ? Number(branding?.sidebarWidth)
      : 240,
  sidebarHeight:
    Number.isFinite(Number(branding?.sidebarHeight)) &&
    Number(branding?.sidebarHeight) >= 50 &&
    Number(branding?.sidebarHeight) <= 100
      ? Number(branding?.sidebarHeight)
      : 100,
});

declare global {
  interface Window {
    setDashboardBranding?: React.Dispatch<Partial<DashboardBranding> | null>;
  }
}

export const useBrandingContext = () => {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error("useBrandingContext must be used within BrandingProvider");
  }
  return context;
};

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [branding, setBrandingState] = useState<DashboardBranding>(() =>
    normalizeBranding()
  );

  const setBranding = useCallback(
    (value: Partial<DashboardBranding> | null) => {
      setBrandingState(normalizeBranding(value));
    },
    []
  );

  useEffect(() => {
    window.setDashboardBranding = setBranding;
    return () => {
      delete window.setDashboardBranding;
    };
  }, [setBranding]);

  useEffect(() => {
    document.documentElement.style.setProperty("--sidebar-width", `${branding.sidebarWidth}px`);
    document.documentElement.style.setProperty("--sidebar-height", `${branding.sidebarHeight}dvh`);
  }, [branding.sidebarWidth, branding.sidebarHeight]);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setBranding(null);
      return;
    }

    axiosInstance
      .get(`/users/${userId}`)
      .then(({ data }) => setBranding(data?.dashboardBranding))
      .catch(() => setBranding(null));
  }, [setBranding]);

  const value = useMemo(
    () => ({ branding, setBranding }),
    [branding, setBranding]
  );

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
};
