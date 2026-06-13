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
import { Box, Chip } from "@mui/material";
import { useAuthContext } from "../../contexts";
import {
  APP_ROLES,
  ROLE_LABELS,
  canCreateUsers,
  canManageUsers as canManageUsersByRole,
} from "../../utils";
import {
  MapTablePage,
  TableBottomActions,
  TableCenterLogo,
} from "../../components/map-table-page";
import { TableSkeleton } from "../../components/table-skeleton";

const ActionsCell = ({ row }: any) => (
  <>
    <EditButton hideText recordItemId={row._id} />
    <ShowButton hideText recordItemId={row._id} />
    <DeleteButton hideText recordItemId={row._id} />
  </>
);

export const UserList = () => {
  const { role } = useAuthContext();
  const canAddUsers = canCreateUsers(role);
  const canManageUsers = canManageUsersByRole(role);

  const { dataGridProps } = useDataGrid({
    dataProviderName: "users",
    resource: "users",
    queryOptions: {
      refetchInterval: 10000,
    },
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
        valueOptions: [...APP_ROLES],
        renderCell: ({ row }) => {
          return ROLE_LABELS[row.role as keyof typeof ROLE_LABELS] || row.role;
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
        headerName: "Status",
        flex: 0.8,
        valueGetter: (params) => params.row.approvalStatus || (params.value ? "approved" : "not_approved"),
        renderCell: (params) => (
          <Chip
            size="small"
            label={
              params.value === "approved"
                ? "Approved"
                : params.value === "pending"
                  ? "Pending"
                  : "Not Approved"
            }
            sx={{
              fontWeight: "bold",
              bgcolor:
                params.value === "approved"
                  ? "success.light"
                  : params.value === "pending"
                    ? "warning.light"
                    : "error.light",
              color:
                params.value === "approved"
                  ? "success.dark"
                  : params.value === "pending"
                    ? "warning.dark"
                    : "error.dark",
            }}
          />
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
          if (row.accountSource === "pending_user") return null;
          if (!canManageUsers && role !== "team_lead") return null;
          return <ActionsCell row={row} />;
        },
      },
    ],
    [role]
  );
  const rows = React.useMemo(
    () => (Array.isArray(dataGridProps.rows) ? dataGridProps.rows : []),
    [dataGridProps.rows]
  );

  return (
    <MapTablePage>
      <List headerButtons={() => null}>
        {dataGridProps.loading ? (
          <TableSkeleton columns={columns.length} />
        ) : (
          <Box>
            <DataGrid
            {...dataGridProps}
            rows={rows}
            rowCount={rows.length}
            columns={columns}
            autoHeight
            rowHeight={34}
            columnHeaderHeight={38}
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
            <Box sx={{ display: "flex", alignItems: "center", mt: 1, gap: 1 }}>
              <TableBottomActions
                createButton={canAddUsers ? <CreateButton /> : null}
              />
              <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
                <TableCenterLogo />
              </Box>
            </Box>
          </Box>
        )}
      </List>
    </MapTablePage>
  );
};
