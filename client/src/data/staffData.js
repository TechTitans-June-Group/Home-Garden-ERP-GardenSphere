export const ROLE_LABELS = {
  admin: 'Admin',
  garden_manager: 'Garden Manager',
  gardener: 'Gardener',
  inventory_manager: 'Inventory Manager',
  finance_manager: 'Finance Manager',
};

export const ROLE_PERMISSIONS = {
  admin: ['Manage Users', 'Manage Roles', 'View System Reports', 'Full system access'],
  garden_manager: [
    'Manage Crops',
    'Manage Irrigation',
    'Manage Fertilizers',
    'Manage Pests/Diseases',
    'Manage Tasks',
    'Manage Harvests',
    'Manage Sales',
    'View Reports',
  ],
  gardener: [
    'View Tasks',
    'Update Tasks',
    'Record Irrigation',
    'Record Maintenance',
    'Report Pest/Disease',
    'Record Harvest',
  ],
  inventory_manager: [
    'Manage Inventory',
    'Manage Purchases',
    'Manage Suppliers',
    'Manage Stock Transactions',
  ],
  finance_manager: ['Manage Expenses', 'Manage Income', 'View Financial Reports'],
};

export const staffAccounts = [
  {
    id: 'u-admin',
    name: 'System Admin',
    email: 'admin@gardensphere.com',
    password: 'Admin@123',
    role: 'admin',
    phone: '0771000001',
    status: 'Active',
  },
  {
    id: 'u-manager',
    name: 'Garden Manager',
    email: 'garden.manager@gardensphere.com',
    password: 'Manager@123',
    role: 'garden_manager',
    phone: '0771000002',
    status: 'Active',
  },
  {
    id: 'u-gardener',
    name: 'Lead Gardener',
    email: 'gardener@gardensphere.com',
    password: 'Gardener@123',
    role: 'gardener',
    phone: '0771000003',
    status: 'Active',
  },
  {
    id: 'u-inventory',
    name: 'Inventory Manager',
    email: 'inventory@gardensphere.com',
    password: 'Inventory@123',
    role: 'inventory_manager',
    phone: '0771000004',
    status: 'Active',
  },
  {
    id: 'u-finance',
    name: 'Finance Manager',
    email: 'finance@gardensphere.com',
    password: 'Finance@123',
    role: 'finance_manager',
    phone: '0771000005',
    status: 'Active',
  },
];

export const initialCrops = [
  { id: 'c1', name: 'Cherry Tomato', variety: 'Sweet 100', location: 'Bed A1', planted: '2026-06-12', quantity: 40, stage: 'Fruiting', status: 'Active' },
  { id: 'c2', name: 'Carrot', variety: 'Nantes', location: 'Bed B2', planted: '2026-06-20', quantity: 80, stage: 'Growing', status: 'Active' },
  { id: 'c3', name: 'Lettuce', variety: 'Butterhead', location: 'Bed C1', planted: '2026-07-15', quantity: 36, stage: 'Ready', status: 'Active' },
  { id: 'c4', name: 'Mint', variety: 'Spearmint', location: 'Herb bed', planted: '2026-05-02', quantity: 18, stage: 'Harvesting', status: 'Active' },
];

export const initialIrrigation = [
  { id: 'i1', crop: 'Cherry Tomato', schedule: 'Every 2 days', time: '06:30', quantity: '8 L', lastDone: '2026-08-18', status: 'Completed' },
  { id: 'i2', crop: 'Lettuce', schedule: 'Daily', time: '07:00', quantity: '5 L', lastDone: '2026-08-19', status: 'Completed' },
  { id: 'i3', crop: 'Carrot', schedule: 'Every 3 days', time: '17:30', quantity: '10 L', lastDone: '2026-08-17', status: 'Due' },
];

export const initialFertilizers = [
  { id: 'f1', name: 'Compost mix', crop: 'Cherry Tomato', date: '2026-08-10', quantity: '4 KG', cost: 800, status: 'Applied' },
  { id: 'f2', name: 'Organic liquid feed', crop: 'Lettuce', date: '2026-08-14', quantity: '2 L', cost: 450, status: 'Applied' },
  { id: 'f3', name: 'Bone meal', crop: 'Carrot', date: '2026-08-05', quantity: '1 KG', cost: 600, status: 'Scheduled' },
];

export const initialPests = [
  { id: 'p1', issue: 'Aphids', crop: 'Cherry Tomato', severity: 'Medium', date: '2026-08-16', treatment: 'Neem spray', status: 'In Progress' },
  { id: 'p2', issue: 'Leaf spot', crop: 'Lettuce', severity: 'Low', date: '2026-08-12', treatment: 'Remove affected leaves', status: 'Resolved' },
];

