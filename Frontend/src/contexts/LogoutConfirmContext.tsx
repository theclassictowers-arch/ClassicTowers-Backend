import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { alpha } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import LogoutIcon from "@mui/icons-material/Logout";
import Box from "@mui/material/Box";
import { useColorModeContext } from "./ColorModeContext";

type LogoutConfirmContextType = {
  confirm: () => Promise<boolean>;
};

const LogoutConfirmContext = createContext<LogoutConfirmContextType | null>(null);

export const useLogoutConfirm = () => {
  const context = useContext(LogoutConfirmContext);
  if (!context) {
    throw new Error("useLogoutConfirm must be used within LogoutConfirmProvider");
  }
  return context;
};

type Props = {
  children: ReactNode;
};

export const LogoutConfirmProvider = ({ children }: Props) => {
  const { dashboardTheme } = useColorModeContext();
  const [open, setOpen] = useState(false);
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback(() => {
    return new Promise<boolean>((resolve) => {
      setResolvePromise(() => resolve);
      setOpen(true);
    });
  }, []);

  const handleConfirm = () => {
    setOpen(false);
    resolvePromise?.(true);
    setResolvePromise(null);
  };

  const handleCancel = () => {
    setOpen(false);
    resolvePromise?.(false);
    setResolvePromise(null);
  };

  return (
    <LogoutConfirmContext.Provider value={{ confirm }}>
      {children}

      <Dialog
        open={open}
        onClose={handleCancel}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 340,
            background: alpha(dashboardTheme.backgroundColor, 0.88),
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(148, 163, 184, 0.22)",
            boxShadow: "0 8px 32px rgba(15, 23, 42, 0.18)",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            pb: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: "50%",
              bgcolor: alpha(dashboardTheme.primaryColor, 0.15),
              color: dashboardTheme.primaryColor,
            }}
          >
            <LogoutIcon fontSize="small" />
          </Box>
          Confirm Logout
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to logout from your account?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={handleCancel}
            variant="outlined"
            color="inherit"
            sx={{ borderRadius: 2, textTransform: "none", minWidth: 90 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            autoFocus
            sx={{
              borderRadius: 2,
              textTransform: "none",
              minWidth: 90,
              bgcolor: dashboardTheme.primaryColor,
              "&:hover": { bgcolor: alpha(dashboardTheme.primaryColor, 0.85) },
            }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </LogoutConfirmContext.Provider>
  );
};
