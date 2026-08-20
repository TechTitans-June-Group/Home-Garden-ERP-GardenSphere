import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  initialActivity,
  initialCrops,
  initialFertilizers,
  initialIrrigation,
  initialMaintenance,
  initialPests,
  initialTasks,
  ROLE_LABELS,
  ROLE_PERMISSIONS,
  staffAccounts,
} from '../data/staffData.js';
import { NEXT_TASK_STATUS, normalizeTask } from '../utils/tasks.js';
import { isInventoryLow } from '../utils/inventory.js';
import api from '../services/api.js';
import {
  adjustInventoryStock,
  createInventoryItem,
  deleteInventoryItem,
  deleteInventoryPurchase,
  deleteInventorySupplier,
  fetchInventory,
  moveInventoryStock,
  saveInventoryPurchase,
  saveInventorySupplier,
  updateInventoryItem,
} from '../services/inventoryService.js';
import {
  deleteFinanceCategory,
  deleteFinanceExpense,
  deleteFinanceIncome,
  fetchFinance,
  saveFinanceCategory,
  saveFinanceExpense,
  saveFinanceIncome,
} from '../services/financeService.js';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '../utils/finance.js';
import {
  deleteHarvestRecord,
  deleteHarvestSale,
  fetchHarvestDesk,
  linkHarvestToSale,
  saveHarvestRecord,
  saveHarvestSale,
} from '../services/harvestService.js';
import { HARVEST_CROPS, HARVEST_GRADES, HARVEST_SALE_STATUSES, HARVEST_UNITS } from '../utils/harvest.js';

const KEYS = {
  session: 'gs_staff_session',
  users: 'gs_staff_users',
  permissions: 'gs_staff_permissions',
  activity: 'gs_staff_activity',
  crops: 'gs_staff_crops',
  irrigation: 'gs_staff_irrigation',
  fertilizers: 'gs_staff_fertilizers',
  pests: 'gs_staff_pests',
  tasks: 'gs_staff_tasks_v2',
  harvests: 'gs_staff_harvests_db',
  sales: 'gs_staff_sales_db',
  inventory: 'gs_staff_inventory_db',
  suppliers: 'gs_staff_suppliers_db',
  purchases: 'gs_staff_purchases_db',
  stock: 'gs_staff_stock_db',
  expenses: 'gs_staff_expenses_v2',
  income: 'gs_staff_income_v2',
  maintenance: 'gs_staff_maintenance',
  notifications: 'gs_staff_notifications',
};

const readJson = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const useStore = (key, initial, transform) => {
  const [items, setItems] = useState(() => {
    const raw = readJson(key, initial);
    return transform ? raw.map(transform) : raw;
  });
  useEffect(() => localStorage.setItem(key, JSON.stringify(items)), [key, items]);

  const save = (record) => {
    setItems((prev) => {
      if (record.id && prev.some((item) => item.id === record.id)) {
        return prev.map((item) => (item.id === record.id ? record : item));
      }
      return [{ ...record, id: record.id || `${key}-${Date.now()}` }, ...prev];
    });
  };

  const remove = (id) => setItems((prev) => prev.filter((item) => item.id !== id));
  return { items, setItems, save, remove };
};

const StaffContext = createContext(null);

