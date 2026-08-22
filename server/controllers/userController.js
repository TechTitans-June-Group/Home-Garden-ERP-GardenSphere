import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import { ROLE_LIST, ROLES } from '../config/roles.js';
import logActivity from '../utils/logActivity.js';

const fail = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const formatStaffUser = (user) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone || '',
  address: user.address || '',
  status: user.isActive ? 'Active' : 'Inactive',
  lastLogin: user.lastLogin || null,
  createdAt: user.createdAt,
});

export const listUsers = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? { role: { $ne: ROLES.USER } } : { role: { $in: ['admin', 'garden_manager', 'gardener'] } };
    const rows = await User.find(filter).sort({ createdAt: -1 });
    res.json({ users: rows.map(formatStaffUser) });
  } catch (error) {
    next(error);
  }
};

export const createStaffUser = async (req, res, next) => {
  try {
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    const role = String(req.body?.role || '').trim();
    const phone = String(req.body?.phone || '').trim();

    if (!name || !email || !password) throw fail('Name, email, and password are required.');
    if (password.length < 6) throw fail('Password must be at least 6 characters.');
    if (!ROLE_LIST.includes(role) || role === ROLES.USER) throw fail('Choose a valid staff role.');
    if (await User.findOne({ email })) throw fail('An account with this email already exists.');

    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      isActive: String(req.body?.status || 'Active') !== 'Inactive',
    });
    await logActivity({ user: req.user, userId: user._id, userName: user.name, action: 'Created user', detail: `Account created with role ${role}.` });
    res.status(201).json({ user: formatStaffUser(user) });
  } catch (error) {
    next(error);
  }
};

export const updateStaffUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role === ROLES.USER) throw fail('User not found.', 404);

    if (req.body.name) user.name = String(req.body.name).trim();
    if (req.body.email) user.email = String(req.body.email).trim().toLowerCase();
    if (req.body.phone !== undefined) user.phone = String(req.body.phone).trim();
    if (req.body.role && ROLE_LIST.includes(req.body.role) && req.body.role !== ROLES.USER) {
      user.role = req.body.role;
    }
    await user.save();
    await logActivity({ user: req.user, userId: user._id, userName: user.name, action: 'Updated user', detail: 'User profile details were updated.' });
    res.json({ user: formatStaffUser(user) });
  } catch (error) {
    next(error);
  }
};

export const setStaffStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role === ROLES.USER) throw fail('User not found.', 404);
    const status = String(req.body?.status || '').trim();
    const isActive = status === 'Active';

    if (!isActive && user.role === 'admin') {
      const activeAdmins = await User.countDocuments({ role: 'admin', isActive: true, _id: { $ne: user._id } });
      if (activeAdmins < 1) throw fail('Cannot deactivate the last active admin.');
    }
    if (!isActive && String(user._id) === String(req.user._id)) {
      throw fail('You cannot deactivate the account you are signed in with.');
    }

    user.isActive = isActive;
    await user.save();
    await logActivity({
      user: req.user,
      userId: user._id,
      userName: user.name,
      action: isActive ? 'Activated user' : 'Deactivated user',
      detail: `Account is now ${isActive ? 'active' : 'inactive'}.`,
    });
    res.json({ user: formatStaffUser(user) });
  } catch (error) {
    next(error);
  }
};

export const resetStaffPassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw fail('User not found.', 404);
    const password = String(req.body?.password || '');
    if (password.length < 6) throw fail('Password must be at least 6 characters.');
    user.password = password;
    await user.save();
    await logActivity({ user: req.user, userId: user._id, userName: user.name, action: 'Reset password', detail: 'Password was reset by an administrator.' });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
};

export const listActivity = async (req, res, next) => {
  try {
    const rows = await ActivityLog.find().sort({ createdAt: -1 }).limit(250);
    res.json({
      activity: rows.map((row) => ({
        id: String(row._id),
        time: row.createdAt,
        actorId: row.actorId ? String(row.actorId) : '',
        actorName: row.actorName,
        userId: row.userId ? String(row.userId) : '',
        userName: row.userName,
        action: row.action,
        detail: row.detail,
      })),
    });
  } catch (error) {
    next(error);
  }
};
