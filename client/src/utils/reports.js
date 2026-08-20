import { formatPrice } from './format.js';

export const toNumber = (value) => {
  const amount = Number(String(value).replace(/[^\d.-]/g, ''));
  return Number.isFinite(amount) ? amount : 0;
};

export const isReadyCrop = (crop) =>
  ['Ready', 'Harvesting'].includes(crop.stage) && (crop.status || 'Active') !== 'Inactive';

export const isLowStock = (item) =>
  (item.status || 'Available') !== 'Inactive' && toNumber(item.stock) <= toNumber(item.minStock);

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const sumBy = (items, pickAmount, pickKey) => {
  const map = new Map();
  items.forEach((item) => {
    const key = pickKey(item) || 'Unspecified';
    map.set(key, (map.get(key) || 0) + pickAmount(item));
  });
  return [...map.entries()].map(([label, amount]) => ({ label, amount }));
};

export const buildKpis = ({ crops, tasks, inventory, harvests, expenses, income }) => {
  const cropList = crops.items || crops;
  const taskList = tasks.items || tasks;
  const inventoryList = inventory.items || inventory;
  const harvestList = harvests.items || harvests;
  const expenseList = expenses.items || expenses;
  const incomeList = income.items || income;

  const totalPlants = cropList.reduce((sum, crop) => sum + toNumber(crop.quantity), 0);
  const activeCrops = cropList.filter((crop) => (crop.status || 'Active') === 'Active').length;
  const readyCrops = cropList.filter(isReadyCrop).length;
  const pendingTasks = taskList.filter((task) => task.status === 'Pending').length;
  const completedTasks = taskList.filter((task) => task.status === 'Completed').length;
  const lowStockItems = inventoryList.filter(isLowStock).length;
  const inventoryValue = inventoryList.reduce((sum, item) => sum + toNumber(item.value), 0);
  const totalHarvest = harvestList.reduce((sum, item) => sum + toNumber(item.quantity), 0);
  const harvestValue = harvestList.reduce((sum, item) => sum + toNumber(item.totalValue), 0);
  const totalExpenses = expenseList.reduce((sum, item) => sum + toNumber(item.amount), 0);
  const totalIncome = incomeList.reduce((sum, item) => sum + toNumber(item.amount), 0);

  return {
    totalPlants,
    activeCrops,
    readyCrops,
    pendingTasks,
    completedTasks,
    lowStockItems,
    inventoryValue,
    totalHarvest,
    harvestValue,
    totalExpenses,
    totalIncome,
    netProfit: totalIncome - totalExpenses,
    taskTotal: taskList.length,
  };
};

export const KPI_CARDS = [
  { key: 'totalPlants', label: 'Total Plants', scopes: ['full', 'garden'], format: 'number', tint: 'bg-emerald-100 text-emerald-700' },
  { key: 'activeCrops', label: 'Active Crops', scopes: ['full', 'garden'], format: 'number', tint: 'bg-lime-100 text-lime-700' },
  { key: 'readyCrops', label: 'Crops Ready for Harvest', scopes: ['full', 'garden'], format: 'number', tint: 'bg-yellow-100 text-yellow-800' },
  { key: 'pendingTasks', label: 'Pending Tasks', scopes: ['full', 'garden'], format: 'number', tint: 'bg-amber-100 text-amber-800' },
  { key: 'completedTasks', label: 'Completed Tasks', scopes: ['full', 'garden'], format: 'number', tint: 'bg-sky-100 text-sky-800' },
  { key: 'lowStockItems', label: 'Low Stock Items', scopes: ['full', 'garden', 'inventory'], format: 'number', tint: 'bg-red-100 text-red-700' },
  { key: 'inventoryValue', label: 'Total Inventory Value', scopes: ['full', 'garden', 'inventory'], format: 'money', tint: 'bg-teal-100 text-teal-800' },
  { key: 'totalHarvest', label: 'Total Harvest', scopes: ['full', 'garden', 'finance'], format: 'harvest', tint: 'bg-orange-100 text-orange-800' },
  { key: 'harvestValue', label: 'Harvest Value', scopes: ['full', 'garden'], format: 'money', tint: 'bg-yellow-100 text-yellow-800' },
  { key: 'totalExpenses', label: 'Total Expenses', scopes: ['full', 'garden', 'finance'], format: 'money', tint: 'bg-rose-100 text-rose-700' },
  { key: 'totalIncome', label: 'Total Income', scopes: ['full', 'garden', 'finance'], format: 'money', tint: 'bg-emerald-100 text-emerald-800' },
  { key: 'netProfit', label: 'Net Profit', scopes: ['full', 'garden', 'finance'], format: 'money', tint: 'bg-green-100 text-green-800' },
];

