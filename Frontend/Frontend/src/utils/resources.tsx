import Dashboard from "@mui/icons-material/Dashboard";
import PeopleAltTwoToneIcon from "@mui/icons-material/PeopleAltTwoTone";
import RoomTwoToneIcon from "@mui/icons-material/RoomTwoTone";
import AdjustIcon from "@mui/icons-material/Adjust";
import SettingsIcon from "@mui/icons-material/Settings";

export const getResources = (role: string) => {
  const isAdmin = role === "admin";
  const isTeamLead = role === "team_lead";

  const isOrganization = role === "organization";
  const canManageSettings = isAdmin || isOrganization;

  const baseResources = [
    {
      name: "dashboard",
      list: "/",
      meta: {
        label: "Dashboard",
        icon: <Dashboard />,
      },
    },
    ...(!isAdmin && !isOrganization
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

  const adminResources = isAdmin
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
          edit: "/limits/edit/:id",
          show: "/limits/show/:id",
          meta: {
            label: "Sensor limits",
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

  const teamLeadResources = isTeamLead
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
            label: "Sensor limits",
            icon: <AdjustIcon />,
          },
        },
      ]
    : [];

  const organizationResources = role === "organization"
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

  const settingsResources = canManageSettings
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
    ...teamLeadResources,
    ...organizationResources,
    ...settingsResources,
  ];
};
