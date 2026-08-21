import api from './api.js';

const apiError = (error, fallback) => {
  throw new Error(error.response?.data?.message || fallback);
};

export const fetchPests = async () => {
  try {
    const { data } = await api.get('/pests');
    return data;
  } catch (error) {
    apiError(error, 'Could not load pest & disease records from the database.');
  }
};

export const savePestRecord = async (payload) => {
  try {
    if (payload.id) {
      const { data } = await api.put(`/pests/${payload.id}`, payload);
      return data.record;
    }
    const { data } = await api.post('/pests', payload);
    return data.record;
  } catch (error) {
    apiError(error, 'Could not save pest/disease record.');
  }
};

export const deletePestRecord = async (id) => {
  try {
    await api.delete(`/pests/${id}`);
  } catch (error) {
    apiError(error, 'Could not delete pest/disease record.');
  }
};
