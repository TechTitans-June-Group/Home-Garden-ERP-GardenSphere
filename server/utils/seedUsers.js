import User from '../models/User.js';
import { ROLES } from '../config/roles.js';

const demoUsers = [
  {
    name: 'System Admin',
    email: 'admin@gardensphere.com',
    password: 'Admin@123',
    role: ROLES.ADMIN,
  },
  {
    name: 'Home User',
    email: 'user@gardensphere.com',
    password: 'User@123',
    role: ROLES.USER,
  },
  {
    name: 'Garden Manager',
    email: 'garden.manager@gardensphere.com',
    password: 'Manager@123',
    role: ROLES.GARDEN_MANAGER,
  },
  {
    name: 'Lead Gardener',
    email: 'gardener@gardensphere.com',
    password: 'Gardener@123',
    role: ROLES.GARDENER,
  },
  {
    name: 'Inventory Manager',
    email: 'inventory@gardensphere.com',
    password: 'Inventory@123',
    role: ROLES.INVENTORY_MANAGER,
  },
  {
    name: 'Finance Manager',
    email: 'finance@gardensphere.com',
    password: 'Finance@123',
    role: ROLES.FINANCE_MANAGER,
  },
];

const ensureDemoCustomer = async () => {
  const existing = await User.findOne({ email: 'customer@gardensphere.com' });
  if (existing) return;
  await User.create({
    name: 'Ayesha Silva',
    email: 'customer@gardensphere.com',
    password: 'Customer@123',
    role: ROLES.USER,
    phone: '0771234567',
    address: '12 Garden Lane, Kandy',
  });
  console.log('Demo customer account created.');
};

const seedUsers = async () => {
  const count = await User.countDocuments();

  if (count > 0) {
    console.log(`Users already exist (${count}). Skipping staff seed.`);
    await ensureDemoCustomer();
    return;
  }

  for (const user of demoUsers) {
    await User.create(user);
  }
  await ensureDemoCustomer();
  console.log('Demo users seeded for all GardenSphere roles.');
};

export default seedUsers;
