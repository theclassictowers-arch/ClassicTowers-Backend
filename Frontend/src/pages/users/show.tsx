import {
  Stack,
  Typography,
  Avatar,
  Card,
  CardContent,
  Grid,
  Button,
  CircularProgress,
  Box,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useShow } from "@refinedev/core";
import { Show } from "@refinedev/mui";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AssignedSites from "../../components/site-assign/assignedSites";
import { formStyles } from "../auth/styles";
import { MovableForm } from "../../components/movable-form";
import { ShowPageLogo } from "../../components/map-table-page";

const { VITE_API_BASE_URL } = import.meta.env;

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

export const UserShow = () => {
  const navigate = useNavigate();
  const { query } = useShow({
    dataProviderName: "users",
    resource: "users",
  });
  const { data, isLoading } = query;
  const record = data?.data || {};

  const {
    name,
    email,
    role,
    isEmailVerified,
    isApproved,
    createdAt,
    profilePicture,
    teamLead,
    towerLimit,
    assignedTowerLimit,
    operatorTowerDetails,
  } = record;

  const formattedCreatedAt = createdAt
    ? new Date(createdAt).toLocaleString()
    : "N/A";

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleResendVerification = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(
        `${VITE_API_BASE_URL}/api/v1/send-verification-email`,
        { email }
      );
      setMessage(response.data.message || "Verification email sent.");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setMessage(error.response?.data?.message || "Failed to resend email.");
      } else {
        setMessage("Failed to resend email.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <MovableForm
        panelId="user-show-window"
        initialWidth={620}
        minWidth={360}
        maxWidth={980}
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
                  onClick={() => navigate("/users")}
                  sx={{ position: "absolute", left: 0, top: 0 }}
                >
                  Back
                </Button>
                <Typography variant="h5" gutterBottom sx={formStyles.title}>
                  User Details
                </Typography>
              </Box>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} sm={4} textAlign="center">
                  <Avatar
                    src={
                      profilePicture
                        ? `${VITE_API_BASE_URL}${profilePicture}`
                        : "/default-avatar.png"
                    }
                    alt="Profile"
                    sx={{
                      width: 100,
                      height: 100,
                      margin: "auto",
                      marginBottom: "10px",
                    }}
                  />
                  <Typography variant="body2" color="textSecondary">
                    Profile Picture
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Stack spacing={1}>
                    <DetailRow label="name" value={name} />
                    <DetailRow label="Email" value={email} />
                    <DetailRow label="Role" value={role} />
                    <DetailRow
                      label="Email Verified"
                      value={isEmailVerified ? "Yes" : "No"}
                      action={
                        !isEmailVerified && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={handleResendVerification}
                            disabled={loading}
                          >
                            {loading ? (
                              <CircularProgress size={18} />
                            ) : (
                              "Resend Email"
                            )}
                          </Button>
                        )
                      }
                    />
                    <DetailRow label="Approved" value={isApproved ? "Yes" : "No"} />
                    {role === "organization" && (
                      <DetailRow label="Tower Limit" value={String(towerLimit ?? 0)} />
                    )}
                    {role === "team_lead" && (
                      <DetailRow
                        label="Allowed Towers"
                        value={String(assignedTowerLimit ?? 0)}
                      />
                    )}
                    {role === "operator" && operatorTowerDetails && (
                      <>
                        <DetailRow
                          label="Tower Location"
                          value={operatorTowerDetails.location}
                        />
                        <DetailRow
                          label="Tower Type"
                          value={operatorTowerDetails.type}
                        />
                        <DetailRow
                          label="Tower Picture"
                          value={operatorTowerDetails.picture}
                        />
                        <DetailRow
                          label="Tower Details"
                          value={operatorTowerDetails.details}
                        />
                      </>
                    )}
                    <DetailRow label="Created At" value={formattedCreatedAt} />
                    {teamLead && <DetailRow label="Team Lead" value={teamLead} />}
                  </Stack>
                  {message && (
                    <Typography
                      variant="body2"
                      color="primary"
                      sx={{ marginTop: 1 }}
                    >
                      {message}
                    </Typography>
                  )}
                </Grid>
              </Grid>
              <Box mt={2}>
                <AssignedSites userRole={role} />
              </Box>
            <ShowPageLogo />
            </CardContent>
          </Card>
        </Show>
      </MovableForm>
    </>
  );
};
