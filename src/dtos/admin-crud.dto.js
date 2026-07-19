import Joi from "joi";

export const menuDto = Joi.object({
  title: Joi.string().trim().min(2).max(80).required(),
  path: Joi.string().trim().pattern(/^\//).max(160).required().messages({
    "string.pattern.base": "Menu path must start with /",
  }),
  icon: Joi.string().trim().allow("").max(80).optional(),
  parent: Joi.string().trim().allow("").max(80).optional(),
  order: Joi.number().integer().min(0).optional(),
  isActive: Joi.boolean().optional(),
});

export const inventoryDto = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  sku: Joi.string().trim().min(2).max(60).required(),
  category: Joi.string().trim().min(2).max(80).required(),
  quantity: Joi.number().min(0).required(),
  unit: Joi.string().trim().allow("").max(30).optional(),
  minimumStock: Joi.number().min(0).optional(),
  location: Joi.string().trim().allow("").max(120).optional(),
  description: Joi.string().trim().allow("").max(1000).optional(),
  isActive: Joi.boolean().optional(),
});
