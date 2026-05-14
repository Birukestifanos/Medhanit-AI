import mongoose from "mongoose";

const aiSettingsSchema = new mongoose.Schema({
  confidenceThreshold: { type: Number, required: true, min: 0, max: 1 },
});

export const AiSettingsModel = mongoose.model("AiSettings", aiSettingsSchema);