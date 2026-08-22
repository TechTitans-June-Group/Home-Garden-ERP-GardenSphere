import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  demoCustomer,
  initialNotifications,
  initialOrders,
  products,
} from '../data/mockData.js';
import { cancelCustomerPurchase, fetchCustomerOrders, recordCustomerPurchase, saveCustomerOrderFeedback } from '../services/inventoryService.js';
import { plotPlantId } from '../utils/gardenGuide.js';
import { fetchShopProducts } from '../services/shopService.js';
import {
  deleteGardenDesignRecord,
  fetchCustomerNotifications,
  fetchGardenDesigns,
  fetchWishlist,
  loginAccount,
  markCustomerNotifications,
  postCustomerNotification,
  registerCustomer,
  saveGardenDesignRecord,
  saveWishlistIds,
  updateMyProfile,
} from '../services/customerService.js';

const STORAGE = {
  user: 'gs_customer_user',
  users: 'gs_customer_users',
  orders: 'gs_customer_orders',
  notifications: 'gs_customer_notifications',
  remember: 'gs_customer_remember',
  designs: 'gs_garden_designs',
  wishlist: 'gs_customer_wishlist',
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
  const [wishlistMap, setWishlistMap] = useState(() => readJson(STORAGE.wishlist, {}));
  const [catalog, setCatalog] = useState(products);

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
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE.designs, JSON.stringify(designs));
    } catch {
      const slim = designs.map(({ photo, ...rest }) => rest);
      try {
        localStorage.setItem(STORAGE.designs, JSON.stringify(slim));
      } catch {
        /* ignore quota errors */
      }
    }
  }, [designs]);
  useEffect(() => localStorage.setItem(STORAGE.wishlist, JSON.stringify(wishlistMap)), [wishlistMap]);

  useEffect(() => {
    fetchShopProducts().then(setCatalog).catch(() => {});
  }, []);

  const addNotification = (payload) => {
    setNotifications((prev) => {
      if (payload.key && prev.some((item) => item.key === payload.key)) return prev;
      const next = {
        id: payload.id || `n-${Date.now()}`,
        read: false,
        time: new Date().toISOString(),
        ...payload,
      };
      if (user && localStorage.getItem('gs_token')) {
        postCustomerNotification({ key: next.key, type: next.type, title: next.title, description: next.description });
      }
      return [next, ...prev];
    });
  };

  const mergeRemoteOrders = (remote, local) => {
    const remoteRows = (remote || []).map((row) => ({
      ...row,
      customerEmail: row.customerEmail || user?.email,
    }));
    const remoteIds = new Set(remoteRows.map((row) => row.id));
    const localOnly = local.filter((row) => !remoteIds.has(row.id));
    return [
      ...remoteRows.map((row) => {
        const existing = local.find((item) => item.id === row.id);
        return {
          ...existing,
          ...row,
          feedback: row.feedback || existing?.feedback || null,
        };
      }),
      ...localOnly,
    ];
  };

  const refreshOrders = async (currentUser = user) => {
    if (!currentUser?.email) return [];
    try {
      const remote = await fetchCustomerOrders(currentUser.email);
      setOrders((prev) => {
        const next = mergeRemoteOrders(remote, prev);
        const changes = prev
          .map((old) => {
            const fresh = next.find((item) => item.id === old.id);
            return fresh && fresh.status !== old.status ? fresh : null;
          })
          .filter(Boolean);
        if (changes.length) {
          window.setTimeout(() => {
            changes.forEach((fresh) => {
              const labels = {
                Confirmed: ['confirmed', 'Order confirmed', `Order ${fresh.id} was confirmed by GardenSphere staff.`],
                Completed: ['completed', 'Order completed', `Order ${fresh.id} is complete. You can leave feedback.`],
                Cancelled: ['cancelled', 'Order cancelled', `Order ${fresh.id} was cancelled.`],
                Pending: ['order', 'Order updated', `Order ${fresh.id} is now Pending.`],
              };
              const note = labels[fresh.status];
              if (note) {
                addNotification({
                  key: `order-${fresh.id}-${fresh.status}`,
                  type: note[0],
                  title: note[1],
                  description: note[2],
                });
              }
            });
          }, 0);
        }
        return next;
      });
      return remote;
    } catch {
      return [];
    }
  };

  useEffect(() => {
    if (user && localStorage.getItem('gs_token')) hydrateCustomer(user);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (!user?.email) return undefined;
    refreshOrders(user);
    const timer = setInterval(() => refreshOrders(user), 8000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  const hydrateCustomer = async (nextUser) => {
    try {
      const [wish, remoteDesigns, notes] = await Promise.all([
        fetchWishlist(),
        fetchGardenDesigns(),
        fetchCustomerNotifications(),
      ]);
      if (wish.length) setWishlistMap((prev) => ({ ...prev, [nextUser.email]: wish }));
      if (remoteDesigns.length) setDesigns(remoteDesigns);
      if (notes.length) setNotifications(notes);
    } catch {
      /* keep cached copies */
    }
  };

  const register = async (payload, remember = true) => {
    const { token, user: next } = await registerCustomer(payload);
    localStorage.setItem('gs_token', token);
    setUser(next);
    setUsers((prev) => [...prev.filter((item) => item.email !== next.email), next]);
    if (remember) localStorage.setItem(STORAGE.remember, next.email);
    return next;
  };

  const login = async (email, password, remember) => {
    const { token, user: next } = await loginAccount(email, password);
    if (next.role && next.role !== 'user') {
      throw new Error('Use the staff portal for this account.');
    }
    localStorage.setItem('gs_token', token);
    setUser(next);
    if (remember) localStorage.setItem(STORAGE.remember, email);
    else localStorage.removeItem(STORAGE.remember);
    await hydrateCustomer(next);
    return next;
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = async (updates) => {
    const next = await updateMyProfile(updates);
    setUser((prev) => ({ ...prev, ...next }));
    return next;
  };

  const placeOrder = async (order) => {
    const created = {
      id: `GS-${Math.floor(24020 + Math.random() * 80)}`,
      orderDate: new Date().toISOString(),
      status: 'Pending',
      feedback: null,
      ...order,
      customerEmail: user?.email || order.customerEmail,
    };

    const purchase = await recordCustomerPurchase({
      productName: created.productName,
      quantity: created.quantity,
      unit: created.unit,
      unitPrice: created.unitPrice,
      image: created.image,
      notes: [created.notes, created.deliveryDate && created.deliverySlot ? `Delivery ${created.deliveryDate} ${created.deliverySlot}` : '']
        .filter(Boolean)
        .join(' · '),
      customerName: created.customerName,
      customerEmail: created.customerEmail,
      phone: created.phone,
      address: created.address,
      orderRef: created.id,
    });

    created.purchaseId = purchase?.id;

    setOrders((prev) => [created, ...prev]);
    addNotification({
      type: 'order',
      title: 'Order placed successfully',
      description: `Your ${created.productName} order ${created.id} has been placed.`,
    });
    return created;
  };

  const cancelOrder = async (orderId) => {
    const existing = orders.find((order) => order.id === orderId);
    try {
      await cancelCustomerPurchase({
        orderRef: orderId,
        email: user?.email || existing?.customerEmail,
      });
    } catch (error) {
      if (!/not found/i.test(error.message || '')) throw error;
    }

    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status: 'Cancelled' } : order))
    );
    addNotification({
      type: 'cancelled',
      title: 'Order cancelled',
      description: `Order ${orderId} was cancelled.`,
    });
  };

  const submitFeedback = async (orderId, rating, comment) => {
    const existing = orders.find((order) => order.id === orderId);
    try {
      await saveCustomerOrderFeedback(orderId, {
        email: user?.email || existing?.customerEmail,
        rating,
        comment,
      });
    } catch (error) {
      if (!/not found/i.test(error.message || '')) throw error;
    }
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, feedback: { rating, comment } } : order
      )
    );
  };

  const markRead = (id) => {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
    markCustomerNotifications(id);
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    markCustomerNotifications();
  };

  const unreadCount = notifications.filter((item) => !item.read).length;
  const customerOrders = user
    ? orders.filter(
        (order) =>
          order.customerEmail?.toLowerCase() === user.email.toLowerCase() ||
          order.customerName === user.name
      )
    : [];
  const gardenDesigns = user
    ? designs.filter((design) => design.customerEmail === user.email)
    : [];

  const wishlistIds = user ? wishlistMap[user.email] || [] : [];
  const wishlistProducts = catalog.filter((item) => wishlistIds.includes(item.id) || wishlistIds.includes(String(item.id)));

  const toggleWishlist = async (productId) => {
    if (!user) {
      throw new Error('Please log in to save favourite harvests.');
    }
    const current = wishlistMap[user.email] || [];
    const key = String(productId);
    const next = current.map(String).includes(key)
      ? current.filter((id) => String(id) !== key)
      : [productId, ...current];
    setWishlistMap((prev) => ({ ...prev, [user.email]: next }));
    try {
      await saveWishlistIds(next.map(String));
    } catch {
      /* keep local copy */
    }
  };

  const isWishlisted = (productId) => wishlistIds.includes(productId);

  useEffect(() => {
    if (!user?.email) return undefined;
    const names = new Set();
    designs
      .filter((design) => design.customerEmail === user.email)
      .forEach((design) => {
        (design.plots || []).forEach((plot) => {
          const plant = catalog.find((item) => item.id === plotPlantId(plot) || String(item.id) === String(plotPlantId(plot)));
          if (plant) names.add(plant.name.toLowerCase());
        });
      });
    if (!names.size) return undefined;
    catalog
      .filter((item) => item.available)
      .forEach((item) => {
        if (!names.has(item.name.toLowerCase())) return;
        addNotification({
          key: `harvest-shop-${user.email}-${item.id}`,
          type: 'harvest',
          title: `${item.name} is in the shop`,
          description: `A crop from your garden design is available to order now.`,
        });
      });
    return undefined;
  }, [user?.email, designs, catalog]);

  const saveGardenDesign = async (design) => {
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

    let saved = payload;
    try {
      saved = await saveGardenDesignRecord(payload);
    } catch {
      /* keep local copy */
    }

    setDesigns((prev) => {
      const exists = prev.some((item) => item.id === saved.id || item.id === payload.id);
      if (exists) return prev.map((item) => (item.id === saved.id || item.id === payload.id ? saved : item));
      return [saved, ...prev];
    });

    addNotification({
      type: 'garden',
      title: 'Garden design saved',
      description: `${saved.name || 'Your garden'} was saved to your account.`,
    });

    return saved;
  };

  const deleteGardenDesign = async (id) => {
    setDesigns((prev) => prev.filter((item) => item.id !== id));
    try {
      await deleteGardenDesignRecord(id);
    } catch {
      /* ignore */
    }
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
      refreshOrders,
      saveGardenDesign,
      deleteGardenDesign,
      wishlistProducts,
      wishlistIds,
      toggleWishlist,
      isWishlisted,
      markRead,
      markAllRead,
      products: catalog,
    }),
    [user, users, customerOrders, gardenDesigns, notifications, unreadCount, wishlistIds, wishlistProducts, catalog]
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
