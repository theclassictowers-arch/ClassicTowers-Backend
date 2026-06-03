import {
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Paper,
  TextField,
  Divider,
} from "@mui/material";
import { Edit } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import { formStyles } from "../auth/styles";
import { MovableForm } from "../../components/movable-form";
import { MapBackgroundPage } from "../../components/map-background-page";

const SectionHeading = ({ title }: { title: string }) => (
  <Typography
    variant="h6"
    sx={{
      mt: 2.5,
      mb: 2,
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
      mb: 1,
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
  title,
  prefix,
  axis,
  register,
  errors,
}: {
  title: string;
  prefix: string;
  axis: string;
  register: any;
  errors: any;
}) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      mb: 2,
      backgroundColor: "#333",
      borderRadius: 2,
    }}
  >
    <SubSectionHeading title={`${axis.toUpperCase()} Axis`} />
    {generateAxisFields(register, errors, prefix, axis)}
  </Paper>
);

export const LimitsEdit = () => {
  const {
    saveButtonProps,
    refineCore: { queryResult },
    register,
    formState: { errors },
  } = useForm();

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <MapBackgroundPage>
        <MovableForm
          panelId="limits-edit-form"
          initialWidth={760}
          minWidth={460}
          maxWidth={1250}
        >
          <Card
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
                Edit Sensor Limits Configuration
              </Typography>
              <Divider sx={{ mb: 4 }} />

              <Box component="form" autoComplete="off">
                <Grid container spacing={6}>
                  {/* Vibration Parameters */}
                  <Grid item xs={12} md={6}>
                    <SectionHeading title="Vibration Parameters" />

                    <Box sx={{ mb: 4 }}>
                      <SectionHeading title="Angle" />
                      {["x", "y", "z"].map((axis) => (
                        <AxisSection
                          key={`angle-${axis}`}
                          title="Angle"
                          prefix="vibrationAngle"
                          axis={axis}
                          register={register}
                          errors={errors}
                        />
                      ))}
                    </Box>

                    <Box sx={{ mb: 4 }}>
                      <SectionHeading title="Displacement" />
                      {["x", "y", "z"].map((axis) => (
                        <AxisSection
                          key={`displacement-${axis}`}
                          title="Displacement"
                          prefix="vibrationDisplacement"
                          axis={axis}
                          register={register}
                          errors={errors}
                        />
                      ))}
                    </Box>

                    <Box sx={{ mb: 4 }}>
                      <SectionHeading title="Speed" />
                      {["x", "y", "z"].map((axis) => (
                        <AxisSection
                          key={`speed-${axis}`}
                          title="Speed"
                          prefix="vibrationSpeed"
                          axis={axis}
                          register={register}
                          errors={errors}
                        />
                      ))}
                    </Box>

                    <Box sx={{ mb: 4 }}>
                      <SectionHeading title="Frequency" />
                      {["x", "y", "z"].map((axis) => (
                        <AxisSection
                          key={`frequency-${axis}`}
                          title="Frequency"
                          prefix="vibrationFrequency"
                          axis={axis}
                          register={register}
                          errors={errors}
                        />
                      ))}
                    </Box>
                  </Grid>

                  {/* Environmental Parameters */}
                  <Grid item xs={12} md={6}>
                    <SectionHeading title="Environmental Parameters" />

                    <Box sx={{ mb: 4 }}>
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

                    <Box sx={{ mb: 4 }}>
                      <SectionHeading title="Temperature" />
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 1,
                          backgroundColor: "#333",
                        }}
                      >
                        {generateAxisFields(register, errors, "windTemperature")}
                      </Paper>
                    </Box>

                    <Box sx={{ mb: 4 }}>
                      <SectionHeading title="Humidity" />
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 1,
                          backgroundColor: "#333",
                        }}
                      >
                        {generateAxisFields(register, errors, "windHumidity")}
                      </Paper>
                    </Box>

                    <Box sx={{ mb: 4 }}>
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
                        sx={{
                          p: 2,
                          borderRadius: 1,
                          backgroundColor: "#333",
                        }}
                      >
                        <SubSectionHeading title="Roll Angle" />
                        {generateAxisFields(register, errors, "vibrationRollAngle")}
                      </Paper>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </MovableForm>
      </MapBackgroundPage>
    </Edit>
  );
};

export default LimitsEdit;
