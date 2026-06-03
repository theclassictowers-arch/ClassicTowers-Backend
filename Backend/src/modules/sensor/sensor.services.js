import createError from "http-errors";
import { dataAccess } from "#dataAccess/index.js";
import { sequenceAndCollectSensorsData } from "#helpers/index.js";

const { read } = dataAccess;
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const normalizeImei = (imei) => {
  const rawValues = Array.isArray(imei)
    ? imei
    : typeof imei === "string"
      ? imei.split(",").map((value) => value.trim())
      : [];

  const normalizedImei = rawValues
    .filter(Boolean)
    .map((value) => Number(value));

  if (!normalizedImei.length || normalizedImei.some(Number.isNaN)) {
    throw createError(400, "A valid IMEI is required");
  }

  return normalizedImei;
};

const parseDateBoundary = (value, boundary) => {
  if (value == null || value === "") {
    return null;
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw createError(400, `Invalid ${boundary} date`);
    }

    return value;
  }

  if (typeof value !== "string") {
    throw createError(400, `Invalid ${boundary} date`);
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return null;
  }

  const normalizedValue = DATE_ONLY_PATTERN.test(trimmedValue)
    ? `${trimmedValue}${boundary === "start" ? "T00:00:00.000Z" : "T23:59:59.999Z"}`
    : trimmedValue;

  const parsedDate = new Date(normalizedValue);
  if (Number.isNaN(parsedDate.getTime())) {
    throw createError(400, `Invalid ${boundary} date`);
  }

  return parsedDate;
};

const normalizeDateRange = (startDateTime, endDateTime) => {
  let normalizedStart = parseDateBoundary(startDateTime, "start");
  let normalizedEnd = parseDateBoundary(endDateTime, "end");

  if (normalizedStart && normalizedEnd && normalizedStart > normalizedEnd) {
    normalizedStart = parseDateBoundary(endDateTime, "start");
    normalizedEnd = parseDateBoundary(startDateTime, "end");
  }

  return {
    startDateTime: normalizedStart,
    endDateTime: normalizedEnd,
  };
};

const toUtcDayStart = (value) =>
  new Date(
    Date.UTC(
      value.getUTCFullYear(),
      value.getUTCMonth(),
      value.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  );

const toUtcDayEnd = (value) =>
  new Date(
    Date.UTC(
      value.getUTCFullYear(),
      value.getUTCMonth(),
      value.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );

const expandRangeToUtcDays = ({ startDateTime, endDateTime }) => {
  if (!startDateTime || !endDateTime) {
    return null;
  }

  return {
    startDateTime: toUtcDayStart(startDateTime),
    endDateTime: toUtcDayEnd(endDateTime),
  };
};

const rangesMatch = (firstRange, secondRange) => {
  if (!firstRange || !secondRange) {
    return false;
  }

  return (
    firstRange.startDateTime?.getTime() === secondRange.startDateTime?.getTime() &&
    firstRange.endDateTime?.getTime() === secondRange.endDateTime?.getTime()
  );
};

const sensorService = {
  getByCoordinates: async function (longitude, latitude) {
    const sensorsData = await read.sensorByCoordinates(longitude, latitude);
    if (!sensorsData.length) {
      throw createError(404, "No sensor found at the given coordinates");
    }  

    const processedSensorData = sequenceAndCollectSensorsData(sensorsData);
    if (!processedSensorData) {
      throw createError(500, "Error processing sensor data");
    }

    return processedSensorData;
  },

  getByImeiAndParameter: async function (
    parameter,
    imei,
    startDateTime,
    endDateTime,
  ) {
    const normalizedImei = normalizeImei(imei);
    const normalizedRange = normalizeDateRange(startDateTime, endDateTime);

    let sensorData = await read.sensorByImeiAndParameter(
      parameter,
      normalizedImei,
      normalizedRange.startDateTime,
      normalizedRange.endDateTime,
    );

    const fallbackRange = expandRangeToUtcDays(normalizedRange);
    if (!sensorData.length && fallbackRange && !rangesMatch(normalizedRange, fallbackRange)) {
      sensorData = await read.sensorByImeiAndParameter(
        parameter,
        normalizedImei,
        fallbackRange.startDateTime,
        fallbackRange.endDateTime,
      );
    }

    const limitsData = await read.limitsByImeiAndParameter(
      parameter,
      normalizedImei,
    );
    if (!limitsData?.[parameter]) {
      throw createError(404, "No limits found for the given IMEI");
    }

    const limits = limitsData[parameter];

    const processedSensorData =
      sequenceAndCollectSensorsData(sensorData)[parameter] || [];

    // Get site name from coordinates
    const siteData = await read.siteByImei(normalizedImei);
    const locationName = siteData?.display_name || "Unknown";

    // Calculate time span
    let timeSpan = null;
    if (sensorData.length > 0) {
      const timestamps = sensorData.map(d => new Date(d.createdAt));
      const minTime = new Date(Math.min(...timestamps));
      const maxTime = new Date(Math.max(...timestamps));
      timeSpan = {
        start: minTime.toISOString(),
        end: maxTime.toISOString(),
      };
    }

    return { limits, processedSensorData, locationName, timeSpan };
  },
};

export default sensorService;
