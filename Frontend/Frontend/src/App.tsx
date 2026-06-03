import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import {
  useNotificationProvider,
  RefineSnackbarProvider,
} from "@refinedev/mui";
import GlobalStyles from "@mui/material/GlobalStyles";
import CssBaseline from "@mui/material/CssBaseline";
import { alpha } from "@mui/material/styles";
import routerProvider, {
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";

import { useAuthContext, useLogoutConfirm } from "./contexts";
import Routes from "./routes";
import {
  useAuthProvider,
  userProvider,
  siteProvider,
  sensorProvider,
  limitsProvider,
  archivesProvider,
} from "./providers";
import { getResources } from "./utils";

const App: React.FC = () => {
  const { role } = useAuthContext();
  const { confirm } = useLogoutConfirm();
  const authProvider = useAuthProvider(confirm);
  const resources = role ? getResources(role) : [];

  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <CssBaseline />
        <GlobalStyles
          styles={(theme) => {
            const isDark = theme.palette.mode === "dark";
            const primaryMain = theme.palette.primary.main;
            const sidebarLine = alpha(theme.palette.divider, isDark ? 0.38 : 0.58);
            const hoverSurface = alpha(
              theme.palette.background.paper,
              isDark ? 0.22 : 0.62
            );
            const neutralShadow = alpha(
              isDark ? theme.palette.common.black : theme.palette.text.primary,
              isDark ? 0.32 : 0.14
            );
            const activeShadow = alpha(primaryMain, isDark ? 0.42 : 0.30);
            const activeShadowStrong = alpha(primaryMain, isDark ? 0.56 : 0.42);
            const activeInset = alpha(
              theme.palette.primary.contrastText,
              isDark ? 0.62 : 0.82
            );
            const activeInsetStrong = alpha(
              theme.palette.primary.contrastText,
              isDark ? 0.78 : 0.96
            );
            const tooltipBg = isDark
              ? theme.palette.background.paper
              : theme.palette.text.primary;

            return {
            html: { WebkitFontSmoothing: "auto" },
            body: { margin: 0, padding: 0 },
            "#root": { minHeight: "100dvh" },
            "@keyframes sidebarIconTwist": {
              "0%": { transform: "rotate(0deg) scale(1)" },
              "45%": { transform: "rotate(-14deg) scale(1.18)" },
              "100%": { transform: "rotate(-8deg) scale(1.12)" },
            },
            "@keyframes sidebarLabelFloat": {
              "0%": {
                opacity: 0,
                transform: "translate(-24px, -50%) scale(0.92)",
              },
              "65%": {
                opacity: 1,
                transform: "translate(4px, -50%) scale(1.02)",
              },
              "100%": {
                opacity: 1,
                transform: "translate(0, -50%) scale(1)",
              },
            },
            "@keyframes sidebarActiveGlow": {
              "0%, 100%": {
                boxShadow:
                  `0 10px 24px ${activeShadow}, inset 3px 0 0 ${activeInset}`,
              },
              "50%": {
                boxShadow:
                  `0 14px 30px ${activeShadowStrong}, inset 3px 0 0 ${activeInsetStrong}`,
              },
            },
            "main.MuiBox-root": {
              padding: "0 !important",
              margin: "0 !important",
              overflow: "hidden",
            },
            "@media (min-width: 900px)": {
              ".MuiBox-root:has(+ nav .MuiDrawer-docked [data-sidebar-collapsed='true'])":
                {
                  width: "56px !important",
                  minWidth: "56px !important",
                  height: "100vh !important",
                },
              ".MuiBox-root:has(+ nav .MuiDrawer-docked [data-sidebar-collapsed='false'])":
                {
                  width: "240px !important",
                  minWidth: "240px !important",
                  height: "100vh !important",
                },
              "nav:has(.MuiDrawer-docked [data-sidebar-collapsed='true'])": {
                width: "56px !important",
                height: "100vh !important",
                background: "transparent !important",
              },
              "nav:has(.MuiDrawer-docked [data-sidebar-collapsed='false'])": {
                width: "240px !important",
                height: "100vh !important",
                background: "transparent !important",
              },
              ".MuiDrawer-docked": {
                height: "100vh !important",
                background: "transparent !important",
              },
              ".MuiDrawer-docked .MuiDrawer-paper": {
                top: "0 !important",
                bottom: "0 !important",
                height: "100vh !important",
                minHeight: "100vh !important",
                maxHeight: "100vh !important",
                borderRight: `1px solid ${sidebarLine}`,
                background: "transparent !important",
                backgroundColor: "transparent !important",
                boxShadow: "none",
                transition:
                  "width 240ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 180ms ease",
                overflow: "hidden !important",
              },
              ".MuiDrawer-docked:has([data-sidebar-collapsed='true']) .MuiDrawer-paper":
                {
                  width: "56px !important",
                  overflow: "visible !important",
                },
              ".MuiDrawer-docked:has([data-sidebar-collapsed='false']) .MuiDrawer-paper":
                {
                  width: "240px !important",
                  overflow: "hidden !important",
                },
              ".MuiDrawer-docked:has([data-sidebar-collapsed='false']) .MuiDrawer-paper *":
                {
                  boxSizing: "border-box",
                },
              ".MuiDrawer-docked .MuiPaper-root": {
                height: "64px !important",
                minHeight: "64px !important",
                background: "transparent !important",
                borderBottom: `1px solid ${sidebarLine}`,
              },
              ".MuiDrawer-docked .MuiPaper-root .MuiIconButton-root": {
                width: "34px",
                height: "34px",
                borderRadius: "12px",
                color: "text.secondary",
                transition:
                  "background-color 180ms ease, transform 180ms ease, box-shadow 180ms ease",
              },
              ".MuiDrawer-docked .MuiPaper-root .MuiIconButton-root:hover": {
                backgroundColor: hoverSurface,
                boxShadow: `0 8px 18px ${neutralShadow}`,
                transform: "scale(1.05)",
              },
              ".MuiDrawer-docked .MuiDrawer-paper > .MuiBox-root": {
                height: "calc(100vh - 64px) !important",
                background: "transparent !important",
                backgroundColor: "transparent !important",
                overflowX: "hidden !important",
                overflowY: "auto !important",
              },
              ".MuiDrawer-docked:has([data-sidebar-collapsed='true']) .MuiDrawer-paper > .MuiBox-root":
                {
                  overflow: "visible !important",
                },
              ".MuiDrawer-docked .MuiList-root": {
                paddingTop: "8px !important",
                paddingBottom: "8px !important",
              },
              ".MuiDrawer-docked:has([data-sidebar-collapsed='true']) .MuiList-root": {
                overflow: "visible !important",
              },
              ".MuiDrawer-docked .MuiListItemButton-root": {
                minHeight: "42px",
                margin: "3px 7px",
                borderRadius: "12px",
                position: "relative",
                display: "flex",
                alignItems: "center",
                width: "calc(100% - 14px)",
                maxWidth: "calc(100% - 14px)",
                transition:
                  "background-color 180ms ease, color 180ms ease, box-shadow 180ms ease, transform 180ms ease",
              },
              ".MuiDrawer-docked:has([data-sidebar-collapsed='true']) .MuiListItemButton-root":
                {
                  overflow: "visible",
                },
              ".MuiDrawer-docked:has([data-sidebar-collapsed='true']) .MuiListItemText-root":
                {
                  position: "absolute",
                  left: "54px",
                  top: "50%",
                  minWidth: "170px",
                  margin: 0,
                  padding: "10px 16px",
                  borderRadius: "999px",
                  color: "#fff",
                  backgroundColor: tooltipBg,
                  boxShadow: `0 14px 34px ${neutralShadow}`,
                  opacity: 0,
                  pointerEvents: "none",
                  transform: "translate(-24px, -50%) scale(0.92)",
                  transformOrigin: "left center",
                  whiteSpace: "nowrap",
                  zIndex: 1400,
                },
              ".MuiDrawer-docked:has([data-sidebar-collapsed='true']) .MuiListItemText-root::before":
                {
                  content: "\"\"",
                  position: "absolute",
                  left: "-6px",
                  top: "50%",
                  width: "12px",
                  height: "12px",
                  backgroundColor: tooltipBg,
                  transform: "translateY(-50%) rotate(45deg)",
                  borderRadius: "4px",
                },
              ".MuiDrawer-docked .MuiListItemIcon-root": {
                minWidth: "38px",
                width: "38px",
                height: "34px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "10px",
                color: "text.secondary",
                transition:
                  "background-color 180ms ease, transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1), color 180ms ease",
              },
              ".MuiDrawer-docked .MuiListItemIcon-root .MuiSvgIcon-root": {
                fontSize: "22px",
              },
              ".MuiDrawer-docked:has([data-sidebar-collapsed='false']) .MuiListItemText-root":
                {
                  position: "static !important",
                  minWidth: "0 !important",
                  margin: "0 0 0 6px !important",
                  padding: "0 !important",
                  borderRadius: "0 !important",
                  color: "inherit !important",
                  backgroundColor: "transparent !important",
                  boxShadow: "none !important",
                  opacity: "1 !important",
                  pointerEvents: "auto !important",
                  transform: "none !important",
                  whiteSpace: "normal !important",
                  overflow: "hidden !important",
                  flex: "1 1 auto",
                },
              ".MuiDrawer-docked:has([data-sidebar-collapsed='false']) .MuiListItemText-root::before":
                {
                  content: "none !important",
                },
              ".MuiDrawer-docked:has([data-sidebar-collapsed='false']) .MuiListItemText-primary":
                {
                  display: "block",
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  lineHeight: 1.25,
              },
              ".MuiDrawer-docked .MuiListItemText-primary": {
                fontWeight: 600,
                letterSpacing: "0 !important",
                transition:
                  "transform 260ms cubic-bezier(0.16, 1, 0.3, 1), color 180ms ease",
              },
              ".MuiDrawer-docked .MuiListItemButton-root:hover": {
                backgroundColor: hoverSurface,
                boxShadow: `0 8px 20px ${neutralShadow}`,
                transform: "translateX(1px)",
              },
              ".MuiDrawer-docked .MuiListItemButton-root:hover .MuiListItemIcon-root":
                {
                  animation:
                    "sidebarIconTwist 260ms cubic-bezier(0.16, 1, 0.3, 1) both",
                },
              ".MuiDrawer-docked .MuiListItemButton-root:hover .MuiListItemText-primary":
                {
                  transform: "translateX(2px)",
                },
              ".MuiDrawer-docked:has([data-sidebar-collapsed='true']) .MuiListItemButton-root:hover .MuiListItemText-root":
                {
                  animation:
                    "sidebarLabelFloat 340ms cubic-bezier(0.16, 1, 0.3, 1) both",
                },
              ".MuiDrawer-docked .MuiListItemButton-root.Mui-selected.Mui-selected":
                {
                  backgroundColor: "#1976d2 !important",
                  color: "#fff !important",
                  boxShadow:
                    `0 10px 24px ${activeShadow}, inset 3px 0 0 ${activeInset}`,
                  animation: "sidebarActiveGlow 2200ms ease-in-out infinite",
                },
              ".MuiDrawer-docked .MuiListItemButton-root.Mui-selected.Mui-selected .MuiListItemIcon-root":
                {
                  color: "#fff !important",
                  transform: "scale(1.08)",
                },
              ".MuiDrawer-docked .MuiListItemButton-root.Mui-selected.Mui-selected .MuiListItemText-root":
                {
                  color: "#fff !important",
                },
              ".MuiDrawer-docked:has([data-sidebar-collapsed='true']) .MuiListItemButton-root.Mui-selected.Mui-selected .MuiListItemText-root":
                {
                  backgroundColor: "#1976d2",
                  color: "#fff",
                },
              ".MuiDrawer-docked:has([data-sidebar-collapsed='true']) .MuiListItemButton-root.Mui-selected.Mui-selected .MuiListItemText-root::before":
                {
                  backgroundColor: "#1976d2",
                },
              ".MuiDrawer-docked .MuiListItemButton-root.Mui-selected.Mui-selected:hover":
                {
                  backgroundColor: "#115293 !important",
                },
              ".MuiDrawer-docked:has([data-sidebar-collapsed='true']) .MuiListItemButton-root.Mui-selected.Mui-selected:hover .MuiListItemText-root":
                {
                  backgroundColor: "#115293",
                },
              ".MuiDrawer-docked:has([data-sidebar-collapsed='true']) .MuiListItemButton-root.Mui-selected.Mui-selected:hover .MuiListItemText-root::before":
                {
                  backgroundColor: "#115293",
                },
              ".MuiDrawer-docked .MuiListItemButton-root.Mui-selected.Mui-selected:hover .MuiListItemIcon-root":
                {
                  transform: "rotate(-10deg) scale(1.16)",
                },
              ".MuiDrawer-docked .MuiListItemButton-root.Mui-selected": {
                boxShadow:
                  `0 10px 24px ${activeShadow}, inset 3px 0 0 ${activeInset}`,
              },
              ".MuiDrawer-docked .MuiListItemButton-root.Mui-selected:hover": {
                backgroundColor: "primary.dark",
              },
              ".MuiDrawer-docked .MuiListItemButton-root.Mui-selected .MuiListItemIcon-root":
                {
                  transform: "scale(1.08)",
                },
              ".MuiDrawer-docked .MuiListItemButton-root.Mui-selected:hover .MuiListItemIcon-root":
                {
                  transform: "rotate(-10deg) scale(1.16)",
                },
              ".MuiDrawer-docked a": {
                textDecoration: "none",
              },
            },
          };
        }}
        />
        <RefineSnackbarProvider>
          <Refine
            dataProvider={{
              default: siteProvider,
              sensors: sensorProvider,
              limits: limitsProvider,
              users: userProvider,
              archives: archivesProvider,
            }}
            notificationProvider={useNotificationProvider}
            routerProvider={routerProvider}
            authProvider={authProvider}
            resources={resources}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
              breadcrumb: false,
              useNewQueryKeys: true,
              projectId: "u4D9YG-XrYklo-sAluut",
            }}
          >
            <Routes />
            <RefineKbar />
            <UnsavedChangesNotifier />
          </Refine>
        </RefineSnackbarProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
};

export default App;
