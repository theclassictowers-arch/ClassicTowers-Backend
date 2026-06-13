import { useCallback, useEffect, useMemo, useState } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import { Map } from "@vis.gl/react-google-maps";
import { styles } from "./styles";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import SatelliteAltOutlinedIcon from "@mui/icons-material/SatelliteAltOutlined";
import Markers from "./Markers";

const { VITE_MAP_ID, VITE_MAP_API_KEY } = import.meta.env;
const getCurrentMapViewStorageKey = () =>
  `currentDashboardMapView:${localStorage.getItem("userId") || "guest"}`;
const getCurrentMapTypeStorageKey = () =>
  `currentDashboardMapType:${localStorage.getItem("userId") || "guest"}`;
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
    const trimmed = value.trim();
    if (!trimmed) return null;

    const parsed = Number(trimmed);
    if (Number.isFinite(parsed)) return parsed;
  }

  return null;
};

const resolveSiteLocation = (site: any): google.maps.LatLngLiteral | null => {
  const coordinates = Array.isArray(site?.coordinates)
    ? site.coordinates
    : null;
  const statusCoordinates = Array.isArray(site?.status?.coordinates)
    ? site.status.coordinates
    : null;

  const lat = toFiniteNumber(
    site?.lat ?? site?.latitude ?? coordinates?.[1] ?? statusCoordinates?.[1]
  );
  const lng = toFiniteNumber(
    site?.lon ??
      site?.lng ??
      site?.longitude ??
      coordinates?.[0] ??
      statusCoordinates?.[0]
  );

  if (lat === null || lng === null) return null;
  return { lat, lng };
};

const extractGoogleMapsErrorText = (error: unknown): string => {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;

  if (typeof error === "object") {
    const candidate = error as Record<string, unknown>;
    const message =
      (candidate.message as string | undefined) ||
      (candidate.statusText as string | undefined) ||
      (candidate.type as string | undefined);

    if (message) return message;

    try {
      return JSON.stringify(error);
    } catch {
      return "";
    }
  }

  return String(error);
};

const buildMapsErrorMessage = (error: unknown): string => {
  const raw = extractGoogleMapsErrorText(error);
  const normalized = raw.toLowerCase();
  const origin =
    typeof window !== "undefined" ? window.location.origin : "your domain";

  if (normalized.includes("referernotallowedmaperror")) {
    return `Google Maps blocked this domain. Add \`${origin}/*\` to key HTTP referrer restrictions.`;
  }

  if (
    normalized.includes("invalidkeymaperror") ||
    normalized.includes("apikeynotfoundmaperror")
  ) {
    return "Google Maps API key is invalid. Recheck `VITE_MAP_API_KEY` value.";
  }

  if (normalized.includes("billingnotenabledmaperror")) {
    return "Google Maps billing is not enabled for this project.";
  }

  if (normalized.includes("urlauthenticationcommonerror")) {
    return "Google Maps authentication failed (`UrlAuthenticationCommonError`). Check API key application restrictions, API restrictions, and billing in Google Cloud.";
  }

  if (
    normalized.includes("apinotactivatedmaperror") ||
    normalized.includes("apiprojectmaperror")
  ) {
    return "Maps JavaScript API is not enabled for this Google Cloud project.";
  }

  if (normalized.includes("map id")) {
    return "Map ID is invalid or from a different Google Cloud project than the API key.";
  }

  if (raw) {
    return `Google Map failed to load: ${raw}`;
  }

  return "Google Map failed to load. Check API key restrictions, billing, and Maps JavaScript API enablement.";
};

type DashboardMapType = "roadmap" | "satellite";

