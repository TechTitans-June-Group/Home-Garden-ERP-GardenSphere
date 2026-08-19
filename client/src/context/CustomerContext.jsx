import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  demoCustomer,
  initialNotifications,
  initialOrders,
} from '../data/mockData.js';

const STORAGE = {
  user: 'gs_customer_user',
  users: 'gs_customer_users',
  orders: 'gs_customer_orders',
  notifications: 'gs_customer_notifications',
  remember: 'gs_customer_remember',
  designs: 'gs_garden_designs',
};

const CustomerContext = createContext(null);

const readJson = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export const CustomerProvider = ({ children }) => {
  const [users, setUsers] = useState(() => {
    const stored = readJson(STORAGE.users, [demoCustomer]);
    return stored.length ? stored : [demoCustomer];
  });
  const [user, setUser] = useState(() => readJson(STORAGE.user, null));
  const [orders, setOrders] = useState(() => readJson(STORAGE.orders, initialOrders));
  const [notifications, setNotifications] = useState(() =>
    readJson(STORAGE.notifications, initialNotifications)
  );
  const [designs, setDesigns] = useState(() => readJson(STORAGE.designs, []));

  useEffect(() => localStorage.setItem(STORAGE.users, JSON.stringify(users)), [users]);
  useEffect(() => {
    if (user) localStorage.setItem(STORAGE.user, JSON.stringify(user));
    else localStorage.removeItem(STORAGE.user);
  }, [user]);
  useEffect(() => localStorage.setItem(STORAGE.orders, JSON.stringify(orders)), [orders]);
  useEffect(
    () => localStorage.setItem(STORAGE.notifications, JSON.stringify(notifications)),
    [notifications]
  );
  useEffect(() => localStorage.setItem(STORAGE.designs, JSON.stringify(designs)), [designs]);

  const addNotification = (payload) => {
    setNotifications((prev) => [
      {
        id: `n-${Date.now()}`,
        read: false,
        time: new Date().toISOString(),
        ...payload,
      },
      ...prev,
    ]);
  };

  const register = (payload, remember = true) => {
    const exists = users.some((item) => item.email.toLowerCase() === payload.email.toLowerCase());
    if (exists) {
      throw new Error('An account with this email already exists.');
    }

    const newUser = {
      id: `cust-${Date.now()}`,
      ...payload,
    };

    setUsers((prev) => [...prev, newUser]);
    if (remember) setUser(newUser);
    else setUser(newUser);
    return newUser;
  };

  const login = (email, password, remember) => {
    const found = users.find(
      (item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password
    );
    if (!found) {
      throw new Error('Invalid email or password.');
    }
    setUser(found);
    if (remember) localStorage.setItem(STORAGE.remember, email);
    else localStorage.removeItem(STORAGE.remember);
    return found;
  };

  const logout = () => setUser(null);

  const updateProfile = (updates) => {
    setUser((prev) => {
      const next = { ...prev, ...updates };
      setUsers((list) => list.map((item) => (item.id === next.id ? next : item)));
      return next;
    });
  };

  const placeOrder = (order) => {
    const created = {
      id: `GS-${Math.floor(24020 + Math.random() * 80)}`,
      orderDate: new Date().toISOString(),
      status: 'Pending',
      feedback: null,
      ...order,
      customerEmail: user?.email || order.customerEmail,
    };
    setOrders((prev) => [created, ...prev]);
    addNotification({
      type: 'order',
      title: 'Order placed successfully',
      description: `Your ${created.productName} order ${created.id} has been placed.`,
    });
    return created;
  };

  const cancelOrder = (orderId) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status: 'Cancelled' } : order))
    );
    addNotification({
      type: 'cancelled',
      title: 'Order cancelled',
      description: `Order ${orderId} was cancelled.`,
    });
  };

  const submitFeedback = (orderId, rating, comment) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, feedback: { rating, comment } } : order
      )
    );
  };

  const markRead = (id) => {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const unreadCount = notifications.filter((item) => !item.read).length;
  const customerOrders = user
    ? orders.filter(
        (order) => order.customerEmail === user.email || order.customerName === user.name
      )
    : [];
  const gardenDesigns = user
    ? designs.filter((design) => design.customerEmail === user.email)
    : [];

  const saveGardenDesign = (design) => {
    if (!user) {
      throw new Error('Please log in as a customer to save a garden design.');
    }

    const id = design.id || `gd-${Date.now()}`;
    const existing = designs.find((item) => item.id === id);
    const payload = {
      ...design,
      id,
      customerEmail: user.email,
      customerName: user.name,
      createdAt: existing?.createdAt || design.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setDesigns((prev) => {
      const exists = prev.some((item) => item.id === payload.id);
      if (exists) return prev.map((item) => (item.id === payload.id ? payload : item));
      return [payload, ...prev];
    });

    addNotification({
      type: 'garden',
      title: 'Garden design saved',
      description: `${payload.name || 'Your garden'} was saved to your account.`,
    });

    return payload;
  };

  const deleteGardenDesign = (id) => {
    setDesigns((prev) => prev.filter((item) => item.id !== id));
  };

  const value = useMemo(
    () => ({
      user,
      users,
      orders: customerOrders,
      gardenDesigns,
      notifications,
      unreadCount,
      register,
      login,
      logout,
      updateProfile,
      placeOrder,
      cancelOrder,
      submitFeedback,
      saveGardenDesign,
      deleteGardenDesign,
      markRead,
      markAllRead,
    }),
    [user, users, customerOrders, gardenDesigns, notifications, unreadCount]
  );

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>;
};

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within CustomerProvider');
  }
  return context;
};
