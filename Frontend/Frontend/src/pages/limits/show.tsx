import {
  Stack,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  useTheme,
  Box,
  Paper,
} from "@mui/material";
import { useShow } from "@refinedev/core";
import { Show } from "@refinedev/mui";

const DomainChip = ({ domain }: { domain: string }) => {
  const theme = useTheme();
  const colorMap = {
    green: {
      bg: theme.palette.success.light,
      color: theme.palette.success.dark,
    },
    yellow: {
      bg: theme.palette.warning.light,
      color: theme.palette.warning.dark,
    },
    red: {
      bg: theme.palette.error.light,
      color: theme.palette.error.dark,
    },
  };

  return (
    <Chip
      label={domain}
      size="small"
      sx={{
        textTransform: "capitalize",
        backgroundColor: colorMap[domain as keyof typeof colorMap].bg,
        color: colorMap[domain as keyof typeof colorMap].color,
        fontWeight: 600,
        "&:hover": {
          backgroundColor: colorMap[domain as keyof typeof colorMap].bg,
        },
        width: "70px",
      }}
    />
  );
};

const DetailRow = ({
  label,
  value,
  domain,
}: {
  label: string;
  value: string | null;
  domain?: string;
}) => (
  <Box sx={{ py: 0.75 }}>
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={6}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <Stack direction="row" spacing={1} alignItems="center">
          {domain && <DomainChip domain={domain} />}
          <Typography variant="body2" fontWeight={500}>
            {value || 0}
          </Typography>
        </Stack>
      </Grid>
    </Grid>
  </Box>
);

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

const generateAxisRows = (
  prefix: string,
  axisData: any,
  axis: string,
  domainTypes: string[] = ["green", "yellow", "red"]
) => {
  return domainTypes.flatMap((domain) => [
    <DetailRow
      key={`${prefix}-${axis}-${domain}-max`}
      label={`${axis.toUpperCase()} Axis - Max`}
      value={axisData?.[domain]?.max}
      domain={domain}
    />,
    <DetailRow
      key={`${prefix}-${axis}-${domain}-min`}
      label={`${axis.toUpperCase()} Axis - Min`}
      value={axisData?.[domain]?.min}
      domain={domain}
    />,
  ]);
};

const AxisSection = ({
  title,
  data,
  axis,
}: {
  title: string;
  data: any;
  axis: string;
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
    {generateAxisRows(title.toLowerCase(), data?.[axis], axis)}
  </Paper>
);

export const LimitsShow = () => {
  const { query } = useShow({
    dataProviderName: "limits",
    resource: "limits",
  });
  const { data, isLoading } = query;
  const record = data?.data || {};

  const {
    vibrationAngle,
    vibrationDisplacement,
    vibrationFrequency,
    vibrationSpeed,
    vibrationPitchAngle,
    vibrationRollAngle,
    windDirection,
    windHumidity,
    windSpeed,
    windTemperature,
  } = record;

  return (
    <Show isLoading={isLoading}>
      <Card
        sx={{
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
            Sensor Limits Configuration
          </Typography>
          <Divider sx={{ mb: 4 }} />

          <Grid container spacing={6}>
            {/* Vibration Parameters */}
            <Grid item xs={12} md={6}>
              <SectionHeading title="Vibration Parameters" />

              <Box sx={{ mb: 4 }}>
                <SectionHeading title="Angle" />
                {["x", "y", "z"].map((axis) => (
                  <AxisSection
                    key={`angle-${axis}`}
                    title="angle"
                    data={vibrationAngle}
                    axis={axis}
                  />
                ))}
              </Box>

              <Box sx={{ mb: 4 }}>
                <SectionHeading title="Displacement" />
                {["x", "y", "z"].map((axis) => (
                  <AxisSection
                    key={`displacement-${axis}`}
                    title="displacement"
                    data={vibrationDisplacement}
                    axis={axis}
                  />
                ))}
              </Box>

              <Box sx={{ mb: 4 }}>
                <SectionHeading title="Speed" />
                {["x", "y", "z"].map((axis) => (
                  <AxisSection
                    key={`speed-${axis}`}
                    title="speed"
                    data={vibrationSpeed}
                    axis={axis}
                  />
                ))}
              </Box>

              <Box sx={{ mb: 4 }}>
                <SectionHeading title="Frequency" />
                {["x", "y", "z"].map((axis) => (
                  <AxisSection
                    key={`frequency-${axis}`}
                    title="frequency"
                    data={vibrationFrequency}
                    axis={axis}
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
                  {generateAxisRows("wind-direction", windDirection, "")}
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
                  {generateAxisRows("wind-speed", windSpeed, "")}
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
                  {generateAxisRows("temperature", windTemperature, "")}
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
                  {generateAxisRows("humidity", windHumidity, "")}
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
                  {generateAxisRows("pitch-angle", vibrationPitchAngle, "")}
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
                  {generateAxisRows("roll-angle", vibrationRollAngle, "")}
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Show>
  );
};

export default LimitsShow;
