import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, IconButton, Stack, Tooltip } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { MapBackgroundPage } from "../map-background-page";

export const MapTablePage = ({ children }: { children: ReactNode }) => {
  const theme = useTheme();

  return (
    <MapBackgroundPage>
      <Box
        className="map-table-page-shell"
        sx={{
          width: "100%",
          minHeight: "100dvh",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "flex-start",
          px: { xs: 1.5, sm: 2.5, md: 3 },
          pl: { xs: 1.5, sm: 2.5, md: "76px" },
          py: { xs: 1, md: 1.5 },
          pointerEvents: "none",
        }}
      >
        <Box
          sx={{
            width: {
              xs: "100%",
              md: "100%",
            },
            maxWidth: "1420px",
            maxHeight: "calc(100dvh - 24px)",
            ml: 0,
            overflow: "auto",
            pointerEvents: "auto",
            animation:
              "tableWindowOpen 460ms cubic-bezier(0.16, 1, 0.3, 1) both",
            transformOrigin: "center top",
            "@keyframes tableWindowOpen": {
              "0%": {
                opacity: 0,
                transform: "translateY(18px) scale(0.94)",
                filter: "blur(4px)",
              },
              "72%": {
                opacity: 1,
                transform: "translateY(-3px) scale(1.01)",
                filter: "blur(0)",
              },
              "100%": {
                opacity: 1,
                transform: "translateY(0) scale(1)",
                filter: "blur(0)",
              },
            },
            "& .MuiPaper-root": {
              backgroundColor: alpha(theme.palette.background.paper, 0.3),
              backdropFilter: "blur(6px)",
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              boxShadow: "none",
            },
            "& .MuiCardHeader-root": {
              padding: "8px 12px 4px",
            },
            "& .MuiCardHeader-action": {
              marginTop: 0,
              marginRight: 0,
            },
            "& .MuiCardContent-root": {
              padding: "4px 8px 8px",
            },
            "& .MuiCardContent-root:last-child": {
              paddingBottom: "8px",
            },
            "& .MuiDataGrid-root": {
              backgroundColor: alpha(theme.palette.background.paper, 0.3),
              borderColor: alpha(theme.palette.divider, 0.28),
              backdropFilter: "blur(4px)",
            },
            "& .MuiDataGrid-toolbarContainer": {
              px: 1,
              py: 1,
              backgroundColor: alpha(theme.palette.background.paper, 0.3),
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.24)}`,
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: alpha(theme.palette.background.default, 0.3),
            },
            "& .MuiDataGrid-row": {
              backgroundColor: alpha(theme.palette.background.paper, 0.3),
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.12),
            },
            "@media (max-width: 899px)": {
              width: "100%",
              maxHeight: "calc(100dvh - 24px)",
              animation:
                "tableWindowOpenMobile 380ms cubic-bezier(0.16, 1, 0.3, 1) both",
              "@keyframes tableWindowOpenMobile": {
                "0%": {
                  opacity: 0,
                  transform: "translateY(18px) scale(0.96)",
                },
                "100%": {
                  opacity: 1,
                  transform: "translateY(0) scale(1)",
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

export const TableBottomActions = ({
  createButton,
}: {
  createButton?: ReactNode;
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={0.75}
      sx={{
        px: 0.5,
        py: 0.35,
        border: `1px solid ${alpha(theme.palette.divider, 0.22)}`,
        borderRadius: "8px",
        backgroundColor: alpha(theme.palette.background.paper, 0.66),
        backdropFilter: "blur(8px)",
        width: "fit-content",
        flexShrink: 0,
      }}
    >
      <Tooltip title="Back">
        <IconButton
          size="small"
          aria-label="Back"
          onClick={() => navigate("/")}
          sx={{
            width: 30,
            height: 30,
            borderRadius: "7px",
            color: theme.palette.primary.main,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.42)}`,
            backgroundColor: alpha(theme.palette.background.paper, 0.72),
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            },
          }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Box
        sx={{
          minWidth: 0,
          "& .MuiButton-root": {
            minWidth: "auto !important",
            height: 30,
            minHeight: "30px !important",
            px: "9px !important",
            borderRadius: "7px",
            textTransform: "none",
          },
          "& .MuiButton-startIcon": {
            mr: "4px !important",
            ml: "0 !important",
          },
        }}
      >
        {createButton}
      </Box>
    </Stack>
  );
};

export const TableCenterLogo = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        px: 0.75,
        py: 0.35,
        border: `1px solid ${alpha(theme.palette.divider, 0.22)}`,
        borderRadius: "8px",
        backgroundColor: alpha(theme.palette.background.paper, 0.66),
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        pointerEvents: "none",
        flexShrink: 0,
      }}
    >
      <Box
        component="img"
        src="/images/classic-electronics-brand-transparent.png"
        alt="Classic Electronics"
        sx={{ height: 40, width: "auto", display: "block" }}
      />
    </Box>
  );
};

export const ShowPageLogo = () => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        mt: 3,
        mb: 0.5,
        px: 0.75,
        py: 0.35,
      }}
    >
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          px: 0.75,
          py: 0.35,
          border: `1px solid ${alpha(theme.palette.divider, 0.22)}`,
          borderRadius: "8px",
          backgroundColor: alpha(theme.palette.background.paper, 0.66),
          backdropFilter: "blur(8px)",
        }}
      >
        <Box
          component="img"
          src="/images/classic-electronics-brand-transparent.png"
          alt="Classic Electronics"
          sx={{ height: 40, width: "auto", display: "block" }}
        />
      </Box>
    </Box>
  );
};

export default MapTablePage;
