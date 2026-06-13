import React, { useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { type SxProps, type Theme, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";

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
  onClose?: () => void;
  showFullPageButton?: boolean;
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
  onClose,
  showFullPageButton = false,
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
  const [isFullPage, setIsFullPage] = useState(false);
  const shouldUseInlineActions = showFullPageButton;
  const windowButtonBaseSx: SxProps<Theme> = {
    minHeight: 30,
    px: 1.25,
    py: 0.25,
    borderRadius: 1.25,
    color: "text.secondary",
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(4px)",
    boxShadow: "none",
    textTransform: "none",
    fontWeight: 700,
    lineHeight: 1,
    cursor: "pointer",
    "&:hover": {
      color: "text.primary",
      backgroundColor: "action.hover",
      boxShadow: "none",
    },
  };
  const backButtonSx: SxProps<Theme> = {
    ...windowButtonBaseSx,
    position: "absolute",
    top: 10,
    zIndex: 4,
    left: 10,
  };
  const fullPageButtonSx: SxProps<Theme> = {
    ...windowButtonBaseSx,
    position: "absolute",
    top: 10,
    zIndex: 4,
    right: 10,
  };
  const inlineBackButtonSx: SxProps<Theme> = {
    ...windowButtonBaseSx,
    flexShrink: 0,
  };
  const backIconButtonSx: SxProps<Theme> = {
    ...backButtonSx,
    width: 34,
    minWidth: 34,
    height: 34,
    p: 0,
  };
  const inlineBackIconButtonSx: SxProps<Theme> = {
    ...inlineBackButtonSx,
    width: 34,
    minWidth: 34,
    height: 34,
    p: 0,
  };
  const inlineFullPageButtonSx: SxProps<Theme> = {
    ...windowButtonBaseSx,
    flexShrink: 0,
  };

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
      } catch {
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
    if (isFullPage) return;
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
    if (isFullPage) return;
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
    if (isFullPage) return;
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
    if (isFullPage) return;
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

  const actions = (
    <>
      {onClose && (
        <Tooltip title="Back">
          <IconButton
            aria-label="Back"
            data-no-drag="true"
            onClick={onClose}
            size="small"
            sx={
              shouldUseInlineActions
                ? inlineBackIconButtonSx
                : backIconButtonSx
            }
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {showFullPageButton && (
        <Button
          aria-label={isFullPage ? "Exit full page" : "Full page view"}
          data-no-drag="true"
          onClick={() => setIsFullPage((prev) => !prev)}
          size="small"
          startIcon={
            isFullPage ? (
              <CloseFullscreenIcon fontSize="small" />
            ) : (
              <OpenInFullIcon fontSize="small" />
            )
          }
          sx={
            shouldUseInlineActions ? inlineFullPageButtonSx : fullPageButtonSx
          }
        >
          {isFullPage ? "Exit" : "Full page"}
        </Button>
      )}
    </>
  );

  const inlineActions = shouldUseInlineActions ? (
    <Box
      data-no-drag="true"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        px: 1.25,
        pt: 1.25,
        pb: 0.75,
        width: "100%",
      }}
    >
      {actions}
    </Box>
  ) : null;

  if (!isDesktop) {
    return (
      <Box sx={{ position: "relative", width: "100%", ...sx }}>
        {inlineActions}
        {!shouldUseInlineActions && actions}
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
        left: isFullPage ? VIEWPORT_MARGIN : position.x,
        top: isFullPage ? VIEWPORT_MARGIN : position.y,
        width: isFullPage
          ? `calc(100vw - ${VIEWPORT_MARGIN * 2}px)`
          : width,
        height: isFullPage
          ? `calc(100dvh - ${VIEWPORT_MARGIN * 2}px)`
          : height ?? "auto",
        zIndex: 1300,
        cursor: isFullPage ? "default" : "grab",
        visibility: isInitialized ? "visible" : "hidden",
        pointerEvents: isInitialized ? "auto" : "none",
        ...sx,
      }}
    >
      {!shouldUseInlineActions && actions}

      <Box
        sx={{
          height: height || isFullPage ? "100%" : "auto",
          overflow: height || isFullPage ? "auto" : "visible",
          pr: 0.25,
          pb: 0.25,
        }}
      >
        {inlineActions}
        {children}
      </Box>

      {!isFullPage && (
        <>
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
        </>
      )}
    </Box>
  );
};
