import React, { useState, useEffect, useRef } from "react";
import { useTheme, alpha, Switch } from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  Brush,
} from "recharts";

export interface RealTimeLineChartProps {
  sensorData: any[];
  dataKeys: { key: string }[];
  sensorParameter: string;
  yAxisLabel: string;
  limits: any;
}

// Utility function to format time or date
const formatTime = (value: string) => {
  if (!value) return "";
  return value.includes(":") ? value : value;
};

interface CustomSwitchProps {
  lineColor: string;
}

const CustomSwitch = styled(Switch, {
  shouldForwardProp: (prop) => prop !== "lineColor",
})<CustomSwitchProps>(({ theme, lineColor }) => ({
  "& .MuiSwitch-switchBase.Mui-checked": {
    color: lineColor,
    "&:hover": {
      backgroundColor: alpha(lineColor, theme.palette.action.hoverOpacity),
    },
  },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
    backgroundColor: lineColor,
  },
}));

export const RealTimeLineChart: React.FC<RealTimeLineChartProps> = ({
  sensorData,
  dataKeys,
  sensorParameter,
  yAxisLabel,
  limits,
}) => {
  const theme = useTheme();
  const [brushRange, setBrushRange] = useState<{
    start: number;
    end: number;
  } | null>(null);
  const [visibleLines, setVisibleLines] = useState<Record<string, boolean>>(
    () => {
      const initialVisibility: Record<string, boolean> = {};
      dataKeys.forEach(({ key }) => {
        initialVisibility[key] = true;
      });
      return initialVisibility;
    }
  );
  const prevDataLengthRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Set line color based on data keys
  const getLineColor = (key: string) => {
    switch (key) {
      case "x":
        return "#90EE90";
      case "y":
        return "#2E8B57";
      case "z":
        return "#006400";
      default:
        return "#2E8B57";
    }
  };

  // Update the brush position when data changes
  useEffect(() => {
    if (!sensorData || sensorData.length === 0) return;

    const dataLength = sensorData.length;
    const defaultWidth = sensorData.length;

    if (!brushRange || dataLength !== prevDataLengthRef.current) {
      const startIndex = Math.max(0, dataLength - defaultWidth);
      const endIndex = dataLength - 1;
      setBrushRange({ start: startIndex, end: endIndex });
      prevDataLengthRef.current = dataLength;
    }
  }, [sensorData, brushRange]);

  // Handle mouse wheel zoom
  const handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    if (!sensorData || sensorData.length === 0 || !brushRange) return;

    const delta = event.deltaY > 0 ? 1.2 : 0.8; // Zoom out or in
    const currentWidth = brushRange.end - brushRange.start;
    const newWidth = Math.max(
      5,
      Math.min(currentWidth * delta, sensorData.length)
    );
    const center = brushRange.start + currentWidth / 2;
    let newStart = Math.max(0, center - newWidth / 2);
    let newEnd = Math.min(sensorData.length - 1, center + newWidth / 2);

    if (newEnd - newStart < 5) {
      newEnd = newStart + 5;
      if (newEnd > sensorData.length - 1) {
        newEnd = sensorData.length - 1;
        newStart = newEnd - 5;
      }
    }

    setBrushRange({ start: Math.round(newStart), end: Math.round(newEnd) });
  };

  // Attach the wheel event listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
    }
    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel);
      }
    };
  }, [brushRange]);

  // Handle brush change from user interaction
  const handleBrushChange = (brushData: any) => {
    if (
      brushData?.startIndex !== undefined &&
      brushData?.endIndex !== undefined
    ) {
      setBrushRange({ start: brushData.startIndex, end: brushData.endIndex });
    }
  };

  // Toggle visibility when switch is toggled
  const handleLegendClick = (data: { dataKey: string }) => {
    const { dataKey } = data;
    setVisibleLines((prev) => ({
      ...prev,
      [dataKey]: !prev[dataKey],
    }));
  };

  return (
    <div
      ref={containerRef}
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "row",
        overflow: "hidden",
        padding: "0 15px 0 5px",
      }}
    >
      {/* Custom Legend on the left with Switch Buttons - Reduced width */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "20px", // Set fixed narrow width
          marginBottom: "130px", // Increased for better spacing
        }}
      >
        {dataKeys.map(({ key }) => (
          <div
            key={key}
            style={{
              marginBottom: "12px", // Increased for better spacing between items
            }}
          >
            {/* Vertical switch */}
            <div style={{ transform: "rotate(270deg)" }}>
              <CustomSwitch
                lineColor={getLineColor(key)}
                checked={visibleLines[key]}
                onChange={() => handleLegendClick({ dataKey: key })}
                size="small"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Chart Container */}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={sensorData}
          margin={{ top: 20, right: 30, left: 10, bottom: 30 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={alpha(theme.palette.grey[400], 0.2)}
            vertical={false}
          />

          <XAxis
            dataKey="time"
            tickFormatter={formatTime}
            stroke={theme.palette.grey[400]}
            tick={{
              fontSize: 11,
              fill: theme.palette.grey[700],
              fontFamily: "monospace",
            }}
          />

          <YAxis
            tick={{
              fontSize: 11,
              fill: theme.palette.grey[700],
              fontFamily: "monospace",
            }}
            stroke={theme.palette.grey[400]}
            label={{
              value: yAxisLabel,
              angle: -90,
              position: "insideLeft",
              style: { fill: theme.palette.grey[700] },
            }}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: alpha(theme.palette.grey[50], 0.9),
              borderRadius: 4,
            }}
            labelFormatter={(value) => `Time: ${value}`}
          />

          {/* Render lines based on their visibility */}
          {dataKeys.map(({ key }) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={getLineColor(key)}
              strokeWidth={1.5}
              dot={false}
              animationDuration={300}
              hide={!visibleLines[key]}
            />
          ))}

          <Brush
            dataKey="time"
            height={10}
            stroke={theme.palette.grey[400]}
            fill={theme.palette.grey[200]}
            travellerWidth={8}
            onChange={handleBrushChange}
            startIndex={brushRange?.start}
            endIndex={brushRange?.end}
            style={{ fontFamily: "monospace", fontSize: 10 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
