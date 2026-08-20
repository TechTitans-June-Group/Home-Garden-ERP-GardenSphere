import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { TASK_MANAGERS, TASK_WORKERS } from '../config/tasks.js';
import {
  addTaskComment,
  createTask,
  deleteTask,
  getAssignees,
  getMyTasks,
  getTaskById,
  getTasks,
  updateTask,
  updateTaskStatus,
} from '../controllers/taskController.js';

const router = Router();

router.use(protect);

router.get('/', authorize(...TASK_WORKERS), getTasks);
router.get('/mine', authorize(...TASK_WORKERS), getMyTasks);
router.get('/assignees', authorize(...TASK_MANAGERS), getAssignees);
router.post('/', authorize(...TASK_MANAGERS), createTask);
router.get('/:id', authorize(...TASK_WORKERS), getTaskById);
router.put('/:id', authorize(...TASK_WORKERS), updateTask);
router.patch('/:id/status', authorize(...TASK_WORKERS), updateTaskStatus);
router.post('/:id/comments', authorize(...TASK_WORKERS), addTaskComment);
router.delete('/:id', authorize(...TASK_MANAGERS), deleteTask);

export default router;
