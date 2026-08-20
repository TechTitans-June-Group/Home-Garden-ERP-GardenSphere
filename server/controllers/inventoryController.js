import InventoryItem from '../models/InventoryItem.js';
import Supplier from '../models/Supplier.js';
import Purchase from '../models/Purchase.js';
import StockMovement from '../models/StockMovement.js';
import { CUSTOMER_PURCHASE_STATUSES, STOCK_TYPES, computeItemStatus, toQty } from '../config/inventory.js';

const fail = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const toDateString = (value) => {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
};

const formatItem = (doc) => ({
  id: String(doc._id),
  item: doc.item,
  category: doc.category,
  image: doc.image || '',
  stock: toQty(doc.stock),
  damaged: toQty(doc.damaged),
  minStock: toQty(doc.minStock),
  unit: doc.unit,
  unitCost: toQty(doc.unitCost),
  value: Math.round(toQty(doc.stock) * toQty(doc.unitCost)),
  status: computeItemStatus(doc),
  supplierId: doc.supplier ? String(doc.supplier._id || doc.supplier) : '',
  location: doc.location || '',
  notes: doc.notes || '',
});

const formatSupplier = (doc) => ({
  id: String(doc._id),
  name: doc.name,
  contact: doc.contact || '',
  email: doc.email || '',
  category: doc.category,
  address: doc.address || '',
  status: doc.status,
});

const formatPurchase = (doc, linkedItem) => {
  const source = doc.source || 'supplier';
  const customerName = doc.customerName || '';
  const supplierName = doc.supplierName || doc.supplier?.name || '';
  const linked = linkedItem || (doc.item && typeof doc.item === 'object' ? doc.item : null);
  return {
    id: String(doc._id),
    source,
    itemId: doc.item ? String(doc.item._id || doc.item) : '',
    item: doc.itemName || linked?.item || '',
    supplierId: doc.supplier ? String(doc.supplier._id || doc.supplier) : '',
    supplier: source === 'customer' ? customerName : supplierName,
    customerName,
    customerEmail: doc.customerEmail || '',
    phone: doc.phone || '',
    address: doc.address || '',
    notes: doc.notes || '',
    image: doc.image || linked?.image || '',
    category: linked?.category || '',
    orderRef: doc.orderRef || '',
    unit: doc.unit || linked?.unit || '',
    date: toDateString(doc.date),
    quantity: toQty(doc.quantity),
    unitCost: toQty(doc.unitCost),
    amount: toQty(doc.amount),
    status: doc.status,
    feedback: doc.feedback?.rating
      ? { rating: doc.feedback.rating, comment: doc.feedback.comment || '' }
      : null,
  };
};

const formatCustomerOrder = (doc) => {
  const row = formatPurchase(doc);
  return {
    id: row.orderRef || row.id,
    purchaseId: row.id,
    productName: row.item,
    image: row.image,
    quantity: row.quantity,
    unit: row.unit,
    unitPrice: row.unitCost,
    total: row.amount,
    status: row.status,
    notes: row.notes,
    customerName: row.customerName || row.supplier,
    customerEmail: row.customerEmail,
    phone: row.phone,
    address: row.address,
    orderDate: doc.date ? new Date(doc.date).toISOString() : row.date,
    feedback: row.feedback,
  };
};

const formatMovement = (doc) => ({
  id: String(doc._id),
  itemId: doc.item ? String(doc.item._id || doc.item) : '',
  item: doc.itemName || doc.item?.item || '',
  type: doc.type,
  quantity: toQty(doc.quantity),
  date: toDateString(doc.date),
  note: doc.note || '',
  actorName: doc.actorName || 'Staff',
});

const recordMovement = async ({ item, type, quantity, note, date, user }) => {
  await StockMovement.create({
    item: item._id,
    itemName: item.item,
    type,
    quantity,
    date: date || new Date(),
    note: note || '',
    actor: user?._id,
    actorName: user?.name || 'Staff',
  });
};

