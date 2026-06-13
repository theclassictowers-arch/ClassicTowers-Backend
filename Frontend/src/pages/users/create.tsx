import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { FieldValues, SubmitHandler } from "react-hook-form";
import { useAuthContext } from "../../contexts";
import {
  axiosInstance,
  getAllowedCreatableUserRoles,
  normalizeRole,
  ROLE_LABELS,
} from "../../utils";
import { useNotification } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { formStyles } from "../auth/styles";
import { MovableForm } from "../../components/movable-form";
import { MapBackgroundPage } from "../../components/map-background-page";

interface Organization {
  _id: string;
  name: string;
  email: string;
  towerLimit?: number;
}

interface TeamLead {
  _id: string;
  name: string;
  email: string;
}

const DEFAULT_ORGANIZATION_MAP_LOCATION = {
  lat: 30.3753,
  lng: 69.3451,
  zoom: 4.8,
};

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

export const UserCreate: React.FC = () => {
  const { role } = useAuthContext();
  const { open } = useNotification();
  const navigate = useNavigate();

  // Get logged-in user's ID from localStorage
  const loggedInUserId = localStorage.getItem("userId");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [teamLeads, setTeamLeads] = useState<TeamLead[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [loadingTeamLeads, setLoadingTeamLeads] = useState(false);

  // Check if current user is Organization or Team Lead (they don't need dropdowns)
  const currentRole = normalizeRole(role);
  const isOrganization = currentRole === "organization";
  const isTeamLead = currentRole === "team_lead";
  const isAdmin = currentRole === "admin";

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
    getValues,
    reset,
    watch,
    setValue,
  } = useForm<FieldValues>({
    mode: "onChange",
    defaultValues: {
      userType: "",
      organization: "",
      teamLead: "",
      assignedTowerLimit: 0,
      mapLat: DEFAULT_ORGANIZATION_MAP_LOCATION.lat,
      mapLng: DEFAULT_ORGANIZATION_MAP_LOCATION.lng,
      mapZoom: DEFAULT_ORGANIZATION_MAP_LOCATION.zoom,
      towerLocation: "",
      towerType: "",
      towerPicture: "",
      towerDetails: "",
    },
  });

  const watchedUserType = watch("userType");
  const watchedOrganization = watch("organization");

  // Get available roles based on current user role
  const getAvailableRoles = () =>
    getAllowedCreatableUserRoles(currentRole).map((value) => ({
      value,
      label: ROLE_LABELS[value],
    }));

  // Fetch organizations when needed (ONLY for Admin - Organization/TeamLead don't need this)
  useEffect(() => {
    const fetchOrganizations = async () => {
      // Only Admin needs to select organization from dropdown
      if (isAdmin && (watchedUserType === "team_lead" || watchedUserType === "operator")) {
        setLoadingOrgs(true);
        try {
          const response = await axiosInstance.get("/users?role=organization");
          setOrganizations(response.data.data || response.data || []);
        } catch (error) {
          console.error("Error fetching organizations:", error);
        }
        setLoadingOrgs(false);
      }
    };
    fetchOrganizations();
  }, [watchedUserType, isAdmin]);

  // Fetch team leads when organization is selected (for operator)
  // - Admin: needs organization selected first
  // - Organization: uses own ID automatically
  // - Team Lead: doesn't need this (they ARE the team lead)
  useEffect(() => {
    const fetchTeamLeads = async () => {
      if (watchedUserType === "operator") {
        // Determine which organization ID to use
        const orgId = isOrganization ? loggedInUserId : watchedOrganization;

        if (orgId && !isTeamLead) {
          setLoadingTeamLeads(true);
          setTeamLeads([]); // Clear previous team leads
          setValue("teamLead", ""); // Reset team lead selection
          try {
            const response = await axiosInstance.get(`/users?role=team_lead&organization=${orgId}`);
            setTeamLeads(response.data.data || response.data || []);
          } catch (error) {
            console.error("Error fetching team leads:", error);
          }
          setLoadingTeamLeads(false);
        }
      }
    };
    fetchTeamLeads();
  }, [watchedUserType, watchedOrganization, setValue, isOrganization, isTeamLead, loggedInUserId]);

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);
    try {
      const payload: Record<string, unknown> = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.userType,
        loginUrl: `${window.location.origin}/login`,
      };

      // Add organization limits if creating organization
      if (data.userType === "organization") {
        payload.teamLeadLimit = parseInt(data.teamLeadLimit) || 0;
        payload.operatorLimit = parseInt(data.operatorLimit) || 0;
        payload.towerLimit = parseInt(data.towerLimit) || 0;
        payload.mapOpeningLocation = {
          lat: Number(data.mapLat),
          lng: Number(data.mapLng),
          zoom: Number(data.mapZoom || DEFAULT_ORGANIZATION_MAP_LOCATION.zoom),
        };
      }

      // Add organization reference for team_lead/operator
      if (data.userType === "team_lead" || data.userType === "operator") {
        // Organization adding users -> use their own ID
        // Admin adding users -> use selected organization
        payload.organization = isOrganization ? loggedInUserId : data.organization;
      }

      // Add team lead reference for operator
      if (data.userType === "operator") {
        // Team Lead adding operator -> use their own ID as teamLead
        // Organization/Admin adding operator -> use selected teamLead
        payload.teamLead = isTeamLead ? loggedInUserId : data.teamLead;
        payload.operatorTowerDetails = {
          location: data.towerLocation || "",
          type: data.towerType || "",
          picture: data.towerPicture || "",
          details: data.towerDetails || "",
        };
      }

      if (data.userType === "team_lead") {
        payload.assignedTowerLimit = parseInt(data.assignedTowerLimit) || 0;
      }

      const response = await axiosInstance.post("/signup", payload);
      const successMessage =
        typeof response.data === "string"
          ? response.data
          : response.data?.message || `${data.userType.replace("_", " ")} has been added`;

      open?.({
        type: "success",
        message: "User request sent successfully!",
        description: successMessage,
      });

      reset();
      navigate("/users");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      open?.({
        type: "error",
        message: "Failed to create user",
        description: err.response?.data?.message || "An error occurred",
      });
    }
    setIsLoading(false);
  };

  const availableRoles = getAvailableRoles();

  if (availableRoles.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6" color="error">
          You don't have permission to add users
        </Typography>
      </Box>
    );
  }

  return (
    <MapBackgroundPage>
      <MovableForm
        panelId="user-create-form"
        initialWidth={400}
        minWidth={320}
        maxWidth={980}
        onClose={() => navigate("/users")}
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
            New User
          </Typography>

        {/* User Type Selection */}
        <FormControl fullWidth sx={{ marginTop: 2, borderRadius: 2 }} error={!!errors.userType}>
          <InputLabel id="user-type-label">User Type</InputLabel>
          <Controller
            name="userType"
            control={control}
            rules={{ required: "User type is required" }}
            render={({ field }) => (
              <Select
                {...field}
                labelId="user-type-label"
                label="User Type"
                onChange={(e) => {
                  field.onChange(e);
                  setValue("organization", "");
                  setValue("teamLead", "");
                }}
              >
                {availableRoles.map((r) => (
                  <MenuItem key={r.value} value={r.value}>
                    {r.label}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
          {errors.userType && (
            <FormHelperText>{errors.userType.message?.toString()}</FormHelperText>
          )}
        </FormControl>

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

        {/* Organization Limits - Only for Organization type (Side by Side) */}
        {watchedUserType === "organization" && (
          <>
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <TextField
                fullWidth
                label="Team Lead Limit"
                type="number"
                {...register("teamLeadLimit", {
                  required: "Team lead limit is required",
                  min: { value: 0, message: "Must be 0 or greater" },
                })}
                error={!!errors.teamLeadLimit}
                helperText={errors.teamLeadLimit?.message?.toString()}
                InputProps={{ sx: { borderRadius: 2 }, inputProps: { min: 0 } }}
              />
              <TextField
                fullWidth
                label="Operator Limit"
                type="number"
                {...register("operatorLimit", {
                  required: "Operator limit is required",
                  min: { value: 0, message: "Must be 0 or greater" },
                })}
                error={!!errors.operatorLimit}
                helperText={errors.operatorLimit?.message?.toString()}
                InputProps={{ sx: { borderRadius: 2 }, inputProps: { min: 0 } }}
              />
            </Box>
            <TextField
              fullWidth
              label="Tower Add Limit"
              type="number"
              {...register("towerLimit", {
                required: "Tower add limit is required",
                min: { value: 0, message: "Must be 0 or greater" },
              })}
              error={!!errors.towerLimit}
              helperText={errors.towerLimit?.message?.toString()}
              margin="normal"
              InputProps={{ sx: { borderRadius: 2 }, inputProps: { min: 0 } }}
            />

            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              Organization Default Map Opening Location
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                fullWidth
                label="Latitude"
                type="number"
                {...register("mapLat", {
                  required: "Latitude is required",
                  valueAsNumber: true,
                  min: { value: -90, message: "Latitude must be >= -90" },
                  max: { value: 90, message: "Latitude must be <= 90" },
                })}
                error={!!errors.mapLat}
                helperText={errors.mapLat?.message?.toString()}
                InputProps={{
                  sx: { borderRadius: 2 },
                  inputProps: { step: "any" },
                }}
              />
              <TextField
                fullWidth
                label="Longitude"
                type="number"
                {...register("mapLng", {
                  required: "Longitude is required",
                  valueAsNumber: true,
                  min: { value: -180, message: "Longitude must be >= -180" },
                  max: { value: 180, message: "Longitude must be <= 180" },
                })}
                error={!!errors.mapLng}
                helperText={errors.mapLng?.message?.toString()}
                InputProps={{
                  sx: { borderRadius: 2 },
                  inputProps: { step: "any" },
                }}
              />
              <TextField
                fullWidth
                label="Zoom"
                type="number"
                {...register("mapZoom", {
                  required: "Zoom is required",
                  valueAsNumber: true,
                  min: { value: 1, message: "Zoom must be >= 1" },
                  max: { value: 20, message: "Zoom must be <= 20" },
                })}
                error={!!errors.mapZoom}
                helperText={errors.mapZoom?.message?.toString()}
                InputProps={{
                  sx: { borderRadius: 2 },
                  inputProps: { step: "0.1" },
                }}
              />
            </Box>
          </>
        )}

        {/* Organization Selection - ONLY for Admin adding Team Lead/Operator */}
        {/* Organization/Team Lead don't need this - they use their own ID */}
        {isAdmin && (watchedUserType === "team_lead" || watchedUserType === "operator") && (
          <FormControl fullWidth sx={{ marginTop: 2, borderRadius: 2 }} error={!!errors.organization}>
            <InputLabel id="organization-label">Organization</InputLabel>
            <Controller
              name="organization"
              control={control}
              rules={{ required: "Organization is required" }}
              render={({ field }) => (
                <Select
                  {...field}
                  labelId="organization-label"
                  label="Organization"
                  disabled={loadingOrgs}
                  onChange={(e) => {
                    field.onChange(e);
                    setValue("teamLead", ""); // Reset team lead when organization changes
                  }}
                >
                  {loadingOrgs ? (
                    <MenuItem disabled>Loading...</MenuItem>
                  ) : (
                    organizations.map((org) => (
                      <MenuItem key={org._id} value={org._id}>
                        {org.name} ({org.email})
                      </MenuItem>
                    ))
                  )}
                </Select>
              )}
            />
            {errors.organization && (
              <FormHelperText>{errors.organization.message?.toString()}</FormHelperText>
            )}
          </FormControl>
        )}

        {/* Team Lead Selection - For Operator */}
        {/* Team Lead doesn't need this - they ARE the team lead */}
        {/* Admin: show after organization selected */}
        {/* Organization: show immediately (uses own ID for org filter) */}
        {watchedUserType === "operator" && !isTeamLead && (isOrganization || watchedOrganization) && (
          <FormControl fullWidth sx={{ marginTop: 2, borderRadius: 2 }} error={!!errors.teamLead}>
            <InputLabel id="team-lead-label">Team Lead</InputLabel>
            <Controller
              name="teamLead"
              control={control}
              rules={{ required: "Team Lead is required" }}
              render={({ field }) => (
                <Select
                  {...field}
                  labelId="team-lead-label"
                  label="Team Lead"
                  disabled={loadingTeamLeads}
                >
                  {loadingTeamLeads ? (
                    <MenuItem disabled>Loading...</MenuItem>
                  ) : teamLeads.length === 0 ? (
                    <MenuItem disabled>No Team Leads found for this Organization</MenuItem>
                  ) : (
                    teamLeads.map((tl) => (
                      <MenuItem key={tl._id} value={tl._id}>
                        {tl.name} ({tl.email})
                      </MenuItem>
                    ))
                  )}
                </Select>
              )}
            />
            {errors.teamLead && (
              <FormHelperText>{errors.teamLead.message?.toString()}</FormHelperText>
            )}
          </FormControl>
        )}

        {watchedUserType === "team_lead" && (isOrganization || isAdmin) && (
          <TextField
            fullWidth
            label="Allowed Towers for this Team Lead"
            type="number"
            {...register("assignedTowerLimit", {
              required: "Team lead tower limit is required",
              min: { value: 0, message: "Must be 0 or greater" },
            })}
            error={!!errors.assignedTowerLimit}
            helperText={errors.assignedTowerLimit?.message?.toString()}
            margin="normal"
            InputProps={{ sx: { borderRadius: 2 }, inputProps: { min: 0 } }}
          />
        )}

        {watchedUserType === "operator" && isTeamLead && (
          <>
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              Operator Tower Details
            </Typography>
            <TextField
              fullWidth
              label="Tower Location"
              {...register("towerLocation", {
                required: "Tower location is required",
              })}
              error={!!errors.towerLocation}
              helperText={errors.towerLocation?.message?.toString()}
              margin="normal"
              InputProps={{ sx: { borderRadius: 2 } }}
            />
            <TextField
              fullWidth
              label="Tower Type"
              {...register("towerType", {
                required: "Tower type is required",
              })}
              error={!!errors.towerType}
              helperText={errors.towerType?.message?.toString()}
              margin="normal"
              InputProps={{ sx: { borderRadius: 2 } }}
            />
            <TextField
              fullWidth
              label="Tower Picture URL"
              {...register("towerPicture")}
              error={!!errors.towerPicture}
              helperText={errors.towerPicture?.message?.toString()}
              margin="normal"
              InputProps={{ sx: { borderRadius: 2 } }}
            />
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Tower Details"
              {...register("towerDetails", {
                required: "Tower details are required",
              })}
              error={!!errors.towerDetails}
              helperText={errors.towerDetails?.message?.toString()}
              margin="normal"
              InputProps={{ sx: { borderRadius: 2 } }}
            />
          </>
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
              "Create User"
            )}
          </Button>
        </Box>
      </MovableForm>
    </MapBackgroundPage>
  );
};

export default UserCreate;
