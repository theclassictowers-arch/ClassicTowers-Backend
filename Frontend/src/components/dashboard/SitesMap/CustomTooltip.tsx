import { memo } from "react";
import { Box, Typography } from "@mui/material";

interface PayloadItem {
  name: string;
  value: number | string;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: PayloadItem[];
  label?: string;
}

const styles = {
  tooltipContainer: {
    backgroundColor: "white",
    border: "1px solid #ccc",
    padding: 2,
    borderRadius: 2,
    boxShadow: 3,
    minWidth: 150,
  },
  title: {
    mb: 1,
  },
  bodyText: {
    fontSize: "14px",
    lineHeight: "1.5",
  },
};

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={styles.tooltipContainer}>
        {/* Display the label (e.g., time) as a subtitle */}
        <Typography variant="subtitle2" color="primary" sx={styles.title}>
          {`Time: ${label}`}
        </Typography>
        {/* Iterate over the payload and display each data item */}
        {payload.map((item, index) => (
          <Typography key={index} variant="body2" sx={{ color: item.color }}>
            {`${item.name}: ${item.value}`}
          </Typography>
        ))}
      </Box>
    );
  }
  return null; // Return null when the tooltip is inactive
};

export default memo(CustomTooltip); // Use memo to prevent unnecessary re-renders
