import PestRecord from '../models/PestRecord.js';

const fail = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const toDateStr = (value) => {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
};

const format = (doc) => ({
  id: String(doc._id),
  issue: doc.issue,
  type: doc.type || 'Pest',
  crop: doc.crop,
  location: doc.location || '',
  severity: doc.severity || 'Low',
  dateDetected: toDateStr(doc.dateDetected),
  treatment: doc.treatment || '',
  treatmentDate: doc.treatmentDate ? toDateStr(doc.treatmentDate) : '',
  status: doc.status || 'Active',
  notes: doc.notes || '',
  reportedByName: doc.reportedByName || '',
  createdAt: doc.createdAt ? doc.createdAt.toISOString() : '',
});

// GET /api/pests
export const getPests = async (req, res, next) => {
  try {
    const records = await PestRecord.find().sort({ dateDetected: -1 });
    res.json({ records: records.map(format) });
  } catch (error) {
    next(error);
  }
};

// POST /api/pests
export const createPest = async (req, res, next) => {
  try {
    const { issue, type, crop, location, severity, dateDetected, treatment, treatmentDate, status, notes } = req.body;
    if (!issue) throw fail('Issue / problem name is required.');
    if (!crop) throw fail('Affected crop is required.');
    if (!dateDetected) throw fail('Detection date is required.');

    const record = await PestRecord.create({
      issue,
      type: type || 'Pest',
      crop,
      location: location || '',
      severity: severity || 'Low',
      dateDetected: new Date(dateDetected),
      treatment: treatment || '',
      treatmentDate: treatmentDate ? new Date(treatmentDate) : null,
      status: status || 'Active',
      notes: notes || '',
      reportedBy: req.user?._id || null,
      reportedByName: req.user?.name || '',
    });

    res.status(201).json({ record: format(record) });
  } catch (error) {
    next(error);
  }
};

// PUT /api/pests/:id
export const updatePest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const record = await PestRecord.findById(id);
    if (!record) throw fail('Pest/disease record not found.', 404);

    const fields = ['issue', 'type', 'crop', 'location', 'severity', 'treatment', 'status', 'notes'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) record[f] = req.body[f];
    });
    if (req.body.dateDetected) record.dateDetected = new Date(req.body.dateDetected);
    if (req.body.treatmentDate !== undefined) {
      record.treatmentDate = req.body.treatmentDate ? new Date(req.body.treatmentDate) : null;
    }

    await record.save();
    res.json({ record: format(record) });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/pests/:id
export const deletePest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await PestRecord.findByIdAndDelete(id);
    if (!deleted) throw fail('Pest/disease record not found.', 404);
    res.json({ success: true, message: 'Record deleted.' });
  } catch (error) {
    next(error);
  }
};
