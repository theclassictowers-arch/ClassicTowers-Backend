import React, { useState, useRef, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Link as MuiLink,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { formStyles } from "../styles";
import { axiosInstance } from "../../../utils";
import { MovableForm } from "../../../components/movable-form";

const VerifyOTPForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }

    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);

    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      setError("Please enter complete 6-digit OTP");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await axiosInstance.post("/verify-otp", { email, otp: otpString });
      // Navigate to reset password page with email and OTP
      navigate("/update-password", { state: { email, otp: otpString } });
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setError("");
    setResendSuccess(false);

    try {
      await axiosInstance.post("/forgot-password", { email });
      setResendSuccess(true);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <MovableForm
      panelId="auth-verify-otp-form"
      initialWidth={400}
      minWidth={320}
      maxWidth={760}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          ...formStyles.container,
          m: 0,
          width: "100%",
          maxWidth: "100%",
        }}
      >
        <Typography variant="h4" gutterBottom sx={formStyles.title}>
          Verify OTP
        </Typography>

      <Typography
        variant="body2"
        sx={{ textAlign: "center", mb: 2, color: "text.secondary" }}
      >
        We've sent a 6-digit OTP to <strong>{email}</strong>
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2, width: "100%" }}>
          {error}
        </Alert>
      )}

      {resendSuccess && (
        <Alert severity="success" sx={{ mb: 2, width: "100%" }}>
          OTP resent successfully!
        </Alert>
      )}

      <Box
        sx={{
          display: "flex",
          gap: 1,
          justifyContent: "center",
          mb: 3,
        }}
        onPaste={handlePaste}
      >
        {otp.map((digit, index) => (
          <TextField
            key={index}
            inputRef={(el) => (inputRefs.current[index] = el)}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            inputProps={{
              maxLength: 1,
              style: {
                textAlign: "center",
                fontSize: "1.5rem",
                fontWeight: "bold",
                padding: "12px",
              },
            }}
            sx={{
              width: "50px",
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        ))}
      </Box>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        sx={formStyles.submitButton}
        disabled={isLoading}
      >
        {isLoading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          "Verify OTP"
        )}
      </Button>

      <Box textAlign="center" mt={2}>
        <Typography sx={formStyles.linkText}>
          Didn't receive OTP?{" "}
          <MuiLink
            component="button"
            type="button"
            onClick={handleResendOTP}
            disabled={resendLoading}
            color="primary"
            sx={{
              ...formStyles.link,
              cursor: resendLoading ? "not-allowed" : "pointer",
              opacity: resendLoading ? 0.6 : 1,
            }}
          >
            {resendLoading ? "Sending..." : "Resend OTP"}
          </MuiLink>
        </Typography>
      </Box>

        <Box textAlign="center" mt={1}>
          <Typography sx={formStyles.linkText}>
            <MuiLink
              component={Link}
              to="/forgot-password"
              color="primary"
              sx={formStyles.link}
            >
              Change Email
            </MuiLink>
          </Typography>
        </Box>
      </Box>
    </MovableForm>
  );
};

export default VerifyOTPForm;
