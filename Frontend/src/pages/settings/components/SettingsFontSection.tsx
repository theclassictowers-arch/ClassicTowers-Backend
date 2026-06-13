import { Box, FormControl, InputLabel, MenuItem, Select, Typography } from "@mui/material";
import type { Dispatch, SetStateAction } from "react";
import { APP_FONT_OPTIONS, normalizeAppFont } from "../../../theme";

type SettingsFontSectionProps = {
  fontInput: string;
  onFontInputChange: Dispatch<SetStateAction<string>>;
};

export const SettingsFontSection = ({
  fontInput,
  onFontInputChange,
}: SettingsFontSectionProps) => (
  <Box
    key="fonts"
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
      Font
    </Typography>
    <Box
      sx={{
        display: "grid",
        gap: 1.25,
        gridTemplateColumns: "1fr 1fr",
        alignItems: "center",
      }}
    >
      <FormControl fullWidth size="small">
        <InputLabel id="settings-font-label">Font</InputLabel>
        <Select
          labelId="settings-font-label"
          label="Font"
          value={fontInput}
          onChange={(event) =>
            onFontInputChange(normalizeAppFont(event.target.value))
          }
        >
          {APP_FONT_OPTIONS.map((font) => (
            <MenuItem
              key={font.value}
              value={font.value}
              sx={{
                fontFamily: `${font.value} !important`,
                "& *": {
                  fontFamily: `${font.value} !important`,
                },
              }}
            >
              {font.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          p: 1.5,
          bgcolor: "background.paper",
          fontFamily: `${fontInput} !important`,
          "& *": {
            fontFamily: `${fontInput} !important`,
          },
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: `${fontInput} !important`,
            fontWeight: 800,
          }}
        >
          Classic Towers
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontFamily: `${fontInput} !important`,
            color: "text.secondary",
          }}
        >
          Monitoring dashboard font preview
        </Typography>
      </Box>
    </Box>
  </Box>
);
