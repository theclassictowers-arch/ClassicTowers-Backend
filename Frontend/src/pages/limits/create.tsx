import {
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Paper,
  TextField,
  Divider,
  Button,
  CircularProgress,
} from "@mui/material";
import { useState } from "react";
import { useForm, type FieldValues, type SubmitHandler } from "react-hook-form";
import { useNotification } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { formStyles } from "../auth/styles";
import { MovableForm } from "../../components/movable-form";
import { MapBackgroundPage } from "../../components/map-background-page";
import { axiosInstance } from "../../utils";

const SectionHeading = ({ title }: { title: string }) => (
  <Typography
    variant="h6"
    sx={{
      mt: 1.5,
      mb: 1,
      fontSize: "1rem",
      fontWeight: 600,
      color: (theme) => theme.palette.text.primary,
    }}
  >
    {title}
  </Typography>
);

const SubSectionHeading = ({ title }: { title: string }) => (
  <Typography
    variant="caption"
    sx={{
      display: "block",
      mb: 0.5,
      color: (theme) => theme.palette.text.secondary,
      fontWeight: 500,
    }}
  >
    {title}
  </Typography>
);

const generateAxisFields = (
  register: any,
  errors: any,
  prefix: string,
  axis: string = "",
  domains: string[] = ["green", "yellow", "red"]
) => {
  return domains.flatMap((domain) => [
    <TextField
      key={`${prefix}-${axis}-${domain}-max`}
      {...register(`${prefix}.${axis}.${domain}.max`, {
        valueAsNumber: true,
      })}
      error={!!errors?.[prefix]?.[axis]?.[domain]?.max}
      helperText={errors?.[prefix]?.[axis]?.[domain]?.max?.message}
      margin="dense"
      fullWidth
      size="small"
      InputLabelProps={{ shrink: true }}
      type="number"
      label={`${domain.charAt(0).toUpperCase() + domain.slice(1)} Max ${
        axis ? `(${axis.toUpperCase()})` : ""
      }`}
    />,
    <TextField
      key={`${prefix}-${axis}-${domain}-min`}
      {...register(`${prefix}.${axis}.${domain}.min`, {
        valueAsNumber: true,
      })}
      error={!!errors?.[prefix]?.[axis]?.[domain]?.min}
      helperText={errors?.[prefix]?.[axis]?.[domain]?.min?.message}
      margin="dense"
      fullWidth
      size="small"
      InputLabelProps={{ shrink: true }}
      type="number"
      label={`${domain.charAt(0).toUpperCase() + domain.slice(1)} Min ${
        axis ? `(${axis.toUpperCase()})` : ""
      }`}
    />,
  ]);
};

const AxisSection = ({
  prefix,
  axis,
  register,
  errors,
}: {
  prefix: string;
  axis: string;
  register: any;
  errors: any;
}) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      mb: 1,
      backgroundColor: "#333",
      borderRadius: 2,
    }}
  >
    <SubSectionHeading title={`${axis.toUpperCase()} Axis`} />
    {generateAxisFields(register, errors, prefix, axis)}
  </Paper>
);

