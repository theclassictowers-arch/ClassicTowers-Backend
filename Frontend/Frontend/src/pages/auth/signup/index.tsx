import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  TextField,
  Button,
  Box,
  Typography,
  Link as MuiLink,
  IconButton,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useRegister } from "@refinedev/core";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { FieldValues, SubmitHandler } from "react-hook-form";
import { formStyles } from "../styles";
import { MovableForm } from "../../../components/movable-form";

const roles = ["operator", "team_lead"];

const validatePassword = (value: string) => {
  if (!/^[A-Za-z0-9@#?!&$%^*()\-_+=<>[\]{}|:;"',.~`]+$/.test(value)) {
    return "Password contains invalid characters or spaces";
  }

  if (value.length < 8 || value.length > 18) {
    return "Password must be between 8 and 18 characters";
  }

  const letters = value.match(/[A-Za-z]/g) || [];
  const numbers = value.match(/[0-9]/g) || [];
  const specials = value.match(/[^A-Za-z0-9]/g) || [];

  if (letters.length < 2) {
    return "Password must include at least two letters";
  }
  if (numbers.length < 2) {
    return "Password must include at least two numbers";
  }
  if (specials.length < 2) {
    return "Password must include at least two special characters";
  }

  return true;
};

const SignUpForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    getValues,
    reset,
    watch,
  } = useForm<FieldValues>({
    mode: "onChange",
  });

  const watchedRole = watch("role", ""); // Watches role selection

  const { mutate: registerUser, isLoading } = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    registerUser(data, {
      onSuccess: (response) => {
        if (response.success) {
          reset();
        }
      },
    });
  };

  return (
    <MovableForm
      panelId="auth-signup-form"
      initialWidth={400}
      minWidth={320}
      maxWidth={760}
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
          Create an Account
        </Typography>

      {/* Full Name */}
      <TextField
        fullWidth
        label="Full Name"
        {...register("name", { required: "Full name is required" })}
        error={!!errors.name}
        helperText={errors.name?.message?.toString()}
        margin="normal"
        InputProps={{ sx: { borderRadius: 2 } }}
      />

      {/* Email */}
      <TextField
        fullWidth
        label="Email"
        type="email"
        {...register("email", { required: "Email is required" })}
        error={!!errors.email}
        helperText={errors.email?.message?.toString()}
        margin="normal"
        InputProps={{ sx: { borderRadius: 2 } }}
      />

      {/* Role Selection */}
      <FormControl fullWidth sx={{ marginTop: 2, borderRadius: 2 }}>
        <InputLabel id="role-select-label">Role</InputLabel>
        <Select
          labelId="role-select-label"
          id="role-select"
          {...register("role", { required: "Role is required" })}
          label="Role"
          error={!!errors.role}
        >
          {roles.map((role) => (
            <MenuItem key={role} value={role}>
              {role.charAt(0).toUpperCase() + role.slice(1).replace("_", " ")}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Conditional Field: teamLead */}
      {watchedRole === "operator" && (
        <TextField
          fullWidth
          label="Team Lead ID"
          {...register("teamLead", {
            required: "Team Lead ID is required for Operators",
          })}
          error={!!errors.teamLead}
          helperText={errors.teamLead?.message?.toString()}
          margin="normal"
          InputProps={{ sx: { borderRadius: 2 } }}
        />
      )}
      {/* Password Field */}
      <TextField
        fullWidth
        label="Password"
        type={showPassword ? "text" : "password"}
        {...register("password", {
          required: "Password is required",
          validate: validatePassword,
        })}
        error={!!errors.password}
        helperText={errors.password?.message?.toString()}
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

      {/* Confirm Password Field */}
      <TextField
        fullWidth
        label="Confirm Password"
        type={showConfirmPassword ? "text" : "password"}
        {...register("confirmPassword", {
          required: "Please confirm your password",
          validate: (value) =>
            value === getValues("password") || "Passwords do not match",
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

      {/* Submit Button */}
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        sx={{
          ...formStyles.submitButton,
          opacity: !isValid || isLoading ? 0.6 : 1,
        }}
        disabled={!isValid || isLoading}
      >
        {isLoading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          "Register"
        )}
      </Button>

        {/* Link to Sign In */}
        <Typography sx={formStyles.linkText}>
          Already have an account?{" "}
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
    </MovableForm>
  );
};

export default SignUpForm;
