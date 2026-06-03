import React, { FC, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

interface SensorParametersListProps {
  status: Record<string, any>;
  onStatusClick: (keys: string[]) => void;
  appliedFilter?: {
    startDateTime: string | null;
    endDateTime: string | null;
  };
}

const labelMapping: Record<string, string> = {
  vibrationAngle: "Vibration Angle",
  vibrationDisplacement: "Vibration Displacement",
  vibrationFrequency: "Vibration Frequency",
  vibrationRollAngle: "Vibration Roll Angle",
  vibrationPitchAngle: "Vibration Pitch Angle",
  vibrationSpeed: "Vibration Speed",
  windDirection: "Wind Direction",
  windHumidity: "Humidity",
  windSpeed: "Wind Speed",
  windTemperature: "Temperature",
};

export const SensorParametersList: FC<SensorParametersListProps> = ({
  status,
  onStatusClick,
  appliedFilter,
}) => {
  const [selectedParameters, setSelectedParameters] = useState<string[]>([]);

  const handleParameterSelect = (key: string) => {
    setSelectedParameters((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      if (prev.length >= 3) return prev;
      return [...prev, key];
    });
  };

  const handleConfirm = () => {
    if (selectedParameters.length > 0) {
      onStatusClick(selectedParameters);
      setSelectedParameters([]);
    }
  };

  return (
    <Box
      sx={{
        p: 1,
        borderRadius: 1,
        bgcolor: "background.default",
      }}
    >
      <Typography
        variant="overline"
        sx={{
          color: "text.secondary",
          fontWeight: 600,
          letterSpacing: 0.5,
          fontSize: "0.65rem",
          display: "block",
          mb: 1,
        }}
      >
        PARAMETERS
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
          gap: 0.5,
        }}
      >
        {Object.entries(status).map(([key]) => {
          const isMultiCheckbox = [
            "vibrationAngle",
            "vibrationDisplacement",
            "vibrationFrequency",
            "vibrationSpeed",
          ].includes(key);

          return (
            <Box
              key={key}
              sx={{
                border: 1,
                borderColor:
                  selectedParameters.includes(key) ? "primary.main" : "divider",
                borderRadius: 1,
                overflow: "hidden",
                transition: "all 0.2s ease",
              }}
            >
              <Box
                onClick={() => handleParameterSelect(key)}
                sx={{
                  bgcolor:
                    selectedParameters.includes(key)
                      ? "action.selected"
                      : "transparent",
                  color:
                    selectedParameters.includes(key) ? "primary.main" : "text.primary",
                  p: 0.5,
                  textAlign: "center",
                  cursor: "pointer",
                  fontSize: "0.6rem",
                  fontWeight: selectedParameters.includes(key) ? 600 : 400,
                  borderBottom: 1,
                  borderColor: "divider",
                }}
              >
                {labelMapping[key] ?? key}
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  py: 0.25,
                }}
              >
                {isMultiCheckbox ? (
                  ["x", "y", "z"].map((axis) => (
                    <FormControlLabel
                      key={axis}
                      control={
                        <Checkbox
                          size="small"
                          checked={selectedParameters.includes(key)}
                          sx={{
                            p: 0,
                            mx: 0.25,
                            color: "action.disabled",
                            "&.Mui-checked": {
                              color: "primary.main",
                            },
                          }}
                        />
                      }
                      label={axis}
                      sx={{
                        m: 0,
                        "& .MuiFormControlLabel-label": {
                          fontSize: "0.6rem",
                          color: "text.secondary",
                        },
                      }}
                    />
                  ))
                ) : (
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={selectedParameters.includes(key)}
                        sx={{
                          p: 0,
                          mx: 0.25,
                          color: "action.disabled",
                          "&.Mui-checked": {
                            color: "primary.main",
                          },
                        }}
                      />
                    }
                    label="value"
                    sx={{
                      m: 0,
                      "& .MuiFormControlLabel-label": {
                        fontSize: "0.6rem",
                        color: "text.secondary",
                      },
                    }}
                  />
                )}
              </Box>
            </Box>
          );
        })}
      </Box>

      <Stack direction="row" justifyContent="flex-end" sx={{ mt: 0.5 }}>
        <Button
          variant="contained"
          size="small"
          onClick={handleConfirm}
          disabled={selectedParameters.length === 0}
          disableElevation
          sx={{
            textTransform: "none",
            px: 1.5,
            py: 0.5,
            fontSize: "0.65rem",
            minWidth: 0,
          }}
        >
          Ok
        </Button>
      </Stack>
    </Box>
  );
};
