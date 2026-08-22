import {
  BadgeDollarSign,
  Bug,
  ClipboardList,
  Droplets,
  FlaskConical,
  LayoutDashboard,
  History,
  Leaf,
  Mail,
  Package,
  PieChart,
  ShoppingCart,
  Sprout,
  Truck,
  Users,
  Wallet,
  Warehouse,
  Wheat,
} from 'lucide-react';

export const staffMenus = {
  admin: [
    {
      group: 'MAIN',
      items: [{ to: '/staff', label: 'Overview', icon: LayoutDashboard, end: true }],
    },
    {
      group: 'PEOPLE',
      items: [
        { to: '/staff/users', label: 'Users', icon: Users },
        { to: '/staff/roles', label: 'Roles', icon: ClipboardList },
        { to: '/staff/activity', label: 'User Activity', icon: History },
        { to: '/staff/messages', label: 'Messages', icon: Mail },
      ],
    },
    {
      group: 'GARDEN',
      items: [
        { to: '/staff/crops', label: 'Crops', icon: Sprout },
        { to: '/staff/irrigation', label: 'Irrigation', icon: Droplets },
        { to: '/staff/fertilizers', label: 'Fertilizers', icon: FlaskConical },
        { to: '/staff/pests', label: 'Pests / Diseases', icon: Bug },
      ],
    },
    {
      group: 'FIELD WORK',
      items: [
        { to: '/staff/record-irrigation', label: 'Irrigation Log', icon: Droplets },
        { to: '/staff/maintenance', label: 'Maintenance', icon: Leaf },
        { to: '/staff/report-pest', label: 'Pest Report', icon: Bug },
        { to: '/staff/record-harvest', label: 'Harvest', icon: Wheat },
      ],
    },
    {
      group: 'OPERATIONS',
      items: [
        { to: '/staff/tasks', label: 'Tasks', icon: ClipboardList },
        { to: '/staff/harvests', label: 'Harvests', icon: Wheat },
        { to: '/staff/sales', label: 'Sales', icon: ShoppingCart },
        { to: '/staff/harvest-reports', label: 'Harvest Reports', icon: PieChart },
        { to: '/staff/reports', label: 'System Reports', icon: PieChart },
      ],
    },
    {
      group: 'SUPPLY',
      items: [
        { to: '/staff/inventory', label: 'Inventory', icon: Warehouse },
        { to: '/staff/purchases', label: 'Purchases', icon: Package },
        { to: '/staff/suppliers', label: 'Suppliers', icon: Truck },
        { to: '/staff/stock', label: 'Stock Moves', icon: ClipboardList },
        { to: '/staff/inventory-reports', label: 'Inventory Reports', icon: PieChart },
      ],
    },
    {
      group: 'FINANCE',
      items: [
        { to: '/staff/expenses', label: 'Expenses', icon: Wallet },
        { to: '/staff/income', label: 'Income', icon: BadgeDollarSign },
        { to: '/staff/finance-reports', label: 'Reports', icon: PieChart },
      ],
    },
  ],
  garden_manager: [
    {
      group: 'MAIN',
      items: [{ to: '/staff', label: 'Overview', icon: LayoutDashboard, end: true }],
    },
    {
      group: 'PEOPLE',
      items: [{ to: '/staff/messages', label: 'Messages', icon: Mail }],
    },
    {
      group: 'GARDEN',
      items: [
        { to: '/staff/crops', label: 'Crops', icon: Sprout },
        { to: '/staff/irrigation', label: 'Irrigation', icon: Droplets },
        { to: '/staff/fertilizers', label: 'Fertilizers', icon: FlaskConical },
        { to: '/staff/pests', label: 'Pests / Diseases', icon: Bug },
      ],
    },
    {
      group: 'SUPPLY',
      items: [
        { to: '/staff/inventory', label: 'Inventory', icon: Warehouse },
        { to: '/staff/purchases', label: 'Purchases', icon: Package },
        { to: '/staff/suppliers', label: 'Suppliers', icon: Truck },
        { to: '/staff/stock', label: 'Stock Moves', icon: ClipboardList },
        { to: '/staff/inventory-reports', label: 'Inventory Reports', icon: PieChart },
      ],
    },
    {
      group: 'FIELD WORK',
      items: [{ to: '/staff/maintenance', label: 'Maintenance', icon: Leaf }],
    },
    {
      group: 'OPERATIONS',
      items: [
        { to: '/staff/tasks', label: 'Tasks', icon: ClipboardList },
        { to: '/staff/harvests', label: 'Harvests', icon: Wheat },
        { to: '/staff/sales', label: 'Sales', icon: ShoppingCart },
        { to: '/staff/harvest-reports', label: 'Harvest Reports', icon: PieChart },
        { to: '/staff/manager-reports', label: 'Reports', icon: PieChart },
      ],
    },
    {
      group: 'FINANCE',
      items: [
        { to: '/staff/expenses', label: 'Expenses', icon: Wallet },
        { to: '/staff/income', label: 'Income', icon: BadgeDollarSign },
        { to: '/staff/finance-reports', label: 'Reports', icon: PieChart },
      ],
    },
  ],
  gardener: [
    {
      group: 'MAIN',
      items: [{ to: '/staff', label: 'Overview', icon: LayoutDashboard, end: true }],
    },
    {
      group: 'FIELD WORK',
      items: [
        { to: '/staff/my-tasks', label: 'My Tasks', icon: ClipboardList },
        { to: '/staff/crops', label: 'Crops', icon: Sprout },
        { to: '/staff/record-irrigation', label: 'Irrigation', icon: Droplets },
        { to: '/staff/maintenance', label: 'Maintenance', icon: Leaf },
        { to: '/staff/report-pest', label: 'Pest Report', icon: Bug },
        { to: '/staff/record-harvest', label: 'Harvest', icon: Wheat },
      ],
    },
  ],
  inventory_manager: [
    {
      group: 'MAIN',
      items: [{ to: '/staff', label: 'Overview', icon: LayoutDashboard, end: true }],
    },
    {
      group: 'SUPPLY',
      items: [
        { to: '/staff/inventory', label: 'Inventory', icon: Warehouse },
        { to: '/staff/purchases', label: 'Purchases', icon: Package },
        { to: '/staff/suppliers', label: 'Suppliers', icon: Truck },
        { to: '/staff/stock', label: 'Stock Moves', icon: ClipboardList },
        { to: '/staff/inventory-reports', label: 'Reports', icon: PieChart },
      ],
    },
  ],
  finance_manager: [
    {
      group: 'MAIN',
      items: [{ to: '/staff', label: 'Overview', icon: LayoutDashboard, end: true }],
    },
    {
      group: 'FINANCE',
      items: [
        { to: '/staff/expenses', label: 'Expenses', icon: Wallet },
        { to: '/staff/income', label: 'Income', icon: BadgeDollarSign },
        { to: '/staff/finance-reports', label: 'Reports', icon: PieChart },
      ],
    },
  ],
};

