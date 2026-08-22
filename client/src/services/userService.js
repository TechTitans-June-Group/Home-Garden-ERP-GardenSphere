import api from './api.js';

const apiError = (error, fallback) => {
  throw new Error(error.response?.data?.message || fallback);
};

export const fetchStaffUsers = async () => {
  try {
    const { data } = await api.get('/users');
    return data.users || [];
  } catch (error) {
    apiError(error, 'Could not load staff users.');
  }
};

export const createStaffUser = async (payload) => {
  try {
    const { data } = await api.post('/users', payload);
    return data.user;
  } catch (error) {
    apiError(error, 'Could not create user.');
  }
};

export const updateStaffUser = async (id, payload) => {
  try {
    const { data } = await api.put(`/users/${id}`, payload);
    return data.user;
  } catch (error) {
    apiError(error, 'Could not update user.');
  }
};

export const setStaffUserStatus = async (id, status) => {
  try {
    const { data } = await api.patch(`/users/${id}/status`, { status });
    return data.user;
  } catch (error) {
    apiError(error, 'Could not update user status.');
  }
};

export const resetStaffUserPassword = async (id, password) => {
  try {
    await api.post(`/users/${id}/password`, { password });
  } catch (error) {
    apiError(error, 'Could not reset password.');
  }
};

export const fetchStaffActivity = async () => {
  try {
    const { data } = await api.get('/users/activity');
    return data.activity || [];
  } catch (error) {
    apiError(error, 'Could not load activity.');
  }
};
