import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FontDownloadOutlinedIcon from "@mui/icons-material/FontDownloadOutlined";
import CheckIcon from "@mui/icons-material/Check";
import ColorizeOutlinedIcon from "@mui/icons-material/ColorizeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import DevicesOutlinedIcon from "@mui/icons-material/DevicesOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { alpha } from "@mui/material/styles";
import { useNotification } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import {
  useAuthContext,
  useBrandingContext,
  useColorModeContext,
} from "../../contexts";
import { axiosInstance } from "../../utils";
import { formStyles } from "../auth/styles";
import { MapBackgroundPage } from "../../components/map-background-page";
import { ShowPageLogo } from "../../components/map-table-page";
import {
  DARK_DASHBOARD_THEME_PRESETS,
  DEFAULT_APP_FONT,
  DEFAULT_DASHBOARD_THEME,
  DEVICE_DASHBOARD_THEME_PRESETS,
  LIGHT_DASHBOARD_THEME_PRESETS,
  normalizeAppFont,
  normalizeDashboardTheme,
  type DashboardThemeColors,
} from "../../theme";
import {
  DEFAULT_DASHBOARD_BRANDING,
  LOGO_TEXT_MAX_LENGTH,
  LOGO_TEXT_MAX_SIZE,
  LOGO_TEXT_MIN_SIZE,
} from "./constants";
import { SettingsFontSection } from "./components/SettingsFontSection";
import { SettingsLogoSection } from "./components/SettingsLogoSection";
import type { DashboardBranding, OrganizationUser } from "./types";

const clampNumber = (
  value: unknown,
  min: number,
  max: number,
  fallback: number
) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) &&
    numberValue >= min &&
    numberValue <= max
    ? numberValue
    : fallback;
};

const normalizeLogoText = (value?: string) =>
  String(value || DEFAULT_DASHBOARD_BRANDING.logoText)
    .trim()
    .slice(0, LOGO_TEXT_MAX_LENGTH);

const isHexColor = (value: string) => /^#([A-Fa-f0-9]{6})$/.test(value.trim());

const areSameTheme = (
  first: DashboardThemeColors,
  second: DashboardThemeColors
) =>
  first.primaryColor.toLowerCase() === second.primaryColor.toLowerCase() &&
  first.backgroundColor.toLowerCase() ===
    second.backgroundColor.toLowerCase() &&
  first.textColor.toLowerCase() === second.textColor.toLowerCase();

const APPEARANCE_MODE_OPTIONS = [
  { value: "light", label: "Light", icon: LightModeOutlinedIcon },
  { value: "dark", label: "Dark", icon: DarkModeOutlinedIcon },
  { value: "device", label: "Device", icon: DevicesOutlinedIcon },
] as const;

type AppearanceMode = (typeof APPEARANCE_MODE_OPTIONS)[number]["value"];

const getPresetGradient = (colors: DashboardThemeColors) =>
  `conic-gradient(${colors.primaryColor} 0 25%, ${colors.textColor} 25% 50%, ${colors.backgroundColor} 50% 75%, ${alpha(
    colors.primaryColor,
    0.34
  )} 75% 100%)`;

const getAppearanceThemePresets = (modePreference: AppearanceMode) => {
  if (modePreference === "dark") return DARK_DASHBOARD_THEME_PRESETS;
  if (modePreference === "device") return DEVICE_DASHBOARD_THEME_PRESETS;
  return LIGHT_DASHBOARD_THEME_PRESETS;
};

const getAppearanceThemeLabel = (modePreference: AppearanceMode) => {
  if (modePreference === "dark") return "Dark Themes";
  if (modePreference === "device") return "System Themes";
  return "Light Themes";
};

const normalizeAppearanceMode = (value?: string | null): AppearanceMode =>
  value === "light" || value === "dark" || value === "device"
    ? value
    : "device";