export const formatKpi = (card, kpis) => {
  const value = kpis[card.key];
  if (card.format === 'money') return formatPrice(value);
  if (card.format === 'harvest') return `${value} units`;
  return String(value);
};

export const REPORT_CATALOG = [
  { id: 'crop', title: 'Crop Productivity Report', scopes: ['full', 'garden'] },
  { id: 'harvest', title: 'Harvest Report', scopes: ['full', 'garden'] },
  { id: 'inventory', title: 'Inventory Report', scopes: ['full', 'garden', 'inventory'] },
  { id: 'irrigation', title: 'Irrigation Report', scopes: ['full', 'garden'] },
  { id: 'fertilizer', title: 'Fertilizer Usage Report', scopes: ['full', 'garden'] },
  { id: 'pest', title: 'Pest & Disease Report', scopes: ['full', 'garden'] },
  { id: 'tasks', title: 'Task Completion Report', scopes: ['full', 'garden'] },
  { id: 'expense', title: 'Expense Report', scopes: ['full', 'garden', 'finance'] },
  { id: 'income', title: 'Income Report', scopes: ['full', 'garden', 'finance'] },
  { id: 'profit', title: 'Profit/Loss Report', scopes: ['full', 'garden', 'finance'] },
  { id: 'monthly', title: 'Monthly Performance Report', scopes: ['full', 'garden', 'finance'] },
  { id: 'yearly', title: 'Yearly Performance Report', scopes: ['full', 'garden', 'finance'] },
];

