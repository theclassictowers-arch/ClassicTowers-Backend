import { Dialog, styled } from "@mui/material";

export const PLCDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    height: "100vh",
    maxWidth: "90vw",
    width: "90vw",
    borderRadius: "8px",
    boxShadow: theme.shadows[5],
  },
}));
