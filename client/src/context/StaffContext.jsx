import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  initialActivity,
  initialCrops,
  initialExpenses,
  initialFertilizers,
  initialHarvests,
  initialIncome,
  initialInventory,
  initialIrrigation,
  initialMaintenance,
  initialPests,
  initialPurchases,
  initialSales,
  initialStock,
  initialSuppliers,
  initialTasks,
  ROLE_LABELS,
  ROLE_PERMISSIONS,
  staffAccounts,
} from '../data/staffData.js';
import { NEXT_TASK_STATUS, normalizeTask } from '../utils/tasks.js';

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
  harvests: 'gs_staff_harvests_v2',
  sales: 'gs_staff_sales',
  inventory: 'gs_staff_inventory',
  suppliers: 'gs_staff_suppliers',
  purchases: 'gs_staff_purchases',
  stock: 'gs_staff_stock',
  expenses: 'gs_staff_expenses_v2',
  income: 'gs_staff_income_v2',
  maintenance: 'gs_staff_maintenance',
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
  const harvests = useStore(KEYS.harvests, initialHarvests);
  const sales = useStore(KEYS.sales, initialSales);
  const inventory = useStore(KEYS.inventory, initialInventory);
  const suppliers = useStore(KEYS.suppliers, initialSuppliers);
  const purchases = useStore(KEYS.purchases, initialPurchases);
  const stock = useStore(KEYS.stock, initialStock);
  const expenses = useStore(KEYS.expenses, initialExpenses);
  const income = useStore(KEYS.income, initialIncome);
  const maintenance = useStore(KEYS.maintenance, initialMaintenance);
  const [permissions, setPermissions] = useState(() => ({
    ...ROLE_PERMISSIONS,
    ...readJson(KEYS.permissions, {}),
  }));
  const [activity, setActivity] = useState(() => readJson(KEYS.activity, initialActivity));

  useEffect(() => localStorage.setItem(KEYS.permissions, JSON.stringify(permissions)), [permissions]);
  useEffect(() => localStorage.setItem(KEYS.activity, JSON.stringify(activity)), [activity]);

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

  const login = (email, password) => {
    const found = users.items.find(
      (item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password
    );
    if (!found || found.status === 'Inactive') {
      throw new Error('Invalid staff credentials or inactive account.');
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
      maintenance,
    }),
    [staff, users, permissions, activity, crops, irrigation, fertilizers, pests, tasks, harvests, sales, inventory, suppliers, purchases, stock, expenses, income, maintenance]
  );

  return <StaffContext.Provider value={value}>{children}</StaffContext.Provider>;
};

export const useStaff = () => {
  const context = useContext(StaffContext);
  if (!context) throw new Error('useStaff must be used within StaffProvider');
  return context;
};
