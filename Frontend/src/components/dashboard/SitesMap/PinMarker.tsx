import { AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { FC } from "react";
import { Point } from "../../../interfaces";

const PinStyles = {
  background: "#F66666",
  glyphColor: "#000",
  borderColor: "#000",
};

const getStatusGlyph = (statuses: string[]): string => {
  if (statuses.includes("danger")) return "!";
  if (statuses.includes("warning")) return "⚠";
  if (statuses.includes("normal")) return "✔";
  return "";
};

interface PinMarkerProps {
  point: Point;
  onClick: () => void;
}

const PinMarker: FC<PinMarkerProps> = ({ point, onClick }) => {
  const statuses = Object.values(point.status).map((s) => s.status);
  const backgroundColor = statuses.includes("danger")
    ? "#F44336"
    : statuses.includes("warning")
    ? "#FF9800"
    : statuses.includes("normal")
    ? "#4CAF50"
    : "#607D8B";

  return (
    <AdvancedMarker
      key={point.key}
      position={point.location}
      onClick={onClick}
      title={point.display_name}
    >
      <Pin
        {...PinStyles}
        background={backgroundColor}
        glyph={getStatusGlyph(statuses)}
      />
    </AdvancedMarker>
  );
};

export default PinMarker;
