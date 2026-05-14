import express from "express";
import { requireAuth, adminOnly } from "../middleware/authMiddleware";
import {
  getAdminSettings,
  updateAdminSettings,
  getAiSettings,
  updateAiSettings,
  getDiseaseTemplates,
  addDiseaseTemplate,
  updateDiseaseTemplate,
} from "../controllers/settingsController";

const router = express.Router();

// GET /settings/admin - Get admin account settings
router.get("/admin", requireAuth, adminOnly, getAdminSettings);

// PATCH /settings/admin - Update admin account settings
router.patch("/admin", requireAuth, adminOnly, updateAdminSettings);

// GET /settings/ai - Get AI settings
router.get("/ai", requireAuth, adminOnly, getAiSettings);

// PATCH /settings/ai - Update AI settings
router.patch("/ai", requireAuth, adminOnly, updateAiSettings);

// GET /settings/disease-templates - Get all disease templates
router.get("/disease-templates", requireAuth, adminOnly, getDiseaseTemplates);

// POST /settings/disease-templates - Add a new disease template
router.post("/disease-templates", requireAuth, adminOnly, addDiseaseTemplate);

// PATCH /settings/disease-templates/:id - Update a disease template
router.patch("/disease-templates/:id", requireAuth, adminOnly, updateDiseaseTemplate);

export default router;