export const initialTasks = [
  { id: 't1', title: 'Water tomato beds', assignee: 'Lead Gardener', priority: 'High', due: '2026-08-19', status: 'In Progress' },
  { id: 't2', title: 'Harvest lettuce', assignee: 'Lead Gardener', priority: 'High', due: '2026-08-20', status: 'Assigned' },
  { id: 't3', title: 'Check chili pests', assignee: 'Lead Gardener', priority: 'Medium', due: '2026-08-21', status: 'Pending' },
  { id: 't4', title: 'Prepare compost', assignee: 'Lead Gardener', priority: 'Low', due: '2026-08-22', status: 'Completed' },
];

export const initialHarvests = [
  { id: 'h1', crop: 'Cherry Tomato', date: '2026-08-18', quantity: 8, unit: 'KG', grade: 'Grade A', location: 'Bed A1' },
  { id: 'h2', crop: 'Strawberry', date: '2026-08-16', quantity: 4, unit: 'Box', grade: 'Premium', location: 'Fruit bed' },
  { id: 'h3', crop: 'Mint', date: '2026-08-19', quantity: 12, unit: 'Bunch', grade: 'Grade A', location: 'Herb bed' },
];

export const initialSales = [
  { id: 's1', product: 'Cherry Tomatoes', customer: 'Ayesha Silva', date: '2026-08-18', quantity: 2, amount: 700, status: 'Pending' },
  { id: 's2', product: 'Green Lettuce', customer: 'Kasun Fernando', date: '2026-08-16', quantity: 3, amount: 540, status: 'Confirmed' },
  { id: 's3', product: 'Strawberries', customer: 'Ishara Jayawardena', date: '2026-08-12', quantity: 1, amount: 890, status: 'Completed' },
];

export const initialInventory = [
  { id: 'inv1', item: 'Tomato seeds', category: 'Seeds', stock: 24, minStock: 10, unit: 'Pack', value: 3600 },
  { id: 'inv2', item: 'Organic compost', category: 'Soil', stock: 8, minStock: 12, unit: 'Bag', value: 6400 },
  { id: 'inv3', item: 'Neem oil', category: 'Pesticides', stock: 6, minStock: 4, unit: 'Bottle', value: 2700 },
  { id: 'inv4', item: 'Garden trowel', category: 'Tools', stock: 5, minStock: 3, unit: 'Pcs', value: 2500 },
];

export const initialSuppliers = [
  { id: 'sup1', name: 'GreenSeed Lanka', contact: '0712223344', email: 'sales@greenseed.lk', category: 'Seeds', status: 'Active' },
  { id: 'sup2', name: 'Eco Compost Co.', contact: '0778899001', email: 'hello@ecocompost.lk', category: 'Soil', status: 'Active' },
  { id: 'sup3', name: 'Farm Tools Kandy', contact: '0812221111', email: 'tools@ftk.lk', category: 'Tools', status: 'Active' },
];

export const initialPurchases = [
  { id: 'pur1', item: 'Tomato seeds', supplier: 'GreenSeed Lanka', date: '2026-08-04', quantity: 10, amount: 1500, status: 'Received' },
  { id: 'pur2', item: 'Organic compost', supplier: 'Eco Compost Co.', date: '2026-08-11', quantity: 6, amount: 4800, status: 'Received' },
  { id: 'pur3', item: 'Drip pipes', supplier: 'Farm Tools Kandy', date: '2026-08-17', quantity: 20, amount: 3200, status: 'Ordered' },
];

export const initialStock = [
  { id: 'st1', item: 'Tomato seeds', type: 'Stock In', quantity: 10, date: '2026-08-04', note: 'New purchase' },
  { id: 'st2', item: 'Organic compost', type: 'Stock Out', quantity: 2, date: '2026-08-15', note: 'Used in Bed B2' },
  { id: 'st3', item: 'Neem oil', type: 'Stock Out', quantity: 1, date: '2026-08-16', note: 'Aphid treatment' },
];

export const initialExpenses = [
  { id: 'e1', category: 'Seeds', description: 'Tomato seed packs', date: '2026-08-04', amount: 1500, method: 'Cash' },
  { id: 'e2', category: 'Fertilizers', description: 'Compost bags', date: '2026-08-11', amount: 4800, method: 'Bank' },
  { id: 'e3', category: 'Water', description: 'Monthly water bill', date: '2026-08-01', amount: 2200, method: 'Bank' },
  { id: 'e4', category: 'Tools', description: 'Replacement trowel', date: '2026-08-09', amount: 650, method: 'Cash' },
];

export const initialIncome = [
  { id: 'in1', category: 'Vegetable sales', description: 'Cherry tomatoes', date: '2026-08-18', amount: 700, method: 'Cash' },
  { id: 'in2', category: 'Vegetable sales', description: 'Lettuce bunches', date: '2026-08-16', amount: 540, method: 'Card' },
  { id: 'in3', category: 'Fruit sales', description: 'Strawberry box', date: '2026-08-12', amount: 890, method: 'Cash' },
];

export const initialMaintenance = [
  { id: 'm1', activity: 'Mulching tomato beds', date: '2026-08-15', notes: 'Used dry leaves and compost', status: 'Done' },
  { id: 'm2', activity: 'Stake chili plants', date: '2026-08-17', notes: 'Added bamboo stakes', status: 'Done' },
];
