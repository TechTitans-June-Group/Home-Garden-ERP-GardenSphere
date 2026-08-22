import api from './api.js';

const apiError = (error, fallback) => {
  throw new Error(error.response?.data?.message || fallback);
};

export const registerCustomer = async (payload) => {
  try {
    const { data } = await api.post('/auth/register', payload);
    return data;
  } catch (error) {
    apiError(error, 'Could not register.');
  }
};

export const loginAccount = async (email, password) => {
  try {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  } catch (error) {
    apiError(error, 'Invalid email or password.');
  }
};

export const resetAccountPassword = async (email, password) => {
  try {
    const { data } = await api.post('/auth/reset-password', { email, password });
    return data;
  } catch (error) {
    apiError(error, 'Could not reset password.');
  }
};

export const updateMyProfile = async (payload) => {
  try {
    const { data } = await api.put('/auth/me', payload);
    return data.user;
  } catch (error) {
    apiError(error, 'Could not update profile.');
  }
};

export const fetchWishlist = async () => {
  try {
    const { data } = await api.get('/customer/wishlist');
    return data.wishlist || [];
  } catch (error) {
    apiError(error, 'Could not load wishlist.');
  }
};

export const saveWishlistIds = async (wishlist) => {
  try {
    const { data } = await api.put('/customer/wishlist', { wishlist });
    return data.wishlist || [];
  } catch (error) {
    apiError(error, 'Could not save wishlist.');
  }
};

export const fetchGardenDesigns = async () => {
  try {
    const { data } = await api.get('/customer/designs');
    return data.designs || [];
  } catch (error) {
    apiError(error, 'Could not load garden designs.');
  }
};

export const saveGardenDesignRecord = async (payload) => {
  try {
    const { data } = await api.post('/customer/designs', payload);
    return data.design;
  } catch (error) {
    apiError(error, 'Could not save garden design.');
  }
};

export const deleteGardenDesignRecord = async (id) => {
  try {
    await api.delete(`/customer/designs/${id}`);
  } catch (error) {
    apiError(error, 'Could not delete garden design.');
  }
};

export const fetchCustomerNotifications = async () => {
  try {
    const { data } = await api.get('/customer/notifications');
    return data.notifications || [];
  } catch (error) {
    apiError(error, 'Could not load notifications.');
  }
};

export const postCustomerNotification = async (payload) => {
  try {
    await api.post('/customer/notifications', payload);
  } catch {
    /* ignore duplicate/offline */
  }
};

export const markCustomerNotifications = async (id) => {
  try {
    await api.patch('/customer/notifications', id ? { id } : {});
  } catch {
    /* ignore */
  }
};
