import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { MAINTENANCE_MANAGE_ROLES, MAINTENANCE_ROLES } from '../config/maintenance.js';
import {
  createMaintenance,
  deleteMaintenance,
  getMaintenanceDesk,
  updateMaintenance,
} from '../controllers/maintenanceController.js';

const router = Router();

router.use(protect, authorize(...MAINTENANCE_ROLES));

router.get('/', getMaintenanceDesk);
router.post('/', createMaintenance);
router.put('/:id', updateMaintenance);
router.delete('/:id', authorize(...MAINTENANCE_MANAGE_ROLES), deleteMaintenance);

export default router;
