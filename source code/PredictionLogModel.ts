import mongoose from "mongoose";

const predictionLogSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  contact: { type: String, required: true },
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  disease: {
    type: String,
    required: true,
  },
  symptoms: [{ type: String, required: true }],
  description: { type: String },
  precautions: [{ type: String }],
  medication: [{ type: String }],
  diet: [{ type: String }],
  workout: [{ type: String }],
  date: { type: Date, default: Date.now },
}, { timestamps: true });

export const PredictionLogModel = mongoose.model("PredictionLog", predictionLogSchema);