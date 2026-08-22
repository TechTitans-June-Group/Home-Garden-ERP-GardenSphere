import api from './api.js';

const apiError = (error, fallback) => {
  throw new Error(error.response?.data?.message || fallback);
};

export const fetchMaintenanceDesk = async () => {
  try {
    const { data } = await api.get('/maintenance');
    return data;
  } catch (error) {
    apiError(error, 'Could not load maintenance records from the database.');
  }
};

export const saveMaintenanceRecord = async (payload) => {
  try {
    if (payload.id) {
      const { data } = await api.put(`/maintenance/${payload.id}`, payload);
      return data.record;
    }
    const { data } = await api.post('/maintenance', payload);
    return data.record;
  } catch (error) {
    apiError(error, 'Could not save maintenance record.');
  }
};

export const deleteMaintenanceRecord = async (id) => {
  try {
    await api.delete(`/maintenance/${id}`);
  } catch (error) {
    apiError(error, 'Could not delete maintenance record.');
  }
};
