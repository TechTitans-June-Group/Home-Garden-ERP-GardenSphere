import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getIrrigationDesk,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  recordWatering,
} from '../controllers/irrigationController.js';

const router = Router();

const IRRIGATION_ROLES = ['admin', 'garden_manager', 'gardener'];
const IRRIGATION_MANAGE_ROLES = ['admin', 'garden_manager'];

router.use(protect, authorize(...IRRIGATION_ROLES));

// Get all schedules and logs
router.get('/', getIrrigationDesk);

// Log a watering record (gardener and manager can both log waterings)
router.post('/records', recordWatering);

// Management of watering schedules
router.post('/schedules', authorize(...IRRIGATION_MANAGE_ROLES), createSchedule);
router.put('/schedules/:id', authorize(...IRRIGATION_MANAGE_ROLES), updateSchedule);
router.delete('/schedules/:id', authorize(...IRRIGATION_MANAGE_ROLES), deleteSchedule);

export default router;
