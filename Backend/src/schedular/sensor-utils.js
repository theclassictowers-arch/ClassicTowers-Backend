// sensor-utils.js
import crypto from "crypto";

// Cache for sensor IDs to avoid recalculating hashes
const sensorIdCache = new Map();

// Cache range span calculations
const rangeSpanCache = new Map();

export const getRangeSpan = (range) => {
  const key = `${range.min}-${range.max}`;
  if (!rangeSpanCache.has(key)) {
    rangeSpanCache.set(key, range.max - range.min);
  }
  return rangeSpanCache.get(key);
};

export const generateInGreenDomain = (range, sampleCount = 10) => {
  const { min } = range;
  const span = getRangeSpan(range);

  // Pre-allocate array for better memory efficiency
  const result = new Array(sampleCount);

  for (let i = 0; i < sampleCount; i++) {
    result[i] = Number((Math.random() * span + min).toFixed(2));
  }

  return result;
};

export const generateAxisDataInGreen = (range) => ({
  x: generateInGreenDomain(range.x),
  y: generateInGreenDomain(range.y),
  z: generateInGreenDomain(range.z),
});

export const getSensorId = (prefix, coordinates) => {
  const coordStr = JSON.stringify(coordinates);
  const key = prefix + "-" + coordStr;

  if (!sensorIdCache.has(key)) {
    const hash = crypto
      .createHash("sha256")
      .update(coordStr)
      .digest("hex")
      .substring(0, 8);

    sensorIdCache.set(key, prefix + "-" + hash);
  }

  return sensorIdCache.get(key);
};

export const getSensorImei = (coordinates) => {
  const coordStr = JSON.stringify(coordinates);
  const hash = crypto.createHash("sha256").update(coordStr).digest("hex");

  // Generate two deterministic IMEI numbers from the hash
  const imei1 = parseInt(hash.substring(0, 8), 16) % 1000000000; // Ensure it's 9 digits
  const imei2 = parseInt(hash.substring(8, 16), 16) % 1000000000;

  return [imei1, imei2];
};