export const pageTitles = {
  '/staff': 'Overview',
  '/staff/': 'Overview',
  '/staff/users': 'Users',
  '/staff/roles': 'Roles',
  '/staff/activity': 'User Activity',
  '/staff/messages': 'Messages',
  '/staff/reports': 'System Reports',
  '/staff/crops': 'Crops',
  '/staff/irrigation': 'Irrigation',
  '/staff/fertilizers': 'Fertilizers',
  '/staff/pests': 'Pests / Diseases',
  '/staff/tasks': 'Tasks',
  '/staff/harvests': 'Harvests',
  '/staff/sales': 'Sales',
  '/staff/harvest-reports': 'Harvest Reports',
  '/staff/manager-reports': 'Reports',
  '/staff/my-tasks': 'My Tasks',
  '/staff/record-irrigation': 'Irrigation',
  '/staff/maintenance': 'Maintenance',
  '/staff/report-pest': 'Pest Report',
  '/staff/record-harvest': 'Harvest',
  '/staff/inventory': 'Inventory',
  '/staff/purchases': 'Purchases',
  '/staff/suppliers': 'Suppliers',
  '/staff/stock': 'Stock Transactions',
  '/staff/expenses': 'Expenses',
  '/staff/income': 'Income',
  '/staff/finance-reports': 'Financial Reports',
  '/staff/inventory-reports': 'Inventory Reports',
};
