import React from "react";
import {
  useDataGrid,
  EditButton,
  ShowButton,
  DeleteButton,
  List,
  CreateButton,
} from "@refinedev/mui";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { MapTablePage } from "../../components/map-table-page";

const ActionsCell = ({ row }: any) => (
  <>
    <EditButton hideText recordItemId={row._id} />
    <ShowButton hideText recordItemId={row._id} />
    <DeleteButton hideText recordItemId={row._id} />
  </>
);
export const SiteList = () => {
  const { dataGridProps } = useDataGrid({
    dataProviderName: "default",
    resource: "sites",
    pagination: {
      mode: "client", // Client-side pagination for instant global search
      pageSize: 10,
    },
    errorNotification: (error) => {
      return {
        message: "Error fetching sites data",
        description: error?.message || "An unexpected error occurred",
        type: "error",
      };
    },
  });

  const role = localStorage.getItem("role")?.toLowerCase();

  const columns = React.useMemo<GridColDef[]>(
    () => [
      {
        field: "imei",
        headerName: "IMEI",
        width: 70,
        flex: 1,
        filterable: true,
        valueGetter: (params) => 
          Array.isArray(params.value) ? params.value.join(", ") : String(params.value || ""),
      },
      {
        field: "name",
        headerName: "Site Name",
        flex: 1,
        filterable: true,
      },
      {
        field: "display_name",
        headerName: "Display Name",
        flex: 1,
        filterable: true,
      },
      {
        field: "region",
        headerName: "Region",
        flex: 1,
        filterable: true,
      },
      {
        field: "infrastructure_id",
        headerName: "Infrastructure ID",
        flex: 1,
        filterable: true,
      },
      {
        field: "lat",
        headerName: "Latitude",
        flex: 1,
        filterable: true,
      },
      {
        field: "lon",
        headerName: "Longitude",
        flex: 1,
        filterable: true,
      },
      {
        field: "actions",
        headerName: "Actions",
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        align: "center",
        headerAlign: "center",
        minWidth: 80,
        renderCell: ({ row }) => {
          if (role !== "admin" && role !== "organization") return null;
          return <ActionsCell row={row} />;
        },
      },
    ],
    [role]
  );

  return (
    <MapTablePage>
      <List
        headerButtons={
          (role === "admin" || role === "organization") ? <CreateButton /> : null
        }
      >
        <DataGrid
          {...dataGridProps}
          columns={columns}
          autoHeight
          // Professional Full Client-side Configuration
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
          slots={{
            toolbar: GridToolbar,
          }}
          slotProps={{
            toolbar: { 
              showQuickFilter: true,
              quickFilterProps: { 
                debounceMs: 250, 
                placeholder: "Search by Name, IMEI, Region...",
              },
            },
          }}
          getRowId={(row) => row._id}
        />
      </List>
    </MapTablePage>
  );
};
