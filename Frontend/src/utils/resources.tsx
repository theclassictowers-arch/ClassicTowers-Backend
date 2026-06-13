import Dashboard from "@mui/icons-material/Dashboard";
import PeopleAltTwoToneIcon from "@mui/icons-material/PeopleAltTwoTone";
import RoomTwoToneIcon from "@mui/icons-material/RoomTwoTone";
import AdjustIcon from "@mui/icons-material/Adjust";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  canAccessSettings,
  canCreateSites,
  canEditSensors,
  canViewSensors,
  normalizeRole,
} from "./access";

export const getResources = (role: string) => {
  const currentRole = normalizeRole(role);
  const canManageSites = canCreateSites(currentRole);

  const baseResources = [
    {
      name: "dashboard",
      list: "/",
      meta: {
        label: "Dashboard",
        icon: <Dashboard />,
      },
    },
    ...(!canManageSites
      ? [
          {
            name: "sites",
            list: "/sites",
            show: "/sites/show/:id",
            meta: {
              label: "Sites",
              icon: <RoomTwoToneIcon />,
            },
          },
        ]
      : []),
  ];

  const adminResources = currentRole === "admin"
    ? [
        {
          name: "sites",
          list: "/sites",
          create: "/sites/create",
          edit: "/sites/edit/:id",
          show: "/sites/show/:id",
          meta: {
            label: "Sites",
            icon: <RoomTwoToneIcon />,
          },
        },
        {
          name: "limits",
          list: "/limits",
          ...(canEditSensors(currentRole)
            ? {
                create: "/limits/create",
                edit: "/limits/edit/:id",
              }
            : {}),
          show: "/limits/show/:id",
          meta: {
            label: "Sensors",
            icon: <AdjustIcon />,
          },
        },
        {
          name: "users",
          list: "/users",
          create: "/users/create",
          edit: "/users/edit/:id",
          show: "/users/show/:id",
          meta: {
            label: "Users",
            icon: <PeopleAltTwoToneIcon />,
          },
        },
      ]
    : [];

  const teamLeadResources = currentRole === "team_lead"
    ? [
        {
          name: "users",
          list: "/users",
          create: "/users/create",
          edit: "/users/edit/:id",
          show: "/users/show/:id",
          meta: {
            label: "Users",
            icon: <PeopleAltTwoToneIcon />,
          },
        },
        {
          name: "limits",
          list: "/limits",
          show: "/limits/show/:id",
          meta: {
            label: "Sensors",
            icon: <AdjustIcon />,
          },
        },
      ]
    : [];

  const organizationResources =
    currentRole === "organization"
      ? [
          {
            name: "sites",
            list: "/sites",
            create: "/sites/create",
            show: "/sites/show/:id",
            meta: {
              label: "Sites",
              icon: <RoomTwoToneIcon />,
            },
          },
          {
            name: "users",
            list: "/users",
            create: "/users/create",
            edit: "/users/edit/:id",
            show: "/users/show/:id",
            meta: {
              label: "Users",
              icon: <PeopleAltTwoToneIcon />,
            },
          },
        ]
      : [];

  const settingsResources = canAccessSettings(currentRole)
    ? [
        {
          name: "settings",
          list: "/settings",
          meta: {
            label: "Settings",
            icon: <SettingsIcon />,
          },
        },
      ]
    : [];

  return [
    ...baseResources,
    ...adminResources,
    ...(canViewSensors(currentRole) ? teamLeadResources : []),
    ...organizationResources,
    ...settingsResources,
  ];
};
