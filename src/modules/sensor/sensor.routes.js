import express from "express";

import sensorController from "./sensor.controllers.js";
import { verifyAuthToken } from "#middleware/index.js";

export const sensorRoutes = express.Router();

sensorRoutes
  .get(
    "/get-by-coordinates",
    verifyAuthToken,
    sensorController.getByCoordinates,
  )
  .get(
    "/get-by-imei-and-parameter",
    verifyAuthToken,
    sensorController.getByImeiAndParameter,
  );
