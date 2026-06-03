import express from "express";

import { verifyAuthToken } from "#middleware/index.js";
import archivesController from "./archives.controllers.js";

export const archivesRoutes = express.Router();

archivesRoutes
  .get("/", verifyAuthToken, archivesController.getAll)
  .get(
    "/get-by-coordinates-and-parameter",
    verifyAuthToken,
    archivesController.getByCoordinatesAndParameter,
  )
  .get(
    "/get-by-imei-and-parameter",
    verifyAuthToken,
    archivesController.getByImeiAndParameter,
  );
