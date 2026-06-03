import { asyncHandler } from "#utils/index.js";
import sensorService from "./sensor.services.js";

const sensorController = {
  getByCoordinates: asyncHandler(async function (req, res) {
    const { longitude, latitude } = req.query;
    const result = await sensorService.getByCoordinates(longitude, latitude);
    res.status(200).json(result);
  }),

  getByImeiAndParameter: asyncHandler(async function (req, res) {
    const { parameter, imei, startDateTime, endDateTime } = req.query;
    const result = await sensorService.getByImeiAndParameter(
      parameter,
      imei,
      startDateTime,
      endDateTime,
    );
    res.status(200).json(result);
  }),
};

export default sensorController;
