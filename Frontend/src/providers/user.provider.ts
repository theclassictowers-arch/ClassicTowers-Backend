import { DataProvider } from "@refinedev/core";

type TData = any; // Define TData type
import { axiosInstance } from "../utils";

export const userProvider: DataProvider = {
  getList: async ({ resource, pagination, filters }) => {
    try {
      // Build query params
      const params = new URLSearchParams();

      // Add pagination params
      if (pagination) {
        const { current = 1, pageSize = 10 } = pagination;
        params.append("current", String(current));
        params.append("pageSize", String(pageSize));
      }

      // Add filter params (role, organization, etc.)
      if (filters) {
        filters.forEach((filter) => {
          if ("field" in filter && filter.value !== undefined && filter.value !== "") {
            params.append(filter.field, String(filter.value));
          }
        });
      }

      const queryString = params.toString();
      const url = queryString ? `/${resource}?${queryString}` : `/${resource}`;

      const { data: response, headers } = await axiosInstance.get(url);

      // Backend returns { data: [...] } format
      const users = response.data || response || [];
      const total = Number(headers["x-total-count"]) || users.length;

      return {
        data: users,
        total,
      };
    } catch (error) {
      return {
        data: [],
        total: 0,
        error: {
          name: "Get Users Error",
          message:
            (error as any).response?.data?.message || "Unknown error occurred",
        },
      };
    }
  },

  getOne: async ({ resource, id }) => {
    try {
      const { data: response } = await axiosInstance.get(`/${resource}/${id}`);

      // Backend returns { data: user } format
      return {
        data: response.data || response,
      };
    } catch (error) {
      return {
        data: {} as TData,
        error: {
          name: "Get User Error",
          message:
            (error as any).response?.data?.message || "Unknown error occurred",
        },
      };
    }
  },

  create: async ({ variables }) => {
    const { data } = await axiosInstance.post("url", variables);

    return {
      data,
    };
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
      return {
        data: {} as TData,
        error: {
          name: "Update User Error",
          message:
            (error as any).response?.data?.message || "Unknown error occurred",
        },
      };
    }
  },

  deleteOne: async ({ resource, id }) => {
    try {
      const { data } = await axiosInstance.delete(`/${resource}/${id}`);

      return {
        data,
      };
    } catch (error) {
      return {
        data: {} as TData,
        error: {
          name: "Delete User Error",
          message:
            (error as any).response?.data?.message || "Unknown error occurred",
        },
      };
    }
  },

  getApiUrl: () => {
    return "API_URL";
  },
};
