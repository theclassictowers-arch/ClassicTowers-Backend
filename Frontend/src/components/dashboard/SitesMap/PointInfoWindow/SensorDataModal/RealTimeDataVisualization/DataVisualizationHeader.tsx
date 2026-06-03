import React from "react";
import { Box, IconButton, Typography } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

export interface DataVisualizationHeaderProps {
  isLoading: boolean;
  refetchLatestData: () => void;
  onClose: () => void;
  siteName: any;
}

export const DataVisualizationHeader: React.FC<
  DataVisualizationHeaderProps
> = ({ isLoading, refetchLatestData, onClose, siteName }) => {
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      sx={{ backgroundColor: "#80AFFA" }}
    >
      <IconButton
        onClick={onClose}
        disabled={isLoading}
        aria-label="Close view"
        size="medium"
        sx={{ color: "#fff" }}
      >
        <ArrowBackIosNewIcon fontSize="inherit" />
      </IconButton>

      <Typography variant="h6" sx={{ color: "#fff" }}>
        {siteName}
      </Typography>

      <IconButton
        onClick={refetchLatestData}
        disabled={isLoading}
        aria-label="Refresh data"
        size="medium"
        sx={{ color: "#fff" }}
      >
        <RefreshIcon fontSize="inherit" />
      </IconButton>
    </Box>
  );
};
