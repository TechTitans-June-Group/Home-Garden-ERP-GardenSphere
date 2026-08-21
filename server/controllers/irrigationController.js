import IrrigationSchedule from '../models/IrrigationSchedule.js';
import IrrigationRecord from '../models/IrrigationRecord.js';

const fail = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const toDateString = (value) => {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
};

const formatSchedule = (doc) => ({
  id: String(doc._id),
  crop: doc.crop,
  cropId: doc.cropId ? String(doc.cropId) : '',
  frequency: doc.frequency,
  schedule: doc.frequency, // frontend maps 'schedule' in table columns
  time: doc.time,
  quantity: doc.quantity,
  lastDone: doc.lastDone ? toDateString(doc.lastDone) : '',
  status: doc.status || 'Due',
});

const formatRecord = (doc) => ({
  id: String(doc._id),
  scheduleId: doc.schedule ? String(doc.schedule) : '',
  crop: doc.crop,
  date: toDateString(doc.date),
  time: doc.time,
  quantity: doc.quantity,
  status: doc.status || 'Completed',
  notes: doc.notes || '',
  recordedByName: doc.recordedByName || '',
});

// GET /api/irrigation
export const getIrrigationDesk = async (req, res, next) => {
  try {
    const [schedules, records] = await Promise.all([
      IrrigationSchedule.find().sort({ crop: 1 }),
      IrrigationRecord.find().sort({ date: -1, time: -1 }),
    ]);

    res.json({
      schedules: schedules.map(formatSchedule),
      records: records.map(formatRecord),
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/irrigation/schedules
export const createSchedule = async (req, res, next) => {
  try {
    const { crop, cropId, frequency, time, quantity, status } = req.body;

    if (!crop) throw fail('Crop name is required.');
    if (!frequency) throw fail('Watering frequency is required.');
    if (!time) throw fail('Watering time is required.');
    if (!quantity) throw fail('Quantity watered is required.');

    const schedule = await IrrigationSchedule.create({
      crop,
      cropId: cropId || null,
      frequency,
      time,
      quantity,
      status: status || 'Due',
    });

    res.status(201).json({ schedule: formatSchedule(schedule) });
  } catch (error) {
    next(error);
  }
};

// PUT /api/irrigation/schedules/:id
export const updateSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { crop, cropId, frequency, time, quantity, lastDone, status } = req.body;

    const schedule = await IrrigationSchedule.findById(id);
    if (!schedule) throw fail('Irrigation schedule not found.', 404);

    if (crop) schedule.crop = crop;
    if (cropId !== undefined) schedule.cropId = cropId || null;
    if (frequency) schedule.frequency = frequency;
    if (time) schedule.time = time;
    if (quantity) schedule.quantity = quantity;
    if (lastDone !== undefined) schedule.lastDone = lastDone ? new Date(lastDone) : null;
    if (status) schedule.status = status;

    await schedule.save();
    res.json({ schedule: formatSchedule(schedule) });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/irrigation/schedules/:id
export const deleteSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await IrrigationSchedule.findByIdAndDelete(id);
    if (!deleted) throw fail('Irrigation schedule not found.', 404);
    res.json({ success: true, message: 'Irrigation schedule deleted.' });
  } catch (error) {
    next(error);
  }
};

// POST /api/irrigation/records (watering history log)
export const recordWatering = async (req, res, next) => {
  try {
    const { scheduleId, crop, date, time, quantity, status, notes } = req.body;

    const cropName = crop ? crop.trim() : '';
    const qtyVal = quantity ? quantity.trim() : '';
    const timeVal = time ? time.trim() : '';

    if (!cropName) throw fail('Crop name is required.');
    if (!qtyVal) throw fail('Water quantity is required.');
    if (!timeVal) throw fail('Watering time is required.');

    let sched = null;
    if (scheduleId) {
      sched = await IrrigationSchedule.findById(scheduleId);
      if (sched) {
        sched.lastDone = date ? new Date(date) : new Date();
        sched.status = 'Completed';
        await sched.save();
      }
    }

    const record = await IrrigationRecord.create({
      schedule: sched ? sched._id : null,
      crop: cropName,
      date: date ? new Date(date) : new Date(),
      time: timeVal,
      quantity: qtyVal,
      status: status || 'Completed',
      notes: notes || '',
      recordedBy: req.user?._id,
      recordedByName: req.user?.name || 'System',
    });

    res.status(201).json({ record: formatRecord(record) });
  } catch (error) {
    next(error);
  }
};