export const SettingsPage: React.FC = () => {
  const { role } = useAuthContext();
  const {
    dashboardTheme,
    fontFamily,
    modePreference,
    setDashboardTheme,
    setFontFamily,
    setModePreference,
  } = useColorModeContext();
  const { setBranding } = useBrandingContext();
  const { open } = useNotification();
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("userId");
  const canManageSettings = Boolean(role);
  const canManageLogo = role === "admin";

  const [organizations, setOrganizations] = useState<OrganizationUser[]>([]);
  const [loadingOrganizations, setLoadingOrganizations] = useState(false);
  const [selectedTargetUserId, setSelectedTargetUserId] = useState(
    currentUserId || ""
  );
  const [themeInput, setThemeInput] =
    useState<DashboardThemeColors>(dashboardTheme);
  const [loadingTheme, setLoadingTheme] = useState(false);
  const [brandingInput, setBrandingInput] = useState<DashboardBranding>(
    DEFAULT_DASHBOARD_BRANDING
  );
  const [logoIconFile, setLogoIconFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showCustomTheme, setShowCustomTheme] = useState(false);
  const [activeSection, setActiveSection] = useState<
    "colors" | "fonts" | "logo"
  >(
    "colors"
  );
  const [fontInput, setFontInput] = useState(fontFamily);
  const [appearanceModeInput, setAppearanceModeInput] =
    useState<AppearanceMode>(modePreference);
  const appearanceThemePresets = useMemo(
    () => getAppearanceThemePresets(appearanceModeInput),
    [appearanceModeInput]
  );

  useEffect(() => {
    setThemeInput(dashboardTheme);
  }, [dashboardTheme]);

  useEffect(() => {
    setFontInput(fontFamily);
  }, [fontFamily]);

  useEffect(() => {
    if (!canManageSettings || role !== "admin") return;

    const fetchOrganizations = async () => {
      setLoadingOrganizations(true);
      try {
        const response = await axiosInstance.get("/users?role=organization");
        const orgUsers = (response.data?.data || []).filter(
          (user: any) => user?.role === "organization"
        );
        setOrganizations(orgUsers);
      } catch {
        open?.({
          type: "error",
          message: "Failed to load organizations",
          description: "Please refresh and try again.",
        });
      } finally {
        setLoadingOrganizations(false);
      }
    };

    fetchOrganizations();
  }, [canManageSettings, open, role]);

  useEffect(() => {
    if (!canManageLogo && activeSection === "logo") {
      setActiveSection("colors");
    }
  }, [activeSection, canManageLogo]);

  const targetUserId = useMemo(() => {
    if (!currentUserId) return "";
    return role === "organization" ? currentUserId : selectedTargetUserId;
  }, [currentUserId, role, selectedTargetUserId]);

  useEffect(() => {
    if (targetUserId === currentUserId) {
      setAppearanceModeInput(modePreference);
    }
  }, [currentUserId, modePreference, targetUserId]);

  useEffect(() => {
    if (!canManageSettings || !targetUserId) return;

    const fetchTheme = async () => {
      setLoadingTheme(true);
      try {
        const response = await axiosInstance.get(`/users/${targetUserId}`);
        const targetAppearanceMode = normalizeAppearanceMode(
          response.data?.dashboardAppearanceMode
        );
        const targetFont = response.data?.dashboardFont
          ? normalizeAppFont(response.data.dashboardFont)
          : targetUserId === currentUserId
            ? fontFamily
            : DEFAULT_APP_FONT;
        setThemeInput(normalizeDashboardTheme(response.data?.dashboardTheme));
        setAppearanceModeInput(targetAppearanceMode);
        setFontInput(targetFont);
        if (targetUserId === currentUserId) {
          setModePreference(targetAppearanceMode);
          setFontFamily(targetFont);
        }
        setBrandingInput({
          logoText: normalizeLogoText(response.data?.dashboardBranding?.logoText),
          logoIcon: response.data?.dashboardBranding?.logoIcon || null,
          logoIconEnabled:
            response.data?.dashboardBranding?.logoIconEnabled !== false,
          logoTextEnabled:
            response.data?.dashboardBranding?.logoTextEnabled !== false,
          logoTextSize: clampNumber(
            response.data?.dashboardBranding?.logoTextSize,
            LOGO_TEXT_MIN_SIZE,
            LOGO_TEXT_MAX_SIZE,
            DEFAULT_DASHBOARD_BRANDING.logoTextSize
          ),
          logoTextWidth: clampNumber(
            response.data?.dashboardBranding?.logoTextWidth,
            60,
            220,
            DEFAULT_DASHBOARD_BRANDING.logoTextWidth
          ),
          sidebarWidth: clampNumber(
            response.data?.dashboardBranding?.sidebarWidth,
            150,
            250,
            DEFAULT_DASHBOARD_BRANDING.sidebarWidth
          ),
          sidebarHeight: clampNumber(
            response.data?.dashboardBranding?.sidebarHeight,
            50,
            100,
            DEFAULT_DASHBOARD_BRANDING.sidebarHeight
          ),
        });
        setLogoIconFile(null);
      } catch {
        setThemeInput(DEFAULT_DASHBOARD_THEME);
        setBrandingInput(DEFAULT_DASHBOARD_BRANDING);
        setLogoIconFile(null);
      } finally {
        setLoadingTheme(false);
      }
    };

    fetchTheme();
  }, [
    canManageSettings,
    currentUserId,
    setFontFamily,
    setModePreference,
    targetUserId,
  ]);

  if (!canManageSettings || !currentUserId) {
    return null;
  }

  const handleChangeThemeInput = (
    key: keyof DashboardThemeColors,
    value: string
  ) => {
    setShowCustomTheme(true);
    setThemeInput((prev) => ({ ...prev, [key]: value }));
  };

  const handleSelectPreset = (colors: DashboardThemeColors) => {
    setShowCustomTheme(false);
    setThemeInput(normalizeDashboardTheme(colors));
  };

  const handleSelectAppearanceMode = (nextMode: AppearanceMode) => {
    const nextPresets = getAppearanceThemePresets(nextMode);
    const selectedTheme = normalizeDashboardTheme(themeInput);
    const currentThemeExistsInMode = nextPresets.some((preset) =>
      areSameTheme(selectedTheme, preset.colors)
    );

    setAppearanceModeInput(nextMode);
    if (targetUserId === currentUserId) {
      setModePreference(nextMode);
    }

    if (!currentThemeExistsInMode && nextPresets[0]) {
      setThemeInput(normalizeDashboardTheme(nextPresets[0].colors));
      setShowCustomTheme(false);
    }
  };

  const validateTheme = () => {
    if (
      !isHexColor(themeInput.primaryColor) ||
      !isHexColor(themeInput.backgroundColor) ||
      !isHexColor(themeInput.textColor)
    ) {
      open?.({
        type: "error",
        message: "Invalid color",
        description: "Use hex colors like #0b70c2.",
      });
      return false;
    }

    return true;
  };

  const handleSaveColors = async () => {
    if (!validateTheme()) return;
    if (!targetUserId) return;

    const payload = normalizeDashboardTheme(themeInput);
    setIsSaving(true);
    try {
      try {
        await axiosInstance.patch(
          `/users/${targetUserId}/dashboard-theme`,
          payload
        );
        await axiosInstance.patch(`/users/${targetUserId}`, {
          dashboardTheme: payload,
          dashboardAppearanceMode: appearanceModeInput,
        });
      } catch (error: unknown) {
        const statusCode = (error as { response?: { status?: number } })
          ?.response?.status;
        if (statusCode !== 404) {
          throw error;
        }

        await axiosInstance.patch(`/users/${targetUserId}`, {
          dashboardTheme: payload,
          dashboardAppearanceMode: appearanceModeInput,
        });
      }

      setThemeInput(payload);
      if (targetUserId === currentUserId) {
        setDashboardTheme(payload);
        setModePreference(appearanceModeInput);
      }
      setOrganizations((prev) =>
        prev.map((org) =>
          org._id === targetUserId
            ? {
                ...org,
                dashboardTheme: payload,
                dashboardAppearanceMode: appearanceModeInput,
              }
            : org
        )
      );

      open?.({
        type: "success",
        message: "Color settings saved",
        description: "Dashboard colors updated successfully.",
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      open?.({
        type: "error",
        message: "Failed to save settings",
        description: err.response?.data?.message || "Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveFontSettings = async () => {
    if (!targetUserId) return;
    const normalizedFont = normalizeAppFont(fontInput);
    setIsSaving(true);
    try {
      await axiosInstance.patch(`/users/${targetUserId}`, {
        dashboardFont: normalizedFont,
      });
      setFontInput(normalizedFont);
      if (targetUserId === currentUserId) {
        setFontFamily(normalizedFont);
      }
      setOrganizations((prev) =>
        prev.map((org) =>
          org._id === targetUserId
            ? { ...org, dashboardFont: normalizedFont }
            : org
        )
      );
      open?.({
        type: "success",
        message: "Font settings saved",
        description: "Dashboard font updated successfully.",
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      open?.({
        type: "error",
        message: "Failed to save font settings",
        description: err.response?.data?.message || "Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBranding = async () => {
    if (!canManageLogo) return;
    if (!targetUserId) return;
    const logoText = normalizeLogoText(brandingInput.logoText);
    const logoTextSize = clampNumber(
      brandingInput.logoTextSize,
      LOGO_TEXT_MIN_SIZE,
      LOGO_TEXT_MAX_SIZE,
      DEFAULT_DASHBOARD_BRANDING.logoTextSize
    );
    const logoTextWidth = clampNumber(
      brandingInput.logoTextWidth,
      60,
      220,
      DEFAULT_DASHBOARD_BRANDING.logoTextWidth
    );
    const sidebarWidth = clampNumber(
      brandingInput.sidebarWidth,
      150,
      250,
      DEFAULT_DASHBOARD_BRANDING.sidebarWidth
    );
    const sidebarHeight = clampNumber(
      brandingInput.sidebarHeight,
      50,
      100,
      DEFAULT_DASHBOARD_BRANDING.sidebarHeight
    );

    if (brandingInput.logoTextEnabled && !logoText) {
      open?.({
        type: "error",
        message: "Logo text is required",
        description: "Enter the sidebar name before saving.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const createBrandingData = (useFallback = false) => {
        const brandingData = new FormData();
        brandingData.append("logoText", logoText);
        brandingData.append(
          "logoIconEnabled",
          String(brandingInput.logoIconEnabled)
        );
        brandingData.append(
          "logoTextEnabled",
          String(brandingInput.logoTextEnabled)
        );
        brandingData.append("logoTextSize", `${logoTextSize}`);
        brandingData.append(
          "logoTextWidth",
          String(logoTextWidth)
        );
        brandingData.append("sidebarWidth", String(sidebarWidth));
        brandingData.append("sidebarHeight", String(sidebarHeight));
        if (useFallback) {
          brandingData.append("dashboardBrandingUpdate", "true");
        }
        if (logoIconFile) {
          brandingData.append("logoIcon", logoIconFile);
        }
        return brandingData;
      };

      let response;
      try {
        response = await axiosInstance.patch(
          `/users/${targetUserId}/dashboard-branding`,
          createBrandingData()
        );
      } catch (error: unknown) {
        const statusCode = (error as { response?: { status?: number } })
          .response?.status;
        if (statusCode !== 404) {
          throw error;
        }

        response = await axiosInstance.patch(
          `/users/${targetUserId}`,
          createBrandingData(true)
        );
      }
      const savedBranding = response.data?.dashboardBranding || {
        ...brandingInput,
        logoText,
        logoTextSize,
        logoTextWidth,
        sidebarWidth,
        sidebarHeight,
      };

      const normalizedSavedBranding = {
        ...savedBranding,
        logoText: normalizeLogoText(savedBranding.logoText),
        logoTextSize,
        logoTextWidth,
        sidebarWidth,
        sidebarHeight,
      };

      setBrandingInput(normalizedSavedBranding);
      setLogoIconFile(null);
      if (targetUserId === currentUserId) {
        setBranding(normalizedSavedBranding);
      }
      setOrganizations((prev) =>
        prev.map((org) =>
          org._id === targetUserId
            ? { ...org, dashboardBranding: normalizedSavedBranding }
            : org
        )
      );

      open?.({
        type: "success",
        message: "Logo settings saved",
        description: "Sidebar logo and text updated successfully.",
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      open?.({
        type: "error",
        message: "Failed to save logo settings",
        description: err.response?.data?.message || "Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MapBackgroundPage>
      <Box
        className="map-table-page-shell"
        sx={{
          width: "100%",
          minHeight: "100dvh",
          boxSizing: "border-box",
          overflowY: "auto",
          px: { xs: 0.75, sm: 1.25, md: 1.5 },
          pl: { xs: 0.75, sm: 1.25, md: "76px" },
          py: { xs: 0.75, sm: 1.25 },
        }}
      >
        <Box
          component="form"
          sx={{
            ...formStyles.container,
            mx: "auto",
            my: 0,
            width: "100%",
            maxWidth: 660,
            boxSizing: "border-box",
            px: { xs: 1.5, sm: 2, md: 2.5 },
            py: { xs: 1.5, sm: 2 },
            borderRadius: { xs: 1.5, sm: 2 },
            overflow: "visible",
          }}
          onSubmit={(event) => {
            event.preventDefault();
            if (activeSection === "colors") {
              handleSaveColors();
            } else if (activeSection === "fonts") {
              handleSaveFontSettings();
            } else if (canManageLogo) {
              handleSaveBranding();
            }
          }}
        >
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="h5" gutterBottom sx={formStyles.title}>
              Settings
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: role === "admin" ? "1fr" : "auto",
              justifyContent: "center",
              mb: 1,
            }}
          >
            {role === "admin" ? (
              <FormControl fullWidth size="small" sx={{ maxWidth: 360 }}>
                <InputLabel id="settings-target-label">Target</InputLabel>
                <Select
                  labelId="settings-target-label"
                  label="Target"
                  value={selectedTargetUserId}
                  disabled={loadingOrganizations}
                  onChange={(event) =>
                    setSelectedTargetUserId(String(event.target.value))
                  }
                >
                  <MenuItem value={currentUserId}>My Account (Admin)</MenuItem>
                  {organizations.map((org) => (
                    <MenuItem key={org._id} value={org._id}>
                      {org.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Typography sx={{ textAlign: "center", color: "text.secondary" }}>
                My Account
              </Typography>
            )}
          </Box>

          {loadingTheme ? (
            <Box sx={{ py: 3, display: "flex", justifyContent: "center" }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Stack spacing={1.5} sx={{ mt: 1.5 }}>
              <Tabs
                value={activeSection}
                onChange={(_, value: "colors" | "fonts" | "logo") =>
                  setActiveSection(value)
                }
                variant="fullWidth"
                sx={{
                  minHeight: 44,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1.5,
                  bgcolor: "background.paper",
                  "& .MuiTab-root": {
                    minHeight: 44,
                    fontWeight: 700,
                    textTransform: "none",
                  },
                }}
              >
                <Tab
                  value="colors"
                  icon={<PaletteOutlinedIcon />}
                  iconPosition="start"
                  label="Appearance"
                />
                <Tab
                  value="fonts"
                  icon={<FontDownloadOutlinedIcon />}
                  iconPosition="start"
                  label="Font"
                />
                {canManageLogo && (
                  <Tab
                    value="logo"
                    icon={<ImageOutlinedIcon />}
                    iconPosition="start"
                    label="Logo"
                  />
                )}
              </Tabs>

              {activeSection === "colors" && (
                <Box
                  key="colors"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                    transformOrigin: "center top",
                    animation:
                      "settingsTabEnter 420ms cubic-bezier(0.16, 1, 0.3, 1) both",
                  }}
                >
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        mb: 1,
                        fontWeight: 700,
                        color: "text.primary",
                        textAlign: "center",
                      }}
                    >
                      Appearance
                    </Typography>
                    <Box
                      sx={{
                        alignItems: "center",
                        bgcolor: "background.paper",
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 999,
                        display: "grid",
                        gap: 0.5,
                        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                        maxWidth: 470,
                        mx: "auto",
                        p: 0.5,
                        width: "100%",
                      }}
                    >
                      {APPEARANCE_MODE_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        const isSelected =
                          appearanceModeInput === option.value;
                        return (
                          <Button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              handleSelectAppearanceMode(option.value)
                            }
                            startIcon={<Icon />}
                            sx={{
                              borderRadius: 999,
                              boxShadow: isSelected
                                ? (theme) =>
                                    `0 0 0 2px ${alpha(
                                      theme.palette.primary.main,
                                      0.24
                                    )}`
                                : "none",
                              color: isSelected
                                ? "primary.contrastText"
                                : "text.primary",
                              fontWeight: 800,
                              minHeight: 44,
                              px: { xs: 1, sm: 2 },
                              textTransform: "none",
                              bgcolor: isSelected
                                ? "primary.main"
                                : "transparent",
                              "&:hover": {
                                bgcolor: isSelected
                                  ? "primary.dark"
                                  : "action.hover",
                              },
                            }}
                          >
                            {option.label}
                          </Button>
                        );
                      })}
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      alignItems: "start",
                      display: "grid",
                      gap: 2,
                      gridTemplateColumns: {
                        xs: "1fr",
                        md: "max-content",
                      },
                      justifyContent: "center",
                      justifyItems: "center",
                      mx: "auto",
                      width: "100%",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        gridColumn: "1 / -1",
                        fontWeight: 700,
                        color: "text.primary",
                        textAlign: "center",
                      }}
                    >
                      {getAppearanceThemeLabel(appearanceModeInput)}
                    </Typography>
                    <Box
                      sx={{
                        display: "grid",
                        gap: 1.5,
                        gridTemplateColumns: {
                          xs: "repeat(2, 108px)",
                          sm: "repeat(4, 108px)",
                          md: "repeat(4, 108px)",
                        },
                        justifyContent: "center",
                        mx: "auto",
                        width: "100%",
                      }}
                    >
                    {appearanceThemePresets.map((preset) => {
                      const isSelected = areSameTheme(
                        normalizeDashboardTheme(themeInput),
                        preset.colors
                      );

                      return (
                        <Button
                          key={preset.id}
                          aria-label={preset.name}
                          type="button"
                          onClick={() => handleSelectPreset(preset.colors)}
                          sx={{
                            aspectRatio: "1 / 1",
                            bgcolor: "action.hover",
                            border: "1px solid",
                            borderColor: isSelected
                              ? "primary.main"
                              : "divider",
                            borderRadius: 2,
                            minWidth: 0,
                            p: 0,
                            position: "relative",
                            "&:hover": {
                              bgcolor: "action.selected",
                              borderColor: "primary.main",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              background: getPresetGradient(preset.colors),
                              border: "1px solid",
                              borderColor: alpha("#000000", 0.14),
                              borderRadius: "50%",
                              height: 64,
                              width: 64,
                            }}
                          />
                          {isSelected && (
                            <Box
                              sx={{
                                alignItems: "center",
                                bgcolor: "primary.main",
                                border: "2px solid",
                                borderColor: "background.paper",
                                borderRadius: "50%",
                                color: "primary.contrastText",
                                display: "flex",
                                height: 30,
                                justifyContent: "center",
                                position: "absolute",
                                right: 12,
                                top: 12,
                                width: 30,
                              }}
                            >
                              <CheckIcon fontSize="small" />
                            </Box>
                          )}
                        </Button>
                      );
                    })}
                    <Button
                      aria-label="Pick custom color"
                      type="button"
                      onClick={() => setShowCustomTheme(true)}
                      sx={{
                        aspectRatio: "1 / 1",
                        bgcolor: showCustomTheme
                          ? (theme) => alpha(theme.palette.primary.main, 0.08)
                          : "action.hover",
                        border: "1px solid",
                        borderColor: showCustomTheme
                          ? "primary.main"
                          : "divider",
                        borderRadius: 2,
                        color: showCustomTheme
                          ? "primary.main"
                          : "text.secondary",
                        minWidth: 0,
                        p: 0,
                        position: "relative",
                        "&:hover": {
                          bgcolor: "action.selected",
                          borderColor: "primary.main",
                          color: "primary.main",
                        },
                      }}
                    >
                      <ColorizeOutlinedIcon />
                      {showCustomTheme && (
                        <Box
                          sx={{
                            alignItems: "center",
                            bgcolor: "primary.main",
                            border: "2px solid",
                            borderColor: "background.paper",
                            borderRadius: "50%",
                            color: "primary.contrastText",
                            display: "flex",
                            height: 30,
                            justifyContent: "center",
                            position: "absolute",
                            right: 12,
                            top: 12,
                            width: 30,
                          }}
                        >
                          <CheckIcon fontSize="small" />
                        </Box>
                      )}
                    </Button>
                    </Box>
                    <Box
                      sx={{
                        display: "none",
                        gap: 1,
                        gridTemplateColumns: "1fr",
                        minWidth: 0,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 700, color: "text.primary" }}
                      >
                        Custom Theme
                      </Typography>
                      <Box
                        sx={{
                          alignItems: "center",
                          display: "flex",
                          gap: 0.75,
                          mb: 0.25,
                        }}
                      >
                        {[
                          themeInput.primaryColor,
                          themeInput.backgroundColor,
                          themeInput.textColor,
                        ].map((color, index) => (
                          <Box
                            key={`${color}-${index}`}
                            sx={{
                              bgcolor: isHexColor(color)
                                ? color
                                : DEFAULT_DASHBOARD_THEME.primaryColor,
                              border: "1px solid",
                              borderColor: alpha("#000000", 0.18),
                              borderRadius: "50%",
                              height: 28,
                              width: 28,
                            }}
                          />
                        ))}
                      </Box>
                      <Stack spacing={0.5}>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        Primary Color
                      </Typography>
                      <TextField
                        fullWidth
                        type="color"
                        value={
                          isHexColor(themeInput.primaryColor)
                            ? themeInput.primaryColor
                            : DEFAULT_DASHBOARD_THEME.primaryColor
                        }
                        onChange={(event) =>
                          handleChangeThemeInput(
                            "primaryColor",
                            event.target.value
                          )
                        }
                        sx={{ "& input": { height: 48, cursor: "pointer" } }}
                        inputProps={{ "aria-label": "Pick primary color" }}
                      />
                      </Stack>
                      <Stack spacing={0.5}>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        Background Color
                      </Typography>
                      <TextField
                        fullWidth
                        type="color"
                        value={
                          isHexColor(themeInput.backgroundColor)
                            ? themeInput.backgroundColor
                            : DEFAULT_DASHBOARD_THEME.backgroundColor
                        }
                        onChange={(event) =>
                          handleChangeThemeInput(
                            "backgroundColor",
                            event.target.value
                          )
                        }
                        sx={{ "& input": { height: 48, cursor: "pointer" } }}
                        inputProps={{ "aria-label": "Pick background color" }}
                      />
                      </Stack>
                      <Stack spacing={0.5}>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        Text Color
                      </Typography>
                      <TextField
                        fullWidth
                        type="color"
                        value={
                          isHexColor(themeInput.textColor)
                            ? themeInput.textColor
                            : DEFAULT_DASHBOARD_THEME.textColor
                        }
                        onChange={(event) =>
                          handleChangeThemeInput(
                            "textColor",
                            event.target.value
                          )
                        }
                        sx={{ "& input": { height: 48, cursor: "pointer" } }}
                        inputProps={{ "aria-label": "Pick text color" }}
                      />
                      </Stack>
                    </Box>
                  </Box>
                  <Dialog
                    open={showCustomTheme}
                    onClose={() => setShowCustomTheme(false)}
                    maxWidth="xs"
                    fullWidth
                    PaperProps={{
                      sx: {
                        borderRadius: 2,
                        overflow: "hidden",
                      },
                    }}
                  >
                    <DialogTitle
                      sx={{
                        alignItems: "center",
                        display: "grid",
                        gridTemplateColumns: "40px 1fr auto",
                        gap: 1,
                        pb: 1,
                      }}
                    >
                      <Button
                        type="button"
                        variant="text"
                        onClick={() => setShowCustomTheme(false)}
                        sx={{
                          borderRadius: "50%",
                          minWidth: 40,
                          p: 0,
                          width: 40,
                          height: 40,
                        }}
                      >
                        <ArrowBackIcon />
                      </Button>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 800, textAlign: "center" }}
                      >
                        Custom Theme
                      </Typography>
                      <Button
                        type="button"
                        variant="contained"
                        disabled={isSaving}
                        onClick={handleSaveColors}
                        sx={{ textTransform: "none", fontWeight: 700 }}
                      >
                        Save
                      </Button>
                    </DialogTitle>
                    <DialogContent
                      sx={{
                        alignItems: "center",
                        display: "grid",
                        gap: 1.25,
                        justifyItems: "center",
                        pt: 1,
                      }}
                    >
                      <Box
                        sx={{
                          alignItems: "center",
                          display: "flex",
                          gap: 0.75,
                          justifyContent: "center",
                        }}
                      >
                        {[
                          themeInput.primaryColor,
                          themeInput.backgroundColor,
                          themeInput.textColor,
                        ].map((color, index) => (
                          <Box
                            key={`${color}-${index}`}
                            sx={{
                              bgcolor: isHexColor(color)
                                ? color
                                : DEFAULT_DASHBOARD_THEME.primaryColor,
                              border: "1px solid",
                              borderColor: alpha("#000000", 0.18),
                              borderRadius: "50%",
                              height: 30,
                              width: 30,
                            }}
                          />
                        ))}
                      </Box>
                      <Stack spacing={0.5} sx={{ width: "100%", maxWidth: 260 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          Primary Color
                        </Typography>
                        <TextField
                          fullWidth
                          type="color"
                          value={
                            isHexColor(themeInput.primaryColor)
                              ? themeInput.primaryColor
                              : DEFAULT_DASHBOARD_THEME.primaryColor
                          }
                          onChange={(event) =>
                            handleChangeThemeInput(
                              "primaryColor",
                              event.target.value
                            )
                          }
                          sx={{ "& input": { height: 48, cursor: "pointer" } }}
                          inputProps={{ "aria-label": "Pick primary color" }}
                        />
                      </Stack>
                      <Stack spacing={0.5} sx={{ width: "100%", maxWidth: 260 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          Background Color
                        </Typography>
                        <TextField
                          fullWidth
                          type="color"
                          value={
                            isHexColor(themeInput.backgroundColor)
                              ? themeInput.backgroundColor
                              : DEFAULT_DASHBOARD_THEME.backgroundColor
                          }
                          onChange={(event) =>
                            handleChangeThemeInput(
                              "backgroundColor",
                              event.target.value
                            )
                          }
                          sx={{ "& input": { height: 48, cursor: "pointer" } }}
                          inputProps={{ "aria-label": "Pick background color" }}
                        />
                      </Stack>
                      <Stack spacing={0.5} sx={{ width: "100%", maxWidth: 260 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          Text Color
                        </Typography>
                        <TextField
                          fullWidth
                          type="color"
                          value={
                            isHexColor(themeInput.textColor)
                              ? themeInput.textColor
                              : DEFAULT_DASHBOARD_THEME.textColor
                          }
                          onChange={(event) =>
                            handleChangeThemeInput(
                              "textColor",
                              event.target.value
                            )
                          }
                          sx={{ "& input": { height: 48, cursor: "pointer" } }}
                          inputProps={{ "aria-label": "Pick text color" }}
                        />
                      </Stack>
                    </DialogContent>
                  </Dialog>
                </Box>
              )}

              {activeSection === "fonts" && (
                <SettingsFontSection
                  fontInput={fontInput}
                  onFontInputChange={setFontInput}
                />
              )}

              {canManageLogo && activeSection === "logo" && (
                <SettingsLogoSection
                  brandingInput={brandingInput}
                  logoIconFile={logoIconFile}
                  role={role}
                  onBrandingInputChange={setBrandingInput}
                  onLogoIconFileChange={setLogoIconFile}
                />
              )}
            </Stack>
          )}
          <Box sx={{ display: "flex", gap: 1.5, mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon fontSize="small" />}
              onClick={() => navigate(-1)}
              sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}
            >
              Back
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{
                ...formStyles.submitButton,
                mt: 0,
                px: 4,
                opacity: isSaving ? 0.6 : 1,
              }}
              disabled={isSaving}
            >
              {isSaving ? <CircularProgress size={24} color="inherit" /> : "Save"}
            </Button>
          </Box>
          <ShowPageLogo />
        </Box>
      </Box>
    </MapBackgroundPage>
  );
};

