import createError from "http-errors";
import { asyncHandler } from "#utils/index.js";
import { Menu } from "#models/menu.model.js";
import { Inventory } from "#models/inventory.model.js";

const models = { menus: Menu, inventory: Inventory };

const getModel = (req) => {
  const Model = models[req.baseUrl.split("/").pop()];
  if (!Model) throw createError(404, "Resource not found");
  return Model;
};

const handleDuplicate = (error) => {
  if (error?.code === 11000) {
    const field = Object.keys(error.keyPattern || error.keyValue || {})[0] || "value";
    throw createError(409, `${field} already exists`);
  }
  throw error;
};

export const adminCrudController = {
  getAll: asyncHandler(async (req, res) => {
    const Model = getModel(req);
    const records = await Model.find().sort({ order: 1, createdAt: -1 }).lean();
    res.status(200).json({ data: records, total: records.length });
  }),
  getById: asyncHandler(async (req, res) => {
    const record = await getModel(req).findById(req.params.id).lean();
    if (!record) throw createError(404, "Record not found");
    res.status(200).json({ data: record });
  }),
  create: asyncHandler(async (req, res) => {
    try {
      const record = await getModel(req).create(req.body);
      res.status(201).json({ data: record });
    } catch (error) {
      handleDuplicate(error);
    }
  }),
  update: asyncHandler(async (req, res) => {
    try {
      const record = await getModel(req).findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!record) throw createError(404, "Record not found");
      res.status(200).json({ data: record });
    } catch (error) {
      handleDuplicate(error);
    }
  }),
  remove: asyncHandler(async (req, res) => {
    const record = await getModel(req).findByIdAndDelete(req.params.id);
    if (!record) throw createError(404, "Record not found");
    res.status(200).json({ data: record, message: "Deleted successfully" });
  }),
};