export const StaffProvider = ({ children }) => {
  const [staff, setStaff] = useState(() => readJson(KEYS.session, null));
  const users = useStore(KEYS.users, staffAccounts);
  const crops = useStore(KEYS.crops, initialCrops);
  const irrigation = useStore(KEYS.irrigation, initialIrrigation);
  const fertilizers = useStore(KEYS.fertilizers, initialFertilizers);
  const pests = useStore(KEYS.pests, initialPests);
  const taskStore = useStore(KEYS.tasks, initialTasks, normalizeTask);
  const harvestStore = useStore(KEYS.harvests, []);
  const saleStore = useStore(KEYS.sales, []);
  const inventoryStore = useStore(KEYS.inventory, []);
  const supplierStore = useStore(KEYS.suppliers, []);
  const purchaseStore = useStore(KEYS.purchases, []);
  const stockStore = useStore(KEYS.stock, []);
  const expenseStore = useStore(KEYS.expenses, []);
  const incomeStore = useStore(KEYS.income, []);
  const maintenance = useStore(KEYS.maintenance, initialMaintenance);
  const [financeCategories, setFinanceCategories] = useState({
    expense: EXPENSE_CATEGORIES,
    income: INCOME_CATEGORIES,
    payment: PAYMENT_METHODS,
    all: [],
  });
  const [financeSummary, setFinanceSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    expenseCount: 0,
    incomeCount: 0,
  });
  const [harvestCrops, setHarvestCrops] = useState(HARVEST_CROPS);
  const [harvestUnits, setHarvestUnits] = useState(HARVEST_UNITS);
  const [harvestGrades, setHarvestGrades] = useState(HARVEST_GRADES);
  const [harvestSaleStatuses, setHarvestSaleStatuses] = useState(HARVEST_SALE_STATUSES);
  const [harvestSummary, setHarvestSummary] = useState({
    harvestCount: 0,
    saleCount: 0,
    totalQuantity: 0,
    totalValue: 0,
    soldValue: 0,
    unsoldCount: 0,
    listedCount: 0,
    soldCount: 0,
  });
  const [permissions, setPermissions] = useState(() => ({
    ...ROLE_PERMISSIONS,
    ...readJson(KEYS.permissions, {}),
  }));
  const [activity, setActivity] = useState(() => readJson(KEYS.activity, initialActivity));
  const [notifications, setNotifications] = useState(() => readJson(KEYS.notifications, []));

  useEffect(() => localStorage.setItem(KEYS.permissions, JSON.stringify(permissions)), [permissions]);
  useEffect(() => localStorage.setItem(KEYS.activity, JSON.stringify(activity)), [activity]);
  useEffect(() => localStorage.setItem(KEYS.notifications, JSON.stringify(notifications)), [notifications]);

  useEffect(() => {
    if (staff) localStorage.setItem(KEYS.session, JSON.stringify(staff));
    else localStorage.removeItem(KEYS.session);
  }, [staff]);

  const logActivity = (payload) => {
    setActivity((prev) =>
      [
        {
          id: `act-${Date.now()}`,
          time: new Date().toISOString(),
          actorId: staff?.id,
          actorName: staff?.name || 'System',
          ...payload,
        },
        ...prev,
      ].slice(0, 250)
    );
  };

  const pushBrowserAlert = (title, body) => {
    if (typeof window === 'undefined' || typeof Notification === 'undefined') return;
    const show = () => {
      try {
        new Notification(title, { body });
      } catch {
        /* browser may block */
      }
    };
    if (Notification.permission === 'granted') show();
    else if (Notification.permission === 'default') {
      Notification.requestPermission().then((perm) => {
        if (perm === 'granted') show();
      });
    }
  };

  const notifyLowStock = (items = []) => {
    const alerts = items.filter(isInventoryLow);
    if (!alerts.length) return;
    setNotifications((prev) => {
      const next = [...prev];
      alerts.forEach((item) => {
        const key = `low-${item.id}-${item.status}`;
        if (next.some((row) => row.key === key)) return;
        const title =
          item.status === 'Out of Stock' ? `${item.item} is out of stock` : `${item.item} is low on stock`;
        const description = `${item.stock} ${item.unit} left · minimum ${item.minStock}. Reorder from Purchases.`;
        next.unshift({
          id: key,
          key,
          type: 'low-stock',
          title,
          description,
          time: new Date().toISOString(),
          read: false,
          to: '/staff/inventory',
        });
        pushBrowserAlert(title, description);
      });
      return next.slice(0, 80);
    });
  };

  const markNotificationRead = (id) => {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const login = async (email, password) => {
    const found = users.items.find(
      (item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password
    );
    if (!found || found.status === 'Inactive') {
      throw new Error('Invalid staff credentials or inactive account.');
    }

    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('gs_token', data.token);
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Cannot reach the GardenSphere server. Start the API, then log in again.'
      );
    }

    const withLogin = { ...found, lastLogin: new Date().toISOString() };
    users.save(withLogin);
    setStaff(withLogin);
    setActivity((prev) =>
      [
        {
          id: `act-${Date.now()}`,
          time: new Date().toISOString(),
          actorId: found.id,
          actorName: found.name,
          userId: found.id,
          userName: found.name,
          action: 'Logged in',
          detail: 'Signed in to the staff portal.',
        },
        ...prev,
      ].slice(0, 250)
    );
    return withLogin;
  };

  const logout = () => {
    if (staff) {
      logActivity({
        userId: staff.id,
        userName: staff.name,
        action: 'Logged out',
        detail: 'Signed out of the staff portal.',
      });
    }
    localStorage.removeItem('gs_token');
    setStaff(null);
  };

  const stampHistory = (action, detail) => ({
    id: `h-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    at: new Date().toISOString(),
    actorId: staff?.id,
    actorName: staff?.name || 'System',
    action,
    detail,
  });

  const resolveAssignee = (assigneeId) => {
    const user = users.items.find((item) => item.id === assigneeId);
    return user ? { assigneeId: user.id, assignee: user.name } : { assigneeId: '', assignee: '' };
  };

  const applyTaskRules = (task) => {
    const next = normalizeTask(task);
    if (next.assigneeId && next.status === 'Pending') {
      next.status = 'Assigned';
    }
    if (!next.assigneeId && next.status === 'Assigned') {
      next.status = 'Pending';
    }
    if (next.status === 'Completed') {
      next.completedAt = next.completedAt || new Date().toISOString();
    } else {
      next.completedAt = null;
    }
    return next;
  };

  const saveTask = (record) => {
    const assignee = resolveAssignee(record.assigneeId);
    let next = applyTaskRules({ ...record, ...assignee });
    const events = [];

    taskStore.setItems((prev) => {
      const existing = prev.find((item) => item.id === record.id);

      if (!existing) {
        events.push({ action: 'Created', detail: 'Task created' });
        if (next.assignee) {
          events.push({ action: 'Assigned', detail: `Assigned to ${next.assignee}` });
        }
        next = {
          ...next,
          id: record.id || `task-${Date.now()}`,
          createdAt: new Date().toISOString(),
          history: [...events.map((event) => stampHistory(event.action, event.detail)), ...(next.history || [])],
        };
        return [next, ...prev];
      }

      if (existing.title !== next.title) {
        events.push({ action: 'Updated', detail: `Title changed to "${next.title}"` });
      }
      if (existing.description !== next.description) {
        events.push({ action: 'Updated', detail: 'Description updated' });
      }
      if (existing.assigneeId !== next.assigneeId) {
        events.push({ action: 'Assigned', detail: next.assignee ? `Assigned to ${next.assignee}` : 'Unassigned' });
      }
      if (existing.priority !== next.priority) {
        events.push({ action: 'Updated', detail: `Priority set to ${next.priority}` });
      }
      if (existing.due !== next.due) {
        events.push({ action: 'Updated', detail: next.due ? `Due date set to ${next.due}` : 'Due date cleared' });
      }
      if (existing.status !== next.status) {
        events.push({ action: 'Status updated', detail: `${existing.status} → ${next.status}` });
      }

      next = {
        ...existing,
        ...next,
        comments: existing.comments,
        history: [...events.map((event) => stampHistory(event.action, event.detail)), ...(existing.history || [])],
      };
      return prev.map((item) => (item.id === existing.id ? next : item));
    });

    logActivity({
      userId: staff?.id,
      userName: staff?.name,
      action: record.id ? 'Updated task' : 'Created task',
      detail: next.title,
    });
    return next;
  };

  const addTaskComment = (taskId, text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    taskStore.setItems((prev) =>
      prev.map((item) => {
        if (item.id !== taskId) return item;
        return {
          ...item,
          comments: [
            ...item.comments,
            {
              id: `c-${Date.now()}`,
              text: trimmed,
              authorId: staff?.id,
              authorName: staff?.name || 'Staff',
              createdAt: new Date().toISOString(),
            },
          ],
          history: [stampHistory('Comment added', trimmed.slice(0, 80)), ...item.history],
        };
      })
    );
  };

  const setTaskStatus = (taskId, status) => {
    const current = taskStore.items.find((item) => item.id === taskId);
    if (!current) return;
    saveTask({ ...current, status });
  };

  const removeTask = (id) => {
    const current = taskStore.items.find((item) => item.id === id);
    taskStore.remove(id);
    logActivity({
      userId: staff?.id,
      userName: staff?.name,
      action: 'Deleted task',
      detail: current?.title || 'A garden task was removed.',
    });
  };

  const tasks = {
    items: taskStore.items,
    setItems: taskStore.setItems,
    save: saveTask,
    remove: removeTask,
    addComment: addTaskComment,
    setStatus: setTaskStatus,
    nextStatus: NEXT_TASK_STATUS,
  };

  const createUser = (payload) => {
    const exists = users.items.some((item) => item.email.toLowerCase() === payload.email.toLowerCase());
    if (exists) {
      throw new Error('An account with this email already exists.');
    }
    const record = {
      ...payload,
      id: `u-${Date.now()}`,
      status: payload.status || 'Active',
      lastLogin: null,
    };
    users.save(record);
    logActivity({
      userId: record.id,
      userName: record.name,
      action: 'Created user',
      detail: `Account created with role ${payload.role}.`,
    });
    return record;
  };

  const updateUser = (payload) => {
    const current = users.items.find((item) => item.id === payload.id);
    if (!current) throw new Error('User not found.');
    const next = { ...current, ...payload, password: current.password };
    users.save(next);
    if (staff?.id === next.id) setStaff(next);
    logActivity({
      userId: next.id,
      userName: next.name,
      action: current.role !== next.role ? 'Assigned role' : 'Updated user',
      detail:
        current.role !== next.role
          ? `Role changed from ${current.role} to ${next.role}.`
          : 'User profile details were updated.',
    });
    return next;
  };

  const setUserStatus = (userId, status) => {
    const current = users.items.find((item) => item.id === userId);
    if (!current) throw new Error('User not found.');

    if (status === 'Inactive' && current.role === 'admin') {
      const activeAdmins = users.items.filter(
        (item) => item.role === 'admin' && (item.status || 'Active') !== 'Inactive'
      );
      if (activeAdmins.length <= 1) {
        throw new Error('Cannot deactivate the last active admin.');
      }
    }
    if (status === 'Inactive' && staff?.id === userId) {
      throw new Error('You cannot deactivate the account you are signed in with.');
    }

    users.setItems((prev) => prev.map((item) => (item.id === userId ? { ...item, status } : item)));
    logActivity({
      userId: current.id,
      userName: current.name,
      action: status === 'Inactive' ? 'Deactivated user' : 'Activated user',
      detail: `Account is now ${status.toLowerCase()}.`,
    });
    return { ...current, status };
  };

  const resetPassword = (userId, password) => {
    const current = users.items.find((item) => item.id === userId);
    if (!current) throw new Error('User not found.');
    users.save({ ...current, password });
    logActivity({
      userId: current.id,
      userName: current.name,
      action: 'Reset password',
      detail: 'Password was reset by an administrator.',
    });
  };

  const savePermissions = (role, list) => {
    setPermissions((prev) => ({ ...prev, [role]: list }));
    logActivity({
      userId: staff?.id,
      userName: staff?.name,
      action: 'Updated permissions',
      detail: `Permissions updated for ${ROLE_LABELS[role] || role}.`,
    });
  };

  const refreshInventory = async () => {
    const data = await fetchInventory();
    inventoryStore.setItems(data.items || []);
    supplierStore.setItems(data.suppliers || []);
    purchaseStore.setItems(data.purchases || []);
    stockStore.setItems(data.stock || []);
    notifyLowStock(data.items || []);
    return data;
  };

  const refreshFinance = async () => {
    const data = await fetchFinance();
    expenseStore.setItems(data.expenses || []);
    incomeStore.setItems(data.income || []);
    setFinanceCategories(
      data.categories || {
        expense: EXPENSE_CATEGORIES,
        income: INCOME_CATEGORIES,
        payment: PAYMENT_METHODS,
        all: [],
      }
    );
    setFinanceSummary(
      data.summary || {
        totalIncome: 0,
        totalExpenses: 0,
        netProfit: 0,
        expenseCount: 0,
        incomeCount: 0,
      }
    );
    return data;
  };

  const saveExpense = async (payload) => {
    const saved = await saveFinanceExpense(payload);
    await refreshFinance();
    logActivity({
      userId: staff?.id,
      userName: staff?.name,
      action: payload.id ? 'Updated expense' : 'Recorded expense',
      detail: `${saved.category} · ${saved.description}`,
    });
    return saved;
  };

  const removeExpense = async (id) => {
    const current = expenseStore.items.find((item) => item.id === id);
    await deleteFinanceExpense(id);
    await refreshFinance();
    logActivity({
      userId: staff?.id,
      userName: staff?.name,
      action: 'Removed expense',
      detail: current?.description || 'An expense was removed.',
    });
  };

  const saveIncome = async (payload) => {
    const saved = await saveFinanceIncome(payload);
    await refreshFinance();
    logActivity({
      userId: staff?.id,
      userName: staff?.name,
      action: payload.id ? 'Updated income' : 'Recorded income',
      detail: `${saved.category} · ${saved.description}`,
    });
    return saved;
  };

  const removeIncome = async (id) => {
    const current = incomeStore.items.find((item) => item.id === id);
    await deleteFinanceIncome(id);
    await refreshFinance();
    logActivity({
      userId: staff?.id,
      userName: staff?.name,
      action: 'Removed income',
      detail: current?.description || 'An income record was removed.',
    });
  };

  const addFinanceCategory = async (payload) => {
    const saved = await saveFinanceCategory(payload);
    await refreshFinance();
    return saved;
  };

  const removeFinanceCategory = async (id) => {
    await deleteFinanceCategory(id);
    await refreshFinance();
  };

  const refreshHarvests = async () => {
    const data = await fetchHarvestDesk();
    harvestStore.setItems(data.harvests || []);
    saleStore.setItems(data.sales || []);
    setHarvestCrops(data.crops?.length ? data.crops : HARVEST_CROPS);
    setHarvestUnits(data.units?.length ? data.units : HARVEST_UNITS);
    setHarvestGrades(data.grades?.length ? data.grades : HARVEST_GRADES);
    setHarvestSaleStatuses(data.saleStatuses?.length ? data.saleStatuses : HARVEST_SALE_STATUSES);
    setHarvestSummary(
      data.summary || {
        harvestCount: 0,
        saleCount: 0,
        totalQuantity: 0,
        totalValue: 0,
        soldValue: 0,
        unsoldCount: 0,
        listedCount: 0,
        soldCount: 0,
      }
    );
    return data;
  };

  const saveHarvest = async (payload) => {
    const saved = await saveHarvestRecord(payload);
    await refreshHarvests();
    logActivity({
      userId: staff?.id,
      userName: staff?.name,
      action: payload.id ? 'Updated harvest' : 'Recorded harvest',
      detail: `${saved.crop} · ${saved.quantity} ${saved.unit} · ${saved.grade}`,
    });
    return saved;
  };

  const removeHarvest = async (id) => {
    const current = harvestStore.items.find((item) => item.id === id);
    await deleteHarvestRecord(id);
    await refreshHarvests();
    logActivity({
      userId: staff?.id,
      userName: staff?.name,
      action: 'Removed harvest',
      detail: current ? `${current.crop} · ${current.date}` : 'A harvest record was removed.',
    });
  };

  const linkSale = async (harvestId, payload) => {
    const saved = await linkHarvestToSale(harvestId, payload);
    await refreshHarvests();
    logActivity({
      userId: staff?.id,
      userName: staff?.name,
      action: 'Linked harvest to sale',
      detail: `${saved.sale?.crop || saved.harvest?.crop} · ${saved.sale?.customer || 'customer'}`,
    });
    return saved;
  };

  const updateSale = async (payload) => {
    const saved = await saveHarvestSale(payload);
    await refreshHarvests();
    logActivity({
      userId: staff?.id,
      userName: staff?.name,
      action: 'Updated harvest sale',
      detail: `${saved.sale?.crop} · ${saved.sale?.status}`,
    });
    return saved;
  };

  const unlinkSale = async (id) => {
    const current = saleStore.items.find((item) => item.id === id);
    await deleteHarvestSale(id);
    await refreshHarvests();
    logActivity({
      userId: staff?.id,
      userName: staff?.name,
      action: 'Unlinked harvest sale',
      detail: current ? `${current.crop} · ${current.customer}` : 'A harvest sale was unlinked.',
    });
  };

  useEffect(() => {
    if (!staff || !localStorage.getItem('gs_token')) return undefined;
    refreshInventory().catch(() => {});
    refreshFinance().catch(() => {});
    refreshHarvests().catch(() => {});
    return undefined;
  }, [staff]);

  const saveInventoryItem = async (payload) => {
    const saved = payload.id
      ? await updateInventoryItem(payload.id, payload)
      : await createInventoryItem(payload);
    await refreshInventory();
    logActivity({
      userId: staff?.id,
      userName: staff?.name,
      action: payload.id ? 'Updated inventory' : 'Added inventory',
      detail: `${saved.item} · ${saved.stock} ${saved.unit}`,
    });
    return saved;
  };

  const removeInventoryItem = async (id) => {
    const current = inventoryStore.items.find((item) => item.id === id);
    await deleteInventoryItem(id);
    await refreshInventory();
    logActivity({
      userId: staff?.id,
      userName: staff?.name,
      action: 'Removed inventory',
      detail: current?.item || 'An inventory item was removed.',
    });
  };

  const moveStock = async (payload) => {
    const item = await moveInventoryStock(payload);
    await refreshInventory();
    logActivity({
      userId: staff?.id,
      userName: staff?.name,
      action: payload.type,
      detail: `${item.item} · ${payload.quantity} ${item.unit}`,
    });
    return { item };
  };

  const adjustStock = async (itemId, quantity, note) => {
    const item = await adjustInventoryStock({ itemId, quantity, note });
    await refreshInventory();
    logActivity({
      userId: staff?.id,
      userName: staff?.name,
      action: 'Updated stock',
      detail: `${item.item} · ${item.stock} ${item.unit}`,
    });
    return { item };
  };

  const saveSupplier = async (payload) => {
    const saved = await saveInventorySupplier(payload);
    await refreshInventory();
    logActivity({
      userId: staff?.id,
      userName: staff?.name,
      action: payload.id ? 'Updated supplier' : 'Added supplier',
      detail: saved.name,
    });
    return saved;
  };

  const savePurchase = async (payload) => {
    const saved = await saveInventoryPurchase(payload);
    await refreshInventory();
    logActivity({
      userId: staff?.id,
      userName: staff?.name,
      action: payload.id ? 'Updated purchase' : 'Recorded purchase',
      detail: `${saved.item} from ${saved.supplier} · ${saved.status}${saved.source === 'customer' ? ' (customer)' : ''}`,
    });
    return saved;
  };

  const removePurchase = async (id) => {
    await deleteInventoryPurchase(id);
    await refreshInventory();
  };

  const inventory = {
    items: inventoryStore.items,
    save: saveInventoryItem,
    remove: removeInventoryItem,
    moveStock,
    adjustStock,
    refresh: refreshInventory,
  };

  const suppliers = {
    items: supplierStore.items,
    save: saveSupplier,
    remove: async (id) => {
      await deleteInventorySupplier(id);
      await refreshInventory();
    },
  };

  const purchases = {
    items: purchaseStore.items,
    save: savePurchase,
    remove: removePurchase,
  };

  const stock = {
    items: stockStore.items,
  };

  const expenses = {
    items: expenseStore.items,
    save: saveExpense,
    remove: removeExpense,
  };

  const income = {
    items: incomeStore.items,
    save: saveIncome,
    remove: removeIncome,
  };

  const finance = {
    categories: financeCategories,
    summary: financeSummary,
    refresh: refreshFinance,
    saveCategory: addFinanceCategory,
    removeCategory: removeFinanceCategory,
  };

  const harvests = {
    items: harvestStore.items,
    crops: harvestCrops,
    units: harvestUnits,
    grades: harvestGrades,
    summary: harvestSummary,
    save: saveHarvest,
    remove: removeHarvest,
    linkSale,
    refresh: refreshHarvests,
  };

  const sales = {
    items: saleStore.items,
    statuses: harvestSaleStatuses,
    save: updateSale,
    remove: unlinkSale,
    link: linkSale,
  };

  const value = useMemo(
    () => ({
      staff,
      login,
      logout,
      users,
      createUser,
      updateUser,
      setUserStatus,
      resetPassword,
      permissions,
      savePermissions,
      activity,
      notifications,
      unreadNotifications: notifications.filter((item) => !item.read).length,
      markNotificationRead,
      markAllNotificationsRead,
      crops,
      irrigation,
      fertilizers,
      pests,
      tasks,
      harvests,
      sales,
      inventory,
      suppliers,
      purchases,
      stock,
      expenses,
      income,
      finance,
      maintenance,
    }),
    [staff, users, permissions, activity, notifications, crops, irrigation, fertilizers, pests, tasks, harvests, sales, inventory, suppliers, purchases, stock, expenses, income, finance, harvestSummary, maintenance]
  );

  return <StaffContext.Provider value={value}>{children}</StaffContext.Provider>;
};

export const useStaff = () => {
  const context = useContext(StaffContext);
  if (!context) throw new Error('useStaff must be used within StaffProvider');
  return context;
};
