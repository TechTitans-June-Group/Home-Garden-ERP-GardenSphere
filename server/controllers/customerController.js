import User from '../models/User.js';
import GardenDesign from '../models/GardenDesign.js';
import CustomerNotification from '../models/CustomerNotification.js';
import { formatUser } from './authController.js';

const fail = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const formatDesign = (doc) => {
  const raw = doc.toObject();
  delete raw._id;
  delete raw.__v;
  return {
    ...raw,
    id: String(doc._id),
    customerEmail: doc.customerEmail,
    customerName: doc.customerName,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

export const getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ wishlist: user?.wishlist || [] });
  } catch (error) {
    next(error);
  }
};

export const saveWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) throw fail('User not found.', 404);
    user.wishlist = Array.isArray(req.body?.wishlist) ? req.body.wishlist.map(String) : [];
    await user.save();
    res.json({ user: formatUser(user), wishlist: user.wishlist });
  } catch (error) {
    next(error);
  }
};

export const listDesigns = async (req, res, next) => {
  try {
    const rows = await GardenDesign.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json({ designs: rows.map(formatDesign) });
  } catch (error) {
    next(error);
  }
};

export const saveDesign = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    delete payload.id;
    delete payload._id;
    const incomingId = req.body?.id;
    const data = {
      ...payload,
      user: req.user._id,
      customerEmail: req.user.email,
      customerName: req.user.name,
    };

    let saved;
    if (incomingId && incomingId.length === 24) {
      saved = await GardenDesign.findOneAndUpdate({ _id: incomingId, user: req.user._id }, data, { new: true });
    }
    if (!saved) saved = await GardenDesign.create(data);
    res.status(201).json({ design: formatDesign(saved) });
  } catch (error) {
    next(error);
  }
};

export const deleteDesign = async (req, res, next) => {
  try {
    const row = await GardenDesign.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!row) throw fail('Garden design not found.', 404);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
};

export const listNotifications = async (req, res, next) => {
  try {
    const rows = await CustomerNotification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(80);
    res.json({
      notifications: rows.map((row) => ({
        id: String(row._id),
        key: row.key,
        type: row.type,
        title: row.title,
        description: row.description,
        read: row.read,
        time: row.time || row.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const addNotification = async (req, res, next) => {
  try {
    if (req.body?.key) {
      const existing = await CustomerNotification.findOne({ user: req.user._id, key: req.body.key });
      if (existing) return res.json({ notification: existing });
    }
    const row = await CustomerNotification.create({
      user: req.user._id,
      key: req.body?.key || '',
      type: req.body?.type || 'info',
      title: req.body?.title || 'Notification',
      description: req.body?.description || '',
    });
    res.status(201).json({ notification: row });
  } catch (error) {
    next(error);
  }
};

export const markNotifications = async (req, res, next) => {
  try {
    const filter = { user: req.user._id };
    if (req.body?.id) filter._id = req.body.id;
    await CustomerNotification.updateMany(filter, { $set: { read: true } });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
};