const applyStockChange = async ({ item, type, quantity, unitCost, note, date, user }) => {
  const qty = toQty(quantity);
  if (qty <= 0) throw fail('Quantity must be greater than 0.');
  if (!STOCK_TYPES.includes(type)) throw fail('Unknown stock movement type.');

  let stockQty = toQty(item.stock);
  let damaged = toQty(item.damaged);
  let nextCost = toQty(item.unitCost);

  if (type === 'Stock In') {
    stockQty += qty;
    if (unitCost) {
      const totalUnits = toQty(item.stock) + qty;
      nextCost = totalUnits
        ? Math.round(((toQty(item.stock) * nextCost + qty * toQty(unitCost)) / totalUnits) * 100) / 100
        : toQty(unitCost);
    }
  } else if (type === 'Stock Out') {
    if (qty > stockQty) throw fail(`Only ${stockQty} ${item.unit} available to issue.`);
    stockQty -= qty;
  } else if (type === 'Damaged') {
    if (qty > stockQty) throw fail(`Only ${stockQty} ${item.unit} available to mark damaged.`);
    stockQty -= qty;
    damaged += qty;
  } else if (type === 'Adjustment') {
    stockQty = qty;
  }

  item.stock = stockQty;
  item.damaged = damaged;
  item.unitCost = nextCost;
  await item.save();
  await recordMovement({ item, type, quantity: qty, note, date, user });
  return item;
};

export const getInventory = async (req, res, next) => {
  try {
    const [items, suppliers, purchases, movements] = await Promise.all([
      InventoryItem.find().sort({ item: 1 }),
      Supplier.find().sort({ name: 1 }),
      Purchase.find().sort({ date: -1, createdAt: -1 }),
      StockMovement.find().sort({ date: -1, createdAt: -1 }).limit(250),
    ]);

    const itemById = new Map(items.map((item) => [String(item._id), item]));

    res.json({
      items: items.map(formatItem),
      suppliers: suppliers.map(formatSupplier),
      purchases: purchases.map((doc) => formatPurchase(doc, itemById.get(String(doc.item)))),
      stock: movements.map(formatMovement),
    });
  } catch (error) {
    next(error);
  }
};

export const createItem = async (req, res, next) => {
  try {
    const payload = req.body || {};
    if (!payload.item?.trim()) throw fail('Item name is required.');

    const item = await InventoryItem.create({
      item: payload.item,
      category: payload.category,
      image: payload.image || '',
      stock: toQty(payload.stock),
      damaged: toQty(payload.damaged),
      minStock: toQty(payload.minStock),
      unit: payload.unit,
      unitCost: toQty(payload.unitCost),
      status: payload.status === 'Inactive' ? 'Inactive' : 'Available',
      supplier: payload.supplierId || null,
      location: payload.location,
      notes: payload.notes,
    });

    if (toQty(item.stock) > 0) {
      await recordMovement({
        item,
        type: 'Stock In',
        quantity: item.stock,
        note: 'Opening stock',
        user: req.user,
      });
    }

    res.status(201).json({ item: formatItem(item) });
  } catch (error) {
    next(error);
  }
};

export const updateItem = async (req, res, next) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) throw fail('Inventory item not found.', 404);

    const payload = req.body || {};
    if (payload.item) item.item = payload.item;
    if (payload.category) item.category = payload.category;
    if (payload.image !== undefined) item.image = payload.image;
    if (payload.minStock !== undefined) item.minStock = payload.minStock;
    if (payload.unit) item.unit = payload.unit;
    if (payload.unitCost !== undefined) item.unitCost = payload.unitCost;
    if (payload.location !== undefined) item.location = payload.location;
    if (payload.notes !== undefined) item.notes = payload.notes;
    if (payload.supplierId !== undefined) item.supplier = payload.supplierId || null;
    item.status = payload.status === 'Inactive' ? 'Inactive' : 'Available';
    await item.save();

    res.json({ item: formatItem(item) });
  } catch (error) {
    next(error);
  }
};

export const deleteItem = async (req, res, next) => {
  try {
    const item = await InventoryItem.findByIdAndDelete(req.params.id);
    if (!item) throw fail('Inventory item not found.', 404);
    res.json({ message: 'Item removed' });
  } catch (error) {
    next(error);
  }
};

export const moveStock = async (req, res, next) => {
  try {
    const { itemId, type, quantity, note, date, unitCost } = req.body || {};
    const item = await InventoryItem.findById(itemId);
    if (!item) throw fail('Inventory item not found.', 404);

    const updated = await applyStockChange({
      item,
      type,
      quantity,
      unitCost,
      note,
      date,
      user: req.user,
    });

    res.json({ item: formatItem(updated) });
  } catch (error) {
    next(error);
  }
};

