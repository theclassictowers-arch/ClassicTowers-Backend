// sensor-data-generator.js
import { CONFIG } from "./sensor-config.js";
import {
  getSensorId,
  generateInGreenDomain,
  generateAxisDataInGreen,
  getSensorImei,
} from "./sensor-utils.js";

export const generateSensorData = (type, coordinates) => {
  const config = CONFIG[type];
  const prefix = type === "VIBRATION" ? "VS" : "WS";
  const sensorId = getSensorId(prefix, coordinates);

  if (type === "VIBRATION") {
    return {
      sensorId,
      speed: generateAxisDataInGreen(config.speed),
      displacement: generateAxisDataInGreen(config.displacement),
      frequency: generateAxisDataInGreen(config.frequency),
      angle: generateAxisDataInGreen(config.angle),
      pitchAngle: generateInGreenDomain(config.pitchAngle),
      rollAngle: generateInGreenDomain(config.rollAngle),
      yawAngle: generateInGreenDomain(config.yawAngle),
      resonance: generateInGreenDomain(config.resonance),
    };
  }

  return {
    sensorId,
    speed: generateInGreenDomain(config.speed),
    direction: generateInGreenDomain(config.direction),
    humidity: generateInGreenDomain(config.humidity),
    temperature: generateInGreenDomain(config.temperature),
  };
};

export const generatePayload = (coordinates) => {
  if (!coordinates || coordinates.length !== 2) {
    throw new Error(
      "Invalid coordinates format. Expected an array of [lon, lat].",
    );
  }

  return {
    coordinates,
    imei: getSensorImei(coordinates),
    vibrationSensor: generateSensorData("VIBRATION", coordinates),
    windSensor: generateSensorData("WIND", coordinates),
  };
};
