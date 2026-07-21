import createError from "http-errors";

import { Limits } from "#models/index.js";

export const evaluateLimits = async (sensorsProperties) => {
  const limits = await Limits.findOne({
    imei: sensorsProperties.imei,
  }).select("-_id -__v -coordinates");

  if (!limits) {
    throw createError(404, "Limits not found for the given coordinates");
  }

  const evaluateThreeAxisSensor = (sensorData, limitType) => {
    const date = sensorData[0].date;
    const time = sensorData[0].time;

    return sensorData.map(({ x, y, z }) => {
      const axes = ["x", "y", "z"];
      for (const axis of axes) {
        const value = axis === "x" ? x : axis === "y" ? y : z;
        const sensorLimits = limits[limitType][axis];

        if (
          value >= sensorLimits.green.min &&
          value <= sensorLimits.green.max
        ) {
          continue;
        }
        if (
          value > sensorLimits.yellow.min &&
          value <= sensorLimits.yellow.max
        ) {
          return {
            status: "warning",
            message: `${limitType} ${axis}-axis value (${value}) exceeds normal range [${sensorLimits.green.min}, ${sensorLimits.green.max}].`,
            date,
            time,
          };
        }
        if (value > sensorLimits.red.min && value <= sensorLimits.red.max) {
          return {
            status: "danger",
            message: `${limitType} ${axis}-axis value (${value}) has reached critical levels.`,
            date,
            time,
          };
        }
      }
      return {
        status: "normal",
        message: `${limitType} is operating within normal parameters.`,
        date,
        time,
      };
    });
  };

  const evaluateSingleValueSensor = (sensorData, limitType) => {
    const date = sensorData[0].date;
    const time = sensorData[0].time;

    return sensorData.map(({ value }) => {
      const sensorLimits = limits[limitType];

      if (value >= sensorLimits.green.min && value <= sensorLimits.green.max) {
        return {
          status: "normal",
          message: `${limitType} is within normal range.`,
          date,
          time,
        };
      }
      if (value > sensorLimits.yellow.min && value <= sensorLimits.yellow.max) {
        return {
          status: "warning",
          message: `${limitType} (${value}) exceeds normal range [${sensorLimits.green.min}, ${sensorLimits.green.max}].`,
          date,
          time,
        };
      }
      if (value > sensorLimits.red.min && value <= sensorLimits.red.max) {
        return {
          status: "danger",
          message: `${limitType} (${value}) has reached critical levels.`,
          date,
          time,
        };
      }
      return {
        status: "normal",
        message: `${limitType} is within normal range.`,
        date,
        time,
      };
    });
  };

  const getOverallStatus = (statusArray) => {
    const dangerItem = statusArray.find((item) => item.status === "danger");
    if (dangerItem) return dangerItem;

    const warningItem = statusArray.find((item) => item.status === "warning");
    if (warningItem) return warningItem;

    return statusArray[0]; // Will be a normal status with its message
  };

  const {
    vibrationSpeed,
    vibrationDisplacement,
    vibrationFrequency,
    vibrationAngle,
    vibrationPitchAngle,
    vibrationRollAngle,
    vibrationYawAngle,
    vibrationResonance,
    windSpeed,
    windDirection,
    windHumidity,
    windTemperature,
  } = sensorsProperties;

  const sensorStatus = {
    vibrationSpeed: getOverallStatus(
      evaluateThreeAxisSensor(vibrationSpeed, "vibrationSpeed"),
    ),

    vibrationDisplacement: getOverallStatus(
      evaluateThreeAxisSensor(vibrationDisplacement, "vibrationDisplacement"),
    ),

    vibrationFrequency: getOverallStatus(
      evaluateThreeAxisSensor(vibrationFrequency, "vibrationFrequency"),
    ),

    vibrationAngle: getOverallStatus(
      evaluateThreeAxisSensor(vibrationAngle, "vibrationAngle"),
    ),

    vibrationPitchAngle: getOverallStatus(
      evaluateSingleValueSensor(vibrationPitchAngle, "vibrationPitchAngle"),
    ),

    vibrationRollAngle: getOverallStatus(
      evaluateSingleValueSensor(vibrationRollAngle, "vibrationRollAngle"),
    ),

    vibrationYawAngle: getOverallStatus(
      evaluateSingleValueSensor(vibrationYawAngle, "vibrationYawAngle"),
    ),

    vibrationResonance: getOverallStatus(
      evaluateSingleValueSensor(vibrationResonance, "vibrationResonance"),
    ),

    windSpeed: getOverallStatus(
      evaluateSingleValueSensor(windSpeed, "windSpeed"),
    ),

    windDirection: getOverallStatus(
      evaluateSingleValueSensor(windDirection, "windDirection"),
    ),

    windHumidity: getOverallStatus(
      evaluateSingleValueSensor(windHumidity, "windHumidity"),
    ),

    windTemperature: getOverallStatus(
      evaluateSingleValueSensor(windTemperature, "windTemperature"),
    ),
  };

  return sensorStatus;
};

