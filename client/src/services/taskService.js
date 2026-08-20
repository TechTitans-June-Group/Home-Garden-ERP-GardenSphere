import api from './api.js';

export const fetchTasks = async () => {
  const { data } = await api.get('/tasks');
  return data.tasks;
};

export const fetchMyTasks = async () => {
  const { data } = await api.get('/tasks/mine');
  return data.tasks;
};

export const fetchAssignees = async () => {
  const { data } = await api.get('/tasks/assignees');
  return data.assignees;
};

export const createTask = async (payload) => {
  const { data } = await api.post('/tasks', payload);
  return data.task;
};

export const updateTask = async (id, payload) => {
  const { data } = await api.put(`/tasks/${id}`, payload);
  return data.task;
};

export const updateTaskStatus = async (id, status) => {
  const { data } = await api.patch(`/tasks/${id}/status`, { status });
  return data.task;
};

export const addTaskComment = async (id, text) => {
  const { data } = await api.post(`/tasks/${id}/comments`, { text });
  return data.task;
};

export const deleteTask = async (id) => {
  const { data } = await api.delete(`/tasks/${id}`);
  return data;
};
