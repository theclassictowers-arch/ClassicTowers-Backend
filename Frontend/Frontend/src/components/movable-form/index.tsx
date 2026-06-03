import React, { useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import { type SxProps, type Theme, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

type Position = {
  x: number;
  y: number;
};

type InteractionState =
  | {
      mode: "drag";
      startX: number;
      startY: number;
      originX: number;
      originY: number;
    }
  | {
      mode: "resize-width";
      startX: number;
      originWidth: number;
    }
  | {
      mode: "resize-height";
      startY: number;
      originHeight: number;
    }
  | {
      mode: "resize-both";
      startX: number;
      startY: number;
      originWidth: number;
      originHeight: number;
    }
  | null;

type MovableFormProps = {
  children: React.ReactNode;
  panelId: string;
  initialWidth?: number;
  initialHeight?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  initialPosition?: Position;
  sx?: SxProps<Theme>;
};

const VIEWPORT_MARGIN = 12;
const STORAGE_PREFIX = "movable-form:v5:";
const FALLBACK_PANEL_HEIGHT = 500;
const NON_DRAGGABLE_SELECTOR = [
  "input",
  "textarea",
  "select",
  "button",
  "a",
  "label",
  "[role='button']",
  "[role='option']",
  "[role='menuitem']",
  "[contenteditable='true']",
  "[data-no-drag='true']",
  ".MuiInputBase-root",
  ".MuiButtonBase-root",
  ".MuiSelect-select",
  ".MuiAutocomplete-root",
].join(", ");

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const getStorageKey = (panelId: string) => `${STORAGE_PREFIX}${panelId}`;

const getDefaultPosition = (
  panelWidth: number,
  panelHeight: number
): Position => {
  const resolvedHeight =
    panelHeight > 0 ? panelHeight : FALLBACK_PANEL_HEIGHT;

  return {
    x: Math.max(VIEWPORT_MARGIN, window.innerWidth - panelWidth - 80),
    y: Math.max(
      VIEWPORT_MARGIN,
      Math.round((window.innerHeight - resolvedHeight) / 2)
    ),
  };
};

const isNonDraggableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest(NON_DRAGGABLE_SELECTOR));
};

