import Task from '../models/Task.js';
import User from '../models/User.js';
import { ROLES } from '../config/roles.js';
import { NEXT_TASK_STATUS, TASK_MANAGERS, TASK_PRIORITIES, TASK_STATUSES } from '../config/tasks.js';

const ASSIGNABLE_ROLES = [ROLES.GARDENER, ROLES.GARDEN_MANAGER, ROLES.ADMIN];

const isManager = (role) => TASK_MANAGERS.includes(role);

const toDateString = (value) => {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
};

const formatPerson = (person) => {
  if (!person) return null;
  return {
    id: person._id,
    name: person.name,
    email: person.email,
    role: person.role,
  };
};

const formatTask = (task) => ({
  id: task._id,
  title: task.title,
  description: task.description || '',
  assignedTo: formatPerson(task.assignedTo),
  createdBy: formatPerson(task.createdBy),
  priority: task.priority,
  dueDate: toDateString(task.dueDate),
  status: task.status,
  comments: (task.comments || []).map((comment) => ({
    id: comment._id,
    text: comment.text,
    author: formatPerson(comment.author) || { id: comment.author, name: 'Staff' },
    createdAt: comment.createdAt,
  })),
  history: (task.history || []).map((entry) => ({
    id: entry._id,
    action: entry.action,
    detail: entry.detail,
    actorName: entry.actorName,
    createdAt: entry.createdAt,
  })),
  completedAt: task.completedAt,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
});

const populateTask = (query) =>
  query
    .populate('assignedTo', 'name email role')
    .populate('createdBy', 'name email role')
    .populate('comments.author', 'name email role');

const historyEntry = (user, action, detail) => ({
  action,
  detail,
  actor: user._id,
  actorName: user.name,
});

const canAccessTask = (user, task) => {
  if (isManager(user.role)) return true;
  const assignedId = task.assignedTo?._id?.toString() || task.assignedTo?.toString();
  return assignedId === user._id.toString();
};

const resolveAssignee = async (assignedTo) => {
  if (!assignedTo) return null;
  const user = await User.findById(assignedTo);
  if (!user || !user.isActive || !ASSIGNABLE_ROLES.includes(user.role)) {
    const error = new Error('Assignee must be an active gardener, garden manager, or admin');
    error.statusCode = 400;
    throw error;
  }
  return user;
};

const applyStatusRules = (task, nextStatus, assignedUser) => {
  const status = nextStatus || task.status;
  if (assignedUser && status === 'Pending') {
    task.status = 'Assigned';
  } else {
    task.status = status;
  }

  if (task.status === 'Completed') {
    task.completedAt = task.completedAt || new Date();
  } else {
    task.completedAt = null;
  }
};

export const getTasks = async (req, res, next) => {
  try {
    const filter = isManager(req.user.role) ? {} : { assignedTo: req.user._id };
    const tasks = await populateTask(Task.find(filter).sort({ createdAt: -1 }));
    res.json({ tasks: tasks.map(formatTask) });
  } catch (error) {
    next(error);
  }
};

export const getMyTasks = async (req, res, next) => {
  try {
    const tasks = await populateTask(Task.find({ assignedTo: req.user._id }).sort({ createdAt: -1 }));
    res.json({ tasks: tasks.map(formatTask) });
  } catch (error) {
    next(error);
  }
};

