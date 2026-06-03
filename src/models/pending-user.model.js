import mongoose from "mongoose";
import { ROLES } from "#constants/index.js";

const { Schema, model } = mongoose;

const PendingUserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    role: {
      type: String,
      enum: {
        values: Object.values(ROLES),
        message: `Role must be one of ${Object.values(ROLES).join(", ")}`,
      },
      default: ROLES.OPERATOR,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    teamLeadLimit: {
      type: Number,
      default: 0,
    },
    operatorLimit: {
      type: Number,
      default: 0,
    },
    towerLimit: {
      type: Number,
      default: 0,
    },
    assignedTowerLimit: {
      type: Number,
      default: 0,
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    teamLead: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    operatorTowerDetails: {
      location: { type: String, default: "" },
      type: { type: String, default: "" },
      picture: { type: String, default: "" },
      details: { type: String, default: "" },
    },
    approvalToken: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto delete expired pending users
PendingUserSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PendingUser = model("PendingUser", PendingUserSchema);
