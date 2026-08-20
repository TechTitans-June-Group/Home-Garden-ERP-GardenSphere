import Harvest from '../models/Harvest.js';
import HarvestSale from '../models/HarvestSale.js';
import {
  HARVEST_CROPS,
  HARVEST_GRADES,
  HARVEST_MANAGE_ROLES,
  HARVEST_SALE_STATUSES,
  HARVEST_UNITS,
  harvestValue,
  saleStatusFromHarvest,
  toAmount,
  toQty,
} from '../config/harvest.js';

const fail = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const toDateString = (value) => {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
};

const assertManage = (req) => {
  if (!HARVEST_MANAGE_ROLES.includes(req.user.role)) {
    throw fail('Only the garden manager can update harvest sales.', 403);
  }
};

const formatHarvest = (doc) => ({
  id: String(doc._id),
  crop: doc.crop,
  cropId: doc.cropId || '',
  variety: doc.variety || '',
  date: toDateString(doc.date),
  quantity: toQty(doc.quantity),
  unit: doc.unit,
  grade: doc.grade,
  location: doc.location || '',
  unitPrice: toAmount(doc.unitPrice),
  totalValue: toAmount(doc.totalValue || harvestValue(doc.quantity, doc.unitPrice)),
  notes: doc.notes || '',
  recordedByName: doc.recordedByName || '',
  saleId: doc.saleId ? String(doc.saleId) : '',
  saleStatus: doc.saleStatus || 'Unlinked',
});

const formatSale = (doc) => ({
  id: String(doc._id),
  harvestId: doc.harvestId ? String(doc.harvestId) : '',
  crop: doc.crop,
  customer: doc.customer,
  date: toDateString(doc.date),
  quantity: toQty(doc.quantity),
  unit: doc.unit,
  unitPrice: toAmount(doc.unitPrice),
  amount: toAmount(doc.amount || harvestValue(doc.quantity, doc.unitPrice)),
  status: doc.status,
  notes: doc.notes || '',
});

const buildSummary = (harvests, sales) => {
  const totalQuantity = harvests.reduce((sum, row) => sum + toQty(row.quantity), 0);
  const totalValue = harvests.reduce((sum, row) => sum + toAmount(row.totalValue || harvestValue(row.quantity, row.unitPrice)), 0);
  const soldValue = harvests
    .filter((row) => row.saleStatus === 'Sold')
    .reduce((sum, row) => sum + toAmount(row.totalValue), 0);
  return {
    harvestCount: harvests.length,
    saleCount: sales.length,
    totalQuantity: Math.round(totalQuantity * 1000) / 1000,
    totalValue: toAmount(totalValue),
    soldValue: toAmount(soldValue),
    unsoldCount: harvests.filter((row) => row.saleStatus === 'Unlinked').length,
    listedCount: harvests.filter((row) => row.saleStatus === 'Listed').length,
    soldCount: harvests.filter((row) => row.saleStatus === 'Sold').length,
  };
};

const readHarvest = (payload) => {
  const crop = String(payload.crop || '').trim();
  const quantity = toQty(payload.quantity);
  const unitPrice = toAmount(payload.unitPrice);
  const unit = String(payload.unit || 'KG').trim();
  const grade = String(payload.grade || 'Grade A').trim();
  if (!crop) throw fail('Crop is required.');
  if (!payload.date) throw fail('Harvest date is required.');
  if (quantity <= 0) throw fail('Quantity must be greater than 0.');
  if (!HARVEST_UNITS.includes(unit)) throw fail('Select a valid harvest unit.');
  if (!HARVEST_GRADES.includes(grade)) throw fail('Select a valid quality grade.');
  if (unitPrice < 0) throw fail('Selling price cannot be negative.');
  return {
    crop,
    cropId: String(payload.cropId || '').trim(),
    variety: String(payload.variety || '').trim(),
    date: payload.date,
    quantity,
    unit,
    grade,
    location: String(payload.location || '').trim(),
    unitPrice,
    totalValue: harvestValue(quantity, unitPrice),
    notes: String(payload.notes || '').trim(),
  };
};

const readSale = (payload, harvest) => {
  const customer = String(payload.customer || '').trim();
  const quantity = toQty(payload.quantity ?? harvest.quantity);
  const unitPrice = toAmount(payload.unitPrice ?? harvest.unitPrice);
  const status = String(payload.status || 'Pending').trim();
  if (!customer) throw fail('Customer is required to link a harvest to sales.');
  if (quantity <= 0) throw fail('Sale quantity must be greater than 0.');
  if (!HARVEST_SALE_STATUSES.includes(status)) throw fail('Select a valid sale status.');
  return {
    customer,
    date: payload.date || harvest.date || new Date(),
    quantity,
    unit: String(payload.unit || harvest.unit || 'KG').trim(),
    unitPrice,
    amount: harvestValue(quantity, unitPrice),
    status,
    notes: String(payload.notes || '').trim(),
    crop: harvest.crop,
  };
};

