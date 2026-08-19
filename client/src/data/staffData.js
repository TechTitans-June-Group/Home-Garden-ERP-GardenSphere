export const ROLE_LABELS = {
  admin: 'Admin',
  garden_manager: 'Garden Manager',
  gardener: 'Gardener',
  inventory_manager: 'Inventory Manager',
  finance_manager: 'Finance Manager',
};

export const ALL_PERMISSIONS = [
  'Full system access',
  'Manage Users',
  'Manage Roles',
  'Manage Permissions',
  'Reset Passwords',
  'View User Activity',
  'View System Reports',
  'Manage Crops',
  'Manage Irrigation',
  'Manage Fertilizers',
  'Manage Pests/Diseases',
  'Manage Tasks',
  'Manage Harvests',
  'Manage Sales',
  'View Reports',
  'View Tasks',
  'Update Tasks',
  'Record Irrigation',
  'Record Maintenance',
  'Report Pest/Disease',
  'Record Harvest',
  'Crop Updates',
  'Manage Inventory',
  'Manage Purchases',
  'Manage Suppliers',
  'Manage Stock Transactions',
  'Manage Expenses',
  'Manage Income',
  'View Financial Reports',
];

export const ROLE_PERMISSIONS = {
  admin: ['Manage Users', 'Manage Roles', 'Manage Permissions', 'Reset Passwords', 'View User Activity', 'View System Reports', 'Full system access'],
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
    'Crop Updates',
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
    lastLogin: '2026-08-19T08:12:00',
  },
  {
    id: 'u-manager',
    name: 'Garden Manager',
    email: 'garden.manager@gardensphere.com',
    password: 'Manager@123',
    role: 'garden_manager',
    phone: '0771000002',
    status: 'Active',
    lastLogin: '2026-08-19T07:40:00',
  },
  {
    id: 'u-gardener',
    name: 'Lead Gardener',
    email: 'gardener@gardensphere.com',
    password: 'Gardener@123',
    role: 'gardener',
    phone: '0771000003',
    status: 'Active',
    lastLogin: '2026-08-19T06:55:00',
  },
  {
    id: 'u-inventory',
    name: 'Inventory Manager',
    email: 'inventory@gardensphere.com',
    password: 'Inventory@123',
    role: 'inventory_manager',
    phone: '0771000004',
    status: 'Active',
    lastLogin: '2026-08-18T16:20:00',
  },
  {
    id: 'u-finance',
    name: 'Finance Manager',
    email: 'finance@gardensphere.com',
    password: 'Finance@123',
    role: 'finance_manager',
    phone: '0771000005',
    status: 'Active',
    lastLogin: '2026-08-18T11:05:00',
  },
];

