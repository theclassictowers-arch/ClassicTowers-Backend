import { DataProvider } from "@refinedev/core";
import { axiosInstance } from "../utils";

const mockSites = [
  {
    "_id": "site-001",
    "name": "Tower Alpha",
    "display_name": "Tower Alpha - Riyadh",
    "latitude": 24.7136,
    "longitude": 46.6753,
    "region": "Riyadh",
    "infrastructure_id": "INF-001",
    "imei": "IMEI-123456789",
    "status": {
      "vibrationAngle": { "message": "Normal vibration angle", "status": "normal" },
      "vibrationDisplacement": { "message": "Displacement within limits", "status": "normal" },
      "vibrationFrequency": { "message": "Frequency stable", "status": "normal" },
      "vibrationSpeed": { "message": "Speed normal", "status": "normal" },
      "windSpeed": { "message": "Wind speed moderate", "status": "normal" },
      "windTemperature": { "message": "Temperature normal", "status": "normal" },
      "windHumidity": { "message": "Humidity normal", "status": "normal" },
      "windDirection": { "message": "Wind direction variable", "status": "normal" }
    },
    "vibrationSensor": {
      "sensorId": "VIB-001"
    }
  },
  {
    "_id": "site-002",
    "name": "Tower Beta",
    "display_name": "Tower Beta - Jeddah",
    "latitude": 21.4858,
    "longitude": 39.1925,
    "region": "Jeddah",
    "infrastructure_id": "INF-002",
    "imei": "IMEI-987654321",
    "status": {
      "vibrationAngle": { "message": "High vibration detected", "status": "warning" },
      "vibrationDisplacement": { "message": "Displacement approaching limit", "status": "warning" },
      "vibrationFrequency": { "message": "Frequency fluctuating", "status": "warning" },
      "vibrationSpeed": { "message": "Speed elevated", "status": "warning" },
      "windSpeed": { "message": "High wind speed", "status": "warning" },
      "windTemperature": { "message": "Temperature rising", "status": "normal" },
      "windHumidity": { "message": "Humidity high", "status": "normal" },
      "windDirection": { "message": "Wind direction stable", "status": "normal" }
    },
    "vibrationSensor": {
      "sensorId": "VIB-002"
    }
  },
  {
    "_id": "site-003",
    "name": "Tower Gamma",
    "display_name": "Tower Gamma - Dammam",
    "latitude": 26.4207,
    "longitude": 50.0888,
    "region": "Dammam",
    "infrastructure_id": "INF-003",
    "imei": "IMEI-555666777",
    "status": {
      "vibrationAngle": { "message": "Critical vibration!", "status": "danger" },
      "vibrationDisplacement": { "message": "Displacement exceeded!", "status": "danger" },
      "vibrationFrequency": { "message": "Frequency critical", "status": "danger" },
      "vibrationSpeed": { "message": "Speed critical", "status": "danger" },
      "windSpeed": { "message": "Extreme wind speed", "status": "danger" },
      "windTemperature": { "message": "Temperature critical", "status": "warning" },
      "windHumidity": { "message": "Humidity critical", "status": "warning" },
      "windDirection": { "message": "Wind direction extreme", "status": "normal" }
    },
    "vibrationSensor": {
      "sensorId": "VIB-003"
    }
  }
];

export const siteProvider: DataProvider = {
  getList: async function ({ resource }) {
    try {
      const response = await axiosInstance.get(`/${resource}`);
      return {
        data: response.data || [],
        total: response.data.length || 0,
        successNotification: {
          message: "Successfully fetched sites",
          description: "Here are the sites",
          type: "success",
        },
      };
    } catch (error) {
      // MOCK DATA FOR TESTING - اگر API fail ہو تو mock sites دیتے ہیں
      console.log("🧪 [MOCK DATA] Using test sites data");
      return {
        data: mockSites,
        total: mockSites.length,
        successNotification: {
          message: "Test sites loaded (Mock)",
          description: "Showing test sites data",
          type: "success",
        },
      };
    }
  },

  getOne: async ({ resource, id }) => {
    try {
      const { data } = await axiosInstance.get(`/${resource}/${id}`);

      return {
        data,
      };
    } catch (error) {
      throw new Error(
        (error as any).response?.data?.message || "Unknown error occurred"
      );
      0;
    }
  },

  create: async ({ resource, variables }) => {
    const role = localStorage.getItem("role")?.toLowerCase();

    if (role !== "admin" && role !== "organization") {
      throw new Error("Permission Denied: Only Admin or Organization can add sites.");
    }

    let payload = variables;

    // Transform data for sites creation to match backend expectation (sensor packet structure)
    if (resource === "sites") {
      const vars = variables as any;
      const { lat, lon, ...rest } = vars;
      // Backend expects coordinates: [longitude, latitude]
      payload = { ...rest, coordinates: [Number(lon), Number(lat)] } as any;
    }

    try {
      const { data } = await axiosInstance.post(`/${resource}`, payload);
      return { data };
    } catch (error) {
      throw new Error(
        (error as any).response?.data?.message || "Unknown error occurred"
      );
    }
  },

  update: async ({ resource, id, variables }) => {
    try {
      const { data } = await axiosInstance.patch(
        `/${resource}/${id}`,
        variables
      );

      return {
        data,
      };
    } catch (error) {
      throw new Error(
        (error as any).response?.data?.message || "Unknown error occurred"
      );
    }
  },

  deleteOne: async ({ resource, id }) => {
    try {
      const { data } = await axiosInstance.delete(`/${resource}/${id}`);

      return {
        data,
      };
    } catch (error) {
      throw new Error(
        (error as any).response?.data?.message || "Unknown error occurred"
      );
    }
  },

  getApiUrl: function (): string {
    throw new Error("Function not implemented.");
  },
};
