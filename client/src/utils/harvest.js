export const HARVEST_UNITS = ['KG', 'Bunch', 'Box', 'Pot', 'g', 'L'];

export const HARVEST_GRADES = ['Premium', 'Grade A', 'Grade B', 'Grade C'];

export const HARVEST_SALE_STATUSES = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

export const HARVEST_CROPS = [
  { name: 'Tomato', variety: 'Roma', location: 'Bed A2' },
  { name: 'Cherry Tomato', variety: 'Sweet 100', location: 'Bed A1' },
  { name: 'Carrot', variety: 'Nantes', location: 'Bed B2' },
  { name: 'Lettuce', variety: 'Butterhead', location: 'Bed C1' },
  { name: 'Mint', variety: 'Spearmint', location: 'Herb bed' },
  { name: 'Strawberry', variety: 'Albion', location: 'Fruit bed' },
  { name: 'Spinach', variety: 'Green Giant', location: 'Bed C2' },
  { name: 'Chili', variety: 'Bird’s Eye', location: 'Bed D1' },
];

export const GRADE_TINTS = {
  Premium: 'bg-violet-100 text-violet-800',
  'Grade A': 'bg-emerald-100 text-emerald-800',
  'Grade B': 'bg-amber-100 text-amber-800',
  'Grade C': 'bg-slate-100 text-slate-700',
};

export const SALE_TINTS = {
  Unlinked: 'bg-slate-100 text-slate-600',
  Listed: 'bg-sky-100 text-sky-800',
  Sold: 'bg-emerald-100 text-emerald-800',
  Pending: 'bg-amber-100 text-amber-800',
  Confirmed: 'bg-sky-100 text-sky-800',
  Completed: 'bg-emerald-100 text-emerald-800',
  Cancelled: 'bg-rose-100 text-rose-700',
};

export const toQty = (value) => {
  const amount = Number(String(value ?? '').replace(/[^\d.-]/g, ''));
  return Number.isFinite(amount) ? Math.round(amount * 1000) / 1000 : 0;
};

export const toAmount = (value) => {
  const amount = Number(String(value ?? '').replace(/[^\d.-]/g, ''));
  return Number.isFinite(amount) ? Math.round(amount * 100) / 100 : 0;
};

export const harvestValue = (quantity, unitPrice) => toAmount(toQty(quantity) * toAmount(unitPrice));

export const todayIso = () => new Date().toISOString().slice(0, 10);

export const blankHarvest = (crop = HARVEST_CROPS[0]) => ({
  id: '',
  crop: crop.name || '',
  cropId: crop.id || '',
  variety: crop.variety || '',
  date: todayIso(),
  quantity: '',
  unit: 'KG',
  grade: 'Grade A',
  location: crop.location || '',
  unitPrice: '',
  notes: '',
});

export const blankHarvestSale = (harvest) => ({
  harvestId: harvest?.id || '',
  crop: harvest?.crop || '',
  customer: '',
  date: todayIso(),
  quantity: harvest?.quantity || '',
  unit: harvest?.unit || 'KG',
  unitPrice: harvest?.unitPrice || '',
  status: 'Pending',
  notes: '',
});

export const mergeCropOptions = (catalog = [], planted = []) => {
  const rows = [...catalog, ...planted.map((crop) => ({
    name: crop.name,
    variety: crop.variety || '',
    location: crop.location || '',
    id: crop.id || '',
  }))];
  const seen = new Set();
  return rows.filter((crop) => {
    const key = String(crop.name || '').trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