export const LimitsCreate = () => {
  const navigate = useNavigate();
  const { open } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FieldValues>({ mode: "onChange" });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);
    try {
      await axiosInstance.post("/limits", data);

      open?.({
        type: "success",
        message: "Sensor limits created successfully!",
        description: "The sensor configuration has been added.",
      });

      reset();
      navigate("/limits");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      open?.({
        type: "error",
        message: "Failed to create sensor limits",
        description: err.response?.data?.message || "An error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MapBackgroundPage>
      <MovableForm
        panelId="limits-create-form"
        initialWidth={760}
        minWidth={460}
        maxWidth={1250}
        onClose={() => navigate("/limits")}
      >
        <Card
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            ...formStyles.container,
            m: 0,
            width: "100%",
            maxWidth: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
            borderRadius: 2,
            boxShadow: (theme) => theme.shadows[5],
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                fontWeight: 700,
                color: (theme) => theme.palette.text.primary,
                mb: 2,
              }}
            >
              Create Sensor Limits Configuration
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box component="form" autoComplete="off">
              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    {...register("vibrationSensor.sensorId", {
                      required: "Vibration Sensor ID is required",
                    })}
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    label="Vibration Sensor ID"
                    error={!!(errors as any)?.vibrationSensor?.sensorId}
                    helperText={
                      (errors as any)?.vibrationSensor?.sensorId?.message?.toString()
                    }
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    {...register("windSensor.sensorId", {
                      required: "Wind Sensor ID is required",
                    })}
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    label="Wind Sensor ID"
                    error={!!(errors as any)?.windSensor?.sensorId}
                    helperText={(errors as any)?.windSensor?.sensorId?.message?.toString()}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2.5}>
                <Grid item xs={12} md={6}>
                  <SectionHeading title="Vibration Parameters" />

                  <Box sx={{ mb: 2 }}>
                    <SectionHeading title="Angle" />
                    {["x", "y", "z"].map((axis) => (
                      <AxisSection
                        key={`angle-${axis}`}
                        prefix="vibrationAngle"
                        axis={axis}
                        register={register}
                        errors={errors}
                      />
                    ))}
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <SectionHeading title="Displacement" />
                    {["x", "y", "z"].map((axis) => (
                      <AxisSection
                        key={`displacement-${axis}`}
                        prefix="vibrationDisplacement"
                        axis={axis}
                        register={register}
                        errors={errors}
                      />
                    ))}
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <SectionHeading title="Speed" />
                    {["x", "y", "z"].map((axis) => (
                      <AxisSection
                        key={`speed-${axis}`}
                        prefix="vibrationSpeed"
                        axis={axis}
                        register={register}
                        errors={errors}
                      />
                    ))}
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <SectionHeading title="Frequency" />
                    {["x", "y", "z"].map((axis) => (
                      <AxisSection
                        key={`frequency-${axis}`}
                        prefix="vibrationFrequency"
                        axis={axis}
                        register={register}
                        errors={errors}
                      />
                    ))}
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <SectionHeading title="Environmental Parameters" />

                  <Box sx={{ mb: 2 }}>
                    <SectionHeading title="Wind" />
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        mb: 2,
                        borderRadius: 1,
                        backgroundColor: "#333",
                      }}
                    >
                      <SubSectionHeading title="Direction" />
                      {generateAxisFields(register, errors, "windDirection")}
                    </Paper>

                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        backgroundColor: "#333",
                      }}
                    >
                      <SubSectionHeading title="Speed" />
                      {generateAxisFields(register, errors, "windSpeed")}
                    </Paper>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <SectionHeading title="Temperature" />
                    <Paper
                      elevation={0}
                      sx={{ p: 2, borderRadius: 1, backgroundColor: "#333" }}
                    >
                      {generateAxisFields(register, errors, "windTemperature")}
                    </Paper>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <SectionHeading title="Humidity" />
                    <Paper
                      elevation={0}
                      sx={{ p: 2, borderRadius: 1, backgroundColor: "#333" }}
                    >
                      {generateAxisFields(register, errors, "windHumidity")}
                    </Paper>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <SectionHeading title="Orientation" />
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        mb: 2,
                        borderRadius: 1,
                        backgroundColor: "#333",
                      }}
                    >
                      <SubSectionHeading title="Pitch Angle" />
                      {generateAxisFields(
                        register,
                        errors,
                        "vibrationPitchAngle"
                      )}
                    </Paper>

                    <Paper
                      elevation={0}
                      sx={{ p: 2, borderRadius: 1, backgroundColor: "#333" }}
                    >
                      <SubSectionHeading title="Roll Angle" />
                      {generateAxisFields(register, errors, "vibrationRollAngle")}
                    </Paper>
                  </Box>
                </Grid>
              </Grid>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{
                  ...formStyles.submitButton,
                  mt: 1,
                  opacity: isLoading ? 0.6 : 1,
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Create Sensor"
                )}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </MovableForm>
    </MapBackgroundPage>
  );
};

export default LimitsCreate;
