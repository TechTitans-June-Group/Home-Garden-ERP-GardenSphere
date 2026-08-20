import Expense from '../models/Expense.js';
import Income from '../models/Income.js';
import FinanceCategory from '../models/FinanceCategory.js';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '../config/finance.js';

const seedFinance = async () => {
  const categoryCount = await FinanceCategory.countDocuments();
  if (categoryCount === 0) {
    await FinanceCategory.insertMany([
      ...EXPENSE_CATEGORIES.map((name) => ({ kind: 'expense', name, locked: true })),
      ...INCOME_CATEGORIES.map((name) => ({ kind: 'income', name, locked: true })),
      ...PAYMENT_METHODS.map((name) => ({ kind: 'payment', name, locked: true })),
    ]);
    console.log('Finance categories seeded.');
  }

  const expenseCount = await Expense.countDocuments();
  if (expenseCount === 0) {
    await Expense.insertMany([
      { category: 'Seeds', description: 'Tomato seed packs', date: '2026-08-04', amount: 1500, method: 'Cash' },
      { category: 'Fertilizers', description: 'Compost bags', date: '2026-08-11', amount: 4800, method: 'Bank' },
      { category: 'Water', description: 'Monthly water bill', date: '2026-08-01', amount: 2200, method: 'Bank' },
      { category: 'Tools', description: 'Replacement trowel', date: '2026-08-09', amount: 650, method: 'Cash' },
      { category: 'Electricity', description: 'Shed lighting and pump', date: '2026-08-05', amount: 1850, method: 'Bank' },
      { category: 'Pest treatments', description: 'Neem oil spray round', date: '2026-08-16', amount: 450, method: 'Cash' },
      { category: 'Maintenance', description: 'Bed edging and mulch', date: '2026-08-15', amount: 1200, method: 'Cash' },
      { category: 'Labour', description: 'Weekend harvest help', date: '2026-08-18', amount: 2500, method: 'Cash' },
      { category: 'Transportation', description: 'Market delivery van', date: '2026-08-18', amount: 900, method: 'Card' },
      { category: 'Soil', description: 'Garden soil mix bags', date: '2026-08-08', amount: 2550, method: 'Bank' },
    ]);
    console.log('Finance expenses seeded.');
  }

  const incomeCount = await Income.countDocuments();
  if (incomeCount === 0) {
    await Income.insertMany([
      { category: 'Vegetable sales', description: 'Cherry tomatoes', date: '2026-08-18', amount: 4200, method: 'Cash' },
      { category: 'Vegetable sales', description: 'Lettuce bunches', date: '2026-08-16', amount: 1620, method: 'Card' },
      { category: 'Fruit sales', description: 'Strawberry boxes', date: '2026-08-12', amount: 2670, method: 'Cash' },
      { category: 'Plant sales', description: 'Nursery chilli seedlings', date: '2026-08-10', amount: 1800, method: 'Bank' },
      { category: 'Other harvest sales', description: 'Herb mix bunches', date: '2026-08-14', amount: 960, method: 'Cash' },
      { category: 'Vegetable sales', description: 'Garden spinach', date: '2026-08-19', amount: 1400, method: 'Card' },
    ]);
    console.log('Finance income seeded.');
  }
};

export default seedFinance;
