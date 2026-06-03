import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useForm, SubmitHandler, FieldValues } from "react-hook-form";
import { axiosInstance } from "../../utils";
import { useNotification } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { formStyles } from "../auth/styles";
import { MovableForm } from "../../components/movable-form";
import { MapBackgroundPage } from "../../components/map-background-page";

const defaultAxisData = { x: [0], y: [0], z: [0] };

export const SiteCreate: React.FC = () => {
  const { open } = useNotification();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<FieldValues>({ mode: "onChange" });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);
    try {
      const payload = {
        coordinates: [Number(data.lon), Number(data.lat)],
        region: data.region || "",
        infrastructure_id: data.infrastructure_id || "",
        imei: data.imei
          .split(",")
          .map((v: string) => Number(v.trim()))
          .filter((n: number) => !isNaN(n)),
        vibrationSensor: {
          sensorId: data.vibrationSensorId,
          speed: defaultAxisData,
          displacement: defaultAxisData,
          frequency: defaultAxisData,
          angle: defaultAxisData,
          pitchAngle: [0],
          rollAngle: [0],
        },
        windSensor: {
          sensorId: data.windSensorId,
          speed: [0],
          direction: [0],
          humidity: [0],
          temperature: [0],
        },
      };

      await axiosInstance.post("/sites", payload);

      open?.({
        type: "success",
        message: "Site created successfully!",
        description: "The site has been added",
      });

      reset();
      navigate("/sites");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      open?.({
        type: "error",
        message: "Failed to create site",
        description: err.response?.data?.message || "An error occurred",
      });
    }
    setIsLoading(false);
  };

  return (
    <MapBackgroundPage>
      <MovableForm
        panelId="site-create-form"
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
            Add New Site
          </Typography>

        <TextField
          fullWidth
          label="IMEI(s) — comma separated"
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
          {...register("lat", { required: "Latitude is required", valueAsNumber: true })}
          error={!!errors.lat}
          helperText={errors.lat?.message?.toString()}
          margin="normal"
          InputProps={{ sx: { borderRadius: 2 }, inputProps: { step: "any" } }}
        />

        <TextField
          fullWidth
          label="Longitude"
          type="number"
          {...register("lon", { required: "Longitude is required", valueAsNumber: true })}
          error={!!errors.lon}
          helperText={errors.lon?.message?.toString()}
          margin="normal"
          InputProps={{ sx: { borderRadius: 2 }, inputProps: { step: "any" } }}
        />

        <TextField
          fullWidth
          label="Vibration Sensor ID"
          {...register("vibrationSensorId", { required: "Vibration Sensor ID is required" })}
          error={!!errors.vibrationSensorId}
          helperText={errors.vibrationSensorId?.message?.toString()}
          margin="normal"
          InputProps={{ sx: { borderRadius: 2 } }}
        />

        <TextField
          fullWidth
          label="Wind Sensor ID"
          {...register("windSensorId", { required: "Wind Sensor ID is required" })}
          error={!!errors.windSensorId}
          helperText={errors.windSensorId?.message?.toString()}
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
              opacity: !isValid || isLoading ? 0.6 : 1,
            }}
            disabled={!isValid || isLoading}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : "Create Site"}
          </Button>
        </Box>
      </MovableForm>
    </MapBackgroundPage>
  );
};
