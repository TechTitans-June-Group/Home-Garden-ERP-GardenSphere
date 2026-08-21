import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { getPests, createPest, updatePest, deletePest } from '../controllers/pestController.js';

const router = Router();

// All roles with garden access can read and create pest reports
const PEST_ROLES = ['admin', 'garden_manager', 'gardener'];
const PEST_MANAGE_ROLES = ['admin', 'garden_manager'];

router.use(protect, authorize(...PEST_ROLES));

// Read all records
router.get('/', getPests);

// Gardeners & managers can create (report) a pest
router.post('/', createPest);

// Only manager/admin can update or delete
router.put('/:id', authorize(...PEST_MANAGE_ROLES), updatePest);
router.delete('/:id', authorize(...PEST_MANAGE_ROLES), deletePest);

export default router;
