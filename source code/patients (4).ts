import { Request, Response } from "express";
import { PatientModel } from "../models/patient";
import { PredictionLogModel } from "../models/PredictionLogModel";
import { UserModel } from "../models/user"; // Add this import
import mongoose from "mongoose";

export const getPatients = async (req: Request, res: Response) => {
  const { search } = req.query;
  try {
    const query: any = {};
    if (search) {
      query.$or = [
        { patientId: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ];
    }

    const patients = await PatientModel.find(query);
    res.json(
      patients.map((p) => ({
        id: p._id,
        patientId: p.patientId,
        name: p.name,
        age: p.age,
        gender: p.gender,
        contact: p.contact,
      }))
    );
  } catch (error: any) {
    console.error("🔐 Get patients error:", error.message, error.stack);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const addPatient = async (req: Request, res: Response) => {
  const { patientId, name, age, gender, contact } = req.body;
  try {
    console.log("🔐 addPatient request body:", req.body);
    if (!patientId || !name || !age || !gender || !contact) {
      return res.status(400).json({ message: "All fields are required: patientId, name, age, gender, contact" });
    }
    if (typeof age !== "number" || age < 0) {
      return res.status(400).json({ message: "Age must be a positive number" });
    }
    if (!["male", "female", "other"].includes(gender)) {
      return res.status(400).json({ message: "Gender must be male, female, or other" });
    }
    const existingPatient = await PatientModel.findOne({ patientId });
    if (existingPatient) {
      return res.status(400).json({ message: "Patient ID already exists" });
    }

    const patient = new PatientModel({ patientId, name, age, gender, contact });
    await patient.save();

    res.status(201).json({
      id: patient._id,
      patientId: patient.patientId,
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      contact: patient.contact,
    });
  } catch (error: any) {
    console.error("🔐 Add patient error:", error.message, error.stack);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updatePatient = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { patientId, name, age, gender, contact } = req.body;
  try {
    console.log("🔐 updatePatient request body:", req.body);
    const patient = await PatientModel.findById(id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    if (patientId && patientId !== patient.patientId) {
      const existingPatient = await PatientModel.findOne({ patientId });
      if (existingPatient) {
        return res.status(400).json({ message: "Patient ID already exists" });
      }
    }
    if (age && (typeof age !== "number" || age < 0)) {
      return res.status(400).json({ message: "Age must be a positive number" });
    }
    if (gender && !["male", "female", "other"].includes(gender)) {
      return res.status(400).json({ message: "Gender must be male, female, or other" });
    }

    patient.patientId = patientId || patient.patientId;
    patient.name = name || patient.name;
    patient.age = age || patient.age;
    patient.gender = gender || patient.gender;
    patient.contact = contact || patient.contact;
    await patient.save();

    res.json({
      id: patient._id,
      patientId: patient.patientId,
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      contact: patient.contact,
    });
  } catch (error: any) {
    console.error("🔐 Update patient error:", error.message, error.stack);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deletePatient = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const patient = await PatientModel.findByIdAndDelete(id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    res.json({ message: "Patient deleted" });
  } catch (error: any) {
    console.error("🔐 Delete patient error:", error.message, error.stack);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const savePrediction = async (req: Request, res: Response) => {
  const { patientId, top_predictions, metadata, staffId } = req.body;
  try {
    console.log("🔐 savePrediction request body:", req.body);
    if (!patientId || !top_predictions || !metadata || !staffId) {
      return res.status(400).json({ message: "Missing required fields: patientId, top_predictions, metadata, staffId" });
    }
    const patient = await PatientModel.findOne({ patientId });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    const user = await UserModel.findById(staffId);
    if (!user) {
      return res.status(404).json({ message: "Staff not found" });
    }

    const prediction = new PredictionLogModel({
      patientId,
      name: patient.name,
      age: patient.age,
      contact: patient.contact,
      staffId,
      disease: metadata.disease,
      symptoms: metadata.symptoms || [],
      description: metadata.description,
      precautions: metadata.precautions || [],
      medication: metadata.medications || [],
      diet: metadata.diet || [],
      workout: metadata.workout || [],
    });
    await prediction.save();

    res.status(201).json({
      message: "Prediction saved",
      prediction: {
        id: prediction._id,
        patientId: prediction.patientId,
        name: prediction.name,
        age: prediction.age,
        contact: prediction.contact,
        disease: prediction.disease,
        symptoms: prediction.symptoms,
        staff: user.fullName,
        date: prediction.date,
        description: prediction.description,
        precautions: prediction.precautions,
        medication: prediction.medication,
        workout: prediction.workout,
        diet: prediction.diet,
      },
    });
  } catch (error: any) {
    console.error("🔐 Save prediction error:", error.message, error.stack);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};