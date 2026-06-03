import { Authenticated, ErrorComponent } from "@refinedev/core";
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
  LimitsEdit,
  LimitsShow,
  SettingsPage,
} from "../pages";
import { ThemedLayoutV2 } from "@refinedev/mui";
import {
  CatchAllNavigate,
  NavigateToResource,
} from "@refinedev/react-router-v6";
import { Title } from "../components";

const AppRoutes: React.FC = () => {
  const { role } = useAuthContext();
  const isAdmin = role === "admin";
  const isTeamLead = role === "team_lead";
  const isOrganization = role === "organization";
  const canAddUsers = isAdmin || isOrganization || isTeamLead;

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
              initialSiderCollapsed={true}
            >
              <Outlet />
            </ThemedLayoutV2>
          </Authenticated>
        }
      >
        <Route index element={<DashboardPage />} />
        {(isAdmin || isOrganization) && (
          <Route path="/settings" element={<SettingsPage />} />
        )}

        <Route path="/sites">
          <Route index element={<SiteList />} />
          {(isAdmin || isOrganization) && (
            <>
              <Route path="create" element={<SiteCreate />} />
              <Route path="edit/:id" element={<SiteEdit />} />
              <Route path="show/:id" element={<SiteShow />} />
            </>
          )}
        </Route>

        {isAdmin || isTeamLead ? (
          <Route path="/limits">
            <Route index element={<LimitsList />} />
            <Route path="show/:id" element={<LimitsShow />} />
            {isAdmin && <Route path="edit/:id" element={<LimitsEdit />} />}
          </Route>
        ) : null}

        {isAdmin || isTeamLead || isOrganization ? (
          <Route path="/users">
            <Route index element={<UserList />} />
            {canAddUsers && <Route path="create" element={<UserCreate />} />}
            <Route path="edit/:id" element={<UsersEdit />} />
            <Route path="show/:id" element={<UserShow />} />
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
        <Route
          path="/verify-otp"
          element={<AuthPage type="verifyOtp" />}
        />
        <Route
          path="/update-password"
          element={<AuthPage type="updatePassword" />}
        />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
