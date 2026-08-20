import api from './api.js';

const apiError = (error, fallback) => {
  throw new Error(error.response?.data?.message || fallback);
};

export const fetchInventory = async () => {
  try {
    const { data } = await api.get('/inventory');
    return data;
  } catch (error) {
    apiError(error, 'Could not load inventory from the database.');
  }
};

export const createInventoryItem = async (payload) => {
  try {
    const { data } = await api.post('/inventory/items', payload);
    return data.item;
  } catch (error) {
    apiError(error, 'Could not save inventory item.');
  }
};

export const updateInventoryItem = async (id, payload) => {
  try {
    const { data } = await api.put(`/inventory/items/${id}`, payload);
    return data.item;
  } catch (error) {
    apiError(error, 'Could not update inventory item.');
  }
};

export const deleteInventoryItem = async (id) => {
  try {
    await api.delete(`/inventory/items/${id}`);
  } catch (error) {
    apiError(error, 'Could not delete inventory item.');
  }
};

export const moveInventoryStock = async (payload) => {
  try {
    const { data } = await api.post('/inventory/stock', payload);
    return data.item;
  } catch (error) {
    apiError(error, 'Could not record stock movement.');
  }
};

export const adjustInventoryStock = async (payload) => {
  try {
    const { data } = await api.post('/inventory/stock/adjust', payload);
    return data.item;
  } catch (error) {
    apiError(error, 'Could not update stock.');
  }
};

export const saveInventorySupplier = async (payload) => {
  try {
    if (payload.id) {
      const { data } = await api.put(`/inventory/suppliers/${payload.id}`, payload);
      return data.supplier;
    }
    const { data } = await api.post('/inventory/suppliers', payload);
    return data.supplier;
  } catch (error) {
    apiError(error, 'Could not save supplier.');
  }
};

export const deleteInventorySupplier = async (id) => {
  try {
    await api.delete(`/inventory/suppliers/${id}`);
  } catch (error) {
    apiError(error, 'Could not delete supplier.');
  }
};

export const saveInventoryPurchase = async (payload) => {
  try {
    if (payload.id) {
      const { data } = await api.put(`/inventory/purchases/${payload.id}`, payload);
      return data.purchase;
    }
    const { data } = await api.post('/inventory/purchases', payload);
    return data.purchase;
  } catch (error) {
    apiError(error, 'Could not save purchase.');
  }
};

export const deleteInventoryPurchase = async (id) => {
  try {
    await api.delete(`/inventory/purchases/${id}`);
  } catch (error) {
    apiError(error, 'Could not delete purchase.');
  }
};

export const recordCustomerPurchase = async (payload) => {
  try {
    const { data } = await api.post('/inventory/customer-purchases', payload);
    return data.purchase;
  } catch (error) {
    apiError(error, 'Could not save this order to purchases.');
  }
};

export const cancelCustomerPurchase = async (payload) => {
  try {
    const { data } = await api.post('/inventory/customer-purchases/cancel', payload);
    return data.purchase;
  } catch (error) {
    apiError(error, 'Could not cancel this purchase.');
  }
};

export const fetchCustomerOrders = async (email) => {
  try {
    const { data } = await api.get('/inventory/customer-orders', { params: { email } });
    return data.orders || [];
  } catch (error) {
    apiError(error, 'Could not load your orders.');
  }
};

export const saveCustomerOrderFeedback = async (orderRef, payload) => {
  try {
    const { data } = await api.post(`/inventory/customer-orders/${encodeURIComponent(orderRef)}/feedback`, payload);
    return data.order;
  } catch (error) {
    apiError(error, 'Could not save feedback.');
  }
};
