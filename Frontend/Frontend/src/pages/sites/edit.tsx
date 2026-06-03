import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useNotification } from "@refinedev/core";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "../../utils";
import { formStyles } from "../auth/styles";
import { MovableForm } from "../../components/movable-form";
import { MapBackgroundPage } from "../../components/map-background-page";

const defaultAxisData = { x: [0], y: [0], z: [0] };

export const SiteEdit: React.FC = () => {
  const { id } = useParams();
  const { open } = useNotification();
  const navigate = useNavigate();

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [siteSnapshot, setSiteSnapshot] = useState<Record<string, any> | null>(
    null
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<FieldValues>({
    mode: "onChange",
    defaultValues: {
      imei: "",
      lat: "",
      lon: "",
      vibrationSensorId: "",
      windSensorId: "",
      region: "",
      infrastructure_id: "",
      name: "",
      display_name: "",
    },
  });

  useEffect(() => {
    if (!id) return;

    const fetchSite = async () => {
      setIsInitialLoading(true);
      try {
        const response = await axiosInstance.get(`/sites/${id}`);
        const record = response.data?.data || response.data || {};
        const coordinates = Array.isArray(record.coordinates)
          ? record.coordinates
          : [];

        setSiteSnapshot(record);
        setValue("imei", Array.isArray(record.imei) ? record.imei.join(", ") : record.imei || "");
        setValue("lat", record.lat ?? coordinates[1] ?? "");
        setValue("lon", record.lon ?? coordinates[0] ?? "");
        setValue("vibrationSensorId", record.vibrationSensor?.sensorId || "");
        setValue("windSensorId", record.windSensor?.sensorId || "");
        setValue("region", record.region || "");
        setValue("infrastructure_id", record.infrastructure_id || "");
        setValue("name", record.name || "");
        setValue("display_name", record.display_name || "");
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        open?.({
          type: "error",
          message: "Failed to load site",
          description: err.response?.data?.message || "An error occurred",
        });
        navigate("/sites");
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchSite();
  }, [id, navigate, open, setValue]);

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    if (!id) return;

    setIsSaving(true);
    try {
      const payload = {
        name: data.name || "",
        display_name: data.display_name || "",
        region: data.region || "",
        infrastructure_id: data.infrastructure_id || "",
        coordinates: [Number(data.lon), Number(data.lat)],
        lat: Number(data.lat),
        lon: Number(data.lon),
        imei: String(data.imei || "")
          .split(",")
          .map((v) => Number(v.trim()))
          .filter((n) => !Number.isNaN(n)),
        vibrationSensor: {
          ...(siteSnapshot?.vibrationSensor || {
            speed: defaultAxisData,
            displacement: defaultAxisData,
            frequency: defaultAxisData,
            angle: defaultAxisData,
            pitchAngle: [0],
            rollAngle: [0],
          }),
          sensorId: data.vibrationSensorId || "",
        },
        windSensor: {
          ...(siteSnapshot?.windSensor || {
            speed: [0],
            direction: [0],
            humidity: [0],
            temperature: [0],
          }),
          sensorId: data.windSensorId || "",
        },
      };

      await axiosInstance.patch(`/sites/${id}`, payload);

      open?.({
        type: "success",
        message: "Site updated successfully!",
        description: "The site has been updated",
      });

      navigate("/sites");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      open?.({
        type: "error",
        message: "Failed to update site",
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
          panelId="site-edit-form"
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
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <Typography variant="h4" gutterBottom sx={formStyles.title}>
              Edit Site
            </Typography>

            <TextField
              fullWidth
              label="IMEI(s) - comma separated"
              {...register("imei", { required: "IMEI is required" })}
              error={!!errors.imei}
              helperText={errors.imei?.message?.toString()}
              margin="normal"
              InputProps={{ sx: { borderRadius: 2 } }}
            />

            <TextField
              fullWidth
              label="Latitude"
              type="number"
              {...register("lat", {
                required: "Latitude is required",
                valueAsNumber: true,
              })}
              error={!!errors.lat}
              helperText={errors.lat?.message?.toString()}
              margin="normal"
              InputProps={{ sx: { borderRadius: 2 }, inputProps: { step: "any" } }}
            />

            <TextField
              fullWidth
              label="Longitude"
              type="number"
              {...register("lon", {
                required: "Longitude is required",
                valueAsNumber: true,
              })}
              error={!!errors.lon}
              helperText={errors.lon?.message?.toString()}
              margin="normal"
              InputProps={{ sx: { borderRadius: 2 }, inputProps: { step: "any" } }}
            />

            <TextField
              fullWidth
              label="Vibration Sensor ID"
              {...register("vibrationSensorId", {
                required: "Vibration Sensor ID is required",
              })}
              error={!!errors.vibrationSensorId}
              helperText={errors.vibrationSensorId?.message?.toString()}
              margin="normal"
              InputProps={{ sx: { borderRadius: 2 } }}
            />

            <TextField
              fullWidth
              label="Wind Sensor ID"
              {...register("windSensorId", {
                required: "Wind Sensor ID is required",
              })}
              error={!!errors.windSensorId}
              helperText={errors.windSensorId?.message?.toString()}
              margin="normal"
              InputProps={{ sx: { borderRadius: 2 } }}
            />

            <TextField
              fullWidth
              label="Name"
              {...register("name", { required: "Name is required" })}
              error={!!errors.name}
              helperText={errors.name?.message?.toString()}
              margin="normal"
              InputProps={{ sx: { borderRadius: 2 } }}
            />

            <TextField
              fullWidth
              label="Display Name"
              {...register("display_name", { required: "Display name is required" })}
              error={!!errors.display_name}
              helperText={errors.display_name?.message?.toString()}
              margin="normal"
              InputProps={{ sx: { borderRadius: 2 } }}
            />

            <TextField
              fullWidth
              label="Region"
              {...register("region")}
              error={!!errors.region}
              helperText={errors.region?.message?.toString()}
              margin="normal"
              InputProps={{ sx: { borderRadius: 2 } }}
            />

            <TextField
              fullWidth
              label="Infrastructure ID"
              {...register("infrastructure_id")}
              error={!!errors.infrastructure_id}
              helperText={errors.infrastructure_id?.message?.toString()}
              margin="normal"
              InputProps={{ sx: { borderRadius: 2 } }}
            />

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
                "Update Site"
              )}
            </Button>
          </Box>
        </MovableForm>
      )}
    </MapBackgroundPage>
  );
};
