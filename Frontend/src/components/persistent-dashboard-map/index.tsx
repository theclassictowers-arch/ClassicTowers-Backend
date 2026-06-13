import { useCallback, useEffect } from "react";
import { Box } from "@mui/material";
import { useList } from "@refinedev/core";
import { io } from "socket.io-client";
import { useLocation } from "react-router-dom";
import { SitesMap } from "../dashboard";

const { VITE_API_BASE_URL } = import.meta.env;

export const PersistentDashboardMap = () => {
  const { pathname } = useLocation();
  const {
    data: siteData,
    isLoading,
    refetch,
  } = useList({
    resource: "sites",
    dataProviderName: "default",
    errorNotification: false,
  });

  const handleNewData = useCallback(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    const socket = VITE_API_BASE_URL ? io(VITE_API_BASE_URL) : io();
    socket.on("newData", handleNewData);

    return () => {
      socket.disconnect();
    };
  }, [handleNewData]);

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        backgroundColor: "background.default",
        pointerEvents: pathname === "/" ? "auto" : "none",
      }}
    >
      <SitesMap siteData={siteData} isLoading={isLoading} />
    </Box>
  );
};

export default PersistentDashboardMap;
