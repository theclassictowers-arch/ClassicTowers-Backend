import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    siteId: {
      type: Schema.Types.ObjectId,
      ref: "Site",
    },
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const LeadSite = model("LeadSite", schema);
