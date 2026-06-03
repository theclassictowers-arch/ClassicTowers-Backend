import { DataProvider } from "@refinedev/core";
import { axiosInstance } from "../utils";
import { generateMockSensorData, generateMockLimits } from "../utils/mockSensorData";

export const sensorProvider: DataProvider = {
  getList: async ({ filters }) => {
    try {
      // Robust filter extraction by field name instead of hardcoded index
      const imei = filters?.find(f => (f as any).field === "imei")?.value;
      const parameter = filters?.find(f => (f as any).field === "parameter")?.value;
      const startDateTime = filters?.find(f => (f as any).field === "startDateTime")?.value;
      const endDateTime = filters?.find(f => (f as any).field === "endDateTime")?.value;

      const response = await axiosInstance.get(
        "/sensors/get-by-imei-and-parameter",
        {
          params: {
            imei,
            parameter, // Axios handles arrays automatically as parameter[]=val1&parameter[]=val2
            startDateTime,
            endDateTime,
          },
        }
      );

      return {
        data: response.data?.data || response.data || [],
        total: response.data?.total || response.data?.data?.length || 0,
        successNotification: {
          message: "Successfully fetched sensors",
          description: "Here are the sensors",
          type: "success",
        },
      };
    } catch (error) {
      // MOCK DATA FOR TESTING - اگر API fail ہو تو mock data دیں
      const parameterValue = filters?.find(f => (f as any).field === "parameter")?.value || "windSpeed";
      const parameter = Array.isArray(parameterValue) ? parameterValue[0] : parameterValue;
      
      const mockData = generateMockSensorData(parameter, 24).map((d: any) => ({
        ...d,
        parameter: parameter, // Trend lines ke liye parameter field lazmi hai
      }));
      const mockLimits = generateMockLimits();

      console.log("🧪 [MOCK DATA] Using test data for parameter:", parameter);
      console.log("🧪 [MOCK DATA] Generated", mockData.length, "data points");
      console.log("🧪 [MOCK DATA] Sample data point:", mockData[0]);

      return {
        data: [
          {
            processedSensorData: mockData,
            limits: mockLimits,
          }
        ],
        total: 1,
        successNotification: {
          message: "Test data loaded (Mock)",
          description: `Showing test data for ${parameter}`,
          type: "success",
        },
      };
    }
  },
  getOne: function () {
    throw new Error("Function not implemented.");
  },
  create: function () {
    throw new Error("Function not implemented.");
  },
  update: function () {
    throw new Error("Function not implemented.");
  },
  deleteOne: function () {
    throw new Error("Function not implemented.");
  },
  getApiUrl: function (): string {
    throw new Error("Function not implemented.");
  },
};
