import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { INVENTORY_ROLES } from '../config/inventory.js';
import {
  adjustStock,
  cancelCustomerPurchase,
  createCustomerPurchase,
  createItem,
  createPurchase,
  createSupplier,
  deleteItem,
  deletePurchase,
  deleteSupplier,
  getInventory,
  listCustomerOrders,
  moveStock,
  saveCustomerFeedback,
  updateItem,
  updatePurchase,
  updateSupplier,
} from '../controllers/inventoryController.js';

const router = Router();

router.get('/customer-orders', listCustomerOrders);
router.post('/customer-purchases', createCustomerPurchase);
router.post('/customer-purchases/cancel', cancelCustomerPurchase);
router.post('/customer-orders/:orderRef/feedback', saveCustomerFeedback);

router.use(protect, authorize(...INVENTORY_ROLES));

router.get('/', getInventory);

router.post('/items', createItem);
router.put('/items/:id', updateItem);
router.delete('/items/:id', deleteItem);

router.post('/stock', moveStock);
router.post('/stock/adjust', adjustStock);

router.post('/suppliers', createSupplier);
router.put('/suppliers/:id', updateSupplier);
router.delete('/suppliers/:id', deleteSupplier);

router.post('/purchases', createPurchase);
router.put('/purchases/:id', updatePurchase);
router.delete('/purchases/:id', deletePurchase);

export default router;
