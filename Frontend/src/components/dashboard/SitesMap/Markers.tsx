import { useState, memo, FC, useEffect, useCallback, useMemo, useRef } from "react";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { InfoWindow, useMap } from "@vis.gl/react-google-maps";
import { useSiteContext } from "../../../contexts";
import { Point } from "../../../interfaces";
import PinMarker from "./PinMarker";
import PointInfoWindow from "./PointInfoWindow";

interface MarkerProps {
  points?: Point[];
}

const getPointStatuses = (point: Point) =>
  Object.values(point.status).map((status) => status.status);

const getMarkerColor = (statuses: string[]) => {
  if (statuses.includes("danger")) return "#F44336";
  if (statuses.includes("warning")) return "#FF9800";
  if (statuses.includes("normal")) return "#4CAF50";
  return "#607D8B";
};

const getStatusGlyph = (statuses: string[]): string => {
  if (statuses.includes("danger")) return "!";
  if (statuses.includes("warning")) return "W";
  if (statuses.includes("normal")) return "";
  return "";
};

const Markers: FC<MarkerProps> = memo(({ points = [] }) => {
  const { selectedSite, setSelectedSite } = useSiteContext();
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const map = useMap();
  const [infoWindowPosition, setInfoWindowPosition] =
    useState<google.maps.LatLngLiteral | null>(null);
  const pointsHash = useMemo(
    () =>
      points
        .map((point) => `${point.key}:${point.location.lat}:${point.location.lng}`)
        .join("|"),
    [points]
  );

  // Use refs for values that shouldn't trigger re-renders
  const isDraggingRef = useRef(false);
  const initialCursorPositionRef = useRef({ x: 0, y: 0 });
  const initialInfoPositionRef = useRef<google.maps.LatLngLiteral | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const previousPointsHashRef = useRef<string>("");
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const markerListenersRef = useRef<google.maps.MapsEventListener[]>([]);

  const canUseClusteredMarkers =
    !!map &&
    typeof google !== "undefined" &&
    !!google.maps.marker?.AdvancedMarkerElement &&
    !!google.maps.marker?.PinElement;

  // Update info window position when a point is selected
  useEffect(() => {
    if (selectedPoint) {
      setInfoWindowPosition(selectedPoint.location);
      // Hide scrollbar after InfoWindow DOM is ready — JS inline style is
      // safe here (unlike CSS overrides which break GM's initialization)
      const t = setTimeout(() => {
        [".gm-style-iw-d", ".gm-style-iw", ".gm-style-iw-c"].forEach((sel) => {
          const el = document.querySelector(sel) as HTMLElement | null;
          if (el) {
            el.style.overflow = "hidden";
            el.style.backgroundColor = "transparent";
          }
        });
      }, 80);
      return () => clearTimeout(t);
    } else {
      setInfoWindowPosition(null);
    }
  }, [selectedPoint]);

  // Handle map click to close info window
  useEffect(() => {
    if (!map) return;

    const handleMapClick = () => {
      if (!isDraggingRef.current) {
        setSelectedPoint(null);
      }
    };

    const listener = map.addListener("click", handleMapClick);
    return () => listener.remove();
  }, [map]);

  // Keep map focused on available markers when the points set changes.
  useEffect(() => {
    if (!map || points.length === 0) return;
    if (previousPointsHashRef.current === pointsHash) return;

    if (points.length === 1) {
      map.panTo(points[0].location);
      map.setZoom(12);
      previousPointsHashRef.current = pointsHash;
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    points.forEach((point) => bounds.extend(point.location));
    map.fitBounds(bounds, 64);
    previousPointsHashRef.current = pointsHash;
  }, [map, points, pointsHash]);

  // Handle marker click
  const handleMarkerClick = useCallback(
    (point: Point) => {
      setSelectedPoint((prev) => (prev?.key === point.key ? null : point));
      setSelectedSite(point.location.lng, point.location.lat);
    },
    [setSelectedSite]
  );

  useEffect(() => {
    if (!map || !canUseClusteredMarkers) return;

    markerListenersRef.current.forEach((listener) => listener.remove());
    markerListenersRef.current = [];
    clustererRef.current?.clearMarkers();

    if (!points.length) return;

    const markers = points.map((point) => {
      const statuses = getPointStatuses(point);
      const pin = new google.maps.marker.PinElement({
        background: getMarkerColor(statuses),
        borderColor: "#000",
        glyph: getStatusGlyph(statuses),
        glyphColor: "#000",
      });
      const marker = new google.maps.marker.AdvancedMarkerElement({
        content: pin.element,
        position: point.location,
        title: point.display_name || point.key,
      });
      let lastFired = 0;
      const onMarkerClick = () => {
        const now = Date.now();
        if (now - lastFired < 300) return;
        lastFired = now;
        handleMarkerClick(point);
      };
      const l1 = (marker as any).addListener("gmp-click", onMarkerClick);
      const l2 = marker.addListener("click", onMarkerClick);
      markerListenersRef.current.push(l1, l2);
      return marker;
    });

    clustererRef.current = new MarkerClusterer({ map, markers });

    return () => {
      markerListenersRef.current.forEach((listener) => listener.remove());
      markerListenersRef.current = [];
      clustererRef.current?.clearMarkers();
      clustererRef.current = null;
    };
  }, [canUseClusteredMarkers, handleMarkerClick, map, points, pointsHash]);

  // Position update calculation
  const updatePosition = useCallback(
    (cursorX: number, cursorY: number) => {
      if (!map || !initialInfoPositionRef.current || !map.getProjection())
        return;

      const deltaX = cursorX - initialCursorPositionRef.current.x;
      const deltaY = cursorY - initialCursorPositionRef.current.y;
      const scale = Math.pow(2, map.getZoom() || 0);

      const initialLatLng = new google.maps.LatLng(
        initialInfoPositionRef.current.lat,
        initialInfoPositionRef.current.lng
      );

      const worldCoordinate = map
        .getProjection()
        ?.fromLatLngToPoint(initialLatLng);

      if (worldCoordinate) {
        const newWorldCoordinate = new google.maps.Point(
          worldCoordinate.x + deltaX / scale,
          worldCoordinate.y + deltaY / scale
        );

        const newLatLng = map
          .getProjection()
          ?.fromPointToLatLng(newWorldCoordinate);

        if (newLatLng) {
          setInfoWindowPosition({
            lat: newLatLng.lat(),
            lng: newLatLng.lng(),
          });
        }
      }
    },
    [map]
  );

  // Drag handlers - now checks for modal open state
  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      // Prevent drag if modal is open
      if (modalOpen) return;

      e.preventDefault();
      e.stopPropagation();

      if (!map || !infoWindowPosition) return;

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      isDraggingRef.current = true;
      initialCursorPositionRef.current = { x: e.clientX, y: e.clientY };
      initialInfoPositionRef.current = { ...infoWindowPosition };
    },
    [map, infoWindowPosition, modalOpen]
  );

  const handleDrag = useCallback(
    (e: MouseEvent) => {
      // Stop drag if modal is open
      if (modalOpen) {
        isDraggingRef.current = false;
        return;
      }

      if (!isDraggingRef.current) return;

      e.preventDefault();
      e.stopPropagation();

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        updatePosition(e.clientX, e.clientY);
      });
    },
    [updatePosition, modalOpen]
  );

  const handleDragEnd = useCallback(() => {
    isDraggingRef.current = false;

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Handle modal state changes
  const handleModalStateChange = useCallback((isOpen: boolean) => {
    setModalOpen(isOpen);

    // If modal opens while dragging, cancel the drag
    if (isOpen && isDraggingRef.current) {
      isDraggingRef.current = false;
    }
  }, []);

  // Global event listeners
  useEffect(() => {
    window.addEventListener("mousemove", handleDrag, { passive: false });
    window.addEventListener("mouseup", handleDragEnd);

    return () => {
      window.removeEventListener("mousemove", handleDrag);
      window.removeEventListener("mouseup", handleDragEnd);

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [handleDrag, handleDragEnd]);

  // Early return if no points
  if (!points.length) return null;

  return (
    <>
      {!canUseClusteredMarkers &&
        points.map((point) => (
          <PinMarker
            key={point.key}
            point={point}
            onClick={() => handleMarkerClick(point)}
          />
        ))}

      {selectedPoint && infoWindowPosition && (
        <InfoWindow
          position={infoWindowPosition}
          onCloseClick={() => setSelectedPoint(null)}
          disableAutoPan={false}
          pixelOffset={[0, -20]}
          headerDisabled
        >
          <div
            style={{
              width: "408px",
              maxWidth: "calc(100vw - 48px)",
              height: "100%",
              overflow: "hidden",
              cursor: modalOpen
                ? "default"
                : isDraggingRef.current
                ? "grabbing"
                : "grab",
              userSelect: "none",
            }}
            onMouseDown={handleDragStart}
            onClick={(e) => e.stopPropagation()}
          >
            {selectedSite && (
              <PointInfoWindow
                point={selectedPoint}
                coordinates={selectedSite}
                onModalStateChange={handleModalStateChange}
                onClose={() => setSelectedPoint(null)}
              />
            )}
          </div>
        </InfoWindow>
      )}
    </>
  );
});

export default Markers;
