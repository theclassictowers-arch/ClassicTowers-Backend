  export * from "./ColorModeContext";
  export * from "./SiteContext";
  export * from "./AuthContext";
  export * from "./LogoutConfirmContext";
  export * from "./BrandingContext";

  // Combined Provider
  import React from "react";
  import { ColorModeProvider } from "./ColorModeContext";
  import { SiteProvider } from "./SiteContext";
  import { AuthProvider } from "./AuthContext";
  import { LogoutConfirmProvider } from "./LogoutConfirmContext";
  import { BrandingProvider } from "./BrandingContext";

  export const ContextProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    return (
      <ColorModeProvider>
        <LogoutConfirmProvider>
          <AuthProvider>
            <BrandingProvider>
              <SiteProvider>{children}</SiteProvider>
            </BrandingProvider>
          </AuthProvider>
        </LogoutConfirmProvider>
      </ColorModeProvider>
    );
  };