export const MovableForm: React.FC<MovableFormProps> = ({
  children,
  panelId,
  initialWidth = 400,
  initialHeight,
  minWidth = 320,
  maxWidth = 900,
  minHeight = 280,
  maxHeight = 920,
  initialPosition,
  sx,
}) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const panelRef = useRef<HTMLDivElement | null>(null);
  const interactionRef = useRef<InteractionState>(null);

  const resolvedMaxWidth = useMemo(() => {
    if (!isDesktop) return maxWidth;
    return Math.min(maxWidth, Math.max(minWidth, window.innerWidth - VIEWPORT_MARGIN * 2));
  }, [isDesktop, maxWidth, minWidth]);

  const resolvedMaxHeight = useMemo(() => {
    if (!isDesktop) return maxHeight;
    return Math.min(
      maxHeight,
      Math.max(minHeight, window.innerHeight - VIEWPORT_MARGIN * 2)
    );
  }, [isDesktop, maxHeight, minHeight]);

  const [width, setWidth] = useState<number>(
    clamp(initialWidth, minWidth, resolvedMaxWidth)
  );
  const [height, setHeight] = useState<number | null>(() => {
    if (typeof initialHeight !== "number") return null;
    return clamp(initialHeight, minHeight, resolvedMaxHeight);
  });
  const [position, setPosition] = useState<Position>(() =>
    initialPosition || { x: 0, y: 0 }
  );
  const [isInitialized, setIsInitialized] = useState(false);

  const clampPosition = (
    nextPosition: Position,
    nextWidth = width,
    nextHeight = height
  ): Position => {
    if (!isDesktop) return nextPosition;

    const panelHeight = panelRef.current?.offsetHeight ?? nextHeight ?? 0;
    const panelWidth = panelRef.current?.offsetWidth ?? nextWidth;
    const maxX = Math.max(
      VIEWPORT_MARGIN,
      window.innerWidth - panelWidth - VIEWPORT_MARGIN
    );
    const maxY = Math.max(
      VIEWPORT_MARGIN,
      window.innerHeight - panelHeight - VIEWPORT_MARGIN
    );

    return {
      x: clamp(nextPosition.x, VIEWPORT_MARGIN, maxX),
      y: clamp(nextPosition.y, VIEWPORT_MARGIN, maxY),
    };
  };

  useEffect(() => {
    if (!isDesktop) {
      setIsInitialized(true);
      return;
    }

    const defaultWidth = clamp(initialWidth, minWidth, resolvedMaxWidth);
    let nextWidth = defaultWidth;
    const defaultHeight =
      typeof initialHeight === "number"
        ? clamp(initialHeight, minHeight, resolvedMaxHeight)
        : null;
    let nextHeight = defaultHeight;
    let nextPosition =
      initialPosition ||
      getDefaultPosition(
        defaultWidth,
        panelRef.current?.offsetHeight ?? defaultHeight ?? 0
      );

    const stored = localStorage.getItem(getStorageKey(panelId));
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as {
          width?: number;
          height?: number;
          x?: number;
          y?: number;
        };
        if (typeof parsed.width === "number") {
          nextWidth = clamp(parsed.width, minWidth, resolvedMaxWidth);
        }
        if (typeof parsed.height === "number") {
          nextHeight = clamp(parsed.height, minHeight, resolvedMaxHeight);
        }
        if (typeof parsed.x === "number" && typeof parsed.y === "number") {
          nextPosition = { x: parsed.x, y: parsed.y };
        }
      } catch (_error) {
        // Ignore invalid storage values and use defaults.
      }
    }

    setWidth(nextWidth);
    setHeight(nextHeight ?? null);
    setPosition(clampPosition(nextPosition, nextWidth, nextHeight));
    setIsInitialized(true);
  }, [
    isDesktop,
    initialHeight,
    initialPosition,
    initialWidth,
    maxHeight,
    minWidth,
    minHeight,
    panelId,
    resolvedMaxHeight,
    resolvedMaxWidth,
  ]);

  useEffect(() => {
    if (!isDesktop || !isInitialized) return;

    localStorage.setItem(
      getStorageKey(panelId),
      JSON.stringify({ x: position.x, y: position.y, width, height })
    );
  }, [height, isDesktop, isInitialized, panelId, position.x, position.y, width]);

  useEffect(() => {
    if (!isDesktop) return;

    const handleMouseMove = (event: MouseEvent) => {
      const interaction = interactionRef.current;
      if (!interaction) return;

      if (interaction.mode === "drag") {
        const deltaX = event.clientX - interaction.startX;
        const deltaY = event.clientY - interaction.startY;

        setPosition(
          clampPosition({
            x: interaction.originX + deltaX,
            y: interaction.originY + deltaY,
          })
        );
      }

      if (interaction.mode === "resize-width") {
        const deltaX = event.clientX - interaction.startX;
        const nextWidth = clamp(
          interaction.originWidth + deltaX,
          minWidth,
          resolvedMaxWidth
        );
        setWidth(nextWidth);
        setPosition((prev) => clampPosition(prev, nextWidth, height));
      }

      if (interaction.mode === "resize-height") {
        const deltaY = event.clientY - interaction.startY;
        const nextHeight = clamp(
          interaction.originHeight + deltaY,
          minHeight,
          resolvedMaxHeight
        );
        setHeight(nextHeight);
        setPosition((prev) => clampPosition(prev, width, nextHeight));
      }

      if (interaction.mode === "resize-both") {
        const deltaX = event.clientX - interaction.startX;
        const deltaY = event.clientY - interaction.startY;
        const nextWidth = clamp(
          interaction.originWidth + deltaX,
          minWidth,
          resolvedMaxWidth
        );
        const nextHeight = clamp(
          interaction.originHeight + deltaY,
          minHeight,
          resolvedMaxHeight
        );

        setWidth(nextWidth);
        setHeight(nextHeight);
        setPosition((prev) => clampPosition(prev, nextWidth, nextHeight));
      }
    };

    const handleMouseUp = () => {
      interactionRef.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    height,
    isDesktop,
    minHeight,
    minWidth,
    resolvedMaxHeight,
    resolvedMaxWidth,
    width,
  ]);

  const handleDragStart = (event: React.MouseEvent<HTMLElement>) => {
    if (!isDesktop) return;
    if (event.button !== 0) return;
    if (isNonDraggableTarget(event.target)) return;
    event.preventDefault();
    interactionRef.current = {
      mode: "drag",
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
    };
  };

  const handleResizeStart = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isDesktop) return;
    event.preventDefault();
    event.stopPropagation();
    interactionRef.current = {
      mode: "resize-width",
      startX: event.clientX,
      originWidth: width,
    };
  };

  const handleResizeHeightStart = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isDesktop) return;
    event.preventDefault();
    event.stopPropagation();
    interactionRef.current = {
      mode: "resize-height",
      startY: event.clientY,
      originHeight: panelRef.current?.offsetHeight ?? height ?? minHeight,
    };
  };

  const handleResizeBothStart = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isDesktop) return;
    event.preventDefault();
    event.stopPropagation();
    interactionRef.current = {
      mode: "resize-both",
      startX: event.clientX,
      startY: event.clientY,
      originWidth: width,
      originHeight: panelRef.current?.offsetHeight ?? height ?? minHeight,
    };
  };

  if (!isDesktop) {
    return (
      <Box sx={{ width: "100%", ...sx }}>
        {children}
      </Box>
    );
  }

  return (
    <Box
      ref={panelRef}
      onMouseDown={handleDragStart}
      sx={{
        position: "fixed",
        left: position.x,
        top: position.y,
        width,
        height: height ?? "auto",
        zIndex: 1300,
        cursor: "grab",
        visibility: isInitialized ? "visible" : "hidden",
        pointerEvents: isInitialized ? "auto" : "none",
        ...sx,
      }}
    >
      <Box
        sx={{
          height: height ? "100%" : "auto",
          overflow: height ? "auto" : "visible",
          pr: 0.25,
          pb: 0.25,
        }}
      >
        {children}
      </Box>

      <Box
        onMouseDown={handleResizeStart}
        sx={{
          position: "absolute",
          top: 0,
          right: -6,
          width: 12,
          height: "100%",
          cursor: "ew-resize",
          zIndex: 1,
        }}
      />

      <Box
        onMouseDown={handleResizeHeightStart}
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: -6,
          height: 12,
          cursor: "ns-resize",
          zIndex: 1,
        }}
      />

      <Box
        onMouseDown={handleResizeBothStart}
        sx={{
          position: "absolute",
          right: -7,
          bottom: -7,
          width: 14,
          height: 14,
          borderRadius: 1,
          cursor: "nwse-resize",
          zIndex: 2,
          backgroundColor: "transparent",
          border: "none",
        }}
      />
    </Box>
  );
};
