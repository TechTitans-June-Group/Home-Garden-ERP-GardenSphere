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

export const PURCHASE_STATUSES = [
  'Ordered',
  'Received',
  'Pending',
  'Confirmed',
  'Completed',
  'Cancelled',
];

export const CUSTOMER_PURCHASE_STATUSES = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

export const PURCHASE_SOURCES = ['supplier', 'customer'];

export const ITEM_STATUSES = ['Available', 'Low Stock', 'Out of Stock', 'Inactive'];

export const INVENTORY_ROLES = ['admin', 'inventory_manager', 'garden_manager'];

export const toQty = (value) => {
  const amount = Number(String(value ?? '').replace(/[^\d.-]/g, ''));
  return Number.isFinite(amount) ? amount : 0;
};

export const computeItemStatus = (item) => {
  if (item.status === 'Inactive') return 'Inactive';
  const stock = toQty(item.stock);
  if (stock <= 0) return 'Out of Stock';
  if (stock <= toQty(item.minStock)) return 'Low Stock';
  return 'Available';
};
