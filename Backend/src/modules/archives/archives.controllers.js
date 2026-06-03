import { asyncHandler } from "#utils/index.js";
import archivesService from "./archives.services.js";

const archivesController = {
  getAll: asyncHandler(async function (req, res) {
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not specified
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
    const skip = (page - 1) * limit;
    const result = await archivesService.getAll(skip, limit, req.user.id);
    res.status(200).json(result);
  }),

  getByCoordinatesAndParameter: asyncHandler(async function (req, res) {
    const { parameter, longitude, latitude, startTime, endTime } = req.query;
    const result = await archivesService.getByCoordinatesAndParameter(
      parameter,
      longitude,
      latitude,
      startTime,
      endTime
    );
    res.status(200).json(result);
  }),

  getByImeiAndParameter: asyncHandler(async function (req, res) {
    const { parameter, imei, startTime, endTime } = req.query;
    const result = await archivesService.getByImeiAndParameter(
      parameter,
      imei,
      startTime,
      endTime
    );
    res.status(200).json(result);
  }),
};

export default archivesController;
