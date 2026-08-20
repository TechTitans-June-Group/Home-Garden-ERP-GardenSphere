import ContactMessage from '../models/ContactMessage.js';

const fail = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const formatReply = (doc) => ({
  id: String(doc._id),
  body: doc.body,
  byName: doc.byName,
  byRole: doc.byRole,
  createdAt: doc.createdAt,
});

const formatMessage = (doc) => ({
  id: String(doc._id),
  name: doc.name,
  email: doc.email,
  phone: doc.phone || '',
  subject: doc.subject,
  message: doc.message,
  status: doc.status,
  replies: (doc.replies || []).map(formatReply),
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

export const createMessage = async (req, res, next) => {
  try {
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const phone = String(req.body?.phone || '').trim();
    const subject = String(req.body?.subject || '').trim();
    const message = String(req.body?.message || '').trim();

    if (!name) throw fail('Name is required.');
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) throw fail('A valid email is required.');
    if (!subject) throw fail('Subject is required.');
    if (!message) throw fail('Message is required.');

    const saved = await ContactMessage.create({ name, email, phone, subject, message });
    res.status(201).json({ message: formatMessage(saved) });
  } catch (error) {
    next(error);
  }
};

export const listMyMessages = async (req, res, next) => {
  try {
    const email = String(req.query.email || '').trim().toLowerCase();
    if (!email) throw fail('Email is required.');
    const rows = await ContactMessage.find({ email }).sort({ createdAt: -1 });
    res.json({ messages: rows.map(formatMessage) });
  } catch (error) {
    next(error);
  }
};

export const listMessages = async (req, res, next) => {
  try {
    const rows = await ContactMessage.find().sort({ createdAt: -1 });
    res.json({
      messages: rows.map(formatMessage),
      summary: {
        total: rows.length,
        unread: rows.filter((row) => row.status === 'New').length,
        replied: rows.filter((row) => row.status === 'Replied').length,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMessage = async (req, res, next) => {
  try {
    const row = await ContactMessage.findById(req.params.id);
    if (!row) throw fail('Message not found.', 404);
    if (row.status === 'New') {
      row.status = 'Read';
      await row.save();
    }
    res.json({ message: formatMessage(row) });
  } catch (error) {
    next(error);
  }
};

export const replyMessage = async (req, res, next) => {
  try {
    const row = await ContactMessage.findById(req.params.id);
    if (!row) throw fail('Message not found.', 404);
    const body = String(req.body?.body || '').trim();
    if (!body) throw fail('Reply text is required.');

    row.replies.push({
      body,
      byName: req.user?.name || 'GardenSphere',
      byRole: req.user?.role || 'admin',
    });
    row.status = 'Replied';
    await row.save();
    res.json({ message: formatMessage(row) });
  } catch (error) {
    next(error);
  }
};

export const updateMessageStatus = async (req, res, next) => {
  try {
    const row = await ContactMessage.findById(req.params.id);
    if (!row) throw fail('Message not found.', 404);
    const status = String(req.body?.status || '').trim();
    if (!['New', 'Read', 'Replied', 'Closed'].includes(status)) throw fail('Invalid status.');
    row.status = status;
    await row.save();
    res.json({ message: formatMessage(row) });
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (req, res, next) => {
  try {
    const row = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!row) throw fail('Message not found.', 404);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
};
