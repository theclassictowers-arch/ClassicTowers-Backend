import { FC, useState, useEffect } from "react";
import { Box, Divider, useTheme } from "@mui/material";
import { useList } from "@refinedev/core";
import dayjs, { Dayjs } from "dayjs";

import { SensorDataModal } from "./SensorDataModal";
import { InfoWindowContentProps } from "./types";
import { SensorFilterPanel } from "./SensorFilterPanel";
import { SensorParametersList } from "./SensorParametersList";

// Update the interface to include the onModalStateChange callback
interface ExtendedInfoWindowContentProps extends InfoWindowContentProps {
  onModalStateChange?: (isOpen: boolean) => void;
}

const PointInfoWindow: FC<ExtendedInfoWindowContentProps> = ({
  point,
  onModalStateChange,
}) => {
  const theme = useTheme();
  const [sensorParameters, setSensorParameters] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Date and time state for filters - without default values
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [appliedFilter, setAppliedFilter] = useState<{
    startDateTime: string | null;
    endDateTime: string | null;
  }>({
    startDateTime: null,
    endDateTime: null,
  });

  const filters = [
    { field: "imei", operator: "eq", value: Array.isArray(point.imei) ? String(point.imei[0]) : String(point.imei || "") },
    { field: "parameter", operator: "in", value: sensorParameters },
    ...(appliedFilter.startDateTime
      ? [
          {
            field: "startDateTime",
            operator: "gte",
            value: appliedFilter.startDateTime,
          },
        ]
      : []),
    ...(appliedFilter.endDateTime
      ? [
          {
            field: "endDateTime",
            operator: "lte",
            value: appliedFilter.endDateTime,
          },
        ]
      : []),
  ];

  const {
    data: sensorData,
    isLoading: isSensorDataLoading,
    error: sensorDataError,
    refetch: refetchSensorData,
  } = useList({
    resource: "sensors",
    dataProviderName: "sensors",
    // @ts-ignore
    filters,
    queryOptions: {
      enabled: sensorParameters.length > 0,
      onSuccess: (data) => {
        console.log("DEBUG: Raw Sensor Data Response:", data);
        const responseData = data?.data;
        const sensorObj = Array.isArray(responseData) ? responseData[0] : responseData;
        const processedData = sensorObj?.processedSensorData || [];
        console.log(`DEBUG: Successfully loaded ${processedData?.length || 0} points.`);
      },
      onError: (err) => {
        console.error("DEBUG: Sensor API Fetch Error:", err);
      }
    },
  });

  // This function is now called after parameter selection and OK button click
  const handleParameterSelected = (keys: string[]) => {
    console.log("Selecting Parameters:", keys);
    setSensorParameters(keys);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSensorParameters([]);
  };

  // Notify parent component about modal state changes
  useEffect(() => {
    if (onModalStateChange) {
      onModalStateChange(isModalOpen);
    }
  }, [isModalOpen, onModalStateChange]);

  // Validate and apply the filter
  const handleApplyFilter = () => {
    setFilterError(null);

    // Check if all required date-time fields are present
    if (!startDate || !startTime || !endDate || !endTime) {
      // Don't show an error if it's a preset filter being applied directly
      // The preset handler in SensorFilterPanel already sets all values
      return;
    }

    // Combine date from DatePicker and time from TimePicker
    const startDateTime = dayjs(startDate)
      .hour(startTime?.hour() || 0)
      .minute(startTime?.minute() || 0)
      .second(startTime?.second() || 0);

    const endDateTime = dayjs(endDate)
      .hour(endTime?.hour() || 0)
      .minute(endTime?.minute() || 0)
      .second(endTime?.second() || 0);

    if (startDateTime.isAfter(endDateTime)) {
      setFilterError("Start date/time must be before end date/time");
      return;
    }

    const startISO = startDateTime.toISOString();
    const endISO = endDateTime.toISOString();

    const newFilter = {
      startDateTime: startISO,
      endDateTime: endISO,
    };

    console.log(`DEBUG: Applying Custom Filter: ${startISO} to ${endISO}`);
    setAppliedFilter(newFilter);

    if (sensorParameters.length > 0) {
      refetchSensorData();
    }
  };

  // This function will be called from the SensorFilterPanel for preset filters
  const handleApplyPresetFilter = (start: Dayjs, end: Dayjs) => {
    setFilterError(null);

    const startISO = start.toISOString();
    const endISO = end.toISOString();

    const newFilter = {
      startDateTime: startISO,
      endDateTime: endISO,
    };

    console.log(`DEBUG: Applying Preset Filter: ${startISO} to ${endISO}`);
    setAppliedFilter(newFilter);

    if (sensorParameters.length > 0) {
      refetchSensorData();
    }
  };

  const handleResetFilter = () => {
    setStartDate(null);
    setStartTime(null);
    setEndDate(null);
    setEndTime(null);
    setAppliedFilter({ startDateTime: null, endDateTime: null });
    setFilterError(null);

    if (sensorParameters.length > 0) {
      refetchSensorData();
    }
  };

  const refetchLatestData = () => {
    if (sensorParameters.length > 0) {
      refetchSensorData();
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: "background.paper",
        borderRadius: 2,
        border: `1px solid ${theme.palette.grey[300]}`,
        boxShadow: "0 18px 40px rgba(15, 23, 42, 0.16)",
        overflow: "hidden",
      }}
    >
      <SensorFilterPanel
        startDate={startDate}
        startTime={startTime}
        endDate={endDate}
        endTime={endTime}
        onStartDateChange={setStartDate}
        onStartTimeChange={setStartTime}
        onEndDateChange={setEndDate}
        onEndTimeChange={setEndTime}
        onApplyFilter={handleApplyFilter}
        onApplyPresetFilter={handleApplyPresetFilter}
        onResetFilter={handleResetFilter}
        filterError={filterError}
        appliedFilter={appliedFilter}
        siteName={point.display_name}
        region={point.region}
        infrastructureId={point.infrastructure_id}
      />

      <Divider sx={{ borderColor: theme.palette.grey[300] }} />

      <SensorParametersList
        status={point.status}
        onStatusClick={handleParameterSelected}
        appliedFilter={appliedFilter}
      />

      {sensorParameters.length > 0 && (
        <SensorDataModal
          open={isModalOpen}
          onClose={handleCloseModal}
          sensorData={sensorData?.data}
          isSensorDataLoading={isSensorDataLoading}
          sensorDataError={sensorDataError}
          sensorParameters={sensorParameters}
          refetchLatestData={refetchLatestData}
          siteName={point.display_name}
        />
      )}
    </Box>
  );
};

export default PointInfoWindow;
