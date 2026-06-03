import { useMemo, useState } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import { Map } from "@vis.gl/react-google-maps";
import { styles } from "./styles";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Markers from "./Markers";

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
    const trimmed = value.trim();
    if (!trimmed) return null;

    const parsed = Number(trimmed);
    if (Number.isFinite(parsed)) return parsed;
  }

  return null;
};

const resolveSiteLocation = (site: any): google.maps.LatLngLiteral | null => {
  const coordinates = Array.isArray(site?.coordinates) ? site.coordinates : null;
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

export const SitesMap = ({ siteData, isLoading }: any) => {
  const [mapLoadError, setMapLoadError] = useState<string | null>(null);

  const initialMapView = useMemo(() => {
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
      <Box sx={styles.container}>
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
              style={{ width: "100%", height: "100%" }}
              gestureHandling="greedy"
              disableDefaultUI
              {...(VITE_MAP_ID ? { mapId: VITE_MAP_ID } : {})}
            >
              <Markers points={locations} />
            </Map>
          </APIProvider>
        )}
      </Box>
    </>
  );
};
