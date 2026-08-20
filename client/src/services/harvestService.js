import api from './api.js';

const apiError = (error, fallback) => {
  throw new Error(error.response?.data?.message || fallback);
};

export const fetchHarvestDesk = async () => {
  try {
    const { data } = await api.get('/harvest');
    return data;
  } catch (error) {
    apiError(error, 'Could not load harvest records from the database.');
  }
};

export const saveHarvestRecord = async (payload) => {
  try {
    if (payload.id) {
      const { data } = await api.put(`/harvest/harvests/${payload.id}`, payload);
      return data.harvest;
    }
    const { data } = await api.post('/harvest/harvests', payload);
    return data.harvest;
  } catch (error) {
    apiError(error, 'Could not save harvest.');
  }
};

export const deleteHarvestRecord = async (id) => {
  try {
    await api.delete(`/harvest/harvests/${id}`);
  } catch (error) {
    apiError(error, 'Could not delete harvest.');
  }
};

export const linkHarvestToSale = async (harvestId, payload) => {
  try {
    const { data } = await api.post(`/harvest/harvests/${harvestId}/sale`, payload);
    return data;
  } catch (error) {
    apiError(error, 'Could not link harvest to sales.');
  }
};

export const saveHarvestSale = async (payload) => {
  try {
    const { data } = await api.put(`/harvest/sales/${payload.id}`, payload);
    return data;
  } catch (error) {
    apiError(error, 'Could not update harvest sale.');
  }
};

export const deleteHarvestSale = async (id) => {
  try {
    await api.delete(`/harvest/sales/${id}`);
  } catch (error) {
    apiError(error, 'Could not unlink harvest sale.');
  }
};
