export const TASK_STATUSES = ['Pending', 'Assigned', 'In Progress', 'Completed'];
export const TASK_PRIORITIES = ['Low', 'Medium', 'High'];

export const NEXT_TASK_STATUS = {
  Pending: 'Assigned',
  Assigned: 'In Progress',
  'In Progress': 'Completed',
};

export const TASK_MANAGERS = ['admin', 'garden_manager'];
export const TASK_WORKERS = ['admin', 'garden_manager', 'gardener'];
