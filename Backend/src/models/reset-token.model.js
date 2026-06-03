import mongoose from "mongoose";

const { Schema } = mongoose;

const ResetTokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto delete expired tokens
ResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to generate 6-digit OTP
ResetTokenSchema.statics.generateOTP = function () {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const ResetToken = mongoose.model("ResetToken", ResetTokenSchema);
