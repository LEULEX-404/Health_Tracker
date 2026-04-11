import express from 'express';
import {
  createSupportMessage,
  getMySupportMessages,
  getAllSupportMessages,
  updateSupportMessageStatus,
} from '../../controllers/Imasha/supportController.js';
import { authenticate, isAdmin, isDoctor } from '../../middleware/Imasha/authMiddleware.js';

const router = express.Router();

router.post('/', authenticate, isDoctor, createSupportMessage);
router.get('/mine', authenticate, isDoctor, getMySupportMessages);
router.get('/', authenticate, isAdmin, getAllSupportMessages);
router.patch('/:id', authenticate, isAdmin, updateSupportMessageStatus);

export default router;
