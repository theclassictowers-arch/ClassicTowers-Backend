import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import {
  useNotificationProvider,
  RefineSnackbarProvider,
} from "@refinedev/mui";
import GlobalStyles from "@mui/material/GlobalStyles";
import { appGlobalStyles } from "./styles/globalStyles";
import CssBaseline from "@mui/material/CssBaseline";
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

  useEffect(() => {
    const wrapChars = (el: Element) => {
      if (el.getAttribute("data-char-wrapped")) return;
      const text = el.textContent ?? "";
      if (!text.trim()) return;
      el.setAttribute("data-char-wrapped", "true");
      el.innerHTML = [...text]
        .map((ch, i) =>
          ch === " "
            ? `<span class="sidebar-menu-space"> </span>`
            : `<span class="sidebar-menu-char" style="--char-index:${i}">${ch}</span>`
        )
        .join("");
    };
    const process = () => {
      document
        .querySelectorAll("nav .MuiListItemText-primary:not([data-char-wrapped])")
        .forEach(wrapChars);
    };
    process();
    const observer = new MutationObserver(process);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  const authProvider = useAuthProvider(confirm);
  const resources = role ? getResources(role) : [];

  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <CssBaseline />
        <GlobalStyles
          styles={appGlobalStyles}
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
            <div
              aria-label="Product of Classic Electronics"
              style={{
                alignItems: "flex-end",
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                border: 0,
                borderRadius: 10,
                bottom: 10,
                display: "flex",
                flexDirection: "column",
                gap: 1,
                padding: "5px 8px 7px",
                pointerEvents: "none",
                position: "fixed",
                right: 10,
                zIndex: 1400,
              }}
            >
            
              <img
                src="/images/classic-electronics-brand-transparent.png"
                alt="Classic Electronics"
                style={{
                  display: "block",
                  height: "auto",
                  maxWidth: "36vw",
                  width: 110,
                }}
              />
            </div>
            <RefineKbar />
            <UnsavedChangesNotifier />
          </Refine>
        </RefineSnackbarProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
};

export default App;