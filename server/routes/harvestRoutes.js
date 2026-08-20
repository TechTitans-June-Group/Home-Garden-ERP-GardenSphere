import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { HARVEST_MANAGE_ROLES, HARVEST_ROLES } from '../config/harvest.js';
import {
  createHarvest,
  deleteHarvest,
  deleteHarvestSale,
  getHarvestDesk,
  linkHarvestSale,
  updateHarvest,
  updateHarvestSale,
} from '../controllers/harvestController.js';

const router = Router();

router.use(protect, authorize(...HARVEST_ROLES));

router.get('/', getHarvestDesk);
router.post('/harvests', createHarvest);
router.put('/harvests/:id', updateHarvest);
router.delete('/harvests/:id', authorize(...HARVEST_MANAGE_ROLES), deleteHarvest);

router.post('/harvests/:id/sale', authorize(...HARVEST_MANAGE_ROLES), linkHarvestSale);
router.put('/sales/:id', authorize(...HARVEST_MANAGE_ROLES), updateHarvestSale);
router.delete('/sales/:id', authorize(...HARVEST_MANAGE_ROLES), deleteHarvestSale);

export default router;
