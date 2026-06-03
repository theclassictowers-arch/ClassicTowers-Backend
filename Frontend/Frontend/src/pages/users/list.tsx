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
import { Typography } from "@mui/material";
import { useAuthContext } from "../../contexts";
import { MapTablePage } from "../../components/map-table-page";

const ActionsCell = ({ row }: any) => (
  <>
    <EditButton hideText recordItemId={row._id} />
    <ShowButton hideText recordItemId={row._id} />
    <DeleteButton hideText recordItemId={row._id} />
  </>
);

export const UserList = () => {
  const { role } = useAuthContext();
  // Permission check based on role
  const canAddUsers = role === "admin" || role === "organization" || role === "team_lead";
  // Action check based on Site list logic (only Admin/Organization can edit/delete)
  const canManageUsers = role === "admin" || role === "organization";

  const { dataGridProps } = useDataGrid({
    dataProviderName: "users",
    resource: "users",
    pagination: {
      mode: "client",
      pageSize: 10,
    },
    errorNotification: (error) => {
      return {
        message: "Error fetching users data",
        description: error?.message || "An unexpected error occurred",
        type: "error",
      };
    },
  });

  const columns = React.useMemo<GridColDef[]>(
    () => [
      {
        field: "_id",
        headerName: "User ID",
        flex: 1,
      },
      {
        field: "email",
        headerName: "Email",
        flex: 1,
        filterable: true,
      },
      {
        field: "role",
        headerName: "Role",
        flex: 1,
        filterable: true,
        type: "singleSelect",
        valueOptions: ["admin", "organization", "team_lead", "operator"],
        renderCell: ({ row }) => {
          const roleLabels: Record<string, string> = {
            admin: "Admin",
            organization: "Organization",
            team_lead: "Team Lead",
            operator: "Operator",
          };
          return roleLabels[row.role] || row.role;
        },
      },
      {
        field: "towerLimit",
        headerName: "Tower Limit",
        flex: 0.8,
        valueGetter: (params) =>
          params.row.role === "organization" ? params.value ?? 0 : "",
      },
      {
        field: "assignedTowerLimit",
        headerName: "Lead Towers",
        flex: 0.8,
        valueGetter: (params) =>
          params.row.role === "team_lead" ? params.value ?? 0 : "",
      },
      {
        field: "isApproved",
        headerName: "Approved",
        flex: 0.8,
        valueGetter: (params) => (params.value ? "Yes" : "No"),
        renderCell: (params) => (
          <Typography
            variant="body2"
            sx={{ color: params.value === "Yes" ? "success.main" : "error.main", fontWeight: "bold" }}
          >
            {params.value}
          </Typography>
        ),
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
          if (!canManageUsers && role !== "team_lead") return null;
          return <ActionsCell row={row} />;
        },
      },
    ],
    [role]
  );

  return (
    <MapTablePage>
      <List
        headerButtons={canAddUsers ? <CreateButton /> : undefined}
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
                placeholder: "Search users by email, role, etc...",
              },
            },
          }}
          getRowId={(row) => row._id}
        />
      </List>
    </MapTablePage>
  );
};
