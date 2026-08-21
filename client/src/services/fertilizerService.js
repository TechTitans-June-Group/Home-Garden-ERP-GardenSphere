import api from './api.js';

const apiError = (error, fallback) => {
  throw new Error(error.response?.data?.message || fallback);
};

export const fetchFertilizersDesk = async () => {
  try {
    const { data } = await api.get('/fertilizers');
    return data;
  } catch (error) {
    apiError(error, 'Could not load fertilizer records from the database.');
  }
};

export const saveFertilizerStock = async (payload) => {
  try {
    if (payload.id) {
      const { data } = await api.put(`/fertilizers/stock/${payload.id}`, payload);
      return data.fertilizer;
    }
    const { data } = await api.post('/fertilizers/stock', payload);
    return data.fertilizer;
  } catch (error) {
    apiError(error, 'Could not save fertilizer stock.');
  }
};

export const deleteFertilizerStock = async (id) => {
  try {
    await api.delete(`/fertilizers/stock/${id}`);
  } catch (error) {
    apiError(error, 'Could not delete fertilizer from stock.');
  }
};

export const saveFertilizerApplication = async (payload) => {
  try {
    if (payload.id) {
      const { data } = await api.put(`/fertilizers/applications/${payload.id}`, payload);
      return data.application;
    }
    const { data } = await api.post('/fertilizers/applications', payload);
    return data.application;
  } catch (error) {
    apiError(error, 'Could not save fertilizer application.');
  }
};

export const deleteFertilizerApplication = async (id) => {
  try {
    await api.delete(`/fertilizers/applications/${id}`);
  } catch (error) {
    apiError(error, 'Could not delete application record.');
  }
};
