import mongoose from "mongoose";

const diseaseTemplateSchema = new mongoose.Schema({
  disease: { type: String, required: true },
  description: { type: String, required: true },
  precautions: [{ type: String }],
  medication: [{ type: String }],
  workout: [{ type: String }],
  diet: [{ type: String }],
}, { timestamps: true });

export const DiseaseTemplateModel = mongoose.model("DiseaseTemplate", diseaseTemplateSchema);