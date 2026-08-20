export const TASK_STATUSES = ['Pending', 'Assigned', 'In Progress', 'Completed'];
export const TASK_PRIORITIES = ['Low', 'Medium', 'High'];

export const NEXT_TASK_STATUS = {
  Pending: 'Assigned',
  Assigned: 'In Progress',
  'In Progress': 'Completed',
};

export const TASK_STATUS_STYLES = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Assigned: 'bg-sky-100 text-sky-800',
  'In Progress': 'bg-orange-100 text-orange-800',
  Completed: 'bg-emerald-100 text-emerald-800',
};

export const TASK_PRIORITY_STYLES = {
  High: 'bg-red-100 text-red-700',
  Medium: 'bg-amber-100 text-amber-800',
  Low: 'bg-slate-100 text-slate-700',
};

export const blankTask = () => ({
  id: '',
  title: '',
  description: '',
  assigneeId: '',
  assignee: '',
  priority: 'Medium',
  due: '',
  status: 'Pending',
  comments: [],
  history: [],
  completedAt: null,
  createdAt: '',
});

export const normalizeTask = (task = {}) => ({
  ...blankTask(),
  ...task,
  description: task.description || '',
  assigneeId: task.assigneeId || '',
  assignee: task.assignee || '',
  comments: Array.isArray(task.comments) ? task.comments : [],
  history: Array.isArray(task.history) ? task.history : [],
  completedAt: task.completedAt || null,
});

export const isTaskOverdue = (task) => {
  if (!task?.due || task.status === 'Completed') return false;
  const due = new Date(`${task.due}T23:59:59`);
  return !Number.isNaN(due.getTime()) && due < new Date();
};

export const isTaskManager = (role) => ['admin', 'garden_manager'].includes(role);

export const isAssignedTo = (task, staff) =>
  Boolean(staff) && (task.assigneeId === staff.id || task.assignee === staff.name);

export const dueTone = (task) => {
  if (!task?.due || task.status === 'Completed') return 'normal';
  const due = new Date(`${task.due}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((due - today) / 86400000);
  if (diff < 0) return 'overdue';
  if (diff === 0) return 'today';
  if (diff === 1) return 'tomorrow';
  return 'normal';
};
