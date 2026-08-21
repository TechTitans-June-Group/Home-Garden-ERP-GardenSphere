import api from './api.js';

const apiError = (error, fallback) => {
  throw new Error(error.response?.data?.message || fallback);
};

export const fetchCrops = async () => {
  try {
    const { data } = await api.get('/crops');
    return data;
  } catch (error) {
    apiError(error, 'Could not load crop records from the database.');
  }
};

// Plantings (Crops in ground)
export const savePlanting = async (payload) => {
  try {
    if (payload.id) {
      const { data } = await api.put(`/crops/plantings/${payload.id}`, payload);
      return data.planting;
    }
    const { data } = await api.post('/crops/plantings', payload);
    return data.planting;
  } catch (error) {
    apiError(error, 'Could not save planting.');
  }
};

export const deletePlanting = async (id) => {
  try {
    await api.delete(`/crops/plantings/${id}`);
  } catch (error) {
    apiError(error, 'Could not delete planting.');
  }
};

// Plants (Crop types)
export const savePlant = async (payload) => {
  try {
    if (payload.id) {
      const { data } = await api.put(`/crops/plants/${payload.id}`, payload);
      return data.plant;
    }
    const { data } = await api.post('/crops/plants', payload);
    return data.plant;
  } catch (error) {
    apiError(error, 'Could not save plant.');
  }
};

export const deletePlant = async (id) => {
  try {
    await api.delete(`/crops/plants/${id}`);
  } catch (error) {
    apiError(error, 'Could not delete plant.');
  }
};

// Varieties
export const saveVariety = async (payload) => {
  try {
    if (payload.id) {
      const { data } = await api.put(`/crops/varieties/${payload.id}`, payload);
      return data.variety;
    }
    const { data } = await api.post('/crops/varieties', payload);
    return data.variety;
  } catch (error) {
    apiError(error, 'Could not save variety.');
  }
};

export const deleteVariety = async (id) => {
  try {
    await api.delete(`/crops/varieties/${id}`);
  } catch (error) {
    apiError(error, 'Could not delete variety.');
  }
};

// Locations
export const saveLocation = async (payload) => {
  try {
    if (payload.id) {
      const { data } = await api.put(`/crops/locations/${payload.id}`, payload);
      return data.location;
    }
    const { data } = await api.post('/crops/locations', payload);
    return data.location;
  } catch (error) {
    apiError(error, 'Could not save location.');
  }
};

export const deleteLocation = async (id) => {
  try {
    await api.delete(`/crops/locations/${id}`);
  } catch (error) {
    apiError(error, 'Could not delete location.');
  }
};
