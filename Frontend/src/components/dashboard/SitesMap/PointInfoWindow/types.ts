import { Point } from "../../../../interfaces";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface StatusType {
  status: string;
}

export interface InfoWindowContentProps {
  point: Point;
  coordinates: Coordinates;
}

export interface SensorStatusProps {
  label: string;
  status: StatusType;
  onStatusClick: (key: string) => void;
  sensorKey: string;
}