export const SitesMap = ({ siteData, isLoading, onExpandChange }: any) => {
  const [mapLoadError, setMapLoadError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapTypeId, setMapTypeId] = useState<DashboardMapType>(() => {
    const storedMapType = localStorage.getItem(getCurrentMapTypeStorageKey());
    return storedMapType === "satellite" ? "satellite" : "roadmap";
  });

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleToggleFullscreen = useCallback(async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await document.documentElement.requestFullscreen();
  }, []);

  const handleToggleMapType = useCallback(() => {
    setMapTypeId((currentType) => {
      const nextType = currentType === "satellite" ? "roadmap" : "satellite";
      localStorage.setItem(getCurrentMapTypeStorageKey(), nextType);
      return nextType;
    });
  }, []);

  const initialMapView = useMemo(() => {
    const currentMapViewStorageKey = getCurrentMapViewStorageKey();
    const storedCurrentView = localStorage.getItem(currentMapViewStorageKey);
    if (storedCurrentView) {
      try {
        const parsed = JSON.parse(storedCurrentView);
        const lat = toFiniteNumber(parsed?.lat);
        const lng = toFiniteNumber(parsed?.lng);
        const zoom = toFiniteNumber(parsed?.zoom);

        if (lat !== null && lng !== null && zoom !== null) {
          return {
            center: { lat, lng },
            zoom,
          };
        }
      } catch {
        localStorage.removeItem(currentMapViewStorageKey);
      }
    }

    const role = localStorage.getItem("role")?.toLowerCase();
    if (role === "admin") {
      return ADMIN_WORLD_VIEW;
    }

    const storedOpeningLocation = localStorage.getItem("mapOpeningLocation");
    if (storedOpeningLocation) {
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
    }

    return DEFAULT_MAP_VIEW;
  }, []);
  const locations = useMemo(() => {
    const sites = Array.isArray(siteData?.data) ? siteData.data : [];

    return sites
      .map((site: any) => {
        const location = resolveSiteLocation(site);
        if (!location) return null;

        const updatedStatus = { ...(site?.status || {}) };
        delete updatedStatus?.coordinates;

        return {
          key: site._id,
          status: updatedStatus,
          name: site.name,
          display_name: site.display_name,
          region: site.region,
          infrastructure_id: site.infrastructure_id,
          imei: site.imei,
          location,
        };
      })
      .filter((site: any) => site !== null);
  }, [siteData]);

  return (
    <>
      <Box
        sx={styles.container}
      >
        {isLoading ? (
          <Box sx={styles.progressLoader}>
            <CircularProgress />
          </Box>
        ) : !VITE_MAP_API_KEY ? (
          <Box sx={styles.progressLoader}>
            <Typography color="error">
              Map API key missing. Please set `VITE_MAP_API_KEY`.
            </Typography>
          </Box>
        ) : mapLoadError ? (
          <Box sx={styles.progressLoader}>
            <Typography color="error" sx={{ textAlign: "center", px: 2 }}>
              {mapLoadError}
            </Typography>
          </Box>
        ) : (
          <APIProvider
            apiKey={VITE_MAP_API_KEY}
            onError={(error) => {
              setMapLoadError(buildMapsErrorMessage(error));
            }}
          >
            <Map
              defaultCenter={initialMapView.center}
              defaultZoom={initialMapView.zoom}
              onCameraChanged={(event) => {
                const { center, zoom } = event.detail;
                const mapView = {
                  center: { lat: center.lat, lng: center.lng },
                  zoom,
                };
                localStorage.setItem(
                  getCurrentMapViewStorageKey(),
                  JSON.stringify({
                    lat: mapView.center.lat,
                    lng: mapView.center.lng,
                    zoom,
                  })
                );
              }}
              style={{ width: "100%", height: "100%" }}
              gestureHandling="greedy"
              disableDefaultUI
              mapTypeId={mapTypeId}
              minZoom={2}
              restriction={{
                latLngBounds: { north: 85, south: -85, west: -180, east: 180 },
                strictBounds: true,
              }}
              {...(VITE_MAP_ID ? { mapId: VITE_MAP_ID } : {})}
            >
              <Markers points={locations} />
            </Map>
            <Stack
              direction="row"
              spacing={1}
              sx={{
                position: "absolute",
                right: 6,
                top: 6,
                zIndex: 5,
              }}
            >
              <Tooltip
                title={
                  mapTypeId === "satellite" ? "Map View" : "Satellite View"
                }
              >
                <IconButton
                  aria-label={
                    mapTypeId === "satellite" ? "Map View" : "Satellite View"
                  }
                  onClick={handleToggleMapType}
                  sx={{
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "0 8px 18px rgba(15, 23, 42, 0.16)",
                    color: "text.primary",
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  {mapTypeId === "satellite" ? (
                    <MapOutlinedIcon />
                  ) : (
                    <SatelliteAltOutlinedIcon />
                  )}
                </IconButton>
              </Tooltip>
              <Tooltip title={isFullscreen ? "Exit Full View" : "Full View"}>
                <IconButton
                  aria-label={isFullscreen ? "Exit Full View" : "Full View"}
                  onClick={handleToggleFullscreen}
                  sx={{
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "0 8px 18px rgba(15, 23, 42, 0.16)",
                    color: "text.primary",
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </IconButton>
              </Tooltip>
            </Stack>
          </APIProvider>
        )}
      </Box>
    </>
  );
};
