import { Router } from 'express';
import { listShopProducts, listShopTestimonials } from '../controllers/shopController.js';

const router = Router();

router.get('/products', listShopProducts);
router.get('/testimonials', listShopTestimonials);

export default router;
