import mongoose from "mongoose";

const { Schema, model } = mongoose;

const inventorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, trim: true, uppercase: true, unique: true },
    category: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, trim: true, default: "pcs" },
    minimumStock: { type: Number, min: 0, default: 0 },
    location: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Inventory = model("Inventory", inventorySchema);
