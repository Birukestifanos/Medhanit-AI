import { Router } from "express";
import { getUsers, createUser, updateUser, toggleUserStatus, deleteUser } from "../controllers/userController";
import { requireAuth, adminOnly } from "../middleware/authMiddleware";

const router = Router();

console.log("🔐 [routes/user] Registering user routes");

router.get("/", requireAuth, adminOnly, getUsers);
router.post("/", requireAuth, adminOnly, createUser);
router.patch("/:id", requireAuth, adminOnly, updateUser);
router.patch("/:id/status", requireAuth, adminOnly, toggleUserStatus);
router.delete("/:id", requireAuth, adminOnly, deleteUser);

export default router;