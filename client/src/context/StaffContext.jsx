import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  initialActivity,
  initialCrops,
  initialFertilizers,
  initialIrrigation,
  initialTasks,
  ROLE_LABELS,
  ROLE_PERMISSIONS,
  staffAccounts,
} from '../data/staffData.js';
import { NEXT_TASK_STATUS, fromApiTask } from '../utils/tasks.js';
import {
  addTaskCommentRecord,
  deleteTaskRecord,
  fetchTaskAssignees,
  fetchTasks,
  saveTaskRecord,
  updateTaskStatusRecord,
} from '../services/taskService.js';
import {
  createStaffUser,
  fetchStaffActivity,
  fetchStaffUsers,
  resetStaffUserPassword,
  setStaffUserStatus,
  updateStaffUser,
} from '../services/userService.js';
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
import {
  fetchCrops,
  savePlanting,
  deletePlanting,
  savePlant,
  deletePlant,
  saveVariety,
  deleteVariety,
  saveLocation,
  deleteLocation,
} from '../services/cropService.js';
import {
  fetchIrrigationDesk,
  saveIrrigationSchedule,
  deleteIrrigationSchedule,
  recordWateringTask,
} from '../services/irrigationService.js';
import {
  fetchFertilizersDesk,
  saveFertilizerStock,
  deleteFertilizerStock,
  saveFertilizerApplication,
  deleteFertilizerApplication,
} from '../services/fertilizerService.js';
import {
  fetchPests,
  savePestRecord,
  deletePestRecord,
} from '../services/pestService.js';
import {
  deleteMaintenanceRecord,
  fetchMaintenanceDesk,
  saveMaintenanceRecord,
} from '../services/maintenanceService.js';
import { MAINTENANCE_LOCATIONS, MAINTENANCE_STATUSES, MAINTENANCE_TYPES } from '../utils/maintenance.js';