export const defaultLimits = {
  vibrationSpeed: {
    x: {
      green: { min: 0, max: 5 },
      yellow: { min: 5, max: 10 },
      red: { min: 10, max: 999999999999999 },
    },
    y: {
      green: { min: 0, max: 5 },
      yellow: { min: 5, max: 10 },
      red: { min: 10, max: 999999999999999 },
    },
    z: {
      green: { min: 0, max: 5 },
      yellow: { min: 5, max: 10 },
      red: { min: 10, max: 999999999999999 },
    },
  },
  vibrationDisplacement: {
    x: {
      green: { min: 0, max: 5 },
      yellow: { min: 5, max: 10 },
      red: { min: 10, max: 999999999999999 },
    },
    y: {
      green: { min: 0, max: 5 },
      yellow: { min: 5, max: 10 },
      red: { min: 10, max: 999999999999999 },
    },
    z: {
      green: { min: 0, max: 5 },
      yellow: { min: 5, max: 10 },
      red: { min: 10, max: 999999999999999 },
    },
  },
  vibrationFrequency: {
    x: {
      green: { min: 0, max: 5 },
      yellow: { min: 5, max: 10 },
      red: { min: 10, max: 999999999999999 },
    },
    y: {
      green: { min: 0, max: 5 },
      yellow: { min: 5, max: 10 },
      red: { min: 10, max: 999999999999999 },
    },
    z: {
      green: { min: 0, max: 5 },
      yellow: { min: 5, max: 10 },
      red: { min: 10, max: 999999999999999 },
    },
  },
  vibrationAngle: {
    x: {
      green: { min: 0, max: 5 },
      yellow: { min: 5, max: 10 },
      red: { min: 10, max: 999999999999999 },
    },
    y: {
      green: { min: 0, max: 5 },
      yellow: { min: 5, max: 10 },
      red: { min: 10, max: 999999999999999 },
    },
    z: {
      green: { min: 0, max: 5 },
      yellow: { min: 5, max: 10 },
      red: { min: 10, max: 999999999999999 },
    },
  },
  vibrationPitchAngle: {
    green: { min: 0, max: 5 },
    yellow: { min: 5, max: 10 },
    red: { min: 10, max: 999999999999999 },
  },
  vibrationRollAngle: {
    green: { min: 0, max: 5 },
    yellow: { min: 5, max: 10 },
    red: { min: 10, max: 999999999999999 },
  },
  vibrationYawAngle: {
    green: { min: 0, max: 5 },
    yellow: { min: 5, max: 10 },
    red: { min: 10, max: 999999999999999 },
  },
  vibrationResonance: {
    green: { min: 0, max: 5 },
    yellow: { min: 5, max: 10 },
    red: { min: 10, max: 999999999999999 },
  },
  windSpeed: {
    green: { min: 0, max: 5 },
    yellow: { min: 5, max: 10 },
    red: { min: 10, max: 999999999999999 },
  },
  windDirection: {
    green: { min: 0, max: 5 },
    yellow: { min: 5, max: 10 },
    red: { min: 10, max: 999999999999999 },
  },
  windHumidity: {
    green: { min: 0, max: 5 },
    yellow: { min: 5, max: 10 },
    red: { min: 10, max: 999999999999999 },
  },
  windTemperature: {
    green: { min: 0, max: 5 },
    yellow: { min: -5, max: 10 },
    red: { min: 10, max: 999999999999999 },
  },
};

