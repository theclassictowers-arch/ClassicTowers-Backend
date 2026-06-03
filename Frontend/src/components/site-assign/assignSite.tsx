import { useEffect, useState } from "react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  CircularProgress,
  Typography,
  Box,
} from "@mui/material";
import { axiosInstance } from "../../utils";

interface Site {
  _id: string;
  lat: number;
  lon: number;
  name: string;
}

interface TeamLeadUser {
  assignedTowerLimit?: number;
}

const AssignSite = ({ userId }: any) => {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [assigning, setAssigning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [teamLead, setTeamLead] = useState<TeamLeadUser | null>(null);
  const [assignedCount, setAssignedCount] = useState(0);

  // Fetch all available sites
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const response = await axiosInstance.get("/sites");
        setSites(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch sites");
      } finally {
        setLoading(false);
      }
    };

    fetchSites();
  }, []);

  useEffect(() => {
    const fetchAssignmentSummary = async () => {
      try {
        const [userResponse, assignedResponse] = await Promise.all([
          axiosInstance.get(`/users/${userId}`),
          axiosInstance.get(`/users/${userId}/sites`),
        ]);
        setTeamLead(userResponse.data?.data || userResponse.data || null);
        setAssignedCount((assignedResponse.data || []).length);
      } catch (err) {
        console.error(err);
      }
    };

    if (userId) {
      fetchAssignmentSummary();
    }
  }, [userId]);

  // Handle site selection and assignment
  const handleChange = async (event: SelectChangeEvent<string>) => {
    const siteId = event.target.value;
    setSelectedSiteId(siteId);
    setAssigning(true);
    setError(null);
    setSuccess(null);

    try {
      await axiosInstance.post(`/users/${userId}/sites`, {
        siteId,
      });
      setSuccess("Site successfully assigned!");
      const assignedResponse = await axiosInstance.get(`/users/${userId}/sites`);
      setAssignedCount((assignedResponse.data || []).length);
    } catch (err) {
      console.error(err);
      const errorMessage =
        (err as any).response?.data?.message || "Failed to assign site.";
      setError(errorMessage);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Box sx={{ minWidth: 300 }} my={2}>
      <Typography variant="body2" sx={{ mb: 1 }}>
        Assigned towers: {assignedCount}
        {teamLead?.assignedTowerLimit ? ` / ${teamLead.assignedTowerLimit}` : ""}
      </Typography>
      <FormControl fullWidth disabled={loading || assigning}>
        <InputLabel>Assign Site</InputLabel>
        <Select
          value={selectedSiteId}
          onChange={handleChange}
          label="Assign Site"
        >
          {sites.map((site) => (
            <MenuItem key={site._id} value={site._id}>
              {site.name} ({site.lat}, {site.lon})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {loading && <CircularProgress size={24} sx={{ mt: 2 }} />}
      {error && (
        <Typography color="error" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
      {success && (
        <Typography color="primary" sx={{ mt: 1 }}>
          {success}
        </Typography>
      )}
    </Box>
  );
};

export default AssignSite;
