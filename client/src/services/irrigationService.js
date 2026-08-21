import api from './api.js';

const apiError = (error, fallback) => {
  throw new Error(error.response?.data?.message || fallback);
};

export const fetchIrrigationDesk = async () => {
  try {
    const { data } = await api.get('/irrigation');
    return data;
  } catch (error) {
    apiError(error, 'Could not load irrigation records from the database.');
  }
};

export const saveIrrigationSchedule = async (payload) => {
  try {
    if (payload.id) {
      const { data } = await api.put(`/irrigation/schedules/${payload.id}`, payload);
      return data.schedule;
    }
    const { data } = await api.post('/irrigation/schedules', payload);
    return data.schedule;
  } catch (error) {
    apiError(error, 'Could not save irrigation schedule.');
  }
};

export const deleteIrrigationSchedule = async (id) => {
  try {
    await api.delete(`/irrigation/schedules/${id}`);
  } catch (error) {
    apiError(error, 'Could not delete irrigation schedule.');
  }
};

export const recordWateringTask = async (payload) => {
  try {
    const { data } = await api.post('/irrigation/records', payload);
    return data.record;
  } catch (error) {
    apiError(error, 'Could not log watering execution.');
  }
};
