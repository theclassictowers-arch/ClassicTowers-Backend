import { DataProvider } from "@refinedev/core";
import { axiosInstance } from "../utils";

export const archivesProvider: DataProvider = {
  getList: async ({ resource, filters }) => {
    try {
      const response = await axiosInstance.get(`/${resource}`, {
        params: {
          limit: filters?.[0]?.value,
          page: filters?.[1]?.value,
        },
      });

      return {
        data: response.data || [],
        total: response.data.length || 0,
        successNotification: {
          message: "Successfully fetched archives",
          description: "Here are the archives",
          type: "success",
        },
      };
    } catch (error) {
      return {
        data: [],
        total: 0,
        error: {
          name: "Get Limits Error",
          message:
            (error as any).response?.data?.message || "Unknown error occurred",
        },
      };
    }
  },
  getOne: async ({ resource, id }) => {
    try {
      const response = await axiosInstance.get(`/${resource}/${id}`);

      return {
        data: response.data,
      };
    } catch (error) {
      return {
        data: {} as any,
        error: {
          name: "Get One Error",
          message:
            (error as any).response?.data?.message || "Unknown error occurred",
        },
      };
    }
  },
  create: async ({ resource, variables }) => {
    try {
      const response = await axiosInstance.post(`/${resource}`, variables);

      return {
        data: response.data,
      };
    } catch (error) {
      return {
        data: {} as any,
        error: {
          name: "Create Error",
          message:
            (error as any).response?.data?.message || "Unknown error occurred",
        },
      };
    }
  },
  update: async ({ resource, id, variables }) => {
    try {
      const response = await axiosInstance.put(`/${resource}/${id}`, variables);

      return {
        data: response.data,
      };
    } catch (error) {
      return {
        data: null as any,
        error: {
          name: "Update Error",
          message:
            (error as any).response?.data?.message || "Unknown error occurred",
        },
      };
    }
  },
  deleteOne: async ({ resource, id }) => {
    try {
      const response = await axiosInstance.delete(`/${resource}/${id}`);

      return {
        data: response.data,
      };
    } catch (error) {
      return {
        data: null as any,
        error: {
          name: "Delete Error",
          message:
            (error as any).response?.data?.message || "Unknown error occurred",
        },
      };
    }
  },
  getApiUrl: () => {
    return axiosInstance.defaults.baseURL || "";
  },
};
