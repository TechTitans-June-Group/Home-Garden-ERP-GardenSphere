import { Router } from 'express';
import { getMe, loginUser, registerUser, resetPassword, updateMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

export default router;