export const adjustStock = async (req, res, next) => {
  try {
    const { itemId, quantity, note } = req.body || {};
    const item = await InventoryItem.findById(itemId);
    if (!item) throw fail('Inventory item not found.', 404);

    const nextQty = toQty(quantity);
    if (nextQty < 0) throw fail('Stock cannot be negative.');
    const delta = nextQty - toQty(item.stock);
    if (delta === 0) {
      return res.json({ item: formatItem(item) });
    }

    const updated = await applyStockChange({
      item,
      type: delta > 0 ? 'Stock In' : 'Stock Out',
      quantity: Math.abs(delta),
      note: note || 'Manual stock update',
      user: req.user,
    });

    res.json({ item: formatItem(updated) });
  } catch (error) {
    next(error);
  }
};

export const createSupplier = async (req, res, next) => {
  try {
    if (!req.body?.name?.trim()) throw fail('Supplier name is required.');
    const supplier = await Supplier.create(req.body);
    res.status(201).json({ supplier: formatSupplier(supplier) });
  } catch (error) {
    next(error);
  }
};

export const updateSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) throw fail('Supplier not found.', 404);
    Object.assign(supplier, req.body);
    await supplier.save();
    res.json({ supplier: formatSupplier(supplier) });
  } catch (error) {
    next(error);
  }
};

export const deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) throw fail('Supplier not found.', 404);
    res.json({ message: 'Supplier removed' });
  } catch (error) {
    next(error);
  }
};

export const createCustomerPurchase = async (req, res, next) => {
  try {
    const payload = req.body || {};
    const quantity = toQty(payload.quantity);
    const unitCost = toQty(payload.unitPrice ?? payload.unitCost);
    const productName = String(payload.productName || '').trim();
    const customerName = String(payload.customerName || '').trim();
    if (!productName) throw fail('Product is required.');
    if (!customerName) throw fail('Customer name is required.');
    if (quantity <= 0) throw fail('Quantity must be greater than 0.');

    const purchase = await Purchase.create({
      source: 'customer',
      itemName: productName,
      supplierName: customerName,
      customerName,
      customerEmail: String(payload.customerEmail || payload.email || '').trim().toLowerCase(),
      phone: String(payload.phone || '').trim(),
      address: String(payload.address || '').trim(),
      notes: String(payload.notes || '').trim(),
      image: payload.image || '',
      orderRef: String(payload.orderRef || '').trim(),
      unit: String(payload.unit || '').trim(),
      quantity,
      unitCost,
      date: payload.date || new Date(),
      status: 'Pending',
    });

    res.status(201).json({ purchase: formatPurchase(purchase) });
  } catch (error) {
    next(error);
  }
};

export const cancelCustomerPurchase = async (req, res, next) => {
  try {
    const payload = req.body || {};
    const orderRef = String(payload.orderRef || '').trim();
    const email = String(payload.email || payload.customerEmail || '').trim().toLowerCase();
    if (!orderRef) throw fail('Order reference is required.');

    const purchase = await Purchase.findOne({ source: 'customer', orderRef });
    if (!purchase) throw fail('Order not found.', 404);
    if (email && purchase.customerEmail && purchase.customerEmail.toLowerCase() !== email) {
      throw fail('Order not found.', 404);
    }
    if (purchase.status === 'Completed') throw fail('Completed orders cannot be cancelled.');

    purchase.status = 'Cancelled';
    await purchase.save();
    res.json({ purchase: formatPurchase(purchase) });
  } catch (error) {
    next(error);
  }
};

export const listCustomerOrders = async (req, res, next) => {
  try {
    const email = String(req.query.email || '').trim().toLowerCase();
    if (!email) throw fail('Email is required.');
    const escaped = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const purchases = await Purchase.find({
      source: 'customer',
      customerEmail: { $regex: `^${escaped}$`, $options: 'i' },
    }).sort({ date: -1, createdAt: -1 });
    res.json({ orders: purchases.map(formatCustomerOrder) });
  } catch (error) {
    next(error);
  }
};

export const saveCustomerFeedback = async (req, res, next) => {
  try {
    const payload = req.body || {};
    const orderRef = String(req.params.orderRef || payload.orderRef || '').trim();
    const email = String(payload.email || payload.customerEmail || '').trim().toLowerCase();
    const rating = Number(payload.rating);
    if (!orderRef) throw fail('Order reference is required.');
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) throw fail('Choose a rating from 1 to 5.');

    const purchase = await Purchase.findOne({ source: 'customer', orderRef });
    if (!purchase) throw fail('Order not found.', 404);
    if (email && purchase.customerEmail && purchase.customerEmail.toLowerCase() !== email) {
      throw fail('Order not found.', 404);
    }
    if (purchase.status !== 'Completed') throw fail('Feedback is available after the order is completed.');

    purchase.feedback = {
      rating,
      comment: String(payload.comment || '').trim(),
    };
    await purchase.save();
    res.json({ order: formatCustomerOrder(purchase) });
  } catch (error) {
    next(error);
  }
};

