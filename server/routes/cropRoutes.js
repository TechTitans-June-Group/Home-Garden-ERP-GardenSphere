import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getCropsDesk,
  createPlanting,
  updatePlanting,
  deletePlanting,
  createPlant,
  updatePlant,
  deletePlant,
  createVariety,
  updateVariety,
  deleteVariety,
  createLocation,
  updateLocation,
  deleteLocation,
} from '../controllers/cropController.js';

const router = Router();

const CROP_ROLES = ['admin', 'garden_manager', 'gardener'];
const CROP_MANAGE_ROLES = ['admin', 'garden_manager'];

router.use(protect, authorize(...CROP_ROLES));

router.get('/', getCropsDesk);

// Plantings (Crops)
router.post('/plantings', authorize(...CROP_MANAGE_ROLES), createPlanting);
router.put('/plantings/:id', updatePlanting);
router.delete('/plantings/:id', authorize(...CROP_MANAGE_ROLES), deletePlanting);

// Plants
router.post('/plants', authorize(...CROP_MANAGE_ROLES), createPlant);
router.put('/plants/:id', authorize(...CROP_MANAGE_ROLES), updatePlant);
router.delete('/plants/:id', authorize(...CROP_MANAGE_ROLES), deletePlant);

// Varieties
router.post('/varieties', authorize(...CROP_MANAGE_ROLES), createVariety);
router.put('/varieties/:id', authorize(...CROP_MANAGE_ROLES), updateVariety);
router.delete('/varieties/:id', authorize(...CROP_MANAGE_ROLES), deleteVariety);

// Locations
router.post('/locations', authorize(...CROP_MANAGE_ROLES), createLocation);
router.put('/locations/:id', authorize(...CROP_MANAGE_ROLES), updateLocation);
router.delete('/locations/:id', authorize(...CROP_MANAGE_ROLES), deleteLocation);

export default router;
