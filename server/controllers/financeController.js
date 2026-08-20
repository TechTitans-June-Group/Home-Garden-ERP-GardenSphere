import Expense from '../models/Expense.js';
import Income from '../models/Income.js';
import FinanceCategory from '../models/FinanceCategory.js';
import { CATEGORY_KINDS, toAmount } from '../config/finance.js';

const fail = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const toDateString = (value) => {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
};

const formatEntry = (doc) => ({
  id: String(doc._id),
  category: doc.category,
  description: doc.description,
  date: toDateString(doc.date),
  amount: toAmount(doc.amount),
  method: doc.method,
  notes: doc.notes || '',
});

const formatCategory = (doc) => ({
  id: String(doc._id),
  kind: doc.kind,
  name: doc.name,
  locked: Boolean(doc.locked),
});

const groupCategories = (rows) => ({
  expense: rows.filter((row) => row.kind === 'expense').map((row) => row.name),
  income: rows.filter((row) => row.kind === 'income').map((row) => row.name),
  payment: rows.filter((row) => row.kind === 'payment').map((row) => row.name),
  all: rows.map(formatCategory),
});

const buildSummary = (expenses, income) => {
  const totalExpenses = expenses.reduce((sum, row) => sum + toAmount(row.amount), 0);
  const totalIncome = income.reduce((sum, row) => sum + toAmount(row.amount), 0);
  return {
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    totalIncome: Math.round(totalIncome * 100) / 100,
    netProfit: Math.round((totalIncome - totalExpenses) * 100) / 100,
    expenseCount: expenses.length,
    incomeCount: income.length,
  };
};

const readEntry = (payload) => {
  const category = String(payload.category || '').trim();
  const description = String(payload.description || '').trim();
  const method = String(payload.method || '').trim();
  const amount = toAmount(payload.amount);
  const date = payload.date || new Date();
  if (!category) throw fail('Category is required.');
  if (!description) throw fail('Description is required.');
  if (!method) throw fail('Payment method is required.');
  if (amount <= 0) throw fail('Amount must be greater than 0.');
  return {
    category,
    description,
    method,
    amount,
    date,
    notes: String(payload.notes || '').trim(),
  };
};

export const getFinance = async (req, res, next) => {
  try {
    const [expenses, income, categories] = await Promise.all([
      Expense.find().sort({ date: -1, createdAt: -1 }),
      Income.find().sort({ date: -1, createdAt: -1 }),
      FinanceCategory.find().sort({ kind: 1, name: 1 }),
    ]);

    res.json({
      expenses: expenses.map(formatEntry),
      income: income.map(formatEntry),
      categories: groupCategories(categories),
      summary: buildSummary(expenses, income),
    });
  } catch (error) {
    next(error);
  }
};

export const createExpense = async (req, res, next) => {
  try {
    const expense = await Expense.create({ ...readEntry(req.body || {}), createdBy: req.user._id });
    res.status(201).json({ expense: formatEntry(expense) });
  } catch (error) {
    next(error);
  }
};

export const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) throw fail('Expense not found.', 404);
    Object.assign(expense, readEntry({ ...formatEntry(expense), ...(req.body || {}) }));
    await expense.save();
    res.json({ expense: formatEntry(expense) });
  } catch (error) {
    next(error);
  }
};

export const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) throw fail('Expense not found.', 404);
    res.json({ message: 'Expense removed' });
  } catch (error) {
    next(error);
  }
};

export const createIncome = async (req, res, next) => {
  try {
    const income = await Income.create({ ...readEntry(req.body || {}), createdBy: req.user._id });
    res.status(201).json({ income: formatEntry(income) });
  } catch (error) {
    next(error);
  }
};

export const updateIncome = async (req, res, next) => {
  try {
    const income = await Income.findById(req.params.id);
    if (!income) throw fail('Income not found.', 404);
    Object.assign(income, readEntry({ ...formatEntry(income), ...(req.body || {}) }));
    await income.save();
    res.json({ income: formatEntry(income) });
  } catch (error) {
    next(error);
  }
};

export const deleteIncome = async (req, res, next) => {
  try {
    const income = await Income.findByIdAndDelete(req.params.id);
    if (!income) throw fail('Income not found.', 404);
    res.json({ message: 'Income removed' });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const kind = String(req.body?.kind || '').trim();
    const name = String(req.body?.name || '').trim();
    if (!CATEGORY_KINDS.includes(kind)) throw fail('Choose expense, income, or payment.');
    if (!name) throw fail('Category name is required.');

    const existing = await FinanceCategory.findOne({
      kind,
      name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
    });
    if (existing) throw fail('That category already exists.');

    const category = await FinanceCategory.create({ kind, name, locked: false });
    res.status(201).json({ category: formatCategory(category) });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await FinanceCategory.findById(req.params.id);
    if (!category) throw fail('Category not found.', 404);
    if (category.locked) throw fail('Default categories cannot be removed.');
    await category.deleteOne();
    res.json({ message: 'Category removed' });
  } catch (error) {
    next(error);
  }
};
