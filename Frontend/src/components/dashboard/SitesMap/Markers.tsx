import { useState, memo, FC, useEffect, useCallback, useMemo, useRef } from "react";
import { InfoWindow, useMap } from "@vis.gl/react-google-maps";
import { useSiteContext } from "../../../contexts";
import { Point } from "../../../interfaces";
import PinMarker from "./PinMarker";
import PointInfoWindow from "./PointInfoWindow";

interface MarkerProps {
  points?: Point[];
}

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

  // Update info window position when a point is selected
  useEffect(() => {
    if (selectedPoint) {
      setInfoWindowPosition(selectedPoint.location);
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
      {points.map((point) => (
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
        >
          <div
            style={{
              width: "408px",
              maxWidth: "calc(100vw - 48px)",
              height: "100%",
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
              />
            )}
          </div>
        </InfoWindow>
      )}
    </>
  );
});

export default Markers;
