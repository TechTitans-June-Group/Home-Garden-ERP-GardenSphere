export const HARVEST_UNITS = ['KG', 'Bunch', 'Box', 'Pot', 'g', 'L'];

export const HARVEST_GRADES = ['Premium', 'Grade A', 'Grade B', 'Grade C'];

export const HARVEST_SALE_STATUSES = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

export const HARVEST_LINK_STATUSES = ['Unlinked', 'Listed', 'Sold'];

export const HARVEST_ROLES = ['admin', 'garden_manager', 'gardener'];

export const HARVEST_MANAGE_ROLES = ['admin', 'garden_manager'];

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

export const toQty = (value) => {
  const amount = Number(String(value ?? '').replace(/[^\d.-]/g, ''));
  return Number.isFinite(amount) ? Math.round(amount * 1000) / 1000 : 0;
};

export const toAmount = (value) => {
  const amount = Number(String(value ?? '').replace(/[^\d.-]/g, ''));
  return Number.isFinite(amount) ? Math.round(amount * 100) / 100 : 0;
};

export const harvestValue = (quantity, unitPrice) => toAmount(toQty(quantity) * toAmount(unitPrice));

export const saleStatusFromHarvest = (saleStatus) => {
  if (saleStatus === 'Completed') return 'Sold';
  if (saleStatus === 'Cancelled' || !saleStatus) return 'Unlinked';
  return 'Listed';
};
