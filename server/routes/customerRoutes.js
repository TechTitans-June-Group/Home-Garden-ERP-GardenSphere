import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {
  addNotification,
  deleteDesign,
  getWishlist,
  listDesigns,
  listNotifications,
  markNotifications,
  saveDesign,
  saveWishlist,
} from '../controllers/customerController.js';

const router = Router();

router.use(protect);

router.get('/wishlist', getWishlist);
router.put('/wishlist', saveWishlist);
router.get('/designs', listDesigns);
router.post('/designs', saveDesign);
router.delete('/designs/:id', deleteDesign);
router.get('/notifications', listNotifications);
router.post('/notifications', addNotification);
router.patch('/notifications', markNotifications);

export default router;
