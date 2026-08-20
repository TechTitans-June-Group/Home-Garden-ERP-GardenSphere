export const INVENTORY_CATEGORIES = [
  'Seeds',
  'Fertilizers',
  'Soil',
  'Compost',
  'Pesticides',
  'Gardening Tools',
  'Irrigation Equipment',
  'Plant Containers',
  'Other Materials',
];

export const INVENTORY_UNITS = ['Packets', 'Bags', 'Bottles', 'Kg', 'Litres', 'Pcs', 'Sets', 'Trays', 'Rolls'];

export const STOCK_TYPES = ['Stock In', 'Stock Out', 'Damaged', 'Adjustment'];

export const PURCHASE_STATUSES = ['Ordered', 'Received', 'Cancelled'];

export const CUSTOMER_PURCHASE_STATUSES = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

export const ITEM_STATUS_STYLES = {
  Available: 'bg-emerald-100 text-emerald-800',
  'Low Stock': 'bg-amber-100 text-amber-800',
  'Out of Stock': 'bg-rose-100 text-rose-700',
  Inactive: 'bg-slate-100 text-slate-600',
};

export const STOCK_TYPE_STYLES = {
  'Stock In': 'bg-emerald-100 text-emerald-800',
  'Stock Out': 'bg-sky-100 text-sky-800',
  Damaged: 'bg-rose-100 text-rose-700',
  Adjustment: 'bg-amber-100 text-amber-800',
  Purchase: 'bg-lime-100 text-lime-800',
};

export const CATEGORY_TINTS = {
  Seeds: 'bg-emerald-100 text-emerald-700',
  Fertilizers: 'bg-lime-100 text-lime-800',
  Soil: 'bg-amber-100 text-amber-800',
  Compost: 'bg-yellow-100 text-yellow-800',
  Pesticides: 'bg-orange-100 text-orange-800',
  'Gardening Tools': 'bg-sky-100 text-sky-800',
  'Irrigation Equipment': 'bg-cyan-100 text-cyan-800',
  'Plant Containers': 'bg-teal-100 text-teal-800',
  'Other Materials': 'bg-slate-100 text-slate-700',
};

export const toQty = (value) => {
  const amount = Number(String(value ?? '').replace(/[^\d.-]/g, ''));
  return Number.isFinite(amount) ? amount : 0;
};

export const todayIso = () => new Date().toISOString().slice(0, 10);

export const blankInventoryItem = () => ({
  id: '',
  item: '',
  category: 'Seeds',
  image: '',
  stock: 0,
  damaged: 0,
  minStock: 0,
  unit: 'Packets',
  unitCost: 0,
  value: 0,
  status: 'Available',
  supplierId: '',
  location: 'Main shed',
  notes: '',
});

export const CATEGORY_IMAGES = {
  Seeds: '/inventory/basil.png',
  Fertilizers: '/inventory/npk.png',
  Soil: '/inventory/soil.png',
  Compost: '/inventory/compost.png',
  Pesticides: '/inventory/neem.png',
  'Gardening Tools': '/inventory/trowel.png',
  'Irrigation Equipment': '/inventory/drip.png',
  'Plant Containers': '/inventory/pots.png',
  'Other Materials': '/inventory/twine.png',
};

export const ITEM_IMAGES = {
  'Tomato Seeds': '/products/tomato.jpg',
  'Basil Seeds': '/inventory/basil.png',
  'Organic NPK 10-10-10': '/inventory/npk.png',
  'Garden Soil Mix': '/inventory/soil.png',
  'Organic Compost': '/inventory/compost.png',
  'Neem Oil': '/inventory/neem.png',
  'Garden Trowel': '/inventory/trowel.png',
  'Drip Irrigation Kit': '/inventory/drip.png',
  'Nursery Pots 8 inch': '/inventory/pots.png',
  'Garden Twine': '/inventory/twine.png',
};

export const resolveItemImage = (item = {}) =>
  item.image || ITEM_IMAGES[item.item] || CATEGORY_IMAGES[item.category] || '/products/plants.jpg';

export const resolvePurchaseVisual = (row = {}, items = []) => {
  const name = String(row.item || '').trim();
  const linked =
    items.find((item) => item.id && item.id === row.itemId) ||
    items.find((item) => String(item.item || '').toLowerCase() === name.toLowerCase());
  return {
    item: name,
    image: row.image || linked?.image || ITEM_IMAGES[name] || '',
    category: row.category || linked?.category || '',
  };
};

export const computeItemStatus = (item) => {
  if (item.status === 'Inactive') return 'Inactive';
  const stock = toQty(item.stock);
  if (stock <= 0) return 'Out of Stock';
  if (stock <= toQty(item.minStock)) return 'Low Stock';
  return 'Available';
};

export const normalizeInventoryItem = (item = {}) => {
  const next = { ...blankInventoryItem(), ...item };
  next.stock = toQty(next.stock);
  next.damaged = toQty(next.damaged);
  next.minStock = toQty(next.minStock);
  next.unitCost = toQty(next.unitCost);
  if (!next.unitCost && toQty(next.value) && next.stock) {
    next.unitCost = Math.round((toQty(next.value) / next.stock) * 100) / 100;
  }
  next.value = Math.round(next.stock * next.unitCost);
  next.status = computeItemStatus(next);
  return next;
};

export const isInventoryLow = (item) => {
  const current = normalizeInventoryItem(item);
  return current.status === 'Low Stock' || current.status === 'Out of Stock';
};

export const itemValue = (item) => toQty(item.stock) * toQty(item.unitCost || item.value / (toQty(item.stock) || 1));
