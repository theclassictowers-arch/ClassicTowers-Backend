import React, { useState } from "react";
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
  Collapse,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { useLogin } from "@refinedev/core";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { FieldValues, SubmitHandler } from "react-hook-form";
import { formStyles } from "../styles"; // Assuming you have a styles file
import { MovableForm } from "../../../components/movable-form";

const SignInForm: React.FC = () => {
  const location = useLocation();
  const successMessage = location.state?.message;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const { mutate: loginUser, isLoading } = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [showInputs, setShowInputs] = useState(Boolean(successMessage));

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleShowInputs = () => setShowInputs((prev) => !prev);

  const handleTitleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleShowInputs();
    }
  };

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    loginUser(data, {
      onSuccess: (response) => {
        if (response.success) {
          reset();
        }
      },
      onError: (error) => {
        alert(JSON.stringify(error, null, 2));
      },
    });
  };

  return (
    <MovableForm
      panelId="auth-signin-form"
      initialWidth={350}
      minWidth={300}
      maxWidth={640}
    >
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          ...formStyles.container,
          m: 0,
          mt: 0,
          transform: "none",
          width: "100%",
          maxWidth: "100%",
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          role="button"
          tabIndex={0}
          aria-expanded={showInputs}
          onClick={handleShowInputs}
          onKeyDown={handleTitleKeyDown}
          sx={{
            ...formStyles.title,
            cursor: "pointer",
            userSelect: "none",
            mt: 2,
          }}
        >
          Sign In
        </Typography>

      <Collapse in={showInputs} timeout={{ enter: 500, exit: 300 }} sx={{ width: "100%" }}>
        <Box sx={{ pt: 1 }}>
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2, width: "100%" }}>
              {successMessage}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Email"
            type="email"
            {...register("email", { required: "Email is required" })}
            error={!!errors.email}
            helperText={errors.email?.message?.toString()}
            margin="normal"
            InputLabelProps={{
              sx: {
                "&.MuiInputLabel-shrink": {
                  fontSize: "1.15rem",
                },
              },
            }}
            InputProps={{
              sx: { borderRadius: 2 },
            }}
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? "text" : "password"}
            {...register("password", { required: "Password is required" })}
            error={!!errors.password}
            helperText={errors.password?.message?.toString()}
            margin="normal"
            InputLabelProps={{
              sx: {
                "&.MuiInputLabel-shrink": {
                  fontSize: "1.15rem",
                },
              },
            }}
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

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={formStyles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
          </Button>

          <Box textAlign="center" mt={2}>
            <Typography sx={formStyles.linkText}>
              Forgot your password?{" "}
              <MuiLink
                component={Link}
                to="/forgot-password"
                color="primary"
                sx={formStyles.link}
              >
                Reset Password
              </MuiLink>
            </Typography>
          </Box>
        </Box>
        </Collapse>
      </Box>
    </MovableForm>
  );
};

export default SignInForm;
