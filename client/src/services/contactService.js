import api from './api.js';

const apiError = (error, fallback) => {
  throw new Error(error.response?.data?.message || fallback);
};

export const sendContactMessage = async (payload) => {
  try {
    const { data } = await api.post('/contact', payload);
    return data.message;
  } catch (error) {
    apiError(error, 'Could not send your message.');
  }
};

export const fetchMyContactMessages = async (email) => {
  try {
    const { data } = await api.get('/contact/my', { params: { email } });
    return data.messages || [];
  } catch (error) {
    apiError(error, 'Could not load your messages.');
  }
};

export const fetchStaffMessages = async () => {
  try {
    const { data } = await api.get('/contact');
    return data;
  } catch (error) {
    apiError(error, 'Could not load contact messages.');
  }
};

export const fetchStaffMessage = async (id) => {
  try {
    const { data } = await api.get(`/contact/${id}`);
    return data.message;
  } catch (error) {
    apiError(error, 'Could not open that message.');
  }
};

export const replyToContactMessage = async (id, body) => {
  try {
    const { data } = await api.post(`/contact/${id}/reply`, { body });
    return data.message;
  } catch (error) {
    apiError(error, 'Could not send the reply.');
  }
};

export const updateContactStatus = async (id, status) => {
  try {
    const { data } = await api.patch(`/contact/${id}/status`, { status });
    return data.message;
  } catch (error) {
    apiError(error, 'Could not update message status.');
  }
};

export const deleteContactMessage = async (id) => {
  try {
    await api.delete(`/contact/${id}`);
  } catch (error) {
    apiError(error, 'Could not delete that message.');
  }
};
