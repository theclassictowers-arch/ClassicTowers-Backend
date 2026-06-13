import React, { useEffect, useState, useCallback } from "react";
import { useList } from "@refinedev/core";
import { Box } from "@mui/material";
import { io } from "socket.io-client";
import { SystemAlertsTable } from "../../components/dashboard";
import { useAuthContext } from "../../contexts";

const { VITE_API_BASE_URL } = import.meta.env;

export const DashboardPage: React.FC = () => {
  const [lastUpdateTime, setLastUpdateTime] = useState<string>("");
  const { role } = useAuthContext();
  const isAdmin = role?.toLowerCase() === "admin";

  const { data: siteData, refetch: refetchSiteData } = useList({
    resource: "sites",
    dataProviderName: "default",
    errorNotification: (error) => ({
      message: "Error fetching sites data",
      description: error?.message || "An unexpected error occurred",
      type: "error",
    }),
  });

  const handleNewData = useCallback(() => {
    refetchSiteData();
    const now = new Date();
    setLastUpdateTime(
      `${now.toLocaleTimeString()} ${now.toLocaleDateString()}`
    );
  }, [refetchSiteData]);

  useEffect(() => {
    const socket = VITE_API_BASE_URL ? io(VITE_API_BASE_URL) : io();
    socket.on("newData", handleNewData);

    return () => {
      socket.disconnect();
    };
  }, [handleNewData]);

  const getLatestStatus = (siteData: any): any[] => {
    if (!siteData?.data) return [];

    const latestStatus = siteData.data
      .flatMap((site: any) => {
        const statuses = Object.values(site?.status).filter(
          (status: any) => !Array.isArray(status)
        );

        return statuses.map((status: any) => ({
          ...status,
          display_name: site.display_name,
          siteCreatedAt: site.createdAt,
        }));
      })
      .map((status: any) => {
        const timestamp = status.siteCreatedAt || new Date().toISOString();
        const [date, fullTime] = timestamp.split("T");
        const time = (fullTime || "00:00:00").split(".")[0];
        return { ...status, date, time };
      });

    const rowData = latestStatus.filter(
      (status: any) => status.status === "danger"
    );
    if (rowData.length > 0) {
      return rowData;
    }

    const warningData = latestStatus.filter(
      (status: any) => status.status === "warning"
    );
    if (warningData.length > 0) {
      return warningData;
    }

    const normalData = latestStatus.filter(
      (status: any) => status.status === "normal"
    );
    return normalData || [];
  };

  const latestStatus = getLatestStatus(siteData);

  return (
    <Box
      sx={{
        height: "100dvh",
        width: "100%",
        m: 0,
        p: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
        pointerEvents: "none",
      }}
    >
      <Box
        className="dashboard-alert-shell"
        sx={{
          flexShrink: 0,
          position: isAdmin ? "absolute" : "relative",
          top: isAdmin ? 0 : "auto",
          left: isAdmin ? 0 : "auto",
          right: isAdmin ? 0 : "auto",
          zIndex: 2,
          pointerEvents: "none",
          "& > *": {
            pointerEvents: "auto",
          },
        }}
      >
        <SystemAlertsTable
          latestStatus={latestStatus || []}
          lastUpdateTime={lastUpdateTime}
          allowResize={isAdmin}
        />
      </Box>
      <Box sx={{ flex: 1, minHeight: 0 }} />
    </Box>
  );
};
