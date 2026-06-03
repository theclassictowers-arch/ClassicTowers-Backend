import { FC, useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Stack,
  Alert,
  Modal,
  Paper,
  ButtonGroup,
  Tooltip,
  IconButton,
  Chip,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { useTheme } from "@mui/material/styles";

interface SensorFilterPanelProps {
  startDate: Dayjs | null;
  startTime: Dayjs | null;
  endDate: Dayjs | null;
  endTime: Dayjs | null;
  onStartDateChange: (newValue: Dayjs | null) => void;
  onStartTimeChange: (newValue: Dayjs | null) => void;
  onEndDateChange: (newValue: Dayjs | null) => void;
  onEndTimeChange: (newValue: Dayjs | null) => void;
  onApplyFilter: () => void;
  onApplyPresetFilter: (start: Dayjs, end: Dayjs) => void; // New function for preset filters
  onResetFilter: () => void;
  filterError: string | null;
  appliedFilter: { startDateTime: string | null; endDateTime: string | null };
  siteName: string;
  region?: string;
  infrastructureId?: string;
}

// Define preset types
type PresetType = "1h" | "6h" | "12h" | "24h" | "custom" | null;

export const SensorFilterPanel: FC<SensorFilterPanelProps> = ({
  startDate,
  startTime,
  endDate,
  endTime,
  onStartDateChange,
  onStartTimeChange,
  onEndDateChange,
  onEndTimeChange,
  onApplyFilter,
  onApplyPresetFilter,
  onResetFilter,
  filterError,
  appliedFilter,
  siteName,
  region,
  infrastructureId,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<PresetType>(null);
  const theme = useTheme();
  const isFilterApplied =
    appliedFilter.startDateTime && appliedFilter.endDateTime;
  const currentDate = dayjs();

  // Reset active preset when filter is reset
  useEffect(() => {
    if (!isFilterApplied) {
      setActivePreset(null);
    }
  }, [isFilterApplied]);

  const dateTimePickerSx = {
    "& .MuiInputBase-root": {
      height: "32px",
      fontSize: "0.75rem",
      backgroundColor: theme.palette.background.paper,
    },
    "& .MuiInputLabel-root": {
      display: "none",
    },
  };

  // Date should not be after today
  const shouldDisableDate = (date: Dayjs) => {
    return date.isAfter(currentDate, "day");
  };

  // Time should not be in the future if date is today
  const shouldDisableTime = (selectedDate: Dayjs | null, timeValue: Dayjs) => {
    if (!selectedDate) return false;

    const isToday = selectedDate.isSame(currentDate, "day");
    if (isToday) {
      return timeValue.isAfter(currentDate);
    }
    return false;
  };

  const handlePresetFilter = (hours: number, preset: PresetType) => {
    const end = dayjs();
    const start = end.subtract(hours, "hour");

    // Update the UI state for consistency
    onStartDateChange(start);
    onStartTimeChange(start);
    onEndDateChange(end);
    onEndTimeChange(end);

    // Set the active preset
    setActivePreset(preset);

    // Directly apply the filter with complete date values
    onApplyPresetFilter(start, end);
  };

  const handleCustomizeClick = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleApplyCustomFilter = () => {
    setActivePreset("custom");
    onApplyFilter();
    setModalOpen(false);
  };

  const getActiveButtonStyle = (preset: PresetType) => {
    if (activePreset === preset) {
      return {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        "&:hover": {
          backgroundColor: theme.palette.primary.dark,
        },
      };
    }
    return {};
  };

  const getTimeRangeText = () => {
    if (isFilterApplied) {
      const start = dayjs(appliedFilter.startDateTime);
      const end = dayjs(appliedFilter.endDateTime);
      return `${start.format("MMM D, HH:mm")} - ${end.format("MMM D, HH:mm")}`;
    }
    return null;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ borderRadius: 1, bgcolor: "background.paper", p: 1 }}>
        {/* Infrastructure ID - top */}
        {infrastructureId && (
          <Typography
            variant="caption"
            sx={{
              display: "block",
              color: theme.palette.text.secondary,
              fontSize: "0.7rem",
              mb: 0.5,
            }}
          >
            ID: <strong>{infrastructureId}</strong>
          </Typography>
        )}

        {/* Header with location */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 0.5,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            sx={{ overflow: "hidden" }}
          >
            <LocationOnIcon
              sx={{
                color: theme.palette.primary.main,
                flexShrink: 0,
                fontSize: "1rem",
              }}
            />
            <Tooltip title={siteName} arrow placement="bottom-start">
              <Typography
                variant="body2"
                fontWeight={500}
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "200px",
                  fontSize: "0.8rem",
                  color: "text.primary",
                }}
              >
                {siteName}
              </Typography>
            </Tooltip>
          </Stack>

          {/* Applied filter chip */}
          {isFilterApplied && (
            <Chip
              label={getTimeRangeText()}
              size="small"
              onDelete={() => {
                setActivePreset(null);
                onResetFilter();
              }}
              deleteIcon={
                <Tooltip title="Reset filter">
                  <RefreshIcon />
                </Tooltip>
              }
              sx={{
                height: "20px",
                fontSize: "0.65rem",
                bgcolor: theme.palette.grey[100],
                color: theme.palette.text.primary,
                "& .MuiChip-deleteIcon": {
                  fontSize: "0.75rem",
                  marginLeft: "2px",
                  color: theme.palette.text.secondary,
                },
              }}
            />
          )}
        </Box>

        {/* Region */}
        {region && (
          <Typography
            variant="caption"
            sx={{
              display: "block",
              color: theme.palette.text.secondary,
              fontSize: "0.7rem",
              mb: 1,
            }}
          >
            Region: <strong>{region}</strong>
          </Typography>
        )}

        {/* Preset buttons */}
        <ButtonGroup
          size="small"
          variant="outlined"
          fullWidth
          sx={{
            my: 0.5,
            "& .MuiButton-root": {
              borderColor: theme.palette.divider,
              color: theme.palette.text.primary,
            },
          }}
        >
          <Button
            onClick={() => handlePresetFilter(1, "1h")}
            sx={{
              fontSize: "0.7rem",
              py: 0.25,
              ...getActiveButtonStyle("1h"),
            }}
          >
            1h
          </Button>
          <Button
            onClick={() => handlePresetFilter(6, "6h")}
            sx={{
              fontSize: "0.7rem",
              py: 0.25,
              ...getActiveButtonStyle("6h"),
            }}
          >
            6h
          </Button>
          <Button
            onClick={() => handlePresetFilter(12, "12h")}
            sx={{
              fontSize: "0.7rem",
              py: 0.25,
              ...getActiveButtonStyle("12h"),
            }}
          >
            12h
          </Button>
          <Button
            onClick={() => handlePresetFilter(24, "24h")}
            sx={{
              fontSize: "0.7rem",
              py: 0.25,
              ...getActiveButtonStyle("24h"),
            }}
          >
            24h
          </Button>
          <Button
            onClick={handleCustomizeClick}
            sx={{
              fontSize: "0.7rem",
              py: 0.25,
              ...getActiveButtonStyle("custom"),
            }}
          >
            Custom
          </Button>
        </ButtonGroup>

        {filterError && (
          <Alert
            severity="error"
            sx={{
              py: 0,
              fontSize: "0.65rem",
              "& .MuiAlert-icon": {
                fontSize: "0.9rem",
                marginRight: 0.5,
              },
            }}
          >
            {filterError}
          </Alert>
        )}
      </Box>

      {/* Custom Filter Modal */}
      <Modal
        open={modalOpen}
        onClose={handleModalClose}
        aria-labelledby="custom-filter-modal"
      >
        <Paper
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "auto",
            maxWidth: "90%",
            p: 1.5,
            outline: "none",
            borderRadius: 1,
            bgcolor: "background.paper",
            boxShadow: 24,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
              pb: 0.5,
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography
              sx={{
                fontSize: "0.85rem",
                fontWeight: 500,
                color: "text.primary",
              }}
            >
              Custom Time Range
            </Typography>

            <IconButton
              size="small"
              onClick={handleModalClose}
              sx={{ p: 0.25, color: "text.secondary" }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Stack spacing={1}>
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontSize: "0.65rem",
                  mb: 0.25,
                  display: "block",
                }}
              >
                Start
              </Typography>
              <Stack direction="row" spacing={1}>
                <DatePicker
                  value={startDate}
                  onChange={onStartDateChange}
                  sx={dateTimePickerSx}
                  shouldDisableDate={shouldDisableDate}
                  slotProps={{
                    textField: {
                      size: "small",
                      placeholder: "Date",
                    },
                  }}
                />
                <TimePicker
                  value={startTime}
                  onChange={onStartTimeChange}
                  sx={dateTimePickerSx}
                  format="HH:mm"
                  ampm={false}
                  shouldDisableTime={(timeValue) =>
                    shouldDisableTime(startDate, timeValue)
                  }
                  slotProps={{
                    textField: {
                      size: "small",
                      placeholder: "Time",
                    },
                  }}
                />
              </Stack>
            </Box>

            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontSize: "0.65rem",
                  mb: 0.25,
                  display: "block",
                }}
              >
                End
              </Typography>
              <Stack direction="row" spacing={1}>
                <DatePicker
                  value={endDate}
                  onChange={onEndDateChange}
                  sx={dateTimePickerSx}
                  shouldDisableDate={shouldDisableDate}
                  slotProps={{
                    textField: {
                      size: "small",
                      placeholder: "Date",
                    },
                  }}
                />
                <TimePicker
                  value={endTime}
                  onChange={onEndTimeChange}
                  sx={dateTimePickerSx}
                  format="HH:mm"
                  ampm={false}
                  shouldDisableTime={(timeValue) =>
                    shouldDisableTime(endDate, timeValue)
                  }
                  slotProps={{
                    textField: {
                      size: "small",
                      placeholder: "Time",
                    },
                  }}
                />
              </Stack>
            </Box>

            {filterError && (
              <Alert
                severity="error"
                sx={{
                  py: 0,
                  fontSize: "0.65rem",
                  "& .MuiAlert-icon": {
                    fontSize: "0.9rem",
                    marginRight: 0.5,
                  },
                }}
              >
                {filterError}
              </Alert>
            )}

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                pt: 0.5,
                mt: 0.5,
                borderTop: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Button
                variant="contained"
                size="small"
                onClick={handleApplyCustomFilter}
                sx={{
                  fontSize: "0.75rem",
                  py: 0.25,
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  "&:hover": {
                    bgcolor: theme.palette.primary.dark,
                  },
                }}
              >
                Apply
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Modal>
    </LocalizationProvider>
  );
};
