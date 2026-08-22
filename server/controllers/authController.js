import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { ROLES } from '../config/roles.js';
import logActivity from '../utils/logActivity.js';

export const formatUser = (user) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone || '',
  address: user.address || '',
  wishlist: user.wishlist || [],
  isActive: user.isActive,
  lastLogin: user.lastLogin || null,
  createdAt: user.createdAt,
});

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      address: address || '',
      role: ROLES.USER,
    });

    res.status(201).json({
      user: formatUser(user),
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    if (user.role !== ROLES.USER) {
      await logActivity({ user, action: 'Logged in', detail: 'Signed in to the staff portal.' });
    }

    res.json({
      user: formatUser(user),
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  res.json({ user: formatUser(req.user) });
};

export const updateMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (req.body.name) user.name = String(req.body.name).trim();
    if (req.body.phone !== undefined) user.phone = String(req.body.phone).trim();
    if (req.body.address !== undefined) user.address = String(req.body.address).trim();
    if (req.body.email) user.email = String(req.body.email).trim().toLowerCase();
    await user.save();
    res.json({ user: formatUser(user) });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    if (!email || password.length < 6) {
      return res.status(400).json({ message: 'Email and a new password (6+ characters) are required.' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'No account exists for that email.' });
    }
    user.password = password;
    await user.save();
    res.json({ message: 'Password updated. You can log in with the new password.' });
  } catch (error) {
    next(error);
  }
};
