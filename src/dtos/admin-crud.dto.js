import Joi from "joi";

export const menuDto = Joi.object({
  title: Joi.string().trim().min(2).max(80).required(),
  menuType: Joi.string().valid("internal", "external").default("internal"),
  path: Joi.when("menuType", {
    is: "external",
    then: Joi.string().trim().uri({ scheme: ["http", "https"] }).max(500).required(),
    otherwise: Joi.string().trim().pattern(/^\//).max(160).required().messages({
      "string.pattern.base": "Internal menu path must start with /",
    }),
  }),
  icon: Joi.string().trim().allow("").max(80).optional(),
  parent: Joi.string().trim().allow("").max(80).optional(),
  order: Joi.number().integer().min(0).optional(),
  roles: Joi.array()
    .items(Joi.string().valid("admin", "organization", "team_lead", "operator"))
    .min(1)
    .unique()
    .optional(),
  description: Joi.string().trim().allow("").max(500).optional(),
  openInNewTab: Joi.boolean().optional(),
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
