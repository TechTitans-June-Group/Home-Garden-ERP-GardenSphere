import Income from '../models/Income.js';
import Expense from '../models/Expense.js';

export const upsertIncome = async ({ source, sourceId, category, description, date, amount, method, notes, createdBy }) => {
  if (!amount || Number(amount) <= 0) return null;
  const query = { source, sourceId: String(sourceId) };
  const payload = {
    source,
    sourceId: String(sourceId),
    category,
    description,
    date: date || new Date(),
    amount,
    method: method || 'Cash',
    notes: notes || '',
    createdBy: createdBy || null,
  };
  const existing = await Income.findOne(query);
  if (existing) {
    Object.assign(existing, payload);
    await existing.save();
    return existing;
  }
  return Income.create(payload);
};

export const removeLinkedIncome = async (source, sourceId) => {
  await Income.deleteMany({ source, sourceId: String(sourceId) });
};

export const upsertExpense = async ({ source, sourceId, category, description, date, amount, method, notes, createdBy }) => {
  if (!amount || Number(amount) <= 0) return null;
  const query = { source, sourceId: String(sourceId) };
  const payload = {
    source,
    sourceId: String(sourceId),
    category,
    description,
    date: date || new Date(),
    amount,
    method: method || 'Cash',
    notes: notes || '',
    createdBy: createdBy || null,
  };
  const existing = await Expense.findOne(query);
  if (existing) {
    Object.assign(existing, payload);
    await existing.save();
    return existing;
  }
  return Expense.create(payload);
};
