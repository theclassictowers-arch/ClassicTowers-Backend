import {
  Stack,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useShow } from "@refinedev/core";
import { Show } from "@refinedev/mui";
import { useNavigate } from "react-router-dom";
import { formStyles } from "../auth/styles";
import { MovableForm } from "../../components/movable-form";
import { ShowPageLogo } from "../../components/map-table-page";

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
  const navigate = useNavigate();
  const { query } = useShow({
    dataProviderName: "default",
    resource: "sites",
  });
  const { data, isLoading } = query;
  const record = data?.data || {};

  const { name, display_name, region, infrastructure_id, lat, lon, imei } =
    record;

  return (
    <MovableForm
      panelId="site-show-window"
      initialWidth={460}
      minWidth={320}
      maxWidth={820}
      sx={{
        "& .MuiPaper-root, & .MuiCard-root": {
          background: "rgba(164, 198, 236, 0.03) !important",
          backgroundColor: "rgba(164, 198, 236, 0.03) !important",
          backdropFilter: "blur(8px)",
          boxShadow: "0 10px 28px rgba(15, 23, 42, 0.10)",
        },
      }}
    >
      <Show isLoading={isLoading} goBack={false}>
        <Card
          sx={{
            ...formStyles.container,
            m: 0,
            width: "100%",
            maxWidth: "100%",
            maxHeight: "88vh",
            overflowY: "auto",
            background: "rgba(164, 198, 236, 0.03)",
          }}
        >
          <CardContent>
            <Box sx={{ position: "relative", mb: 2 }}>
              <Button
                size="small"
                startIcon={<ArrowBackIcon fontSize="small" />}
                onClick={() => navigate("/sites")}
                sx={{ position: "absolute", left: 0, top: 0 }}
              >
                Back
              </Button>
              <Typography variant="h5" gutterBottom sx={formStyles.title}>
                Site Details
              </Typography>
            </Box>

            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <DetailRow
                    label="IMEI"
                    value={Array.isArray(imei) ? imei.join(", ") : imei}
                  />
                  <DetailRow label="Name" value={name} />
                  <DetailRow label="Display Name" value={display_name} />
                  <DetailRow label="Region" value={region} />
                  <DetailRow
                    label="Infrastructure ID"
                    value={infrastructure_id}
                  />
                  <DetailRow label="Latitude" value={lat} />
                  <DetailRow label="Longitude" value={lon} />
                </Stack>
              </Grid>
            </Grid>
            <ShowPageLogo />
          </CardContent>
        </Card>
      </Show>
    </MovableForm>
  );
};
