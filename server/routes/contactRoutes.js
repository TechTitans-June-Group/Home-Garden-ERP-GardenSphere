import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  createMessage,
  deleteMessage,
  getMessage,
  listMessages,
  listMyMessages,
  replyMessage,
  updateMessageStatus,
} from '../controllers/contactController.js';

const router = Router();

router.post('/', createMessage);
router.get('/my', listMyMessages);

router.use(protect, authorize('admin', 'garden_manager'));

router.get('/', listMessages);
router.get('/:id', getMessage);
router.post('/:id/reply', replyMessage);
router.patch('/:id/status', updateMessageStatus);
router.delete('/:id', deleteMessage);

export default router;
