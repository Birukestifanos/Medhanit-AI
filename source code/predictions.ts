import express from "express";
import { requireAuth, adminOnly, staffOrAdmin } from "../middleware/authMiddleware";
import { getPredictions, exportPredictions } from "../controllers/predictionController";

const router = express.Router();

router.get("/", requireAuth, staffOrAdmin, getPredictions);
router.get("/export", requireAuth, adminOnly, exportPredictions);

export default router;