export const initialActivity = [
  {
    id: 'act-1',
    time: '2026-08-19T08:12:00',
    actorName: 'System Admin',
    actorId: 'u-admin',
    userName: 'System Admin',
    userId: 'u-admin',
    action: 'Logged in',
    detail: 'Signed in to the Admin portal.',
  },
  {
    id: 'act-2',
    time: '2026-08-19T07:40:00',
    actorName: 'Garden Manager',
    actorId: 'u-manager',
    userName: 'Garden Manager',
    userId: 'u-manager',
    action: 'Logged in',
    detail: 'Signed in to the Garden Manager portal.',
  },
  {
    id: 'act-3',
    time: '2026-08-18T15:22:00',
    actorName: 'System Admin',
    actorId: 'u-admin',
    userName: 'Lead Gardener',
    userId: 'u-gardener',
    action: 'Assigned role',
    detail: 'Role set to Gardener.',
  },
  {
    id: 'act-4',
    time: '2026-08-18T14:10:00',
    actorName: 'System Admin',
    actorId: 'u-admin',
    userName: 'Inventory Manager',
    userId: 'u-inventory',
    action: 'Updated user',
    detail: 'Phone number was updated.',
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
  {
    id: 't1',
    title: 'Water tomato plants',
    description: 'Water cherry tomato beds in the morning, focusing on Bed A1.',
    assigneeId: 'u-gardener',
    assignee: 'Lead Gardener',
    priority: 'High',
    due: '2026-08-19',
    status: 'In Progress',
    completedAt: null,
    createdAt: '2026-08-18T07:00:00',
    comments: [
      {
        id: 'c1',
        text: 'Beds A1 and A2 are done. A3 still needs water.',
        authorId: 'u-gardener',
        authorName: 'Lead Gardener',
        createdAt: '2026-08-19T07:15:00',
      },
    ],
    history: [
      { id: 'h3', at: '2026-08-19T06:40:00', actorName: 'Lead Gardener', action: 'Status updated', detail: 'Assigned → In Progress' },
      { id: 'h2', at: '2026-08-18T07:05:00', actorName: 'Garden Manager', action: 'Assigned', detail: 'Assigned to Lead Gardener' },
      { id: 'h1', at: '2026-08-18T07:00:00', actorName: 'Garden Manager', action: 'Created', detail: 'Task created' },
    ],
  },
  {
    id: 't2',
    title: 'Apply fertilizer',
    description: 'Apply compost mix around fruiting tomato plants after watering.',
    assigneeId: 'u-gardener',
    assignee: 'Lead Gardener',
    priority: 'Medium',
    due: '2026-08-20',
    status: 'Assigned',
    completedAt: null,
    createdAt: '2026-08-18T09:00:00',
    comments: [],
    history: [
      { id: 'h5', at: '2026-08-18T09:01:00', actorName: 'Garden Manager', action: 'Assigned', detail: 'Assigned to Lead Gardener' },
      { id: 'h4', at: '2026-08-18T09:00:00', actorName: 'Garden Manager', action: 'Created', detail: 'Task created' },
    ],
  },
  {
    id: 't3',
    title: 'Remove weeds',
    description: 'Clear weeds from carrot and lettuce beds before they seed.',
    assigneeId: 'u-gardener',
    assignee: 'Lead Gardener',
    priority: 'Medium',
    due: '2026-08-21',
    status: 'Assigned',
    completedAt: null,
    createdAt: '2026-08-18T10:00:00',
    comments: [],
    history: [
      { id: 'h7', at: '2026-08-18T10:02:00', actorName: 'Garden Manager', action: 'Assigned', detail: 'Assigned to Lead Gardener' },
      { id: 'h6', at: '2026-08-18T10:00:00', actorName: 'Garden Manager', action: 'Created', detail: 'Task created' },
    ],
  },
  {
    id: 't4',
    title: 'Inspect plants',
    description: 'Walk all beds and note pests, yellowing leaves, or irrigation issues.',
    assigneeId: 'u-gardener',
    assignee: 'Lead Gardener',
    priority: 'High',
    due: '2026-08-19',
    status: 'Assigned',
    completedAt: null,
    createdAt: '2026-08-18T11:00:00',
    comments: [],
    history: [
      { id: 'h9', at: '2026-08-18T11:02:00', actorName: 'Garden Manager', action: 'Assigned', detail: 'Assigned to Lead Gardener' },
      { id: 'h8', at: '2026-08-18T11:00:00', actorName: 'Garden Manager', action: 'Created', detail: 'Task created' },
    ],
  },
  {
    id: 't5',
    title: 'Apply pest treatment',
    description: 'Spray neem oil on tomato plants showing aphids.',
    assigneeId: 'u-gardener',
    assignee: 'Lead Gardener',
    priority: 'High',
    due: '2026-08-20',
    status: 'In Progress',
    completedAt: null,
    createdAt: '2026-08-17T16:00:00',
    comments: [
      {
        id: 'c2',
        text: 'Neem mix is ready. Treating Bed A1 next.',
        authorId: 'u-gardener',
        authorName: 'Lead Gardener',
        createdAt: '2026-08-19T08:00:00',
      },
    ],
    history: [
      { id: 'h12', at: '2026-08-19T07:50:00', actorName: 'Lead Gardener', action: 'Status updated', detail: 'Assigned → In Progress' },
      { id: 'h11', at: '2026-08-17T16:05:00', actorName: 'Garden Manager', action: 'Assigned', detail: 'Assigned to Lead Gardener' },
      { id: 'h10', at: '2026-08-17T16:00:00', actorName: 'Garden Manager', action: 'Created', detail: 'Task created' },
    ],
  },
  {
    id: 't6',
    title: 'Prepare soil',
    description: 'Loosen soil and mix compost into the empty herb bed before replanting mint.',
    assigneeId: '',
    assignee: '',
    priority: 'Low',
    due: '2026-08-23',
    status: 'Pending',
    completedAt: null,
    createdAt: '2026-08-19T08:30:00',
    comments: [],
    history: [{ id: 'h13', at: '2026-08-19T08:30:00', actorName: 'Garden Manager', action: 'Created', detail: 'Task created' }],
  },
  {
    id: 't7',
    title: 'Harvest vegetables',
    description: 'Harvest ready lettuce and grade it before sending to sales.',
    assigneeId: 'u-gardener',
    assignee: 'Lead Gardener',
    priority: 'High',
    due: '2026-08-20',
    status: 'Assigned',
    completedAt: null,
    createdAt: '2026-08-19T06:00:00',
    comments: [],
    history: [
      { id: 'h15', at: '2026-08-19T06:05:00', actorName: 'Garden Manager', action: 'Assigned', detail: 'Assigned to Lead Gardener' },
      { id: 'h14', at: '2026-08-19T06:00:00', actorName: 'Garden Manager', action: 'Created', detail: 'Task created' },
    ],
  },
  {
    id: 't8',
    title: 'Clean tools',
    description: 'Wash, dry, and store trowels, shears, and watering cans after field work.',
    assigneeId: 'u-gardener',
    assignee: 'Lead Gardener',
    priority: 'Low',
    due: '2026-08-18',
    status: 'Completed',
    completedAt: '2026-08-18T17:20:00',
    createdAt: '2026-08-18T08:00:00',
    comments: [
      {
        id: 'c3',
        text: 'All tools cleaned and returned to the shed.',
        authorId: 'u-gardener',
        authorName: 'Lead Gardener',
        createdAt: '2026-08-18T17:15:00',
      },
    ],
    history: [
      { id: 'h19', at: '2026-08-18T17:20:00', actorName: 'Lead Gardener', action: 'Status updated', detail: 'In Progress → Completed' },
      { id: 'h18', at: '2026-08-18T16:00:00', actorName: 'Lead Gardener', action: 'Status updated', detail: 'Assigned → In Progress' },
      { id: 'h17', at: '2026-08-18T08:02:00', actorName: 'System Admin', action: 'Assigned', detail: 'Assigned to Lead Gardener' },
      { id: 'h16', at: '2026-08-18T08:00:00', actorName: 'System Admin', action: 'Created', detail: 'Task created' },
    ],
  },
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
