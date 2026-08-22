import Purchase from '../models/Purchase.js';
import User from '../models/User.js';
import Harvest from '../models/Harvest.js';
import HarvestSale from '../models/HarvestSale.js';
import { SHOP_CATALOG } from '../config/shop.js';
import { ROLES } from '../config/roles.js';
import { HARVEST_CROPS, HARVEST_UNITS, harvestValue, saleStatusFromHarvest } from '../config/harvest.js';

const cropKey = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/s\b/g, '');

export const cropsMatch = (left, right) => {
  const a = cropKey(left);
  const b = cropKey(right);
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  const mainA = a.split(' ').pop();
  const mainB = b.split(' ').pop();
  return Boolean(mainA && mainB && mainA.length > 3 && mainA === mainB);
};

export const shopProductForCrop = (crop) =>
  SHOP_CATALOG.find((item) => cropsMatch(item.name, crop) || item.cropKeys.some((key) => cropsMatch(key, crop))) || null;

const escapeRegex = (value) => String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const findCustomerAccount = async ({ name, email }) => {
  const cleanedEmail = String(email || '').trim().toLowerCase();
  if (cleanedEmail) {
    const byEmail = await User.findOne({ email: cleanedEmail, role: ROLES.USER });
    if (byEmail) return byEmail;
  }
  const cleanedName = String(name || '').trim();
  if (!cleanedName) return null;
  return User.findOne({
    role: ROLES.USER,
    name: { $regex: `^${escapeRegex(cleanedName)}$`, $options: 'i' },
  });
};

const findLinkedPurchase = async (sale, account) => {
  if (sale.orderRef) {
    const byRef = await Purchase.findOne({ source: 'customer', orderRef: sale.orderRef });
    if (byRef) return byRef;
  }

  const email = account?.email || sale.customerEmail || '';
  const name = account?.name || sale.customer || '';
  const clauses = [];
  if (email) clauses.push({ customerEmail: { $regex: `^${escapeRegex(email)}$`, $options: 'i' } });
  if (name) clauses.push({ customerName: { $regex: `^${escapeRegex(name)}$`, $options: 'i' } });
  if (!clauses.length) return null;

  const rows = await Purchase.find({ source: 'customer', $or: clauses }).sort({ date: -1, createdAt: -1 });
  return (
    rows.find((row) => cropsMatch(row.itemName, sale.crop) && row.status !== 'Cancelled') ||
    rows.find((row) => cropsMatch(row.itemName, sale.crop)) ||
    null
  );
};

export const upsertPurchaseFromHarvestSale = async (sale, { userId } = {}) => {
  if (!sale) return null;
  const account = await findCustomerAccount({ name: sale.customer, email: sale.customerEmail });
  const catalog = shopProductForCrop(sale.crop);
  const productName = catalog?.name || sale.crop;
  const customerName = account?.name || sale.customer;
  const customerEmail = (account?.email || sale.customerEmail || '').toLowerCase();

  let purchase = await findLinkedPurchase(sale, account);
  const orderRef = sale.orderRef || purchase?.orderRef || `HS-${String(sale._id).slice(-6).toUpperCase()}`;

  const fields = {
    source: 'customer',
    itemName: productName,
    supplierName: customerName,
    customerName,
    customerEmail,
    phone: account?.phone || purchase?.phone || '',
    address: account?.address || purchase?.address || '',
    notes: sale.notes || purchase?.notes || `Harvest sale ${sale.crop}`,
    image: purchase?.image || catalog?.image || '',
    orderRef,
    unit: sale.unit || catalog?.unit || 'KG',
    quantity: sale.quantity,
    unitCost: sale.unitPrice,
    date: sale.date || purchase?.date || new Date(),
    status: sale.status || 'Pending',
    createdBy: userId || purchase?.createdBy || sale.createdBy || null,
  };

  if (purchase) {
    Object.assign(purchase, fields);
    await purchase.save();
  } else if (sale.status !== 'Cancelled') {
    purchase = await Purchase.create(fields);
  }

  sale.customerEmail = customerEmail || sale.customerEmail || '';
  sale.orderRef = purchase?.orderRef || orderRef;
  if (sale.isModified?.() || sale.customerEmail || sale.orderRef) {
    await sale.save();
  }
  return purchase;
};

export const unlinkPurchaseFromHarvestSale = async (sale) => {
  if (!sale?.orderRef || !String(sale.orderRef).startsWith('HS-')) return null;
  const purchase = await Purchase.findOne({ source: 'customer', orderRef: sale.orderRef });
  if (!purchase || purchase.status === 'Completed') return purchase;
  purchase.status = 'Cancelled';
  await purchase.save();
  return purchase;
};