const KEYS = {
  session: 'gs_staff_session',
  users: 'gs_staff_users',
  permissions: 'gs_staff_permissions_v2',
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
  const [userItems, setUserItems] = useState([]);
  const [activity, setActivity] = useState([]);
  const [cropsItems, setCropsItems] = useState([]);
  const [plantsItems, setPlantsItems] = useState([]);
  const [varietiesItems, setVarietiesItems] = useState([]);
  const [locationsItems, setLocationsItems] = useState([]);
  const [irrigationSchedules, setIrrigationSchedules] = useState([]);
  const [irrigationRecords, setIrrigationRecords] = useState([]);
  const [fertilizerStockItems, setFertilizerStockItems] = useState([]);
  const [fertilizerApplicationItems, setFertilizerApplicationItems] = useState([]);
  const [pestItems, setPestItems] = useState([]);
  const [taskItems, setTaskItems] = useState([]);
  const harvestStore = useStore(KEYS.harvests, []);
  const saleStore = useStore(KEYS.sales, []);
  const inventoryStore = useStore(KEYS.inventory, []);
  const supplierStore = useStore(KEYS.suppliers, []);
  const purchaseStore = useStore(KEYS.purchases, []);
  const stockStore = useStore(KEYS.stock, []);
  const expenseStore = useStore(KEYS.expenses, []);
  const incomeStore = useStore(KEYS.income, []);
  const [maintenanceItems, setMaintenanceItems] = useState([]);
  const [maintenanceTypes, setMaintenanceTypes] = useState(MAINTENANCE_TYPES);
  const [maintenanceStatuses, setMaintenanceStatuses] = useState(MAINTENANCE_STATUSES);
  const [maintenanceLocations, setMaintenanceLocations] = useState(MAINTENANCE_LOCATIONS);
  const [maintenanceSummary, setMaintenanceSummary] = useState({
    total: 0,
    due: 0,
    overdue: 0,
    done: 0,
  });
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
  const [notifications, setNotifications] = useState(() => readJson(KEYS.notifications, []));

  useEffect(() => localStorage.setItem(KEYS.permissions, JSON.stringify(permissions)), [permissions]);
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

  const notifyOverdueMaintenance = (summary = {}, records = []) => {
    if (!summary.overdue) return;
    const key = `maintenance-overdue-${summary.overdue}-${records
      .filter((row) => row.overdue)
      .map((row) => row.id)
      .sort()
      .join('-')}`;
    setNotifications((prev) => {
      if (prev.some((row) => row.key === key || (row.type === 'maintenance-overdue' && !row.read))) return prev;
      const title = `${summary.overdue} garden care ${summary.overdue === 1 ? 'job is' : 'jobs are'} overdue`;
      const description = 'Open Maintenance to mark weeding, mulching, or cleanup as done.';
      pushBrowserAlert(title, description);
      return [
        {
          id: key,
          key,
          type: 'maintenance-overdue',
          title,
          description,
          time: new Date().toISOString(),
          read: false,
          to: '/staff/maintenance',
        },
        ...prev,
      ].slice(0, 80);
    });
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

  const toStaffSession = (user) => ({
    id: String(user.id),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || '',
    status: user.isActive === false || user.status === 'Inactive' ? 'Inactive' : 'Active',
    lastLogin: user.lastLogin || new Date().toISOString(),
  });

  const refreshUsers = async () => {
    try {
      const rows = await fetchStaffUsers();
      setUserItems(rows);
    } catch {
      /* gardeners cannot list users */
    }
    if (staff?.role === 'admin') {
      try {
        setActivity(await fetchStaffActivity());
      } catch {
        /* ignore */
      }
    }
  };

  const refreshTasks = async () => {
    const rows = await fetchTasks();
    setTaskItems(rows.map(fromApiTask));
    if (['admin', 'garden_manager'].includes(staff?.role)) {
      try {
        const assignees = await fetchTaskAssignees();
        setUserItems((prev) => {
          const extras = assignees.filter((row) => !prev.some((item) => String(item.id) === String(row.id)));
          return extras.length ? [...prev, ...extras.map((row) => ({ ...row, status: 'Active' }))] : prev;
        });
      } catch {
        /* ignore */
      }
    }
    return rows;
  };

  const login = async (email, password) => {
    let data;
    try {
      const response = await api.post('/auth/login', { email, password });
      data = response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Cannot reach the GardenSphere server. Start the API, then log in again.'
      );
    }
    if (!data?.user || data.user.role === 'user') {
      throw new Error('Invalid staff credentials or inactive account.');
    }
    localStorage.setItem('gs_token', data.token);
    const session = toStaffSession(data.user);
    setStaff(session);
    return session;
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

  const saveTask = async (record) => {
    const saved = await saveTaskRecord({
      id: record.id,
      title: record.title,
      description: record.description,
      assignedTo: record.assigneeId || null,
      priority: record.priority,
      dueDate: record.due,
      status: record.status,
    });
    await refreshTasks();
    return fromApiTask(saved);
  };

  const addTaskComment = async (taskId, text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    await addTaskCommentRecord(taskId, trimmed);
    await refreshTasks();
  };

  const setTaskStatus = async (taskId, status) => {
    await updateTaskStatusRecord(taskId, status);
    await refreshTasks();
  };

  const removeTask = async (id) => {
    await deleteTaskRecord(id);
    await refreshTasks();
  };

  const tasks = {
    items: taskItems,
    save: saveTask,
    remove: removeTask,
    addComment: addTaskComment,
    setStatus: setTaskStatus,
    refresh: refreshTasks,
    nextStatus: NEXT_TASK_STATUS,
  };

  const createUser = async (payload) => {
    const record = await createStaffUser(payload);
    await refreshUsers();
    return record;
  };

  const updateUser = async (payload) => {
    const next = await updateStaffUser(payload.id, payload);
    if (staff?.id === next.id) setStaff({ ...staff, ...next });
    await refreshUsers();
    return next;
  };

  const setUserStatus = async (userId, status) => {
    const next = await setStaffUserStatus(userId, status);
    await refreshUsers();
    return next;
  };

  const resetPassword = async (userId, password) => {
    await resetStaffUserPassword(userId, password);
    await refreshUsers();
  };

  const users = { items: userItems };

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

  const refreshCrops = async () => {
    const data = await fetchCrops();
    setCropsItems(data.plantings || []);
    setPlantsItems(data.plants || []);
    setVarietiesItems(data.varieties || []);
    setLocationsItems(data.locations || []);
    return data;
  };

  const saveCropPlanting = async (payload) => {
    const saved = await savePlanting(payload);
    await refreshCrops();
    logActivity({
      userId: staff?.id,
      userName: staff?.name,
      action: payload.id ? 'Updated crop planting' : 'Recorded planting',
      detail: `${saved.name} · ${saved.quantity} plants at ${saved.location}`,
    });
    return saved;
  };

  const removeCropPlanting = async (id) => {
    await deletePlanting(id);
    await refreshCrops();
    logActivity({
      userId: staff?.id,
      userName: staff?.name,
      action: 'Removed planting',
      detail: 'A crop planting record was removed.',
    });
  };

  const savePlantType = async (payload) => {
    const saved = await savePlant(payload);
    await refreshCrops();
    logActivity({
      userId: staff?.id,
      userName: staff?.name,
      action: payload.id ? 'Updated plant type' : 'Added plant type',
      detail: saved.name,
    });
    return saved;
  };

  const removePlantType = async (id) => {
    await deletePlant(id);
    await refreshCrops();
    logActivity({
      userId: staff?.id,
      userName: staff?.name,
      action: 'Removed plant type',
      detail: 'A plant type was removed.',
    });
  };

  const saveVarietyType = async (payload) => {
    const saved = await saveVariety(payload);
    await refreshCrops();
    logActivity({
      userId: staff?.id,
      userName: staff?.name,
      action: payload.id ? 'Updated variety' : 'Added variety',
      detail: `${saved.plantName} · ${saved.name}`,
    });
    return saved;
  };

  const removeVarietyType = async (id) => {
    await deleteVariety(id);
    await refreshCrops();
    logActivity({
      userId: staff?.id,
      userName: staff?.name,
      action: 'Removed variety',
      detail: 'A variety was removed.',
    });
  };

  const saveLocationItem = async (payload) => {
    const saved = await saveLocation(payload);
    await refreshCrops();
    logActivity({
      userId: staff?.id,
      userName: staff?.name,
      action: payload.id ? 'Updated garden location' : 'Added garden location',
      detail: saved.name,
    });
    return saved;
  };

  const removeLocationItem = async (id) => {
    await deleteLocation(id);
    await refreshCrops();
    logActivity({
      userId: staff?.id,
      userName: staff?.name,
      action: 'Removed location',
      detail: 'A garden location was removed.',
    });
  };

  const pushKeyedNotice = (key, title, description, to) => {
    setNotifications((prev) => {
      if (prev.some((row) => row.key === key)) return prev;
      return [
        { id: key, key, type: 'ops', title, description, time: new Date().toISOString(), read: false, to },
        ...prev,
      ].slice(0, 80);
    });
  };

  const refreshIrrigation = async () => {
    const data = await fetchIrrigationDesk();
    setIrrigationSchedules(data.schedules || []);
    setIrrigationRecords(data.records || []);
    const due = (data.schedules || []).filter((row) => row.status === 'Due').length;
    if (due) pushKeyedNotice(`irrigation-due-${due}`, `${due} irrigation ${due === 1 ? 'schedule is' : 'schedules are'} due`, 'Open Irrigation to water the beds that are waiting.', '/staff/irrigation');
    return data;
  };

  const saveSchedule = async (payload) => {
    const saved = await saveIrrigationSchedule(payload);
    await refreshIrrigation();
    logActivity({
      userId: staff?.id,
      userName: staff?.name,
      action: payload.id ? 'Updated irrigation schedule' : 'Created irrigation schedule',
      detail: `${saved.crop} · ${saved.frequency} at ${saved.time}`,
    });
    return saved;
  };

  const removeSchedule = async (id) => {
    await deleteIrrigationSchedule(id);
    await refreshIrrigation();
    logActivity({
      userId: staff?.id,
      userName: staff?.name,
      action: 'Deleted irrigation schedule',
      detail: 'An irrigation schedule was removed.',
    });
  };

  const recordWateringExecution = async (payload) => {
    const saved = await recordWateringTask(payload);
    await refreshIrrigation();
    logActivity({
      userId: staff?.id,
      userName: staff?.name,
      action: 'Recorded watering',
      detail: `${saved.crop} watered with ${saved.quantity} at ${saved.time}`,
    });
    return saved;
  };

  const refreshFertilizers = async () => {
    const data = await fetchFertilizersDesk();
    setFertilizerStockItems(data.fertilizers || []);
    setFertilizerApplicationItems(data.applications || []);
    const low = (data.fertilizers || []).filter((row) => Number(row.stock) <= Number(row.minStock || 0));
    if (low.length) {
      pushKeyedNotice(`fertilizer-low-${low.length}`, `${low.length} fertilizer ${low.length === 1 ? 'is' : 'stocks are'} low`, 'Reorder from Fertilizers or Purchases before the next application.', '/staff/fertilizers');
    }
    return data;
  };

  const saveFertilizerStockItem = async (payload) => {
    const saved = await saveFertilizerStock(payload);
    await refreshFertilizers();
    logActivity({
      userId: staff?.id,
      userName: staff?.name,
      action: payload.id ? 'Updated fertilizer stock' : 'Added fertilizer stock',
      detail: `${saved.name} · ${saved.stock} ${saved.unit}`,
    });
    return saved;
  };

  const removeFertilizerStockItem = async (id) => {
    await deleteFertilizerStock(id);
    await refreshFertilizers();
    logActivity({
      userId: staff?.id,
      userName: staff?.name,
      action: 'Deleted fertilizer stock',
      detail: 'A fertilizer stock item was removed.',
    });
  };

  const saveApplicationRecord = async (payload) => {
    const saved = await saveFertilizerApplication(payload);
    await refreshFertilizers();
    logActivity({
      userId: staff?.id,
      userName: staff?.name,
      action: payload.id ? 'Updated fertilizer application' : 'Recorded fertilizer application',
      detail: `${saved.fertilizerName} · ${saved.quantity} ${saved.unit} applied to ${saved.crop}`,
    });
    return saved;
  };

  const removeApplicationRecord = async (id) => {
    await deleteFertilizerApplication(id);
    await refreshFertilizers();
    logActivity({
      userId: staff?.id,
      userName: staff?.name,
      action: 'Deleted fertilizer application',
      detail: 'A fertilizer application record was removed.',
    });
  };

  const refreshPests = async () => {
    const data = await fetchPests();
    setPestItems(data.records || []);
    const hot = (data.records || []).filter((row) => ['High', 'Critical'].includes(row.severity) && row.status !== 'Resolved');
    if (hot.length) {
      pushKeyedNotice(`pest-hot-${hot.length}`, `${hot.length} serious pest/disease ${hot.length === 1 ? 'case needs' : 'cases need'} follow-up`, 'Open Pests to update treatment status.', '/staff/pests');
    }
    return data;
  };

  const refreshMaintenance = async () => {
    const data = await fetchMaintenanceDesk();
    const records = data.records || [];
    const summary = data.summary || { total: 0, due: 0, overdue: 0, done: 0 };
    setMaintenanceItems(records);
    setMaintenanceTypes(data.types?.length ? data.types : MAINTENANCE_TYPES);
    setMaintenanceStatuses(data.statuses?.length ? data.statuses : MAINTENANCE_STATUSES);
    setMaintenanceLocations(data.locations?.length ? data.locations : MAINTENANCE_LOCATIONS);
    setMaintenanceSummary(summary);
    notifyOverdueMaintenance(summary, records);
    return data;
  };

  const saveMaintenanceItem = async (payload) => {
    const saved = await saveMaintenanceRecord(payload);
    await refreshMaintenance();
    logActivity({
      userId: staff?.id,
      userName: staff?.name,
      action: payload.id ? 'Updated maintenance' : 'Recorded maintenance',
      detail: `${saved.type}${saved.location ? ` · ${saved.location}` : ''} · ${saved.status}`,
    });
    return saved;
  };

  const removeMaintenanceItem = async (id) => {
    await deleteMaintenanceRecord(id);
    await refreshMaintenance();
    logActivity({
      userId: staff?.id,
      userName: staff?.name,
      action: 'Deleted maintenance',
      detail: 'A garden care record was removed.',
    });
  };

  const savePestItem = async (payload) => {
    const saved = await savePestRecord(payload);
    await refreshPests();
    logActivity({
      userId: staff?.id,
      userName: staff?.name,
      action: payload.id ? 'Updated pest/disease record' : 'Reported pest/disease',
      detail: `${saved.issue} on ${saved.crop} · ${saved.severity} severity`,
    });
    return saved;
  };

  const removePestItem = async (id) => {
    await deletePestRecord(id);
    await refreshPests();
    logActivity({
      userId: staff?.id,
      userName: staff?.name,
      action: 'Deleted pest/disease record',
      detail: 'A pest/disease record was removed.',
    });
  };

  useEffect(() => {
    if (!staff || !localStorage.getItem('gs_token')) return undefined;
    refreshInventory().catch(() => {});
    refreshFinance().catch(() => {});
    refreshHarvests().catch(() => {});
    refreshCrops().catch(() => {});
    refreshIrrigation().catch(() => {});
    refreshFertilizers().catch(() => {});
    refreshPests().catch(() => {});
    refreshMaintenance().catch(() => {});
    refreshUsers().catch(() => {});
    refreshTasks()
      .then((rows) => {
        const overdue = (rows || []).filter((task) => task.status !== 'Completed' && task.dueDate && new Date(task.dueDate) < new Date());
        if (overdue.length) {
          setNotifications((prev) => {
            const key = `tasks-overdue-${overdue.length}`;
            if (prev.some((row) => row.key === key)) return prev;
            return [
              {
                id: key,
                key,
                type: 'task',
                title: `${overdue.length} garden ${overdue.length === 1 ? 'task is' : 'tasks are'} overdue`,
                description: 'Open Tasks to assign or complete overdue work.',
                time: new Date().toISOString(),
                read: false,
                to: staff?.role === 'gardener' ? '/staff/my-tasks' : '/staff/tasks',
              },
              ...prev,
            ].slice(0, 80);
          });
        }
      })
      .catch(() => {});
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
    refresh: refreshInventory,
  };

  const stock = {
    items: stockStore.items,
  };

  const expenses = {
    items: expenseStore.items,
    save: saveExpense,
    remove: removeExpense,
  };

  const crops = {
    items: cropsItems,
    save: saveCropPlanting,
    remove: removeCropPlanting,
    refresh: refreshCrops,
  };

  const plants = {
    items: plantsItems,
    save: savePlantType,
    remove: removePlantType,
  };

  const varieties = {
    items: varietiesItems,
    save: saveVarietyType,
    remove: removeVarietyType,
  };

  const locations = {
    items: locationsItems,
    save: saveLocationItem,
    remove: removeLocationItem,
  };

  const irrigation = {
    items: irrigationSchedules,
    records: irrigationRecords,
    save: saveSchedule,
    remove: removeSchedule,
    recordWatering: recordWateringExecution,
    refresh: refreshIrrigation,
  };

  const pests = {
    items: pestItems,
    save: savePestItem,
    remove: removePestItem,
    refresh: refreshPests,
  };

  const maintenance = {
    items: maintenanceItems,
    types: maintenanceTypes,
    statuses: maintenanceStatuses,
    locations: maintenanceLocations,
    summary: maintenanceSummary,
    save: saveMaintenanceItem,
    remove: removeMaintenanceItem,
    refresh: refreshMaintenance,
  };

  const fertilizers = {
    items: fertilizerApplicationItems,
    stock: fertilizerStockItems,
    save: saveApplicationRecord,
    remove: removeApplicationRecord,
    saveStock: saveFertilizerStockItem,
    removeStock: removeFertilizerStockItem,
    refresh: refreshFertilizers,
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
      plants,
      varieties,
      locations,
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
    [staff, users, permissions, activity, notifications, crops, plants, varieties, locations, irrigation, fertilizers, pests, tasks, harvests, sales, inventory, suppliers, purchases, stock, expenses, income, finance, harvestSummary, maintenance]
  );

  return <StaffContext.Provider value={value}>{children}</StaffContext.Provider>;
};

export const useStaff = () => {
  const context = useContext(StaffContext);
  if (!context) throw new Error('useStaff must be used within StaffProvider');
  return context;
};
