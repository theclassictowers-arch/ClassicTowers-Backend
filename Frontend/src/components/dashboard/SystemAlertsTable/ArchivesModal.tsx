import React, { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  useTheme,
  Typography,
  IconButton,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useDataGrid } from "@refinedev/mui";
import { io } from "socket.io-client";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { TableSkeleton } from "../../table-skeleton";

export interface ArchivesModalProps {
  open: boolean;
  onClose: () => void;
}

const { VITE_API_BASE_URL } = import.meta.env;

// Fixed page size - no longer configurable by user
const PAGE_SIZE = 10;

const labelMapping: Record<string, string> = {
  vibrationAngle: "Vibration Angle",
  vibrationDisplacement: "Vibration Displacement",
  vibrationFrequency: "Vibration Frequency",
  vibrationRollAngle: "Roll Angle",
  vibrationPitchAngle: "Pitch Angle",
  vibrationSpeed: "Vibration Speed",
  windDirection: "Wind Direction",
  windSpeed: "Wind Speed",
  windHumidity: "Humidity",
  windTemperature: "Temperature",
};

export const ArchivesModal: React.FC<ArchivesModalProps> = ({
  open,
  onClose,
}) => {
  const theme = useTheme();
  const [lastUpdateTime, setLastUpdateTime] = useState<string>("");

  // Professional DataGrid setup like Sites List
  const { dataGridProps, tableQueryResult } = useDataGrid({
    resource: "archives",
    dataProviderName: "archives",
    pagination: {
      mode: "client", // Instant global search like Sites List
      pageSize: PAGE_SIZE,
    },
    errorNotification: (error) => ({
      message: "Error fetching archives",
      description: error?.message || "An unexpected error occurred",
      type: "error",
    }),
    queryOptions: {
      enabled: open,
    },
  });

  const isArchivesLoading = tableQueryResult.isLoading;
  const archives =
    (tableQueryResult.data?.data as any)?.archives ||
    tableQueryResult.data?.data ||
    [];

  // Manual refresh handler
  const handleManualRefresh = () => {
    tableQueryResult.refetch();
    updateLastRefreshTime();
  };

  // Update the last refresh timestamp
  const updateLastRefreshTime = () => {
    const now = new Date();
    setLastUpdateTime(
      `${now.toLocaleTimeString()} ${now.toLocaleDateString()}`
    );
  };

  // Socket handler for new data
  const handleNewData = useCallback(() => {
    tableQueryResult.refetch();
    updateLastRefreshTime();
  }, [tableQueryResult]);

  // Socket connection setup
  useEffect(() => {
    if (open) {
      updateLastRefreshTime();
      const socket = VITE_API_BASE_URL ? io(VITE_API_BASE_URL) : io();
      socket.on("newData", handleNewData);

      return () => {
        socket.disconnect();
      };
    }
  }, [open, handleNewData]);

  // Process the archives data for display
  const processedRows = React.useMemo(() => {
    const archivesData = archives;
    if (!archivesData || !Array.isArray(archivesData)) return [];

    return archivesData.flatMap((archive: any) => {
      const results = [];
      // Process each status property that has a status field
      for (const key in archive) {
        const field = archive[key];
        if (field && typeof field === "object" && field.status) {
          const timestamp = archive.createdAt || new Date().toISOString();
          const [datePart, timePart] = timestamp.split("T");
          const time = (timePart || "00:00:00").split(".")[0];
          results.push({
            id: `${archive._id}-${key}`,
            date: datePart,
            time: time,
            siteName: archive.siteName,
            sensorName: labelMapping[key] || key,
            status: field.status,
            message: field.message,
          });
        }
      }
      return results;
    });
  }, [archives]);

  const columns: GridColDef[] = [
    { field: "date", headerName: "Date", flex: 1 },
    {
      field: "time",
      headerName: "Time",
      flex: 1,
      valueGetter: (params) => {
        const utcDate = new Date(`${params.row.date}T${params.value}Z`);
        return utcDate.toLocaleTimeString("en-GB", { hour12: false });
      },
    },
    { field: "siteName", headerName: "Site", flex: 1.5 },
    {
      field: "sensorName",
      headerName: "Sensor",
      flex: 1,
      filterable: true,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: "message",
      headerName: "Message",
      flex: 2.5,
      filterable: true,
      renderCell: (params) => (
        <Tooltip title={params.value} arrow>
          <Typography noWrap variant="body2">
            {params.value.split(" at ")[0]}
          </Typography>
        </Tooltip>
      ),
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 1,
          boxShadow: 3,
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: theme.palette.mode === "light" ? "#f5f5f5" : "#333",
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 1.5,
        }}
      >
        <Box display="flex" alignItems="center">
          <Typography variant="h6" component="span">
            System Archives
          </Typography>
          {isArchivesLoading && (
            <CircularProgress size={20} thickness={5} sx={{ ml: 2 }} />
          )}
        </Box>
        <Box display="flex" alignItems="center">
          <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
            Last updated: {lastUpdateTime}
          </Typography>
          <Tooltip title="Refresh data">
            <IconButton
              size="small"
              onClick={handleManualRefresh}
              sx={{
                backgroundColor:
                  theme.palette.mode === "light"
                    ? "rgba(0, 0, 0, 0.04)"
                    : "rgba(255, 255, 255, 0.08)",
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "light"
                      ? "rgba(0, 0, 0, 0.08)"
                      : "rgba(255, 255, 255, 0.12)",
                },
              }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          p: 0,
          height: 500,
          backgroundColor: theme.palette.background.default,
        }}
      >
        {isArchivesLoading ? (
          <TableSkeleton columns={columns.length} rows={9} />
        ) : (
          <DataGrid
          {...dataGridProps}
          rows={processedRows}
          rowCount={processedRows.length}
          columns={columns}
          loading={isArchivesLoading}
          autoHeight={false}
          density="compact"
          rowHeight={34}
          columnHeaderHeight={38}
          // Matches Site List: Uncontrolled State for Instant Search
          filterModel={undefined}
          sortModel={undefined}
          paginationModel={undefined}
          onFilterModelChange={undefined}
          onSortModelChange={undefined}
          onPaginationModelChange={undefined}
          disableColumnMenu={false}
          hideFooterSelectedRowCount
          filterMode="client"
          sortingMode="client"
          paginationMode="client"
          initialState={{
            pagination: { paginationModel: { pageSize: PAGE_SIZE, page: 0 } },
          }}
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: {
                debounceMs: 250,
                placeholder: "Search sensor or site...",
              },
            },
          }}
          sx={{
            border: "none",
            "& .MuiDataGrid-cell": {
              borderBottom: `1px solid ${theme.palette.divider}`,
            },
          }}
          getRowId={(row) => row.id}
          />
        )}
      </DialogContent>
      <DialogActions
        sx={{
          justifyContent: "flex-end",
          p: 1.5,
          backgroundColor: theme.palette.mode === "light" ? "#f5f5f5" : "#333",
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Button
          onClick={onClose}
          variant="contained"
          size="small"
          sx={{
            textTransform: "none",
            minWidth: 100,
            backgroundColor: theme.palette.grey[500],
            "&:hover": {
              backgroundColor: theme.palette.grey[600],
            },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