const harvestUnit = (unit) => {
  const value = String(unit || 'KG').trim();
  if (HARVEST_UNITS.includes(value)) return value;
  if (/bunch|stem/i.test(value)) return 'Bunch';
  if (/pack|pot/i.test(value)) return 'Pot';
  return 'KG';
};

const harvestCropName = (productName) => {
  const catalog = shopProductForCrop(productName);
  const planted = HARVEST_CROPS.find(
    (crop) =>
      cropsMatch(crop.name, productName) ||
      catalog?.cropKeys.some((key) => cropsMatch(crop.name, key))
  );
  return planted?.name || catalog?.name || productName;
};

const applySaleLink = async (harvest, sale) => {
  if (!harvest) return;
  if (!sale || sale.status === 'Cancelled') {
    harvest.saleId = null;
    harvest.saleStatus = 'Unlinked';
  } else {
    harvest.saleId = sale._id;
    harvest.saleStatus = saleStatusFromHarvest(sale.status);
  }
  await harvest.save();
};

export const upsertHarvestSaleFromPurchase = async (purchase) => {
  if (!purchase || purchase.source !== 'customer') return null;

  const orderRef = String(purchase.orderRef || '').trim();
  const customerName = String(purchase.customerName || purchase.supplierName || '').trim();
  const customerEmail = String(purchase.customerEmail || '').trim().toLowerCase();
  const productName = String(purchase.itemName || '').trim();
  if (!productName || !customerName) return null;

  let sale = orderRef ? await HarvestSale.findOne({ orderRef }) : null;
  if (!sale) {
    const rows = await HarvestSale.find({
      $or: [
        ...(customerEmail ? [{ customerEmail }] : []),
        { customer: { $regex: `^${escapeRegex(customerName)}$`, $options: 'i' } },
      ],
    }).sort({ date: -1, createdAt: -1 });
    sale = rows.find((row) => cropsMatch(row.crop, productName) && (!row.orderRef || row.orderRef === orderRef)) || null;
  }

  let harvest = sale?.harvestId ? await Harvest.findById(sale.harvestId) : null;
  if (!harvest) {
    const unlinked = await Harvest.find({ saleStatus: 'Unlinked' }).sort({ date: -1, createdAt: -1 });
    harvest = unlinked.find((row) => cropsMatch(row.crop, productName)) || null;
  }
  if (harvest && !sale) {
    sale = await HarvestSale.findOne({ harvestId: harvest._id });
  }
  if (!harvest) {
    const crop = harvestCropName(productName);
    const unit = harvestUnit(purchase.unit);
    harvest = await Harvest.create({
      crop,
      variety: HARVEST_CROPS.find((item) => item.name === crop)?.variety || '',
      location: HARVEST_CROPS.find((item) => item.name === crop)?.location || '',
      date: purchase.date || new Date(),
      quantity: purchase.quantity,
      unit,
      grade: 'Grade A',
      unitPrice: purchase.unitCost,
      totalValue: harvestValue(purchase.quantity, purchase.unitCost),
      notes: `Opened from shop order ${orderRef}`.trim(),
      recordedByName: 'Shop order',
    });
  }

  const fields = {
    harvestId: harvest._id,
    crop: harvest.crop,
    customer: customerName,
    customerEmail,
    orderRef,
    date: purchase.date || new Date(),
    quantity: purchase.quantity,
    unit: harvestUnit(purchase.unit || harvest.unit),
    unitPrice: purchase.unitCost,
    amount: harvestValue(purchase.quantity, purchase.unitCost),
    status: purchase.status === 'Cancelled' ? 'Cancelled' : purchase.status || 'Pending',
    notes: purchase.notes || '',
  };

  if (sale) {
    Object.assign(sale, fields);
    await sale.save();
  } else if (fields.status !== 'Cancelled') {
    sale = await HarvestSale.create(fields);
  }

  await applySaleLink(harvest, sale);
  return sale;
};

export const formatSaleAsCustomerOrder = (sale) => {
  const catalog = shopProductForCrop(sale.crop);
  return {
    id: sale.orderRef || `HS-${String(sale._id).slice(-6).toUpperCase()}`,
    purchaseId: '',
    productName: catalog?.name || sale.crop,
    image: catalog?.image || '',
    quantity: sale.quantity,
    unit: sale.unit,
    unitPrice: sale.unitPrice,
    total: sale.amount,
    status: sale.status,
    notes: sale.notes || '',
    customerName: sale.customer,
    customerEmail: sale.customerEmail || '',
    phone: '',
    address: '',
    orderDate: sale.date ? new Date(sale.date).toISOString() : new Date().toISOString(),
    feedback: null,
  };
};
