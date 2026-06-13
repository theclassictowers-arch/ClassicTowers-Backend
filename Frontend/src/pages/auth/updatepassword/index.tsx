import React, { useState, useEffect } from "react";
import { useForm } from "@refinedev/react-hook-form";
import {
  TextField,
  Button,
  Box,
  Typography,
  Link as MuiLink,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { FieldValues, SubmitHandler } from "react-hook-form";
import { formStyles } from "../styles";
import { axiosInstance } from "../../../utils";
import { MovableForm } from "../../../components/movable-form";

const UpdatePasswordForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const otp = location.state?.otp;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
  } = useForm();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const newPassword = watch("newPassword");

  useEffect(() => {
    if (!email || !otp) {
      navigate("/forgot-password");
    }
  }, [email, otp, navigate]);

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);

    try {
      await axiosInstance.post("/reset-password", {
        email,
        otp,
        newPassword: data.newPassword,
      });
      // Navigate to login with success message
      navigate("/login", {
        state: { message: "Password reset successfully! Please login with your new password." },
      });
    } catch (error: any) {
      setError("newPassword", {
        type: "manual",
        message: error.response?.data?.message || "Failed to reset password",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!email || !otp) {
    return (
      <MovableForm
        panelId="auth-update-password-form"
        initialWidth={400}
        minWidth={320}
        maxWidth={720}
      >
        <Box
          sx={{
            ...formStyles.container,
            m: 0,
            width: "100%",
            maxWidth: "100%",
          }}
        >
          <Alert severity="error" sx={{ mb: 2 }}>
            Invalid session. Please start the password reset process again.
          </Alert>
          <MuiLink component={Link} to="/forgot-password" color="primary">
            Go to Forgot Password
          </MuiLink>
        </Box>
      </MovableForm>
    );
  }

  return (
    <MovableForm
      panelId="auth-update-password-form"
      initialWidth={400}
      minWidth={320}
      maxWidth={720}
    >
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          ...formStyles.container,
          m: 0,
          width: "100%",
          maxWidth: "100%",
        }}
      >
        <Typography variant="h4" gutterBottom sx={formStyles.title}>
          Reset Password
        </Typography>

      <Typography
        variant="body2"
        sx={{ textAlign: "center", mb: 2, color: "text.secondary" }}
      >
        Enter your new password below.
      </Typography>

      <TextField
        fullWidth
        label="New Password"
        type={showPassword ? "text" : "password"}
        {...register("newPassword", {
          required: "Password is required",
          minLength: {
            value: 8,
            message: "Password must be at least 8 characters",
          },
          maxLength: {
            value: 18,
            message: "Password must be at most 18 characters",
          },
          validate: {
            hasLetters: (value) =>
              (value.match(/[a-zA-Z]/g) || []).length >= 2 ||
              "Password must contain at least 2 letters",
            hasNumbers: (value) =>
              (value.match(/[0-9]/g) || []).length >= 2 ||
              "Password must contain at least 2 numbers",
            hasSpecial: (value) =>
              (value.match(/[@#?!&$%^*()\-_+=<>\[\]{}|:;"',.~]/g) || []).length >= 2 ||
              "Password must contain at least 2 special characters",
          },
        })}
        error={!!errors.newPassword}
        helperText={errors.newPassword?.message?.toString()}
        margin="normal"
        InputProps={{
          sx: { borderRadius: 2 },
          endAdornment: (
            <IconButton
              onClick={handleClickShowPassword}
              edge="end"
              aria-label="toggle password visibility"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          ),
        }}
      />

      <TextField
        fullWidth
        label="Confirm Password"
        type={showConfirmPassword ? "text" : "password"}
        {...register("confirmPassword", {
          required: "Please confirm your password",
          validate: (value) => value === newPassword || "Passwords do not match",
        })}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message?.toString()}
        margin="normal"
        InputProps={{
          sx: { borderRadius: 2 },
          endAdornment: (
            <IconButton
              onClick={handleClickShowConfirmPassword}
              edge="end"
              aria-label="toggle confirm password visibility"
            >
              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          ),
        }}
      />

      <Typography variant="caption" sx={{ color: "text.secondary", mt: 1, display: "block" }}>
        Password must be 8-18 characters with at least 2 letters, 2 numbers, and 2 special characters.
      </Typography>

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
          "Reset Password"
        )}
      </Button>

        <Box textAlign="center" mt={2}>
          <Typography sx={formStyles.linkText}>
            Remember your password?{" "}
            <MuiLink
              component={Link}
              to="/login"
              color="primary"
              sx={formStyles.link}
            >
              Sign In
            </MuiLink>
          </Typography>
        </Box>
      </Box>
    </MovableForm>
  );
};

export default UpdatePasswordForm;
