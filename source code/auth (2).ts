import { Router } from 'express';
import { signup, login, logout, getMe, updateProfile } from '../controllers/authController';
import { requireAuth, adminOnly, staffOrAdmin } from '../middleware/authMiddleware';

const router = Router();

router.post('/signup', adminOnly, signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);
router.patch('/update-profile', requireAuth, staffOrAdmin, updateProfile);

export default router;