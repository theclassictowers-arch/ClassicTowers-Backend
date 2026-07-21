import Joi from "joi";

const axisDto = Joi.object({
  x: Joi.array().items(Joi.number()).required().messages({
    "array.base": "X-axis must be an array of numbers",
    "array.includes": "X-axis must only contain numbers",
    "any.required": "X-axis is required",
  }),

  y: Joi.array().items(Joi.number()).required().messages({
    "array.base": "Y-axis must be an array of numbers",
    "array.includes": "Y-axis must only contain numbers",
    "any.required": "Y-axis is required",
  }),

  z: Joi.array().items(Joi.number()).required().messages({
    "array.base": "Z-axis must be an array of numbers",
    "array.includes": "Z-axis must only contain numbers",
    "any.required": "Z-axis is required",
  }),
});

const vibrationDto = Joi.object({
  sensorId: Joi.string().required().messages({
    "string.base": "Sensor ID must be a string",
    "string.empty": "Sensor ID should not be empty",
    "any.required": "Sensor ID is required",
  }),

  speed: axisDto.required().messages({
    "any.required": "Speed data is required",
  }),

  displacement: axisDto.required().messages({
    "any.required": "Displacement data is required",
  }),

  frequency: axisDto.required().messages({
    "any.required": "Frequency data is required",
  }),

  angle: axisDto.required().messages({
    "any.required": "Angle data is required",
  }),

  pitchAngle: Joi.array().items(Joi.number()).messages({
    "any.required": "Pitch angle data is required",
  }),

  rollAngle: Joi.array().items(Joi.number()).messages({
    "any.required": "Roll angle data is required",
  }),

  yawAngle: Joi.array().items(Joi.number()).messages({
    "any.required": "Yaw angle data is required",
  }),

  resonance: Joi.array().items(Joi.number()).messages({
    "any.required": "Resonance data is required",
  }),
});

const imuDto = Joi.object({
  pitchAngle: Joi.array().items(Joi.number()).messages({
    "array.base": "Pitch angle must be an array of numbers",
  }),

  rollAngle: Joi.array().items(Joi.number()).messages({
    "array.base": "Roll angle must be an array of numbers",
  }),

  yawAngle: Joi.array().items(Joi.number()).messages({
    "array.base": "Yaw angle must be an array of numbers",
  }),

  resonance: Joi.array().items(Joi.number()).messages({
    "array.base": "Resonance must be an array of numbers",
  }),
});

const windDto = Joi.object({
  sensorId: Joi.string().required().messages({
    "string.base": "Sensor ID must be a string",
    "string.empty": "Sensor ID should not be empty",
    "any.required": "Sensor ID is required",
  }),

  speed: Joi.array().items(Joi.number()).required().messages({
    "array.base": "Speed must be an array of numbers",
    "array.includes": "Speed must only contain numbers",
    "any.required": "Speed data is required",
  }),

  direction: Joi.array().items(Joi.number()).required().messages({
    "array.base": "Direction must be an array of numbers",
    "array.includes": "Direction must only contain numbers",
    "any.required": "Direction data is required",
  }),

  humidity: Joi.array().items(Joi.number()).required().messages({
    "array.base": "Humidity must be an array of numbers",
    "array.includes": "Humidity must only contain numbers",
    "any.required": "Humidity data is required",
  }),

  temperature: Joi.array().items(Joi.number()).required().messages({
    "array.base": "Temperature must be an array of numbers",
    "array.includes": "Temperature must only contain numbers",
    "any.required": "Temperature data is required",
  }),
});

export const sensorDto = Joi.object({
  coordinates: Joi.array().items(Joi.number()).length(2).required().messages({
    "array.base": "Coordinates must be an array of numbers",
    "array.length":
      "Coordinates must contain exactly 2 numbers (latitude and longitude)",
    "any.required": "Coordinates are required",
  }),
  createdAt: Joi.date().iso().optional().messages({
    "date.base": "Created at must be a valid date",
    "date.format": "Created at must be a valid ISO date",
  }),
  imei: Joi.array().items(Joi.number()).required().messages({
    "string.base": "IMEI must be an array of strings",
    "string.empty": "IMEI should not be empty",
    "any.required": "IMEI is required",
  }),
  region: Joi.string().allow("").optional(),
  infrastructure_id: Joi.string().allow("").optional(),
  vibrationSensor: vibrationDto.optional(),
  IMUSensor: imuDto.optional(),
  windSensor: windDto.required().messages({
    "any.required": "Wind sensor data is required",
  }),
});
