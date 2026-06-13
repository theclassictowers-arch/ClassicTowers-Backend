import { FC, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  Stack,
  Popover,
  Divider,
  useTheme,
} from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";

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
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const availableKeys = Object.keys(status);

  const handleToggle = (key: string) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const selectedKeys = availableKeys.filter((k) => checked[k]);

  const handleConfirm = () => {
    if (selectedKeys.length > 0) {
      onStatusClick(selectedKeys);
      setAnchorEl(null);
      setChecked({});
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    setChecked({});
  };

  return (
    <Box sx={{ p: 1, backgroundColor: theme.palette.background.default }}>
      <Typography
        variant="overline"
        sx={{
          color: "text.secondary",
          fontWeight: 600,
          letterSpacing: 0.5,
          fontSize: "0.65rem",
          display: "block",
          mb: 0.75,
        }}
      >
        PARAMETERS
      </Typography>

      <Button
        size="small"
        variant="outlined"
        startIcon={<TuneIcon sx={{ fontSize: "0.9rem !important" }} />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          width: "100%",
          justifyContent: "flex-start",
          textTransform: "none",
          fontSize: "0.75rem",
          py: 0.5,
          borderColor: theme.palette.divider,
          color: "text.secondary",
        }}
      >
        Select parameters…
      </Button>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          sx: {
            width: 230,
            borderRadius: 1.5,
            boxShadow: "0 8px 24px rgba(15,23,42,0.14)",
          },
        }}
      >
        <Stack sx={{ px: 1, pt: 1, pb: 0.5 }}>
          {availableKeys.map((key) => (
            <FormControlLabel
              key={key}
              control={
                <Checkbox
                  size="small"
                  checked={!!checked[key]}
                  onChange={() => handleToggle(key)}
                  sx={{ py: 0.3, px: 0.75 }}
                />
              }
              label={
                <Typography sx={{ fontSize: "0.78rem" }}>
                  {labelMapping[key] ?? key}
                </Typography>
              }
              sx={{ m: 0, py: 0.15 }}
            />
          ))}
        </Stack>

        <Divider />

        <Box
          sx={{
            px: 1,
            py: 0.75,
            display: "flex",
            justifyContent: "flex-end",
            gap: 0.75,
          }}
        >
          <Button
            size="small"
            onClick={handleClose}
            sx={{ fontSize: "0.72rem", textTransform: "none", minWidth: 0 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            disableElevation
            disabled={selectedKeys.length === 0}
            onClick={handleConfirm}
            sx={{
              fontSize: "0.72rem",
              textTransform: "none",
              px: 1.5,
              py: 0.4,
              minWidth: 0,
            }}
          >
            Ok
          </Button>
        </Box>
      </Popover>
    </Box>
  );
};
