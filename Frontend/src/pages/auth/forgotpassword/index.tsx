import React from "react";
import { useForm } from "@refinedev/react-hook-form";
import {
  TextField,
  Button,
  Box,
  Typography,
  Link as MuiLink,
  CircularProgress,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { FieldValues, SubmitHandler } from "react-hook-form";
import { formStyles } from "../styles";
import { axiosInstance } from "../../../utils";
import { MovableForm } from "../../../components/movable-form";

const ForgotPasswordForm: React.FC = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  const [isLoading, setIsLoading] = React.useState(false);

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);
    try {
      await axiosInstance.post("/forgot-password", { email: data.email });
      // Navigate to verify OTP page with email
      navigate("/verify-otp", { state: { email: data.email } });
    } catch (error: any) {
      setError("email", {
        type: "manual",
        message: error.response?.data?.message || "Failed to send OTP",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MovableForm
      panelId="auth-forgot-password-form"
      initialWidth={400}
      minWidth={320}
      maxWidth={700}
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
          Forgot Password
        </Typography>

      <Typography
        variant="body2"
        sx={{ textAlign: "center", mb: 2, color: "text.secondary" }}
      >
        Enter your email address and we'll send you an OTP to reset your password.
      </Typography>

      <TextField
        fullWidth
        label="Email"
        type="email"
        {...register("email", {
          required: "Email is required",
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "Invalid email address",
          },
        })}
        error={!!errors.email}
        helperText={errors.email?.message?.toString()}
        margin="normal"
        InputLabelProps={{
          sx: {
            "&.MuiInputLabel-shrink": {
              fontSize: "0.9rem",
            },
          },
        }}
        InputProps={{
          sx: { borderRadius: 2 },
        }}
      />

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
          "Send OTP"
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

export default ForgotPasswordForm;
