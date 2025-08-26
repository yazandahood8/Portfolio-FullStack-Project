import { Router } from 'express';
import {
  createMessage,
  getMessages,
  getMessageById,
  markRead,
  deleteMessage,
} from '../controllers/messageController.js';

const router = Router();

// Public (contact form)
router.post('/', createMessage);

// Owner/Admin (add your auth middleware if needed)
// e.g. router.use(authMiddleware);
router.get('/', getMessages);
router.get('/:id', getMessageById);
router.patch('/:id/read', markRead);
router.delete('/:id', deleteMessage);

export default router;
