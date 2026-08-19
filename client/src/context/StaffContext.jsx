import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
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
  staffAccounts,
} from '../data/staffData.js';

const KEYS = {
  session: 'gs_staff_session',
  users: 'gs_staff_users',
  crops: 'gs_staff_crops',
  irrigation: 'gs_staff_irrigation',
  fertilizers: 'gs_staff_fertilizers',
  pests: 'gs_staff_pests',
  tasks: 'gs_staff_tasks',
  harvests: 'gs_staff_harvests',
  sales: 'gs_staff_sales',
  inventory: 'gs_staff_inventory',
  suppliers: 'gs_staff_suppliers',
  purchases: 'gs_staff_purchases',
  stock: 'gs_staff_stock',
  expenses: 'gs_staff_expenses',
  income: 'gs_staff_income',
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

const useStore = (key, initial) => {
  const [items, setItems] = useState(() => readJson(key, initial));
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
  const tasks = useStore(KEYS.tasks, initialTasks);
  const harvests = useStore(KEYS.harvests, initialHarvests);
  const sales = useStore(KEYS.sales, initialSales);
  const inventory = useStore(KEYS.inventory, initialInventory);
  const suppliers = useStore(KEYS.suppliers, initialSuppliers);
  const purchases = useStore(KEYS.purchases, initialPurchases);
  const stock = useStore(KEYS.stock, initialStock);
  const expenses = useStore(KEYS.expenses, initialExpenses);
  const income = useStore(KEYS.income, initialIncome);
  const maintenance = useStore(KEYS.maintenance, initialMaintenance);

  useEffect(() => {
    if (staff) localStorage.setItem(KEYS.session, JSON.stringify(staff));
    else localStorage.removeItem(KEYS.session);
  }, [staff]);

  const login = (email, password) => {
    const found = users.items.find(
      (item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password
    );
    if (!found || found.status === 'Inactive') {
      throw new Error('Invalid staff credentials or inactive account.');
    }
    setStaff(found);
    return found;
  };

  const logout = () => setStaff(null);

  const value = useMemo(
    () => ({
      staff,
      login,
      logout,
      users,
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
    [staff, users, crops, irrigation, fertilizers, pests, tasks, harvests, sales, inventory, suppliers, purchases, stock, expenses, income, maintenance]
  );

  return <StaffContext.Provider value={value}>{children}</StaffContext.Provider>;
};

export const useStaff = () => {
  const context = useContext(StaffContext);
  if (!context) throw new Error('useStaff must be used within StaffProvider');
  return context;
};