export const getAssignees = async (req, res, next) => {
  try {
    const users = await User.find({
      role: { $in: ASSIGNABLE_ROLES },
      isActive: true,
    })
      .select('name email role')
      .sort({ name: 1 });

    res.json({
      assignees: users.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const task = await populateTask(Task.findById(req.params.id));
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (!canAccessTask(req.user, task)) {
      return res.status(403).json({ message: 'You can only view tasks assigned to you' });
    }
    res.json({ task: formatTask(task) });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const { title, description = '', assignedTo, priority = 'Medium', dueDate, status } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ message: 'Task title is required' });
    }
    if (priority && !TASK_PRIORITIES.includes(priority)) {
      return res.status(400).json({ message: 'Invalid task priority' });
    }
    if (status && !TASK_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid task status' });
    }

    const assignee = await resolveAssignee(assignedTo);
    const task = new Task({
      title: title.trim(),
      description: description.trim(),
      assignedTo: assignee?._id || null,
      createdBy: req.user._id,
      priority,
      dueDate: dueDate || null,
      status: status || 'Pending',
      history: [historyEntry(req.user, 'Created', 'Task created')],
    });

    applyStatusRules(task, task.status, assignee);
    if (assignee) {
      task.history.push(historyEntry(req.user, 'Assigned', `Assigned to ${assignee.name}`));
    }

    await task.save();
    const created = await populateTask(Task.findById(task._id));
    res.status(201).json({ task: formatTask(created) });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (!canAccessTask(req.user, task)) {
      return res.status(403).json({ message: 'You can only update tasks assigned to you' });
    }

    const manager = isManager(req.user.role);
    const { title, description, assignedTo, priority, dueDate, status } = req.body;

    if (!manager) {
      if (status && status !== task.status) {
        const allowed = NEXT_TASK_STATUS[task.status];
        if (status !== allowed) {
          return res.status(400).json({
            message: `Gardeners can only move this task to ${allowed || 'no further status'}`,
          });
        }
        task.history.push(historyEntry(req.user, 'Status updated', `${task.status} → ${status}`));
        applyStatusRules(task, status, task.assignedTo);
      } else {
        return res.status(403).json({ message: 'Gardeners can only update task status or add comments' });
      }

      await task.save();
      const updated = await populateTask(Task.findById(task._id));
      return res.json({ task: formatTask(updated) });
    }

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({ message: 'Task title is required' });
      }
      if (task.title !== title.trim()) {
        task.history.push(historyEntry(req.user, 'Updated', `Title changed to "${title.trim()}"`));
      }
      task.title = title.trim();
    }

    if (description !== undefined && task.description !== description.trim()) {
      task.description = description.trim();
      task.history.push(historyEntry(req.user, 'Updated', 'Description updated'));
    }

    if (priority !== undefined) {
      if (!TASK_PRIORITIES.includes(priority)) {
        return res.status(400).json({ message: 'Invalid task priority' });
      }
      if (task.priority !== priority) {
        task.history.push(historyEntry(req.user, 'Updated', `Priority set to ${priority}`));
      }
      task.priority = priority;
    }

    if (dueDate !== undefined) {
      const nextDue = dueDate || null;
      const previousDue = toDateString(task.dueDate);
      const nextDueLabel = nextDue ? toDateString(nextDue) : '';
      if (previousDue !== nextDueLabel) {
        task.history.push(
          historyEntry(req.user, 'Updated', nextDueLabel ? `Due date set to ${nextDueLabel}` : 'Due date cleared')
        );
      }
      task.dueDate = nextDue;
    }

    if (assignedTo !== undefined) {
      const assignee = await resolveAssignee(assignedTo);
      const previousId = task.assignedTo?.toString() || '';
      const nextId = assignee?._id?.toString() || '';
      if (previousId !== nextId) {
        task.assignedTo = assignee?._id || null;
        task.history.push(historyEntry(req.user, 'Assigned', assignee ? `Assigned to ${assignee.name}` : 'Unassigned'));
      }
    }

    if (status !== undefined) {
      if (!TASK_STATUSES.includes(status)) {
        return res.status(400).json({ message: 'Invalid task status' });
      }
      if (task.status !== status) {
        task.history.push(historyEntry(req.user, 'Status updated', `${task.status} → ${status}`));
      }
      applyStatusRules(task, status, task.assignedTo);
    } else {
      applyStatusRules(task, task.status, task.assignedTo);
    }

    await task.save();
    const updated = await populateTask(Task.findById(task._id));
    res.json({ task: formatTask(updated) });
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!TASK_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid task status' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (!canAccessTask(req.user, task)) {
      return res.status(403).json({ message: 'You can only update tasks assigned to you' });
    }

    if (!isManager(req.user.role)) {
      const allowed = NEXT_TASK_STATUS[task.status];
      if (status !== allowed) {
        return res.status(400).json({
          message: `Gardeners can only move this task to ${allowed || 'no further status'}`,
        });
      }
    }

    if (task.status !== status) {
      task.history.push(historyEntry(req.user, 'Status updated', `${task.status} → ${status}`));
    }
    applyStatusRules(task, status, task.assignedTo);
    await task.save();

    const updated = await populateTask(Task.findById(task._id));
    res.json({ task: formatTask(updated) });
  } catch (error) {
    next(error);
  }
};

export const addTaskComment = async (req, res, next) => {
  try {
    const text = req.body.text?.trim();
    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (!canAccessTask(req.user, task)) {
      return res.status(403).json({ message: 'You can only comment on tasks assigned to you' });
    }

    task.comments.push({ text, author: req.user._id });
    task.history.push(historyEntry(req.user, 'Comment added', text.slice(0, 80)));
    await task.save();

    const updated = await populateTask(Task.findById(task._id));
    res.status(201).json({ task: formatTask(updated) });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};
