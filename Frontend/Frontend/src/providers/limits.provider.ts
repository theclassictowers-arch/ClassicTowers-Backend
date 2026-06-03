import {
  BaseRecord,
  DataProvider,
  DeleteOneParams,
  DeleteOneResponse,
} from "@refinedev/core";
import { axiosInstance } from "../utils";

export const limitsProvider: DataProvider = {
  getList: async ({ resource }) => {
    try {
      const response = await axiosInstance.get(`/${resource}`);

      return {
        data: response.data || [],
        total: response.data.length || 0,
        successNotification: {
          message: "Successfully fetched limits",
          description: "Here are the limits",
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
      const { data } = await axiosInstance.get(`/${resource}/${id}`);

      return {
        data,
      };
    } catch (error) {
      throw new Error(
        (error as any).response?.data?.message || "Unknown error occurred"
      );
    }
  },

  create: function () {
    throw new Error("Function not implemented.");
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

  deleteOne: async function <
    TData extends BaseRecord = BaseRecord,
    TVariables = {}
  >(params: DeleteOneParams<TVariables>): Promise<DeleteOneResponse<TData>> {
    try {
      const { id } = params;
      const response = await axiosInstance.delete(`/limits/delete/${id}`);

      return {
        data: response.data,
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