export const buildReport = (id, data) => {
  const crops = data.crops.items;
  const harvests = data.harvests.items;
  const inventory = data.inventory.items;
  const irrigation = data.irrigation.items;
  const fertilizers = data.fertilizers.items;
  const pests = data.pests.items;
  const tasks = data.tasks.items;
  const expenses = data.expenses.items;
  const income = data.income.items;
  const kpis = buildKpis(data);

  if (id === 'crop') {
    const harvestByCrop = sumBy(harvests, (item) => toNumber(item.quantity), (item) => item.crop);
    const harvestMap = Object.fromEntries(harvestByCrop.map((row) => [row.label, row.amount]));
    return {
      columns: ['Crop', 'Variety', 'Location', 'Plants', 'Stage', 'Status', 'Harvest qty'],
      rows: crops.map((crop) => [
        crop.name,
        crop.variety,
        crop.location,
        crop.quantity,
        crop.stage,
        crop.status,
        harvestMap[crop.name] || 0,
      ]),
      summary: `${kpis.activeCrops} active crops · ${kpis.totalPlants} plants · ${kpis.readyCrops} ready for harvest`,
      bar: { title: 'Plants by crop', data: crops.map((crop) => ({ label: crop.name, value: toNumber(crop.quantity) })) },
      pie: { title: 'Crops by stage', data: sumBy(crops, () => 1, (crop) => crop.stage) },
    };
  }

  if (id === 'harvest') {
    const harvestValueTotal = harvests.reduce((sum, item) => sum + toNumber(item.totalValue), 0);
    const byCrop = sumBy(harvests, (item) => toNumber(item.quantity), (item) => item.crop);
    const byGrade = sumBy(harvests, (item) => toNumber(item.quantity), (item) => item.grade);
    return {
      columns: ['Date', 'Crop', 'Quantity', 'Unit', 'Grade', 'Location', 'Selling price', 'Total value', 'Sales'],
      rows: harvests.map((item) => [
        item.date,
        item.crop,
        item.quantity,
        item.unit,
        item.grade,
        item.location,
        `${formatPrice(item.unitPrice || 0)}/${item.unit || 'unit'}`,
        formatPrice(item.totalValue || 0),
        item.saleStatus || 'Unlinked',
      ]),
      extra: byCrop.map((row) => [row.label, row.amount]),
      extraTitle: 'Quantity by crop',
      extraColumns: ['Crop', 'Quantity'],
      summary: `${harvests.length} harvest records · ${kpis.totalHarvest} units · ${formatPrice(harvestValueTotal)}`,
      bar: { title: 'Harvest quantity by crop', data: byCrop.map((row) => ({ label: row.label, value: row.amount })) },
      pie: { title: 'Harvest by grade', data: byGrade.map((row) => ({ label: row.label, value: row.amount })) },
    };
  }

  if (id === 'inventory') {
    return {
      columns: ['Item', 'Category', 'Stock', 'Min stock', 'Unit', 'Value', 'Stock status'],
      rows: inventory.map((item) => [
        item.item,
        item.category,
        item.stock,
        item.minStock,
        item.unit,
        formatPrice(item.value),
        isLowStock(item) ? item.status || 'Low stock' : item.status || 'OK',
      ]),
      summary: `${inventory.length} items · ${kpis.lowStockItems} low stock · value ${formatPrice(kpis.inventoryValue)}`,
      bar: { title: 'Stock by item', data: inventory.map((item) => ({ label: item.item, value: toNumber(item.stock) })) },
      pie: { title: 'Value by category', data: sumBy(inventory, (item) => toNumber(item.value), (item) => item.category) },
    };
  }

  if (id === 'irrigation') {
    const due = irrigation.filter((item) => item.status === 'Due').length;
    return {
      columns: ['Crop', 'Schedule', 'Time', 'Quantity', 'Last done', 'Status'],
      rows: irrigation.map((item) => [item.crop, item.schedule, item.time, item.quantity, item.lastDone, item.status]),
      summary: `${irrigation.length} schedules · ${due} currently due`,
      bar: { title: 'Schedules by crop', data: sumBy(irrigation, () => 1, (item) => item.crop) },
      pie: { title: 'Irrigation status', data: sumBy(irrigation, () => 1, (item) => item.status) },
    };
  }

  if (id === 'fertilizer') {
    const totalCost = fertilizers.reduce((sum, item) => sum + toNumber(item.cost), 0);
    return {
      columns: ['Fertilizer', 'Crop', 'Date', 'Quantity', 'Cost', 'Status'],
      rows: fertilizers.map((item) => [item.name, item.crop, item.date, item.quantity, formatPrice(item.cost), item.status]),
      summary: `${fertilizers.length} applications · total cost ${formatPrice(totalCost)}`,
      bar: { title: 'Cost by fertilizer', data: sumBy(fertilizers, (item) => toNumber(item.cost), (item) => item.name) },
      pie: { title: 'Usage status', data: sumBy(fertilizers, () => 1, (item) => item.status) },
    };
  }

  if (id === 'pest') {
    const open = pests.filter((item) => item.status !== 'Resolved').length;
    return {
      columns: ['Issue', 'Crop', 'Severity', 'Detected', 'Treatment', 'Status'],
      rows: pests.map((item) => [item.issue, item.crop, item.severity, item.date, item.treatment, item.status]),
      summary: `${pests.length} incidents · ${open} still open`,
      bar: { title: 'Incidents by crop', data: sumBy(pests, () => 1, (item) => item.crop) },
      pie: { title: 'By severity', data: sumBy(pests, () => 1, (item) => item.severity) },
    };
  }

  if (id === 'tasks') {
    const rate = tasks.length ? Math.round((kpis.completedTasks / tasks.length) * 100) : 0;
    return {
      columns: ['Task', 'Assignee', 'Priority', 'Due date', 'Status', 'Completed'],
      rows: tasks.map((item) => [
        item.title,
        item.assignee || 'Unassigned',
        item.priority,
        item.due || '—',
        item.status,
        item.completedAt ? String(item.completedAt).slice(0, 10) : '—',
      ]),
      summary: `${kpis.completedTasks}/${tasks.length} completed (${rate}%) · ${kpis.pendingTasks} pending`,
      bar: { title: 'Tasks by priority', data: sumBy(tasks, () => 1, (item) => item.priority) },
      pie: { title: 'Tasks by status', data: sumBy(tasks, () => 1, (item) => item.status) },
    };
  }

  if (id === 'expense') {
    const byCategory = sumBy(expenses, (item) => toNumber(item.amount), (item) => item.category);
    return {
      columns: ['Date', 'Category', 'Description', 'Amount', 'Method'],
      rows: expenses.map((item) => [item.date, item.category, item.description, formatPrice(item.amount), item.method]),
      extra: byCategory.map((row) => [row.label, formatPrice(row.amount)]),
      extraTitle: 'By category',
      extraColumns: ['Category', 'Amount'],
      summary: `${expenses.length} expense records · ${formatPrice(kpis.totalExpenses)}`,
      bar: { title: 'Expenses by category', data: byCategory },
      pie: { title: 'Share by category', data: byCategory },
    };
  }

  if (id === 'income') {
    const byCategory = sumBy(income, (item) => toNumber(item.amount), (item) => item.category);
    return {
      columns: ['Date', 'Category', 'Description', 'Amount', 'Method'],
      rows: income.map((item) => [item.date, item.category, item.description, formatPrice(item.amount), item.method]),
      extra: byCategory.map((row) => [row.label, formatPrice(row.amount)]),
      extraTitle: 'By category',
      extraColumns: ['Category', 'Amount'],
      summary: `${income.length} income records · ${formatPrice(kpis.totalIncome)}`,
      bar: { title: 'Income by category', data: byCategory },
      pie: { title: 'Share by category', data: byCategory },
    };
  }

  if (id === 'profit') {
    return {
      columns: ['Metric', 'Amount'],
      rows: [
        ['Total income', formatPrice(kpis.totalIncome)],
        ['Total expenses', formatPrice(kpis.totalExpenses)],
        ['Net profit / loss', formatPrice(kpis.netProfit)],
      ],
      summary: `Net Profit = Total Income − Total Expenses · ${formatPrice(kpis.netProfit)}`,
      bar: {
        title: 'Income vs expenses',
        data: [
          { label: 'Income', value: kpis.totalIncome, color: '#16A34A' },
          { label: 'Expenses', value: kpis.totalExpenses, color: '#F97316' },
          { label: 'Net', value: Math.abs(kpis.netProfit), color: kpis.netProfit >= 0 ? '#84CC16' : '#EF4444' },
        ],
      },
      pie: {
        title: 'Money split',
        data: [
          { label: 'Income', value: kpis.totalIncome, color: '#16A34A' },
          { label: 'Expenses', value: kpis.totalExpenses, color: '#F97316' },
        ],
      },
    };
  }

  if (id === 'monthly' || id === 'yearly') {
    const buckets = new Map();
    const periodOf = (value) => {
      const date = parseDate(value);
      if (!date) return { key: '0000-00', label: 'Unknown' };
      if (id === 'yearly') {
        return { key: String(date.getFullYear()), label: String(date.getFullYear()) };
      }
      return {
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        label: date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
      };
    };
    const touch = (value) => {
      const period = periodOf(value);
      if (!buckets.has(period.key)) {
        buckets.set(period.key, { label: period.label, harvest: 0, tasks: 0, income: 0, expenses: 0 });
      }
      return buckets.get(period.key);
    };
    harvests.forEach((item) => {
      touch(item.date).harvest += toNumber(item.quantity);
    });
    tasks.forEach((item) => {
      if (item.status === 'Completed') touch((item.completedAt || item.due || '').slice(0, 10)).tasks += 1;
    });
    income.forEach((item) => {
      touch(item.date).income += toNumber(item.amount);
    });
    expenses.forEach((item) => {
      touch(item.date).expenses += toNumber(item.amount);
    });
    const rows = [...buckets.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([, values]) => [
        values.label,
        values.harvest,
        values.tasks,
        formatPrice(values.income),
        formatPrice(values.expenses),
        formatPrice(values.income - values.expenses),
      ]);
    return {
      columns: [id === 'monthly' ? 'Month' : 'Year', 'Harvest qty', 'Tasks completed', 'Income', 'Expenses', 'Net'],
      rows,
      summary: `${rows.length} ${id === 'monthly' ? 'months' : 'years'} recorded`,
      bar: {
        title: `${id === 'monthly' ? 'Monthly' : 'Yearly'} income`,
        data: [...buckets.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([, values]) => ({
          label: values.label,
          value: values.income,
        })),
      },
      pie: {
        title: 'Income vs expenses',
        data: [
          { label: 'Income', value: kpis.totalIncome, color: '#16A34A' },
          { label: 'Expenses', value: kpis.totalExpenses, color: '#F97316' },
        ],
      },
    };
  }

  return { columns: [], rows: [], summary: '' };
};

export const downloadCsv = (title, report) => {
  const lines = [];
  lines.push(report.columns.join(','));
  report.rows.forEach((row) => {
    lines.push(row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','));
  });
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title.replace(/\s+/g, '-').toLowerCase()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};
