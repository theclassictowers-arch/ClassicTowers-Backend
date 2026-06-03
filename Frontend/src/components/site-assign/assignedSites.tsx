import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
} from "@mui/material";
import { axiosInstance } from "../../utils";
import { useParams } from "react-router-dom";

interface Site {
  _id: string;
  lat: number;
  lon: number;
  name: string;
}

function AssignedSites({ userRole }: any) {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();

  useEffect(() => {
    if (userRole !== "team_lead") return;

    const fetchSites = async () => {
      try {
        const response = await axiosInstance.get(`/users/${params.id}/sites`);
        setSites(response.data);
      } catch (err) {
        setError("Failed to load sites.");
      } finally {
        setLoading(false);
      }
    };

    fetchSites();
  }, [userRole]);

  if (userRole !== "team_lead") return null;

  if (loading) {
    return (
      <div>
        <Typography variant="h6" gutterBottom>
          Assigned Sites
        </Typography>
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Typography variant="h6" gutterBottom>
          Assigned Sites
        </Typography>
        <Typography color="error">{error}</Typography>
      </div>
    );
  }

  if (sites)
    return (
      <div>
        <Typography variant="h6" gutterBottom>
          Assigned Sites
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Site Name</TableCell>
                <TableCell>Latitude</TableCell>
                <TableCell>Longitude</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sites?.map((site) => (
                <TableRow key={site._id}>
                  <TableCell>{site._id}</TableCell>
                  <TableCell>{site.name}</TableCell>
                  <TableCell>{site.lat}</TableCell>
                  <TableCell>{site.lon}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    );
}

export default AssignedSites;
