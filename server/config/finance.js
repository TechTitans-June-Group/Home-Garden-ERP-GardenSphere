export const EXPENSE_CATEGORIES = [
  'Seeds',
  'Fertilizers',
  'Soil',
  'Tools',
  'Water',
  'Electricity',
  'Pest treatments',
  'Maintenance',
  'Labour',
  'Transportation',
  'Other expenses',
];

export const INCOME_CATEGORIES = [
  'Vegetable sales',
  'Fruit sales',
  'Plant sales',
  'Other harvest sales',
];

export const PAYMENT_METHODS = ['Cash', 'Bank', 'Card', 'Online', 'Cheque'];

export const CATEGORY_KINDS = ['expense', 'income', 'payment'];

export const FINANCE_ROLES = ['admin', 'finance_manager', 'garden_manager'];

export const toAmount = (value) => {
  const amount = Number(String(value ?? '').replace(/[^\d.-]/g, ''));
  return Number.isFinite(amount) ? Math.round(amount * 100) / 100 : 0;
};
