import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getFertilizersDesk,
  createFertilizer,
  updateFertilizer,
  deleteFertilizer,
  createApplication,
  updateApplication,
  deleteApplication,
} from '../controllers/fertilizerController.js';

const router = Router();

const FERTILIZER_ROLES = ['admin', 'garden_manager', 'gardener'];
const FERTILIZER_MANAGE_ROLES = ['admin', 'garden_manager'];

router.use(protect, authorize(...FERTILIZER_ROLES));

// Get stock and applications
router.get('/', getFertilizersDesk);

// Manage Stock
router.post('/stock', authorize(...FERTILIZER_MANAGE_ROLES), createFertilizer);
router.put('/stock/:id', authorize(...FERTILIZER_MANAGE_ROLES), updateFertilizer);
router.delete('/stock/:id', authorize(...FERTILIZER_MANAGE_ROLES), deleteFertilizer);

// Applications
router.post('/applications', createApplication);
router.put('/applications/:id', updateApplication);
router.delete('/applications/:id', authorize(...FERTILIZER_MANAGE_ROLES), deleteApplication);

export default router;
