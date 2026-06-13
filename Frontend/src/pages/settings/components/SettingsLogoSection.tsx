import {
  Box,
  Button,
  FormControlLabel,
  Slider,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import type { Dispatch, SetStateAction } from "react";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import {
  LOGO_TEXT_MAX_LENGTH,
  LOGO_TEXT_MAX_SIZE,
  LOGO_TEXT_MIN_SIZE,
} from "../constants";
import type { DashboardBranding } from "../types";

type SettingsLogoSectionProps = {
  brandingInput: DashboardBranding;
  logoIconFile: File | null;
  role?: string;
  onBrandingInputChange: Dispatch<SetStateAction<DashboardBranding>>;
  onLogoIconFileChange: Dispatch<SetStateAction<File | null>>;
};

const compactSliderSx = {
  width: "100%",
  "& .MuiSlider-markLabel": {
    fontSize: "0.62rem",
    whiteSpace: "nowrap",
  },
};

const edgeLabelSliderSx = {
  ...compactSliderSx,
  "& .MuiSlider-markLabel[data-index='0']": {
    transform: "translateX(0)",
  },
  "& .MuiSlider-markLabel[data-index='1']": {
    transform: "translateX(-100%)",
  },
};

export const SettingsLogoSection = ({
  brandingInput,
  logoIconFile,
  role,
  onBrandingInputChange,
  onLogoIconFileChange,
}: SettingsLogoSectionProps) => {
  const isAdmin = role === "admin";
  const logoPreviewSrc = logoIconFile
    ? URL.createObjectURL(logoIconFile)
    : brandingInput.logoIcon
    ? `${import.meta.env.VITE_API_BASE_URL}${brandingInput.logoIcon}`
    : "";

  return (
    <Box
      key="logo"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        transformOrigin: "center top",
        animation: "settingsTabEnter 420ms cubic-bezier(0.16, 1, 0.3, 1) both",
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 700, color: "text.primary" }}
      >
        Logo
      </Typography>

      {isAdmin && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, max-content)",
            },
            columnGap: "40px",
            rowGap: 2,
            alignItems: "start",
          }}
        >
          <Box sx={{ width: { xs: "100%", sm: 170 } }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              Sidebar Width: {brandingInput.sidebarWidth}px
            </Typography>
            <Slider
              value={brandingInput.sidebarWidth}
              min={150}
              max={250}
              step={10}
              marks={[
                { value: 150, label: "Small" },
                { value: 200, label: "Medium" },
                { value: 250, label: "Large" },
              ]}
              onChange={(_, value) =>
                onBrandingInputChange((prev) => ({
                  ...prev,
                  sidebarWidth: value as number,
                }))
              }
              sx={compactSliderSx}
            />
          </Box>
          <Box sx={{ width: { xs: "100%", sm: 170 } }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              Sidebar Height: {brandingInput.sidebarHeight}%
            </Typography>
            <Slider
              value={brandingInput.sidebarHeight}
              min={50}
              max={100}
              step={5}
              marks={[
                { value: 50, label: "Half" },
                { value: 75, label: "Medium" },
                { value: 100, label: "Full" },
              ]}
              onChange={(_, value) =>
                onBrandingInputChange((prev) => ({
                  ...prev,
                  sidebarHeight: value as number,
                }))
              }
              sx={compactSliderSx}
            />
          </Box>
        </Box>
      )}

      <TextField
        label="Logo Text"
        value={brandingInput.logoText}
        disabled={!brandingInput.logoTextEnabled}
        inputProps={{ maxLength: LOGO_TEXT_MAX_LENGTH }}
        helperText={`${brandingInput.logoText.length}/${LOGO_TEXT_MAX_LENGTH} characters`}
        onChange={(event) =>
          onBrandingInputChange((prev) => ({
            ...prev,
            logoText: event.target.value.slice(0, LOGO_TEXT_MAX_LENGTH),
          }))
        }
        InputProps={{ sx: { borderRadius: 2 } }}
        sx={{ width: { xs: "100%", sm: 220 }, maxWidth: "100%" }}
      />

      {isAdmin && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "max-content repeat(2, 180px)",
            },
            columnGap: 5,
            rowGap: 1.5,
            alignItems: "start",
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={brandingInput.logoTextEnabled}
                onChange={(event) =>
                  onBrandingInputChange((prev) => ({
                    ...prev,
                    logoTextEnabled: event.target.checked,
                  }))
                }
              />
            }
            label="Show Logo Text"
          />
          <Box sx={{ width: { xs: "100%", sm: 180 }, px: 1.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              Font Size: {brandingInput.logoTextSize}px
            </Typography>
            <Slider
              value={brandingInput.logoTextSize}
              min={LOGO_TEXT_MIN_SIZE}
              max={LOGO_TEXT_MAX_SIZE}
              step={1}
              marks={[
                { value: LOGO_TEXT_MIN_SIZE, label: "8px" },
                { value: LOGO_TEXT_MAX_SIZE, label: "16px" },
              ]}
              disabled={!brandingInput.logoTextEnabled}
              onChange={(_, value) =>
                onBrandingInputChange((prev) => ({
                  ...prev,
                  logoTextSize: value as number,
                }))
              }
              sx={edgeLabelSliderSx}
            />
          </Box>
          <Box sx={{ width: { xs: "100%", sm: 180 }, px: 1.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              Text Width: {brandingInput.logoTextWidth}px
            </Typography>
            <Slider
              value={brandingInput.logoTextWidth}
              min={60}
              max={220}
              step={5}
              marks={[
                { value: 60, label: "60px" },
                { value: 220, label: "220px" },
              ]}
              disabled={!brandingInput.logoTextEnabled}
              onChange={(_, value) =>
                onBrandingInputChange((prev) => ({
                  ...prev,
                  logoTextWidth: value as number,
                }))
              }
              sx={edgeLabelSliderSx}
            />
          </Box>
        </Box>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "max-content 140px 64px",
          },
          alignItems: "center",
          columnGap: 2,
          rowGap: 1,
        }}
      >
        {isAdmin && (
          <FormControlLabel
            control={
              <Switch
                checked={brandingInput.logoIconEnabled}
                onChange={(event) =>
                  onBrandingInputChange((prev) => ({
                    ...prev,
                    logoIconEnabled: event.target.checked,
                  }))
                }
              />
            }
            label="Logo Image"
            sx={{
              m: 0,
              justifySelf: { xs: "center", sm: "start" },
              "& .MuiFormControlLabel-label": {
                whiteSpace: "nowrap",
              },
            }}
          />
        )}
        <Button
          component="label"
          variant="outlined"
          disabled={!brandingInput.logoIconEnabled}
          sx={{
            width: { xs: "100%", sm: 140 },
            minWidth: 0,
            justifySelf: "center",
            justifyContent: "center",
            overflow: "hidden",
            textTransform: "none",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {logoIconFile ? logoIconFile.name : "Choose Image"}
          <input
            hidden
            type="file"
            accept="image/png,image/jpeg"
            onChange={(event) =>
              onLogoIconFileChange(event.target.files?.[0] || null)
            }
          />
        </Button>
        <Box
          sx={{
            width: 64,
            height: 64,
            justifySelf: { xs: "center", sm: "end" },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            bgcolor: "background.paper",
            opacity: brandingInput.logoIconEnabled ? 1 : 0.45,
            p: 0.5,
          }}
        >
          {logoPreviewSrc ? (
            <Box
              component="img"
              src={logoPreviewSrc}
              alt="Logo icon preview"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          ) : (
            <ImageOutlinedIcon color="disabled" />
          )}
        </Box>
      </Box>

      {isAdmin && (
        <Typography variant="caption" color="text.secondary">
          Recommended logo icon: 128 x 128px square PNG or JPG (displayed at 34
          x 34px). Maximum file size: 5MB.
        </Typography>
      )}
    </Box>
  );
};
