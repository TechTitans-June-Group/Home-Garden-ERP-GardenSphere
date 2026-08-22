import Maintenance from '../models/Maintenance.js';
import {
  MAINTENANCE_LOCATIONS,
  MAINTENANCE_MANAGE_ROLES,
  MAINTENANCE_STATUSES,
  MAINTENANCE_TYPES,
} from '../config/maintenance.js';

const fail = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const toDateString = (value) => {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
};

const todayStamp = () => new Date().toISOString().slice(0, 10);

const isOverdue = (row) => row.status === 'Due' && toDateString(row.date) < todayStamp();

const formatRecord = (doc) => ({
  id: String(doc._id),
  type: doc.type,
  date: toDateString(doc.date),
  location: doc.location || '',
  crop: doc.crop || '',
  notes: doc.notes || '',
  status: doc.status,
  recordedBy: doc.recordedBy ? String(doc.recordedBy) : '',
  recordedByName: doc.recordedByName || '',
  overdue: isOverdue(doc),
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

const canManage = (req) => MAINTENANCE_MANAGE_ROLES.includes(req.user?.role);

const ownsRecord = (req, doc) => {
  if (!doc.recordedBy) return false;
  return String(doc.recordedBy) === String(req.user._id);
};

const buildSummary = (rows) => {
  const due = rows.filter((row) => row.status === 'Due');
  return {
    total: rows.length,
    due: due.length,
    overdue: due.filter((row) => isOverdue(row)).length,
    done: rows.filter((row) => row.status === 'Done').length,
  };
};

export const getMaintenanceDesk = async (req, res, next) => {
  try {
    const filter = canManage(req) ? {} : { recordedBy: req.user._id };
    const rows = await Maintenance.find(filter).sort({ date: -1, createdAt: -1 });
    res.json({
      records: rows.map(formatRecord),
      types: MAINTENANCE_TYPES,
      statuses: MAINTENANCE_STATUSES,
      locations: MAINTENANCE_LOCATIONS,
      summary: buildSummary(rows),
    });
  } catch (error) {
    next(error);
  }
};

export const createMaintenance = async (req, res, next) => {
  try {
    const type = String(req.body?.type || '').trim();
    const date = String(req.body?.date || '').trim();
    const location = String(req.body?.location || '').trim();
    const crop = String(req.body?.crop || '').trim();
    const notes = String(req.body?.notes || '').trim();
    const status = String(req.body?.status || 'Due').trim();

    if (!MAINTENANCE_TYPES.includes(type)) throw fail('Choose a valid activity type.');
    if (!date) throw fail('Date is required.');
    if (!MAINTENANCE_STATUSES.includes(status)) throw fail('Invalid status.');

    const saved = await Maintenance.create({
      type,
      date: new Date(date),
      location,
      crop,
      notes,
      status,
      recordedBy: req.user?._id || null,
      recordedByName: req.user?.name || '',
    });

    res.status(201).json({ record: formatRecord(saved) });
  } catch (error) {
    next(error);
  }
};

export const updateMaintenance = async (req, res, next) => {
  try {
    const row = await Maintenance.findById(req.params.id);
    if (!row) throw fail('Maintenance record not found.', 404);
    if (!canManage(req) && !ownsRecord(req, row)) {
      throw fail('You can only update your own maintenance records.', 403);
    }

    if (req.body.type !== undefined) {
      const type = String(req.body.type).trim();
      if (!MAINTENANCE_TYPES.includes(type)) throw fail('Choose a valid activity type.');
      row.type = type;
    }
    if (req.body.date) row.date = new Date(req.body.date);
    if (req.body.location !== undefined) row.location = String(req.body.location).trim();
    if (req.body.crop !== undefined) row.crop = String(req.body.crop).trim();
    if (req.body.notes !== undefined) row.notes = String(req.body.notes).trim();
    if (req.body.status !== undefined) {
      const status = String(req.body.status).trim();
      if (!MAINTENANCE_STATUSES.includes(status)) throw fail('Invalid status.');
      row.status = status;
    }

    await row.save();
    res.json({ record: formatRecord(row) });
  } catch (error) {
    next(error);
  }
};

export const deleteMaintenance = async (req, res, next) => {
  try {
    const row = await Maintenance.findByIdAndDelete(req.params.id);
    if (!row) throw fail('Maintenance record not found.', 404);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
};
