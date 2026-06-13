import { Authenticated, ErrorComponent } from "@refinedev/core";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { lazy, Suspense } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import { useAuthContext } from "../contexts";
import {
  AuthPage,
  DashboardPage,
  SiteCreate,
  SiteEdit,
  SiteList,
  SiteShow,
  UserList,
  UsersEdit,
  UserShow,
  UserCreate,
  LimitsList,
  LimitsCreate,
  LimitsEdit,
  LimitsShow,
} from "../pages";
import { ThemedLayoutV2 } from "@refinedev/mui";
import {
  CatchAllNavigate,
  NavigateToResource,
} from "@refinedev/react-router-v6";
import { Title, CustomSider } from "../components";
import { PersistentDashboardMap } from "../components";
import {
  canAccessSettings,
  canCreateSites,
  canCreateUsers,
  canViewSensors,
  canViewUsers,
  canEditSensors,
} from "../utils";

const SettingsPage = lazy(() =>
  import("../pages/settings").then((module) => ({
    default: module.SettingsPage,
  }))
);

const RouteFallback = () => (
  <Box
    sx={{
      alignItems: "center",
      display: "flex",
      justifyContent: "center",
      minHeight: "100dvh",
      width: "100%",
    }}
  >
    <CircularProgress />
  </Box>
);

const AppRoutes: React.FC = () => {
  const { role } = useAuthContext();
  const canManageSites = canCreateSites(role);
  const canAddUsers = canCreateUsers(role);

  return (
    <Routes>
      <Route
        element={
          <Authenticated
            key="authenticated-routes"
            fallback={<CatchAllNavigate to="/login" />}
          >
            <ThemedLayoutV2
              Header={() => null}
              Title={Title}
              Sider={CustomSider}
              initialSiderCollapsed={true}
            >
              <PersistentDashboardMap />
              <Outlet />
            </ThemedLayoutV2>
          </Authenticated>
        }
      >
        <Route index element={<DashboardPage />} />
        {canAccessSettings(role) && (
          <Route
            path="/settings"
            element={
              <Suspense fallback={<RouteFallback />}>
                <SettingsPage />
              </Suspense>
            }
          />
        )}

        <Route path="/sites">
          <Route index element={<SiteList />} />
          {canManageSites && (
            <>
              <Route path="create" element={<SiteCreate />} />
              <Route
                path="edit/:id"
                element={
                  <>
                    <SiteList />
                    <SiteEdit />
                  </>
                }
              />
              <Route
                path="show/:id"
                element={
                  <>
                    <SiteList />
                    <SiteShow />
                  </>
                }
              />
            </>
          )}
        </Route>

        {canViewSensors(role) ? (
          <Route path="/limits">
            <Route index element={<LimitsList />} />
            <Route
              path="show/:id"
              element={
                <>
                  <LimitsList />
                  <LimitsShow />
                </>
              }
            />
            {canEditSensors(role) && (
              <>
                <Route path="create" element={<LimitsCreate />} />
                <Route
                  path="edit/:id"
                  element={
                    <>
                      <LimitsList />
                      <LimitsEdit />
                    </>
                  }
                />
              </>
            )}
          </Route>
        ) : null}

        {canViewUsers(role) ? (
          <Route path="/users">
            <Route index element={<UserList />} />
            {canAddUsers && <Route path="create" element={<UserCreate />} />}
            <Route
              path="edit/:id"
              element={
                <>
                  <UserList />
                  <UsersEdit />
                </>
              }
            />
            <Route
              path="show/:id"
              element={
                <>
                  <UserList />
                  <UserShow />
                </>
              }
            />
          </Route>
        ) : null}
        <Route path="*" element={<ErrorComponent />} />
      </Route>
      <Route
        element={
          <Authenticated key="authenticated-outer" fallback={<Outlet />}>
            <NavigateToResource />
          </Authenticated>
        }
      >
        <Route path="/login" element={<AuthPage type="login" />} />
        {/* Registration removed - Admin will add users from dashboard */}
        <Route
          path="/forgot-password"
          element={<AuthPage type="forgotPassword" />}
        />
        <Route path="/verify-otp" element={<AuthPage type="verifyOtp" />} />
        <Route
          path="/update-password"
          element={<AuthPage type="updatePassword" />}
        />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
