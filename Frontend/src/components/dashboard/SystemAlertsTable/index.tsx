import React, { useEffect, useRef, useState } from "react";
import {
  useTheme,
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";

interface SystemAlertsTableProps {
  latestStatus: any[];
  lastUpdateTime: string;
  allowResize?: boolean;
}

export const SystemAlertsTable: React.FC<SystemAlertsTableProps> = ({
  latestStatus,
  allowResize = false,
}) => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [expandedHeight, setExpandedHeight] = useState(250);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isResizing) return;

    const getClientY = (event: MouseEvent | TouchEvent) => {
      if ("touches" in event) {
        return event.touches[0]?.clientY ?? event.changedTouches[0]?.clientY ?? 0;
      }

      return event.clientY;
    };

    const handleResize = (event: MouseEvent | TouchEvent) => {
      const top = containerRef.current?.getBoundingClientRect().top ?? 0;
      const maxHeight = Math.max(160, window.innerHeight - top - 16);
      const nextHeight = Math.min(Math.max(getClientY(event) - top, 90), maxHeight);
      setExpandedHeight(nextHeight);
    };

    const stopResize = () => setIsResizing(false);

    window.addEventListener("mousemove", handleResize);
    window.addEventListener("mouseup", stopResize);
    window.addEventListener("touchmove", handleResize, { passive: false });
    window.addEventListener("touchend", stopResize);

    return () => {
      window.removeEventListener("mousemove", handleResize);
      window.removeEventListener("mouseup", stopResize);
      window.removeEventListener("touchmove", handleResize);
      window.removeEventListener("touchend", stopResize);
    };
  }, [isResizing]);

  const renderTableRows = (data: any[]) => {
    return data.map((status: any, index: number) => {
      const timestamp = `${status.date}T${status.time}Z`;
      const utcDate = new Date(timestamp);
      const formattedTime = utcDate.toLocaleTimeString("en-GB", { hour12: false });
      return (
        <TableRow
          key={index}
          sx={{
            backgroundColor:
              status.status === "danger"
                ? theme.palette.error.light
                : status.status === "warning"
                ? theme.palette.warning.light
                : theme.palette.success.light,
            color: "#fff",
          }}
        >
          <TableCell sx={{ borderRight: "1px solid #444", color: "#111" }}>
            {status.date}
          </TableCell>
          <TableCell sx={{ borderRight: "1px solid #444", color: "#111" }}>
            {formattedTime}
          </TableCell>
          <TableCell sx={{ borderRight: "1px solid #444", color: "#111" }}>
            {status.display_name}
          </TableCell>
          <TableCell sx={{ color: "#111" }}>
            <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
              {status.message?.split(" at ")[0] || "System Status: " + status.status}
            </Typography>
          </TableCell>
        </TableRow>
      );
    });
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        width: {
          xs: "100%",
          md: isFullWidth ? "100%" : "40%",
        },
        mx: 0,
        mt: 0,
        transition: "width 320ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <Paper
        elevation={8}
        sx={{
          bgcolor: theme.palette.background.paper,
          borderRadius: 0,
          overflow: "hidden",
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: "0 14px 38px rgba(15, 23, 42, 0.22)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "stretch" }}>
          <Box sx={{ flex: 1 }}>
            <TableContainer
              sx={{
                maxHeight: isExpanded ? expandedHeight : 33,
                position: "relative",
                overflowY: isExpanded ? "auto" : "hidden",
                transition:
                  isResizing
                    ? "none"
                    : "max-height 360ms cubic-bezier(0.2, 0.8, 0.2, 1)",
                scrollBehavior: "smooth",
              }}
            >
              <Table stickyHeader size="small">
                <TableBody>
                  {latestStatus && latestStatus.length > 0 ? (
                    renderTableRows(latestStatus)
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Typography>
                            All systems are operating normally
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.25,
              px: 0.5,
              borderLeft: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Tooltip title={isFullWidth ? "40% width" : "Full width"}>
              <IconButton
                onClick={() => setIsFullWidth((current) => !current)}
                aria-label={
                  isFullWidth
                    ? "Set alerts to 40 percent width"
                    : "Set alerts to full width"
                }
                size="small"
                sx={{
                  color: theme.palette.primary.main,
                  transition:
                    "color 180ms ease, transform 180ms ease",
                  "&:hover": {
                    color: theme.palette.primary.dark,
                    bgcolor: "transparent",
                    transform: "scale(1.06)",
                  },
                  "&:active": {
                    transform: "scale(0.94)",
                  },
                }}
              >
                {isFullWidth ? (
                  <FullscreenExitIcon fontSize="small" />
                ) : (
                  <FullscreenIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip title={isExpanded ? "Collapse" : "Expand"}>
              <IconButton
                onClick={() => setIsExpanded((current) => !current)}
                aria-label={isExpanded ? "Collapse alerts" : "Expand alerts"}
                size="small"
                sx={{
                  color: theme.palette.primary.main,
                  transition:
                    "color 180ms ease, transform 360ms cubic-bezier(0.2, 0.8, 0.2, 1)",
                  transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                  "&:hover": {
                    color: theme.palette.primary.dark,
                    bgcolor: "transparent",
                  },
                  "&:active": {
                    transform: isExpanded
                      ? "rotate(180deg) scale(0.94)"
                      : "rotate(0deg) scale(0.94)",
                  },
                }}
              >
                <KeyboardArrowDownIcon fontSize="medium" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        {allowResize && isExpanded && (
          <Box
            onMouseDown={(event) => {
              event.preventDefault();
              setIsResizing(true);
            }}
            onTouchStart={(event) => {
              event.preventDefault();
              setIsResizing(true);
            }}
            sx={{
              height: 12,
              cursor: "ns-resize",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: isResizing ? "action.selected" : "background.paper",
              borderTop: `1px solid ${theme.palette.divider}`,
              transition: "background-color 180ms ease",
              touchAction: "none",
              "&::before": {
                content: "\"\"",
                width: 48,
                height: 4,
                borderRadius: 99,
                bgcolor: "text.disabled",
              },
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          />
        )}
      </Paper>
    </Box>
  );
};
