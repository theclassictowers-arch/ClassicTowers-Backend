import { Box, styled } from "@mui/material";

export const StatusLED = styled(Box)<{ active?: boolean }>(
  ({ theme, active }) => ({
    width: 12,
    height: 12,
    borderRadius: "50%",
    backgroundColor: active
      ? theme.palette.success.main
      : theme.palette.error.main,
    boxShadow: `0 0 10px ${
      active ? theme.palette.success.main : theme.palette.error.main
    }`,
  })
);
