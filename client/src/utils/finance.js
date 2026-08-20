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

export const EXPENSE_TINTS = {
  Seeds: 'bg-emerald-100 text-emerald-800',
  Fertilizers: 'bg-lime-100 text-lime-800',
  Soil: 'bg-amber-100 text-amber-800',
  Tools: 'bg-sky-100 text-sky-800',
  Water: 'bg-cyan-100 text-cyan-800',
  Electricity: 'bg-yellow-100 text-yellow-800',
  'Pest treatments': 'bg-orange-100 text-orange-800',
  Maintenance: 'bg-teal-100 text-teal-800',
  Labour: 'bg-violet-100 text-violet-800',
  Transportation: 'bg-indigo-100 text-indigo-800',
  'Other expenses': 'bg-slate-100 text-slate-700',
};

export const INCOME_TINTS = {
  'Vegetable sales': 'bg-emerald-100 text-emerald-800',
  'Fruit sales': 'bg-rose-100 text-rose-800',
  'Plant sales': 'bg-lime-100 text-lime-800',
  'Other harvest sales': 'bg-amber-100 text-amber-800',
};

export const METHOD_TINTS = {
  Cash: 'bg-emerald-50 text-emerald-800',
  Bank: 'bg-sky-50 text-sky-800',
  Card: 'bg-violet-50 text-violet-800',
  Online: 'bg-cyan-50 text-cyan-800',
  Cheque: 'bg-slate-100 text-slate-700',
};

export const todayIso = () => new Date().toISOString().slice(0, 10);

export const blankFinanceEntry = (category, method = 'Cash') => ({
  id: '',
  category,
  description: '',
  date: todayIso(),
  amount: '',
  method,
  notes: '',
});