export const createPurchase = async (req, res, next) => {
  try {
    const payload = req.body || {};
    const item = await InventoryItem.findById(payload.itemId);
    const supplier = await Supplier.findById(payload.supplierId);
    const quantity = toQty(payload.quantity);
    const unitCost = toQty(payload.unitCost);
    if (!item) throw fail('Select an inventory item.');
    if (!supplier) throw fail('Select a supplier.');
    if (quantity <= 0) throw fail('Quantity must be greater than 0.');

    const purchase = await Purchase.create({
      source: 'supplier',
      item: item._id,
      itemName: item.item,
      image: item.image || '',
      unit: item.unit || '',
      supplier: supplier._id,
      supplierName: supplier.name,
      date: payload.date || new Date(),
      quantity,
      unitCost,
      status: payload.status || 'Ordered',
      createdBy: req.user._id,
    });

    if (purchase.status === 'Received') {
      await applyStockChange({
        item,
        type: 'Stock In',
        quantity,
        unitCost,
        date: purchase.date,
        note: `Purchase received (${purchase._id})`,
        user: req.user,
      });
    }

    res.status(201).json({ purchase: formatPurchase(purchase) });
  } catch (error) {
    next(error);
  }
};

export const updatePurchase = async (req, res, next) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) throw fail('Purchase not found.', 404);

    const payload = req.body || {};

    if (purchase.source === 'customer') {
      const nextStatus = payload.status || purchase.status;
      if (!CUSTOMER_PURCHASE_STATUSES.includes(nextStatus)) {
        throw fail('Invalid status for a customer order.');
      }
      purchase.status = nextStatus;
      if (payload.notes !== undefined) purchase.notes = String(payload.notes || '').trim();
      await purchase.save();
      return res.json({ purchase: formatPurchase(purchase) });
    }

    const item = await InventoryItem.findById(payload.itemId || purchase.item);
    const supplier = await Supplier.findById(payload.supplierId || purchase.supplier);
    if (!item) throw fail('Select an inventory item.');
    if (!supplier) throw fail('Select a supplier.');

    const quantity = toQty(payload.quantity ?? purchase.quantity);
    const unitCost = toQty(payload.unitCost ?? purchase.unitCost);
    const nextStatus = payload.status || purchase.status;

    const prevReceivedQty = purchase.status === 'Received' ? toQty(purchase.quantity) : 0;
    const nextReceivedQty = nextStatus === 'Received' ? quantity : 0;
    const delta = nextReceivedQty - prevReceivedQty;

    purchase.item = item._id;
    purchase.itemName = item.item;
    purchase.image = item.image || purchase.image || '';
    purchase.unit = item.unit || purchase.unit || '';
    purchase.supplier = supplier._id;
    purchase.supplierName = supplier.name;
    purchase.date = payload.date || purchase.date;
    purchase.quantity = quantity;
    purchase.unitCost = unitCost;
    purchase.status = nextStatus;
    await purchase.save();

    if (delta !== 0) {
      await applyStockChange({
        item,
        type: delta > 0 ? 'Stock In' : 'Stock Out',
        quantity: Math.abs(delta),
        unitCost: delta > 0 ? unitCost : undefined,
        date: purchase.date,
        note: delta > 0 ? `Purchase received (${purchase._id})` : `Purchase reversed (${purchase._id})`,
        user: req.user,
      });
    }

    res.json({ purchase: formatPurchase(purchase) });
  } catch (error) {
    next(error);
  }
};

export const deletePurchase = async (req, res, next) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) throw fail('Purchase not found.', 404);

    if (purchase.source !== 'customer' && purchase.status === 'Received') {
      const item = await InventoryItem.findById(purchase.item);
      if (item) {
        await applyStockChange({
          item,
          type: 'Stock Out',
          quantity: purchase.quantity,
          note: `Purchase deleted (${purchase._id})`,
          user: req.user,
        });
      }
    }

    await purchase.deleteOne();
    res.json({ message: 'Purchase removed' });
  } catch (error) {
    next(error);
  }
};
