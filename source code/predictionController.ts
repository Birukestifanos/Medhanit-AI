import { Request, Response } from "express";
import { PredictionLogModel } from "../models/PredictionLogModel";
import { UserModel } from "../models/user";
import { Parser } from "json2csv";

// controllers/predictionController.ts
export const getPredictions = async (req: Request, res: Response) => {
  const { search, disease, staff, dateStart, dateEnd, page = 1, limit = 10 } = req.query;

  try {
    const query: any = {};

    if (search) {
      query.$or = [
        { disease: { $regex: search as string, $options: "i" } },
        { patientId: { $regex: search as string, $options: "i" } },
        { name: { $regex: search as string, $options: "i" } },
      ];
    }
    if (disease) query.disease = disease;
    if (staff) {
      const users = await UserModel.find({
        fullName: { $regex: staff as string, $options: "i" },
      }).select("_id");
      const staffIds = users.map((u) => u._id);
      if (staffIds.length > 0) {
        query.staffId = { $in: staffIds };
      } else {
        return res.json({ logs: [], pagination: { totalPages: 0, currentPage: parseInt(page as string) } });
      }
    }
    if (dateStart || dateEnd) {
      query.date = {};
      if (dateStart) query.date.$gte = new Date(dateStart as string);
      if (dateEnd) query.date.$lte = new Date(dateEnd as string);
    }

    const pageNumber = Math.max(1, parseInt(page as string, 10));
    const limitNumber = Math.min(100, parseInt(limit as string, 10));
    const skip = (pageNumber - 1) * limitNumber;

    const total = await PredictionLogModel.countDocuments(query);
    const totalPages = Math.ceil(total / limitNumber);

    const predictions = await PredictionLogModel.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limitNumber);

    const predictionData = await Promise.all(
      predictions.map(async (p) => {
        const user = await UserModel.findById(p.staffId).select("fullName");
        return {
          _id: p._id,
          patientId: p.patientId,
          name: p.name,
          age: p.age,
          contact: p.contact,
          disease: p.disease,
          symptoms: p.symptoms,
          staffEmail: user ? user.fullName : "Unknown",
          createdAt: p.date,
          description: p.description,
          precautions: p.precautions,
          medication: p.medication,
          workout: p.workout,
          diet: p.diet,
        };
      })
    );

    // ✅ Correct response format
    res.json({
      logs: predictionData,
      pagination: {
        totalPages,
        currentPage: pageNumber,
      },
    });
  } catch (error: any) {
    console.error("🔐 Get predictions error:", error.message, error.stack);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const exportPredictions = async (req: Request, res: Response) => {
  try {
    const predictions = await PredictionLogModel.find();
    const predictionData = await Promise.all(
      predictions.map(async (p) => {
        const user = await UserModel.findById(p.staffId).select("fullName");
        return {
          patientId: p.patientId,
          name: p.name,
          age: p.age,
          contact: p.contact,
          disease: p.disease,
          symptoms: p.symptoms,
          staff: user ? user.fullName : "Unknown",
          date: p.date,
        };
      })
    );

    const fields = [
      { label: "Patient ID", value: "patientId" },
      { label: "Name", value: "name" },
      { label: "Age", value: "age" },
      { label: "Contact", value: "contact" },
      { label: "Disease", value: "disease" },
      { label: "Symptoms", value: (row: any) => row.symptoms.join(";") },
      { label: "Staff", value: "staff" },
      { label: "Date", value: "date" },
    ];
    const json2csv = new Parser({ fields });
    const csv = json2csv.parse(predictionData);
    res.header("Content-Type", "text/csv");
    res.attachment("predictions.csv");
    res.send(csv);
  } catch (error: any) {
    console.error("🔐 Export predictions error:", error.message, error.stack);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};