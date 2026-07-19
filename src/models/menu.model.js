import mongoose from "mongoose";

const { Schema, model } = mongoose;

const menuSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    path: { type: String, required: true, trim: true, unique: true },
    icon: { type: String, trim: true, default: "" },
    parent: { type: String, trim: true, default: "" },
    order: { type: Number, default: 0, min: 0 },
    menuType: {
      type: String,
      enum: ["internal", "external"],
      default: "internal",
    },
    roles: {
      type: [String],
      enum: ["admin", "organization", "team_lead", "operator"],
      default: ["admin"],
    },
    description: { type: String, trim: true, default: "" },
    openInNewTab: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Menu = model("Menu", menuSchema);
