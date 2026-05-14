import express from "express";
import { requireAuth, adminOnly, staffOrAdmin } from "../middleware/authMiddleware";
import { getPatients, addPatient, updatePatient, deletePatient, savePrediction } from "../controllers/patients";

const router = express.Router();

router.get("/", requireAuth, staffOrAdmin, getPatients);
router.post("/", requireAuth, staffOrAdmin, addPatient);
router.patch("/:id", requireAuth, staffOrAdmin, updatePatient);
router.delete("/:id", requireAuth, adminOnly, deletePatient);
router.post("/predictions", requireAuth, staffOrAdmin, savePrediction);

export default router;