const applySaleToHarvest = async (harvest, sale) => {
  if (!sale || sale.status === 'Cancelled') {
    harvest.saleId = null;
    harvest.saleStatus = 'Unlinked';
  } else {
    harvest.saleId = sale._id;
    harvest.saleStatus = saleStatusFromHarvest(sale.status);
  }
  await harvest.save();
};

export const getHarvestDesk = async (req, res, next) => {
  try {
    const [harvests, sales] = await Promise.all([
      Harvest.find().sort({ date: -1, createdAt: -1 }),
      HarvestSale.find().sort({ date: -1, createdAt: -1 }),
    ]);

    res.json({
      harvests: harvests.map(formatHarvest),
      sales: sales.map(formatSale),
      crops: HARVEST_CROPS,
      units: HARVEST_UNITS,
      grades: HARVEST_GRADES,
      saleStatuses: HARVEST_SALE_STATUSES,
      summary: buildSummary(harvests, sales),
    });
  } catch (error) {
    next(error);
  }
};

export const createHarvest = async (req, res, next) => {
  try {
    const harvest = await Harvest.create({
      ...readHarvest(req.body || {}),
      recordedBy: req.user._id,
      recordedByName: req.user.name,
    });
    res.status(201).json({ harvest: formatHarvest(harvest) });
  } catch (error) {
    next(error);
  }
};

export const updateHarvest = async (req, res, next) => {
  try {
    const harvest = await Harvest.findById(req.params.id);
    if (!harvest) throw fail('Harvest record not found.', 404);
    Object.assign(harvest, readHarvest({ ...formatHarvest(harvest), ...(req.body || {}) }));
    await harvest.save();
    res.json({ harvest: formatHarvest(harvest) });
  } catch (error) {
    next(error);
  }
};

export const deleteHarvest = async (req, res, next) => {
  try {
    assertManage(req);
    const harvest = await Harvest.findById(req.params.id);
    if (!harvest) throw fail('Harvest record not found.', 404);
    if (harvest.saleId) {
      await HarvestSale.findByIdAndDelete(harvest.saleId);
    }
    await harvest.deleteOne();
    res.json({ message: 'Harvest removed' });
  } catch (error) {
    next(error);
  }
};

export const linkHarvestSale = async (req, res, next) => {
  try {
    assertManage(req);
    const harvest = await Harvest.findById(req.params.id);
    if (!harvest) throw fail('Harvest record not found.', 404);

    const existing = await HarvestSale.findOne({ harvestId: harvest._id });
    if (existing && existing.status !== 'Cancelled') {
      throw fail('This harvest is already linked to a sale.');
    }

    const fields = readSale(req.body || {}, harvest);
    let sale = existing;
    if (sale) {
      Object.assign(sale, fields, { harvestId: harvest._id, createdBy: req.user._id });
      await sale.save();
    } else {
      sale = await HarvestSale.create({
        ...fields,
        harvestId: harvest._id,
        createdBy: req.user._id,
      });
    }

    await applySaleToHarvest(harvest, sale);
    res.status(201).json({ harvest: formatHarvest(harvest), sale: formatSale(sale) });
  } catch (error) {
    next(error);
  }
};

export const updateHarvestSale = async (req, res, next) => {
  try {
    assertManage(req);
    const sale = await HarvestSale.findById(req.params.id);
    if (!sale) throw fail('Sale not found.', 404);
    const harvest = await Harvest.findById(sale.harvestId);
    if (!harvest) throw fail('Linked harvest was not found.', 404);

    Object.assign(sale, readSale({ ...formatSale(sale), ...(req.body || {}) }, harvest));
    await sale.save();
    await applySaleToHarvest(harvest, sale);
    res.json({ harvest: formatHarvest(harvest), sale: formatSale(sale) });
  } catch (error) {
    next(error);
  }
};

export const deleteHarvestSale = async (req, res, next) => {
  try {
    assertManage(req);
    const sale = await HarvestSale.findById(req.params.id);
    if (!sale) throw fail('Sale not found.', 404);
    const harvest = await Harvest.findById(sale.harvestId);
    await HarvestSale.findByIdAndDelete(sale._id);
    if (harvest) {
      await applySaleToHarvest(harvest, null);
    }
    res.json({ message: 'Sale unlinked' });
  } catch (error) {
    next(error);
  }
};
