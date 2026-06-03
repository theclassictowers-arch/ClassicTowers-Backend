import { asyncHandler } from "#utils/index.js";
import limitsService from "./limits.services.js";

const limitsController = {
  getAll: asyncHandler(async function (req, res) {
    const result = await limitsService.getAll(req.user.id);
    res.status(200).json(result);
  }),

  getByCoordinates: asyncHandler(async function (req, res) {
    const { longitude, latitude } = req.query;
    const result = await limitsService.getByCoordinates(longitude, latitude);
    res.status(200).json(result);
  }),

  getById: asyncHandler(async function (req, res) {
    const { limitId } = req.params;
    const result = await limitsService.getById(limitId);
    res.status(200).json(result);
  }),

  getByCoordinatesAndParameter: asyncHandler(async function (req, res) {
    const { parameter, longitude, latitude } = req.query;
    const result = await limitsService.getByCoordinatesAndParameter(
      parameter,
      longitude,
      latitude
    );
    res.status(200).json(result);
  }),

  updateById: asyncHandler(async function (req, res) {
    const { limitId } = req.params;
    const limitsData = req.body;
    const result = await limitsService.updateById(limitId, limitsData);
    res.status(201).json(result);
  }),
};

export default limitsController;