export const sequenceAndCollectSensorsData = (sensorsDataArr) => {
  const timeStampedData = {
    coordinates: sensorsDataArr.map((data) => data.coordinates),
    imei: sensorsDataArr.map((data) => data.imei),
    vibrationData: sensorsDataArr.map((data) =>
      timeStampData(data, "vibrationSensor"),
    ),
    windData: sensorsDataArr.map((data) => timeStampData(data, "windSensor")),
  };

  const sensorsProperties = {
    coordinates: timeStampedData.coordinates[0], // timeStampedData.coordinates [ [45.80135688512171, 17.872781227581005] ]
    imei: timeStampedData.imei[0], // timeStampedData.imei [ [123456789012345, 123456789012345] ]
    vibrationSpeed: timeStampedData.vibrationData.flatMap((data) =>
      extractVibrationData(data, "speed"),
    ),
    vibrationDisplacement: timeStampedData.vibrationData.flatMap((data) =>
      extractVibrationData(data, "displacement"),
    ),
    vibrationFrequency: timeStampedData.vibrationData.flatMap((data) =>
      extractVibrationData(data, "frequency"),
    ),
    vibrationAngle: timeStampedData.vibrationData.flatMap((data) =>
      extractVibrationData(data, "angle"),
    ),
    vibrationPitchAngle: timeStampedData.vibrationData.flatMap((data) =>
      extractWindData(data, "pitchAngle"),
    ),
    vibrationRollAngle: timeStampedData.vibrationData.flatMap((data) =>
      extractWindData(data, "rollAngle"),
    ),
    vibrationYawAngle: timeStampedData.vibrationData.flatMap((data) =>
      extractWindData(data, "yawAngle"),
    ),
    vibrationResonance: timeStampedData.vibrationData.flatMap((data) =>
      extractWindData(data, "resonance"),
    ),
    windSpeed: timeStampedData.windData.flatMap((data) =>
      extractWindData(data, "speed"),
    ),
    windDirection: timeStampedData.windData.flatMap((data) =>
      extractWindData(data, "direction"),
    ),
    windTemperature: timeStampedData.windData.flatMap((data) =>
      extractWindData(data, "temperature"),
    ),
    windHumidity: timeStampedData.windData.flatMap((data) =>
      extractWindData(data, "humidity"),
    ),
  };

  return sensorsProperties;
};

function timeStampData(sensor, type) {
  const createdAt = new Date(sensor.createdAt);

  const year = createdAt.getFullYear();
  const month = String(createdAt.getMonth() + 1).padStart(2, "0");
  const day = String(createdAt.getDate()).padStart(2, "0");
  const hours = String(createdAt.getHours()).padStart(2, "0");
  const minutes = String(createdAt.getMinutes()).padStart(2, "0");
  const seconds = String(createdAt.getSeconds()).padStart(2, "0");

  return {
    date: `${day}-${month}-${year}`,
    time: `${hours}:${minutes}:${seconds}`,
    data: sensor[type],
  };
}

function extractVibrationData(sensor, type) {
  if (!sensor.data || !sensor.data[type]) return [];

  return sensor.data[type].x.map((_, index) => ({
    date: sensor.date,
    time: sensor.time,
    x: sensor.data[type].x[index],
    y: sensor.data[type].y[index],
    z: sensor.data[type].z[index],
  }));
}

function extractWindData(sensor, type) {
  if (!sensor.data || !sensor.data[type]) return [];

  return sensor.data[type].map((_, index) => ({
    date: sensor.date,
    time: sensor.time,
    value: sensor.data[type][index],
  }));
}
