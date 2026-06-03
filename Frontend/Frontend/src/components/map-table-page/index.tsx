import type { ReactNode } from "react";
import { Box } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { MapBackgroundPage } from "../map-background-page";

export const MapTablePage = ({ children }: { children: ReactNode }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <MapBackgroundPage>
      <Box
        sx={{
          width: "100%",
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          px: { xs: 1.5, sm: 2.5, md: 3 },
          py: { xs: 1.5, md: 3 },
          pointerEvents: "none",
        }}
      >
        <Box
          sx={{
            width: "min(1480px, calc(100vw - 88px))",
            maxHeight: "calc(100dvh - 48px)",
            ml: { xs: 0, md: 1 },
            overflow: "auto",
            pointerEvents: "auto",
            animation:
              "tableFromSidebar 520ms cubic-bezier(0.16, 1, 0.3, 1) both",
            transformOrigin: "left center",
            "@keyframes tableFromSidebar": {
              "0%": {
                opacity: 0,
                transform: "translateX(-64px) scale(0.985)",
                filter: "blur(3px)",
              },
              "68%": {
                opacity: 1,
                transform: "translateX(8px) scale(1)",
                filter: "blur(0)",
              },
              "100%": {
                opacity: 1,
                transform: "translateX(0) scale(1)",
                filter: "blur(0)",
              },
            },
            "& .MuiPaper-root": {
              backgroundColor: alpha(
                theme.palette.background.paper,
                isDark ? 0.84 : 0.9
              ),
              backdropFilter: "blur(8px)",
              border: `1px solid ${alpha(theme.palette.divider, 0.52)}`,
              boxShadow: `0 18px 48px ${alpha(
                theme.palette.common.black,
                isDark ? 0.34 : 0.16
              )}`,
            },
            "& .MuiDataGrid-root": {
              backgroundColor: alpha(
                theme.palette.background.paper,
                isDark ? 0.7 : 0.78
              ),
              borderColor: alpha(theme.palette.divider, 0.48),
            },
            "& .MuiDataGrid-toolbarContainer": {
              px: 1,
              py: 1,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.36)}`,
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: alpha(
                theme.palette.background.default,
                isDark ? 0.42 : 0.68
              ),
            },
            "& .MuiDataGrid-row": {
              backgroundColor: alpha(
                theme.palette.background.paper,
                isDark ? 0.36 : 0.56
              ),
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.09),
            },
            "@media (max-width: 899px)": {
              width: "100%",
              maxHeight: "calc(100dvh - 24px)",
              animation:
                "tableFromSidebarMobile 420ms cubic-bezier(0.16, 1, 0.3, 1) both",
              "@keyframes tableFromSidebarMobile": {
                "0%": {
                  opacity: 0,
                  transform: "translateY(22px)",
                },
                "100%": {
                  opacity: 1,
                  transform: "translateY(0)",
                },
              },
            },
          }}
        >
          {children}
        </Box>
      </Box>
    </MapBackgroundPage>
  );
};

export default MapTablePage;
