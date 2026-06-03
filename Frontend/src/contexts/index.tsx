  export * from "./ColorModeContext";
  export * from "./SiteContext";
  export * from "./AuthContext";
  export * from "./LogoutConfirmContext";

  // Combined Provider
  import React from "react";
  import { ColorModeProvider } from "./ColorModeContext";
  import { SiteProvider } from "./SiteContext";
  import { AuthProvider } from "./AuthContext";
  import { LogoutConfirmProvider } from "./LogoutConfirmContext";

  export const ContextProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    return (
      <ColorModeProvider>
        <LogoutConfirmProvider>
          <AuthProvider>
            <SiteProvider>{children}</SiteProvider>
          </AuthProvider>
        </LogoutConfirmProvider>
      </ColorModeProvider>
    );
  };
