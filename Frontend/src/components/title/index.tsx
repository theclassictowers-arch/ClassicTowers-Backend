import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import MemoryIcon from "@mui/icons-material/Memory";
import { useTheme } from "@mui/material/styles";
import { HamburgerMenu } from "@refinedev/mui";
import LogoTextBlack from "../../assets/images/logo_text_black.png";
import LogoTextWhite from "../../assets/images/logo_text_white.png";

type TitleProps = {
  collapsed: boolean;
};

export const Title: React.FC<TitleProps> = ({ collapsed }) => {
  const theme = useTheme();

  const logoText =
    theme.palette.mode === "light" ? LogoTextBlack : LogoTextWhite;

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
        justifyContent="center"
        gap="8px"
        sx={{
          padding: "8px",
          width: "100%",
          minWidth: 0,
          borderRadius: "8px",
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          position: "relative",
          overflow: "hidden",
          transition: "box-shadow 180ms ease, transform 180ms ease",
          "&:hover": {
            boxShadow: "0 8px 18px rgba(15, 23, 42, 0.12)",
            transform: "translateY(-1px)",
          },
        }}
      >
        <Box display="flex" alignItems="center" gap={1.25} minWidth={0}>
          <MemoryIcon
            sx={{
              flexShrink: 0,
              fontSize: 32,
              color: theme.palette.mode === "light" ? "#0b70c2" : "#67B7F7",
              "&:active": {
                color: theme.palette.mode === "light" ? "#0b70c2" : "#fff",
                backgroundColor:
                  theme.palette.mode === "light" ? "#f5f5f5" : "#000",
              },
            }}
          />
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            minWidth={0}
          >
            <img
              src={logoText}
              width={120}
              alt="PLC Logo"
              style={{
                display: "block",
                maxWidth: "100%",
                filter: `drop-shadow(0 1px 2px ${theme.palette.divider})`,
              }}
            />
          </Box>
        </Box>
      </Box>
    </Link>
  );
};
