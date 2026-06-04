import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import createError from "http-errors";
import { ROLES } from "#constants/index.js";

const { Schema, model } = mongoose;
const mapOpeningLocationSchema = new Schema(
  {
    lat: {
      type: Number,
      min: -90,
      max: 90,
    },
    lng: {
      type: Number,
      min: -180,
      max: 180,
    },
    zoom: {
      type: Number,
      min: 1,
      max: 20,
      default: 4.8,
    },
  },
  { _id: false },
);
const dashboardThemeSchema = new Schema(
  {
    primaryColor: {
      type: String,
      trim: true,
      match: [/^#([A-Fa-f0-9]{6})$/, "Primary color must be a valid hex color"],
    },
    backgroundColor: {
      type: String,
      trim: true,
      match: [/^#([A-Fa-f0-9]{6})$/, "Background color must be a valid hex color"],
    },
    textColor: {
      type: String,
      trim: true,
      match: [/^#([A-Fa-f0-9]{6})$/, "Text color must be a valid hex color"],
    },
  },
  { _id: false },
);
const dashboardBrandingSchema = new Schema(
  {
    logoText: {
      type: String,
      trim: true,
      maxlength: 60,
      default: "The Classic Towers",
    },
    logoIcon: {
      type: String,
      default: null,
    },
    logoIconEnabled: {
      type: Boolean,
      default: true,
    },
    logoTextEnabled: {
      type: Boolean,
      default: true,
    },
    logoTextSize: {
      type: Number,
      min: 10,
      max: 32,
      default: 16,
    },
    logoTextWidth: {
      type: Number,
      min: 60,
      max: 180,
      default: 145,
    },
  },
  { _id: false },
);

const UserSchema = new Schema(
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
    profilePicture: {
      type: String,
      default: null,
    },
    // Organization ke liye limits
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

    // Team Lead/Operator ke liye organization reference
    organization: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Operator ke liye team lead reference
    teamLead: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    mapOpeningLocation: {
      type: mapOpeningLocationSchema,
      default: null,
    },
    dashboardTheme: {
      type: dashboardThemeSchema,
      default: null,
    },
    dashboardBranding: {
      type: dashboardBrandingSchema,
      default: null,
    },
    operatorTowerDetails: {
      location: { type: String, default: "" },
      type: { type: String, default: "" },
      picture: { type: String, default: "" },
      details: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.password;
        return ret;
      },
    },
  }
);

UserSchema.pre("save", async function () {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

UserSchema.methods.comparePassword = async function (password) {
  try {
    const isMatch = await bcrypt.compare(password, this.password);

    if (!isMatch) {
      throw createError(401, "Invalid credentials");
    }

    return isMatch;
  } catch (error) {
    throw createError(500, error.message);
  }
};

export const User = model("User", UserSchema);
