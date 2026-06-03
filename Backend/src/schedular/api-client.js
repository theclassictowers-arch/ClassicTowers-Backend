// config/api-client.js
import axios from "axios";
import { API_ENDPOINT, AXIOS_TIMEOUT } from "./sensor-constants.js";

export const apiClient = axios.create({
  baseURL: API_ENDPOINT,
  timeout: AXIOS_TIMEOUT,
  headers: { "Content-Type": "application/json" },
});
