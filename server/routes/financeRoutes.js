import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { FINANCE_ROLES } from '../config/finance.js';
import {
  createCategory,
  createExpense,
  createIncome,
  deleteCategory,
  deleteExpense,
  deleteIncome,
  getFinance,
  updateExpense,
  updateIncome,
} from '../controllers/financeController.js';

const router = Router();

router.use(protect, authorize(...FINANCE_ROLES));

router.get('/', getFinance);

router.post('/expenses', createExpense);
router.put('/expenses/:id', updateExpense);
router.delete('/expenses/:id', deleteExpense);

router.post('/income', createIncome);
router.put('/income/:id', updateIncome);
router.delete('/income/:id', deleteIncome);

router.post('/categories', createCategory);
router.delete('/categories/:id', deleteCategory);

export default router;
