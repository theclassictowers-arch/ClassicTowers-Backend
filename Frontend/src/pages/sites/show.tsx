import { Stack, Typography, Card, CardContent, Grid } from "@mui/material";
import { useShow } from "@refinedev/core";
import { Show } from "@refinedev/mui";

const DetailRow = ({
  label,
  value,
  action,
}: {
  label: string;
  value: string | null;
  action?: React.ReactNode;
}) => (
  <Grid container spacing={1} alignItems="center">
    <Grid item xs={4}>
      <Typography variant="body2" fontWeight="bold" color="textSecondary">
        {label}:
      </Typography>
    </Grid>
    <Grid item xs={8} display="flex" alignItems="center" gap={1}>
      <Typography variant="body2" color="textPrimary">
        {value || "N/A"}
      </Typography>
      {action}
    </Grid>
  </Grid>
);

export const SiteShow = () => {
  const { query } = useShow({
    dataProviderName: "default",
    resource: "sites",
  });
  const { data, isLoading } = query;
  const record = data?.data || {};

  const { name, display_name, region, infrastructure_id, lat, lon, imei } = record;

  return (
    <Show isLoading={isLoading}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Site Details
          </Typography>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={8}>
              <Stack spacing={1}>
                <DetailRow label="IMEI" value={Array.isArray(imei) ? imei.join(", ") : imei} />
                <DetailRow label="Name" value={name} />
                <DetailRow label="Display Name" value={display_name} />
                <DetailRow label="Region" value={region} />
                <DetailRow label="Infrastructure ID" value={infrastructure_id} />
                <DetailRow label="Latitude" value={lat} />
                <DetailRow label="Longitude" value={lon} />
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Show>
  );
};
