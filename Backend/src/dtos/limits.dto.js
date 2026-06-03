import Joi from "joi";

const rangeDto = Joi.object({
  min: Joi.number().required().messages({
    "number.base": "Min must be a number",
    "any.required": "Min is required",
  }),
  max: Joi.number().required().messages({
    "number.base": "Max must be a number",
    "any.required": "Max is required",
  }),
});

const directionalDto = Joi.object({
  green: rangeDto.required().messages({
    "any.required": "Green range is required",
  }),
  yellow: rangeDto.required().messages({
    "any.required": "Yellow range is required",
  }),
  red: rangeDto.required().messages({
    "any.required": "Red range is required",
  }),
});

const axisDto = Joi.object({
  x: directionalDto.required().messages({
    "any.required": "X-axis directional data is required",
  }),
  y: directionalDto.required().messages({
    "any.required": "Y-axis directional data is required",
  }),
  z: directionalDto.required().messages({
    "any.required": "Z-axis directional data is required",
  }),
});

export const limitsDto = Joi.object({
  coordinates: Joi.array().items(Joi.number()).required().messages({
    "array.base": "Coordinates must be an array of numbers",
    "any.required": "Coordinates are required",
  }),
  imei: Joi.array().items(Joi.string()).required().messages({
    "array.base": "IMEI must be an array of strings",
    "any.required": "IMEI is required",
  }),
  vibrationSpeed: axisDto.required().messages({
    "any.required": "Vibration speed data is required",
  }),
  vibrationDisplacement: axisDto.required().messages({
    "any.required": "Vibration displacement data is required",
  }),
  vibrationFrequency: axisDto.required().messages({
    "any.required": "Vibration frequency data is required",
  }),
  vibrationAngle: axisDto.required().messages({
    "any.required": "Vibration angle data is required",
  }),
  vibrationPitchAngle: directionalDto.required().messages({
    "any.required": "Vibration pitch angle data is required",
  }),
  vibrationRollAngle: directionalDto.required().messages({
    "any.required": "Vibration roll angle data is required",
  }),
  windSpeed: directionalDto.required().messages({
    "any.required": "Wind speed data is required",
  }),
  windDirection: directionalDto.required().messages({
    "any.required": "Wind direction data is required",
  }),
  windHumidity: directionalDto.required().messages({
    "any.required": "Wind humidity data is required",
  }),
  windTemperature: directionalDto.required().messages({
    "any.required": "Wind temperature data is required",
  }),
});
