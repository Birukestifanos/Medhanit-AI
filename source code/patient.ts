import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  patientId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ["male", "female", "other"], required: true },
  contact: { type: String, required: true },
}, { timestamps: true });

export const PatientModel = mongoose.model("Patient", patientSchema);