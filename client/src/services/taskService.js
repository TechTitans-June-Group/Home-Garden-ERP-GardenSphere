import api from './api.js';

const apiError = (error, fallback) => {
  throw new Error(error.response?.data?.message || fallback);
};

export const fetchTasks = async () => {
  try {
    const { data } = await api.get('/tasks');
    return data.tasks || [];
  } catch (error) {
    apiError(error, 'Could not load tasks.');
  }
};

export const fetchTaskAssignees = async () => {
  try {
    const { data } = await api.get('/tasks/assignees');
    return data.assignees || [];
  } catch (error) {
    apiError(error, 'Could not load assignees.');
  }
};

export const saveTaskRecord = async (payload) => {
  try {
    if (payload.id) {
      const { data } = await api.put(`/tasks/${payload.id}`, payload);
      return data.task;
    }
    const { data } = await api.post('/tasks', payload);
    return data.task;
  } catch (error) {
    apiError(error, 'Could not save task.');
  }
};

export const updateTaskStatusRecord = async (id, status) => {
  try {
    const { data } = await api.patch(`/tasks/${id}/status`, { status });
    return data.task;
  } catch (error) {
    apiError(error, 'Could not update task status.');
  }
};

export const addTaskCommentRecord = async (id, text) => {
  try {
    const { data } = await api.post(`/tasks/${id}/comments`, { text });
    return data.task;
  } catch (error) {
    apiError(error, 'Could not add comment.');
  }
};

export const deleteTaskRecord = async (id) => {
  try {
    await api.delete(`/tasks/${id}`);
  } catch (error) {
    apiError(error, 'Could not delete task.');
  }
};
