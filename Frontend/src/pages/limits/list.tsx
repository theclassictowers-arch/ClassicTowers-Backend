import React from "react";
import { useDataGrid, EditButton, ShowButton, List } from "@refinedev/mui";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { MapTablePage } from "../../components/map-table-page";

const ActionsCell = ({ row }: { row: any }) => (
  <>
    <EditButton hideText recordItemId={row._id} />
    <ShowButton hideText recordItemId={row._id} />
  </>
);

export const LimitsList = () => {
  const { dataGridProps } = useDataGrid({
    syncWithLocation: true,
    pagination: {
      mode: "client",
      pageSize: 10,
    },
    resource: "limits",
  });

  const columns = React.useMemo<GridColDef[]>(
    () => [
      {
        field: "updatedAt",
        headerName: "Last Updated",
        flex: 1,
        valueFormatter: (params) => {
          if (!params.value) return "";
          const [date, time] = params.value.split("T");
          return `${date} | ${time.split(".")[0]}`;
        },
      },
      {
        field: "vibrationSensor",
        headerName: "Vibration Sensor ID",
        flex: 1,
        filterable: true,
        valueGetter: (params) => params.row?.vibrationSensor?.sensorId || "N/A",
      },
      {
        field: "windSensor",
        headerName: "Wind Sensor ID",
        flex: 1,
        filterable: true,
        valueGetter: (params) => params.row?.windSensor?.sensorId || "N/A",
      },
      {
        field: "longitude",
        headerName: "Longitude",
        flex: 1,
        valueGetter: (params) => params.row?.coordinates?.[0],
      },
      {
        field: "latitude",
        headerName: "Latitude",
        flex: 1,
        valueGetter: (params) => params.row?.coordinates?.[1],
      },
      {
        field: "actions",
        headerName: "Actions",
        sortable: false,
        filterable: false,
        align: "center",
        headerAlign: "center",
        minWidth: 100,
        renderCell: (params) => <ActionsCell row={params.row} />,
      },
    ],
    []
  );

  return (
    <MapTablePage>
      <List>
        <DataGrid
          {...dataGridProps}
          columns={columns}
          autoHeight
          // Professional Uncontrolled Configuration for Instant Search
          filterModel={undefined}
          sortModel={undefined}
          paginationModel={undefined}
          onFilterModelChange={undefined} 
          onSortModelChange={undefined}
          onPaginationModelChange={undefined}

          sortingMode="client"
          filterMode="client"
          paginationMode="client"

          initialState={{
            pagination: { paginationModel: { pageSize: 10, page: 0 } },
          }}
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 250, placeholder: "Search by Sensor ID..." },
            },
          }}
          getRowId={(row) => row._id}
        />
      </List>
    </MapTablePage>
  );
};
