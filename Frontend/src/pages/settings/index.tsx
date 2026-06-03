import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useNotification } from "@refinedev/core";
import { useAuthContext, useColorModeContext } from "../../contexts";
import { axiosInstance } from "../../utils";
import { formStyles } from "../auth/styles";
import { MovableForm } from "../../components/movable-form";
import { MapBackgroundPage } from "../../components/map-background-page";
import {
  DASHBOARD_THEME_PRESETS,
  DEFAULT_DASHBOARD_THEME,
  normalizeDashboardTheme,
  type DashboardThemeColors,
} from "../../theme";

type OrganizationUser = {
  _id: string;
  name: string;
  dashboardTheme?: Partial<DashboardThemeColors>;
};

const isHexColor = (value: string) => /^#([A-Fa-f0-9]{6})$/.test(value.trim());

const areSameTheme = (
  first: DashboardThemeColors,
  second: DashboardThemeColors
) =>
  first.primaryColor.toLowerCase() === second.primaryColor.toLowerCase() &&
  first.backgroundColor.toLowerCase() === second.backgroundColor.toLowerCase() &&
  first.textColor.toLowerCase() === second.textColor.toLowerCase();

export const SettingsPage: React.FC = () => {
  const { role } = useAuthContext();
  const { dashboardTheme, setDashboardTheme } = useColorModeContext();
  const { open } = useNotification();
  const currentUserId = localStorage.getItem("userId");
  const canManageSettings = role === "admin" || role === "organization";

  const [organizations, setOrganizations] = useState<OrganizationUser[]>([]);
  const [loadingOrganizations, setLoadingOrganizations] = useState(false);
  const [selectedTargetUserId, setSelectedTargetUserId] = useState(
    currentUserId || ""
  );
  const [themeInput, setThemeInput] = useState<DashboardThemeColors>(dashboardTheme);
  const [loadingTheme, setLoadingTheme] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setThemeInput(dashboardTheme);
  }, [dashboardTheme]);

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

  const targetUserId = useMemo(() => {
    if (!currentUserId) return "";
    return role === "organization" ? currentUserId : selectedTargetUserId;
  }, [currentUserId, role, selectedTargetUserId]);

  useEffect(() => {
    if (!canManageSettings || !targetUserId) return;

    const fetchTheme = async () => {
      setLoadingTheme(true);
      try {
        const response = await axiosInstance.get(`/users/${targetUserId}`);
        setThemeInput(normalizeDashboardTheme(response.data?.dashboardTheme));
      } catch {
        setThemeInput(DEFAULT_DASHBOARD_THEME);
      } finally {
        setLoadingTheme(false);
      }
    };

    fetchTheme();
  }, [canManageSettings, targetUserId]);

  if (!canManageSettings || !currentUserId) {
    return null;
  }

  const handleChangeThemeInput = (
    key: keyof DashboardThemeColors,
    value: string
  ) => {
    setThemeInput((prev) => ({ ...prev, [key]: value }));
  };

  const handleSelectPreset = (colors: DashboardThemeColors) => {
    setThemeInput(normalizeDashboardTheme(colors));
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

  const handleSave = async () => {
    if (!validateTheme()) return;
    if (!targetUserId) return;

    const payload = normalizeDashboardTheme(themeInput);
    setIsSaving(true);
    try {
      try {
        await axiosInstance.patch(`/users/${targetUserId}/dashboard-theme`, payload);
      } catch (error: unknown) {
        const statusCode = (error as { response?: { status?: number } })?.response
          ?.status;
        if (statusCode !== 404) {
          throw error;
        }

        await axiosInstance.patch(`/users/${targetUserId}`, {
          dashboardTheme: payload,
        });
      }

      setThemeInput(payload);
      if (targetUserId === currentUserId) {
        setDashboardTheme(payload);
      }
      setOrganizations((prev) =>
        prev.map((org) =>
          org._id === targetUserId ? { ...org, dashboardTheme: payload } : org
        )
      );

      open?.({
        type: "success",
        message: "Settings saved",
        description: "Theme settings updated successfully.",
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

  return (
    <MapBackgroundPage>
      <MovableForm
        panelId="settings-form"
        initialWidth={420}
        minWidth={320}
        maxWidth={760}
      >
        <Box
          component="form"
          sx={{
            ...formStyles.container,
            m: 0,
            width: "100%",
            maxWidth: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
          onSubmit={(event) => {
            event.preventDefault();
            handleSave();
          }}
        >
          <Typography variant="h4" gutterBottom sx={formStyles.title}>
            Settings
          </Typography>

          {role === "admin" && (
            <FormControl fullWidth sx={{ mt: 1.5 }}>
              <InputLabel id="settings-target-label">Target</InputLabel>
              <Select
                labelId="settings-target-label"
                label="Target"
                value={selectedTargetUserId}
                disabled={loadingOrganizations}
                onChange={(event) => setSelectedTargetUserId(String(event.target.value))}
              >
                <MenuItem value={currentUserId}>My Account (Admin)</MenuItem>
                {organizations.map((org) => (
                  <MenuItem key={org._id} value={org._id}>
                    {org.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {loadingTheme ? (
            <Box sx={{ py: 3, display: "flex", justifyContent: "center" }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Stack spacing={1.5} sx={{ mt: 1.5 }}>
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, fontWeight: 700, color: "text.primary" }}
                >
                  Theme Presets
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, minmax(0, 1fr))",
                    },
                    gap: 1,
                  }}
                >
                  {DASHBOARD_THEME_PRESETS.map((preset) => {
                    const isSelected = areSameTheme(
                      normalizeDashboardTheme(themeInput),
                      preset.colors
                    );

                    return (
                      <Button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset.colors)}
                        sx={{
                          alignItems: "stretch",
                          border: "1px solid",
                          borderColor: isSelected ? "primary.main" : "divider",
                          borderRadius: 1,
                          color: "text.primary",
                          justifyContent: "flex-start",
                          minHeight: 72,
                          p: 1,
                          textAlign: "left",
                          textTransform: "none",
                          bgcolor: isSelected
                            ? (theme) => alpha(theme.palette.primary.main, 0.08)
                            : "background.paper",
                          "&:hover": {
                            borderColor: "primary.main",
                            bgcolor: (theme) =>
                              alpha(theme.palette.primary.main, 0.1),
                          },
                        }}
                      >
                        <Stack spacing={0.75} sx={{ width: "100%" }}>
                          <Stack direction="row" spacing={0.5}>
                            {Object.values(preset.colors).map((color) => (
                              <Box
                                key={`${preset.id}-${color}`}
                                sx={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: 0.75,
                                  bgcolor: color,
                                  border: "1px solid",
                                  borderColor: alpha("#000000", 0.16),
                                }}
                              />
                            ))}
                          </Stack>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 700, lineHeight: 1.2 }}
                            >
                              {preset.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "text.secondary",
                                display: "block",
                                lineHeight: 1.25,
                              }}
                            >
                              {preset.description}
                            </Typography>
                          </Box>
                        </Stack>
                      </Button>
                    );
                  })}
                </Box>
              </Box>

              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, color: "text.primary" }}
              >
                Custom Theme
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <TextField
                  fullWidth
                  label="Primary Color"
                  value={themeInput.primaryColor}
                  onChange={(event) =>
                    handleChangeThemeInput("primaryColor", event.target.value)
                  }
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
                <TextField
                  type="color"
                  value={
                    isHexColor(themeInput.primaryColor)
                      ? themeInput.primaryColor
                      : DEFAULT_DASHBOARD_THEME.primaryColor
                  }
                  onChange={(event) =>
                    handleChangeThemeInput("primaryColor", event.target.value)
                  }
                  sx={{ width: { xs: "100%", sm: 72 } }}
                  inputProps={{ "aria-label": "Pick primary color" }}
                />
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <TextField
                  fullWidth
                  label="Background Color"
                  value={themeInput.backgroundColor}
                  onChange={(event) =>
                    handleChangeThemeInput("backgroundColor", event.target.value)
                  }
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
                <TextField
                  type="color"
                  value={
                    isHexColor(themeInput.backgroundColor)
                      ? themeInput.backgroundColor
                      : DEFAULT_DASHBOARD_THEME.backgroundColor
                  }
                  onChange={(event) =>
                    handleChangeThemeInput("backgroundColor", event.target.value)
                  }
                  sx={{ width: { xs: "100%", sm: 72 } }}
                  inputProps={{ "aria-label": "Pick background color" }}
                />
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <TextField
                  fullWidth
                  label="Text Color"
                  value={themeInput.textColor}
                  onChange={(event) =>
                    handleChangeThemeInput("textColor", event.target.value)
                  }
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
                <TextField
                  type="color"
                  value={
                    isHexColor(themeInput.textColor)
                      ? themeInput.textColor
                      : DEFAULT_DASHBOARD_THEME.textColor
                  }
                  onChange={(event) =>
                    handleChangeThemeInput("textColor", event.target.value)
                  }
                  sx={{ width: { xs: "100%", sm: 72 } }}
                  inputProps={{ "aria-label": "Pick text color" }}
                />
              </Stack>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{
                  ...formStyles.submitButton,
                  opacity: isSaving ? 0.7 : 1,
                }}
                disabled={isSaving}
              >
                {isSaving ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Save Settings"
                )}
              </Button>
            </Stack>
          )}
        </Box>
      </MovableForm>
    </MapBackgroundPage>
  );
};
