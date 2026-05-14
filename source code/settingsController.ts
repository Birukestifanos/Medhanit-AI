import { Request, Response } from "express";
import { UserModel } from "../models/user";
import { AiSettingsModel } from "../models/aisettings";
import { DiseaseTemplateModel } from "../models/diseaseTemplate";
import bcrypt from "bcryptjs";

export const getAdminSettings = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    const user = await UserModel.findById(req.user.userId).select("fullName email");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ name: user.fullName, email: user.email });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateAdminSettings = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    const user = await UserModel.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.fullName = name || user.fullName;
    user.email = email || user.email;
    if (password) {
      user.hashedPassword = await bcrypt.hash(password, 10);
    }
    await user.save();

    res.json({ name: user.fullName, email: user.email });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAiSettings = async (req: Request, res: Response) => {
  try {
    const settings = await AiSettingsModel.findOne();
    if (!settings) {
      return res.status(404).json({ message: "AI settings not found" });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateAiSettings = async (req: Request, res: Response) => {
  const { confidenceThreshold } = req.body;
  try {
    let settings = await AiSettingsModel.findOne();
    if (!settings) {
      settings = new AiSettingsModel({ confidenceThreshold });
    } else {
      settings.confidenceThreshold = confidenceThreshold || settings.confidenceThreshold;
    }
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getDiseaseTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await DiseaseTemplateModel.find();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const addDiseaseTemplate = async (req: Request, res: Response) => {
  const { disease, description, precautions, medication, workout, diet } = req.body;
  try {
    const template = new DiseaseTemplateModel({
      disease,
      description,
      precautions,
      medication,
      workout,
      diet,
    });
    await template.save();
    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateDiseaseTemplate = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { disease, description, precautions, medication, workout, diet } = req.body;
  try {
    const template = await DiseaseTemplateModel.findById(id);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    template.disease = disease || template.disease;
    template.description = description || template.description;
    template.precautions = precautions || template.precautions;
    template.medication = medication || template.medication;
    template.workout = workout || template.workout;
    template.diet = diet || template.diet;
    await template.save();

    res.json(template);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};