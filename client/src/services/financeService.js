import api from './api.js';

const apiError = (error, fallback) => {
  throw new Error(error.response?.data?.message || fallback);
};

export const fetchFinance = async () => {
  try {
    const { data } = await api.get('/finance');
    return data;
  } catch (error) {
    apiError(error, 'Could not load finance records from the database.');
  }
};

export const saveFinanceExpense = async (payload) => {
  try {
    if (payload.id) {
      const { data } = await api.put(`/finance/expenses/${payload.id}`, payload);
      return data.expense;
    }
    const { data } = await api.post('/finance/expenses', payload);
    return data.expense;
  } catch (error) {
    apiError(error, 'Could not save expense.');
  }
};

export const deleteFinanceExpense = async (id) => {
  try {
    await api.delete(`/finance/expenses/${id}`);
  } catch (error) {
    apiError(error, 'Could not delete expense.');
  }
};

export const saveFinanceIncome = async (payload) => {
  try {
    if (payload.id) {
      const { data } = await api.put(`/finance/income/${payload.id}`, payload);
      return data.income;
    }
    const { data } = await api.post('/finance/income', payload);
    return data.income;
  } catch (error) {
    apiError(error, 'Could not save income.');
  }
};

export const deleteFinanceIncome = async (id) => {
  try {
    await api.delete(`/finance/income/${id}`);
  } catch (error) {
    apiError(error, 'Could not delete income.');
  }
};

export const saveFinanceCategory = async (payload) => {
  try {
    const { data } = await api.post('/finance/categories', payload);
    return data.category;
  } catch (error) {
    apiError(error, 'Could not save category.');
  }
};

export const deleteFinanceCategory = async (id) => {
  try {
    await api.delete(`/finance/categories/${id}`);
  } catch (error) {
    apiError(error, 'Could not delete category.');
  }
};
