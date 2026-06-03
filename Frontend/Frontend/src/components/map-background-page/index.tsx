import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { Box, Typography } from "@mui/material";

const { VITE_MAP_ID, VITE_MAP_API_KEY } = import.meta.env;

const ADMIN_WORLD_VIEW = {
  center: { lat: 20, lng: 0 },
  zoom: 2,
};

const DEFAULT_MAP_VIEW = {
  center: {
    lat: 23.98024724735944,
    lng: 46.506555519227064,
  },
  zoom: 6,
};

const toFiniteNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const useInitialMapView = () =>
  useMemo(() => {
    const role = localStorage.getItem("role")?.toLowerCase();
    if (role === "admin") {
      return ADMIN_WORLD_VIEW;
    }

    const storedOpeningLocation = localStorage.getItem("mapOpeningLocation");
    if (!storedOpeningLocation) {
      return DEFAULT_MAP_VIEW;
    }

    try {
      const parsed = JSON.parse(storedOpeningLocation);
      const lat = toFiniteNumber(parsed?.lat);
      const lng = toFiniteNumber(parsed?.lng);
      const zoom = toFiniteNumber(parsed?.zoom);

      if (lat !== null && lng !== null) {
        return {
          center: { lat, lng },
          zoom: zoom ?? DEFAULT_MAP_VIEW.zoom,
        };
      }
    } catch {
      return DEFAULT_MAP_VIEW;
    }

    return DEFAULT_MAP_VIEW;
  }, []);

export const MapBackgroundPage = ({ children }: { children: ReactNode }) => {
  const [mapLoadError, setMapLoadError] = useState(false);
  const initialMapView = useInitialMapView();

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        minHeight: "100dvh",
        m: 0,
        p: 0,
        overflow: "hidden",
      }}
    >
      <Box sx={{ position: "absolute", inset: 0, zIndex: 0 }}>
        {VITE_MAP_API_KEY && !mapLoadError ? (
          <APIProvider
            apiKey={VITE_MAP_API_KEY}
            onError={() => setMapLoadError(true)}
          >
            <Map
              defaultCenter={initialMapView.center}
              defaultZoom={initialMapView.zoom}
              style={{ width: "100%", height: "100%" }}
              gestureHandling="none"
              disableDefaultUI
              {...(VITE_MAP_ID ? { mapId: VITE_MAP_ID } : {})}
            />
          </APIProvider>
        ) : (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "background.default",
            }}
          >
            <Typography color="text.secondary">
              Map background unavailable
            </Typography>
          </Box>
        )}
      </Box>

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          backgroundColor: "rgba(255, 255, 255, 0.12)",
          backdropFilter: "blur(1px)",
        }}
      />

      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          minHeight: "100dvh",
          display: "flex",
          justifyContent: "right",
          alignItems: "center",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default MapBackgroundPage;
