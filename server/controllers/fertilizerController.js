import Fertilizer from '../models/Fertilizer.js';
import FertilizerApplication from '../models/FertilizerApplication.js';

const fail = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const toDateString = (value) => {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
};

const formatFertilizer = (doc) => ({
  id: String(doc._id),
  name: doc.name,
  stock: doc.stock,
  unit: doc.unit,
  minStock: doc.minStock,
  description: doc.description || '',
});

const formatApplication = (doc) => ({
  id: String(doc._id),
  fertilizerId: doc.fertilizer ? String(doc.fertilizer._id || doc.fertilizer) : '',
  name: doc.fertilizerName || (doc.fertilizer ? doc.fertilizer.name : ''), // frontend uses 'name' for fertilizer name
  fertilizerName: doc.fertilizerName || (doc.fertilizer ? doc.fertilizer.name : ''),
  crop: doc.crop,
  cropId: doc.cropId ? String(doc.cropId) : '',
  date: toDateString(doc.date),
  quantity: doc.quantity,
  unit: doc.unit || 'KG',
  cost: doc.cost,
  status: doc.status || 'Scheduled',
  notes: doc.notes || '',
  recordedByName: doc.recordedByName || '',
});

// GET /api/fertilizers
export const getFertilizersDesk = async (req, res, next) => {
  try {
    const [fertilizers, applications] = await Promise.all([
      Fertilizer.find().sort({ name: 1 }),
      FertilizerApplication.find().populate('fertilizer').sort({ date: -1, createdAt: -1 }),
    ]);

    res.json({
      fertilizers: fertilizers.map(formatFertilizer),
      applications: applications.map(formatApplication),
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/fertilizers/stock
export const createFertilizer = async (req, res, next) => {
  try {
    const { name, stock, unit, minStock, description } = req.body;
    if (!name) throw fail('Fertilizer name is required.');

    const exists = await Fertilizer.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (exists) throw fail('A fertilizer with this name already exists.');

    const fertilizer = await Fertilizer.create({
      name: name.trim(),
      stock: stock !== undefined ? Number(stock) : 0,
      unit: unit || 'KG',
      minStock: minStock !== undefined ? Number(minStock) : 0,
      description: description || '',
    });

    res.status(201).json({ fertilizer: formatFertilizer(fertilizer) });
  } catch (error) {
    next(error);
  }
};

// PUT /api/fertilizers/stock/:id
export const updateFertilizer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, stock, unit, minStock, description } = req.body;

    const fertilizer = await Fertilizer.findById(id);
    if (!fertilizer) throw fail('Fertilizer not found.', 404);

    if (name) {
      const trimmedName = name.trim();
      const exists = await Fertilizer.findOne({
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
      });
      if (exists) throw fail('A fertilizer with this name already exists.');
      fertilizer.name = trimmedName;
    }

    if (stock !== undefined) fertilizer.stock = Number(stock);
    if (unit) fertilizer.unit = unit;
    if (minStock !== undefined) fertilizer.minStock = Number(minStock);
    if (description !== undefined) fertilizer.description = description;

    await fertilizer.save();
    res.json({ fertilizer: formatFertilizer(fertilizer) });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/fertilizers/stock/:id
export const deleteFertilizer = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Check if any applications are associated with this fertilizer
    const hasApplications = await FertilizerApplication.exists({ fertilizer: id });
    if (hasApplications) {
      throw fail('Cannot delete fertilizer: it has associated application records.');
    }

    const deleted = await Fertilizer.findByIdAndDelete(id);
    if (!deleted) throw fail('Fertilizer not found.', 404);

    res.json({ success: true, message: 'Fertilizer deleted.' });
  } catch (error) {
    next(error);
  }
};

// POST /api/fertilizers/applications
export const createApplication = async (req, res, next) => {
  try {
    const { fertilizerId, crop, cropId, date, quantity, cost, status, notes } = req.body;

    if (!fertilizerId) throw fail('Fertilizer selection is required.');
    if (!crop) throw fail('Crop name is required.');
    if (!date) throw fail('Application date is required.');
    if (quantity === undefined || Number(quantity) <= 0) throw fail('Applied quantity must be greater than 0.');

    const fertilizer = await Fertilizer.findById(fertilizerId);
    if (!fertilizer) throw fail('Select a valid fertilizer.');

    const qty = Number(quantity);

    // Stock deduction logic if Applied
    if (status === 'Applied') {
      if (fertilizer.stock < qty) {
        throw fail(`Insufficient stock. Current stock of ${fertilizer.name} is ${fertilizer.stock} ${fertilizer.unit}.`);
      }
      fertilizer.stock -= qty;
      await fertilizer.save();
    }

    const app = await FertilizerApplication.create({
      fertilizer: fertilizer._id,
      fertilizerName: fertilizer.name,
      crop: crop.trim(),
      cropId: cropId || null,
      date: new Date(date),
      quantity: qty,
      unit: fertilizer.unit,
      cost: cost !== undefined ? Number(cost) : 0,
      status: status || 'Scheduled',
      notes: notes || '',
      recordedBy: req.user?._id,
      recordedByName: req.user?.name || 'System',
    });

    const populated = await FertilizerApplication.findById(app._id).populate('fertilizer');
    res.status(201).json({ application: formatApplication(populated) });
  } catch (error) {
    next(error);
  }
};

// PUT /api/fertilizers/applications/:id
export const updateApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fertilizerId, crop, cropId, date, quantity, cost, status, notes } = req.body;

    const appObj = await FertilizerApplication.findById(id);
    if (!appObj) throw fail('Application record not found.', 404);

    const prevStatus = appObj.status;
    const prevQty = appObj.quantity;

    let targetFertilizer = null;
    if (fertilizerId) {
      targetFertilizer = await Fertilizer.findById(fertilizerId);
      if (!targetFertilizer) throw fail('Select a valid fertilizer.');
    } else {
      targetFertilizer = await Fertilizer.findById(appObj.fertilizer);
    }

    if (!targetFertilizer) throw fail('Associated fertilizer is missing.');

    const newQty = quantity !== undefined ? Number(quantity) : prevQty;
    const newStatus = status !== undefined ? status : prevStatus;

    if (newQty <= 0) throw fail('Applied quantity must be greater than 0.');

    // Stock adjustment calculations
    if (prevStatus === 'Scheduled' && newStatus === 'Applied') {
      // Deduct full quantity
      if (targetFertilizer.stock < newQty) {
        throw fail(`Insufficient stock. Current stock of ${targetFertilizer.name} is ${targetFertilizer.stock} ${targetFertilizer.unit}.`);
      }
      targetFertilizer.stock -= newQty;
    } else if (prevStatus === 'Applied' && newStatus === 'Scheduled') {
      // Return full quantity to stock
      targetFertilizer.stock += prevQty;
    } else if (prevStatus === 'Applied' && newStatus === 'Applied') {
      // Adjust difference
      const diff = newQty - prevQty;
      if (diff > 0) {
        if (targetFertilizer.stock < diff) {
          throw fail(`Insufficient stock. Current stock is ${targetFertilizer.stock} ${targetFertilizer.unit}. Cannot apply an extra ${diff} ${targetFertilizer.unit}.`);
        }
        targetFertilizer.stock -= diff;
      } else if (diff < 0) {
        targetFertilizer.stock += Math.abs(diff);
      }
    }

    await targetFertilizer.save();

    // Update application fields
    appObj.fertilizer = targetFertilizer._id;
    appObj.fertilizerName = targetFertilizer.name;
    appObj.unit = targetFertilizer.unit;
    if (crop) appObj.crop = crop.trim();
    if (cropId !== undefined) appObj.cropId = cropId || null;
    if (date) appObj.date = new Date(date);
    appObj.quantity = newQty;
    if (cost !== undefined) appObj.cost = Number(cost);
    appObj.status = newStatus;
    if (notes !== undefined) appObj.notes = notes;

    await appObj.save();

    const populated = await FertilizerApplication.findById(appObj._id).populate('fertilizer');
    res.json({ application: formatApplication(populated) });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/fertilizers/applications/:id
export const deleteApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const app = await FertilizerApplication.findById(id);
    if (!app) throw fail('Application record not found.', 404);

    // If it was already applied, add back the quantity to stock
    if (app.status === 'Applied') {
      const fertilizer = await Fertilizer.findById(app.fertilizer);
      if (fertilizer) {
        fertilizer.stock += app.quantity;
        await fertilizer.save();
      }
    }

    await FertilizerApplication.findByIdAndDelete(id);
    res.json({ success: true, message: 'Application record deleted.' });
  } catch (error) {
    next(error);
  }
};
