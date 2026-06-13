import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import MemoryIcon from "@mui/icons-material/Memory";
import { useTheme, alpha } from "@mui/material/styles";
import { HamburgerMenu } from "@refinedev/mui";
import Typography from "@mui/material/Typography";
import { useBrandingContext, useColorModeContext } from "../../contexts";

type TitleProps = {
  collapsed: boolean;
};

export const Title: React.FC<TitleProps> = ({ collapsed }) => {
  const theme = useTheme();
  const { branding } = useBrandingContext();
  const { dashboardTheme } = useColorModeContext();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const logoTextLength = branding.logoText.length;
  const logoTextSize = Math.min(16, Math.max(8, branding.logoTextSize));

  const logoTextBoxWidth =
    logoTextLength >= 15
      ? Math.max(branding.logoTextWidth, 172)
      : branding.logoTextWidth;

  if (collapsed) {
    return (
      <Box
        data-sidebar-collapsed="true"
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: theme.palette.mode === "light" ? "#0b70c2" : "#fff",
          "& .MuiButtonBase-root": {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            "&:hover": {
              backgroundColor: theme.palette.action.hover,
            },
          },
        }}
      >
        <HamburgerMenu />
      </Box>
    );
  }

  return (
    <Link
      to="/"
      data-sidebar-collapsed="false"
      style={{
        display: "block",
        width: "100%",
        minWidth: 0,
        overflow: "hidden",
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="flex-start"
        gap="8px"
        sx={{
          padding: "8px 8px 8px 2px",
          width: "100%",
          minWidth: 0,
          overflow: "hidden",
          "&:hover .sidebar-logo-text-box": {
            boxShadow: "0 8px 18px rgba(15, 23, 42, 0.12)",
            transform: "translateY(-1px)",
          },
        }}
      >
        {branding.logoIconEnabled && branding.logoIcon ? (
          <Box
            component="img"
            src={`${apiBaseUrl}${branding.logoIcon}`}
            alt=""
            sx={{
              width: 34,
              height: 34,
              flexShrink: 0,
              objectFit: "contain",
            }}
          />
        ) : branding.logoIconEnabled ? (
          <MemoryIcon
            sx={{
              flexShrink: 0,
              fontSize: 32,
              color: theme.palette.mode === "light" ? "#0b70c2" : "#67B7F7",
            }}
          />
        ) : null}
        {branding.logoTextEnabled && (
          <Box
            className="sidebar-logo-text-box"
            display="flex"
            alignItems="center"
            justifyContent="center"
            minWidth={0}
            sx={{
              width: logoTextBoxWidth,
              maxWidth: "calc(100% - 42px)",
              minHeight: 28,
              px: 0.85,
              py: 0.7,
              borderRadius: "8px",
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              overflow: "hidden",
              transition: "box-shadow 180ms ease, transform 180ms ease",
            }}
          >
            <Typography
              variant="subtitle1"
              noWrap
              sx={{
                width: "100%",
                minWidth: 0,
                color: dashboardTheme.textColor,
                fontFamily:
                  "\"Arial Narrow\", \"Roboto Condensed\", Arial, sans-serif",
                fontSize: `${logoTextSize}px`,
                fontStretch: "condensed",
                fontWeight: 400,
                lineHeight: 1.15,
                letterSpacing: 0,
                textAlign: "center",
                textTransform: "none",
                textOverflow: "clip",
                textShadow:
                  theme.palette.mode === "light"
                    ? "0.35px 0 #ffffff"
                    : "0.35px 0 #111111",
              }}
            >
              {branding.logoText}
            </Typography>
          </Box>
        )}
      </Box>
    </Link>
  );
};
