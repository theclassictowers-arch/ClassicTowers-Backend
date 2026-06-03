import express from "express";

import { limitsDto } from "#dtos/index.js";
import { verifyAuthToken, validateDto } from "#middleware/index.js";
import limitsController from "./limits.controllers.js";

export const limitsRoutes = express.Router();

limitsRoutes
  .get("/", verifyAuthToken, limitsController.getAll)
  .get(
    "/get-by-coordinates",
    verifyAuthToken,
    limitsController.getByCoordinates,
  )
  .get(
    "/get-by-coordinates-and-parameter",
    verifyAuthToken,
    limitsController.getByCoordinatesAndParameter,
  )
  .get("/:limitId", verifyAuthToken, limitsController.getById)
  .patch(
    "/:limitId",
    verifyAuthToken,
    validateDto(limitsDto),
    limitsController.updateById,
  );
