import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  createStaffUser,
  listActivity,
  listUsers,
  resetStaffPassword,
  setStaffStatus,
  updateStaffUser,
} from '../controllers/userController.js';

const router = Router();

router.use(protect);
router.get('/', authorize('admin', 'garden_manager'), listUsers);
router.get('/activity', authorize('admin'), listActivity);
router.post('/', authorize('admin'), createStaffUser);
router.put('/:id', authorize('admin'), updateStaffUser);
router.patch('/:id/status', authorize('admin'), setStaffStatus);
router.post('/:id/password', authorize('admin'), resetStaffPassword);

export default router;
