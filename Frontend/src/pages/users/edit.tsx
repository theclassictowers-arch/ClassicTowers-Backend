import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useNotification } from "@refinedev/core";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "../../utils";
import { useAuthContext } from "../../contexts";
import AssignSite from "../../components/site-assign/assignSite";
import { formStyles } from "../auth/styles";
import { MovableForm } from "../../components/movable-form";
import { MapBackgroundPage } from "../../components/map-background-page";

const { VITE_API_BASE_URL } = import.meta.env;

type UserEditFormValues = {
  name: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  isApproved: boolean;
  profilePicture: File | string | null;
  assignedTowerLimit: number;
  towerLimit: number;
};

const getAllowedRoles = (currentUserRole?: string | null) => {
  switch (currentUserRole) {
    case "admin":
      return ["admin", "organization", "team_lead", "operator"];
    case "organization":
      return ["team_lead", "operator"];
    case "team_lead":
      return ["operator"];
    default:
      return [];
  }
};

export const UsersEdit: React.FC = () => {
  const { id } = useParams();
  const { role: currentUserRole } = useAuthContext();
  const { open } = useNotification();
  const navigate = useNavigate();

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [storedProfilePath, setStoredProfilePath] = useState<string>("");

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<UserEditFormValues>({
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      role: "",
      isEmailVerified: false,
      isApproved: false,
      profilePicture: null,
      assignedTowerLimit: 0,
      towerLimit: 0,
    },
  });

  const watchedRole = watch("role");

  const roleOptions = useMemo(() => {
    const allowed = getAllowedRoles(currentUserRole);
    const withCurrent = watchedRole ? [...allowed, watchedRole] : allowed;
    return Array.from(new Set(withCurrent));
  }, [currentUserRole, watchedRole]);

  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      setIsInitialLoading(true);
      try {
        const response = await axiosInstance.get(`/users/${id}`);
        const record = response.data?.data || response.data || {};

        const profilePicturePath =
          typeof record.profilePicture === "string" ? record.profilePicture : "";
        setStoredProfilePath(profilePicturePath);

        setValue("name", record.name || "");
        setValue("email", record.email || "");
        setValue("role", record.role || "");
        setValue("isEmailVerified", Boolean(record.isEmailVerified));
        setValue("isApproved", Boolean(record.isApproved));
        setValue("profilePicture", profilePicturePath || null);
        setValue("assignedTowerLimit", Number(record.assignedTowerLimit || 0));
        setValue("towerLimit", Number(record.towerLimit || 0));
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        open?.({
          type: "error",
          message: "Failed to load user",
          description: err.response?.data?.message || "An error occurred",
        });
        navigate("/users");
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchUser();
  }, [id, navigate, open, setValue]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setValue("profilePicture", file, { shouldDirty: true, shouldValidate: true });
  };

  const onSubmit: SubmitHandler<UserEditFormValues> = async (data) => {
    if (!id) return;

    setIsSaving(true);
    try {
      const { profilePicture, ...fields } = data;
      const normalizedFields = {
        ...fields,
        isEmailVerified: Boolean(fields.isEmailVerified),
        isApproved: Boolean(fields.isApproved),
      };

      if (profilePicture instanceof File) {
        const formData = new FormData();
        Object.entries(normalizedFields).forEach(([key, value]) => {
          formData.append(key, String(value));
        });
        formData.append("profilePicture", profilePicture);

        await axiosInstance.patch(`/users/${id}`, formData);
      } else {
        await axiosInstance.patch(`/users/${id}`, normalizedFields);
      }

      open?.({
        type: "success",
        message: "User updated successfully!",
        description: "The user has been updated",
      });

      navigate("/users");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      open?.({
        type: "error",
        message: "Failed to update user",
        description: err.response?.data?.message || "An error occurred",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!id) return null;

  return (
    <MapBackgroundPage>
      {isInitialLoading ? (
        <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      ) : (
        <MovableForm
          panelId="user-edit-form"
          initialWidth={400}
          minWidth={320}
          maxWidth={980}
        >
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{
              ...formStyles.container,
              m: 0,
              width: "100%",
              maxWidth: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <Typography variant="h4" gutterBottom sx={formStyles.title}>
              Edit User
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "center", mt: 1, mb: 2 }}>
              <Box sx={{ position: "relative", display: "inline-block" }}>
                <Avatar
                  src={
                    previewUrl ||
                    (storedProfilePath
                      ? `${VITE_API_BASE_URL}${storedProfilePath}`
                      : "/default-avatar.png")
                  }
                  alt="Profile"
                  sx={{ width: 92, height: 92 }}
                />
                <Box sx={{ position: "absolute", right: -4, bottom: -4 }}>
                  <input
                    accept="image/*"
                    id="user-edit-profile-picture"
                    type="file"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                  <label htmlFor="user-edit-profile-picture">
                    <IconButton color="primary" component="span" size="small">
                      <PhotoCamera />
                    </IconButton>
                  </label>
                </Box>
              </Box>
            </Box>

            <TextField
              fullWidth
              label="Full Name"
              {...register("name", { required: "Full name is required" })}
              error={!!errors.name}
              helperText={errors.name?.message?.toString()}
              margin="normal"
              InputProps={{ sx: { borderRadius: 2 } }}
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email format",
                },
              })}
              error={!!errors.email}
              helperText={errors.email?.message?.toString()}
              margin="normal"
              InputProps={{ sx: { borderRadius: 2 } }}
            />

            <FormControl fullWidth sx={{ mt: 2 }} error={!!errors.role}>
              <InputLabel id="user-edit-role-label">Role</InputLabel>
              <Controller
                name="role"
                control={control}
                rules={{ required: "Role is required" }}
                render={({ field }) => (
                  <Select {...field} labelId="user-edit-role-label" label="Role">
                    {roleOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option
                          .split("_")
                          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                          .join(" ")}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>

            <FormControlLabel
              sx={{ mt: 2 }}
              control={
                <Controller
                  name="isEmailVerified"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={Boolean(field.value)}
                      onChange={(_, value) => field.onChange(value)}
                    />
                  )}
                />
              }
              label="Is Email Verified"
            />

            <FormControlLabel
              control={
                <Controller
                  name="isApproved"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={Boolean(field.value)}
                      onChange={(_, value) => field.onChange(value)}
                    />
                  )}
                />
              }
              label="Is Approved"
            />

            {watchedRole === "organization" && (
              <TextField
                fullWidth
                label="Tower Add Limit"
                type="number"
                {...register("towerLimit", {
                  min: { value: 0, message: "Must be 0 or greater" },
                  valueAsNumber: true,
                })}
                error={!!errors.towerLimit}
                helperText={errors.towerLimit?.message?.toString()}
                margin="normal"
                InputProps={{ sx: { borderRadius: 2 }, inputProps: { min: 0 } }}
              />
            )}

            {watchedRole === "team_lead" && (
              <TextField
                fullWidth
                label="Allowed Towers for this Team Lead"
                type="number"
                {...register("assignedTowerLimit", {
                  min: { value: 0, message: "Must be 0 or greater" },
                  valueAsNumber: true,
                })}
                error={!!errors.assignedTowerLimit}
                helperText={errors.assignedTowerLimit?.message?.toString()}
                margin="normal"
                InputProps={{ sx: { borderRadius: 2 }, inputProps: { min: 0 } }}
              />
            )}

            {watchedRole === "team_lead" && id && (
              <Box sx={{ mt: 2 }}>
                <AssignSite userId={id} />
              </Box>
            )}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{
                ...formStyles.submitButton,
                mt: 2,
                opacity: !isValid || isSaving ? 0.6 : 1,
              }}
              disabled={!isValid || isSaving}
            >
              {isSaving ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Update User"
              )}
            </Button>
          </Box>
        </MovableForm>
      )}
    </MapBackgroundPage>
  );
};

export default UsersEdit;
