import express from "express";
const router = express.Router();
import exerciseController from "../../controllers/Priya/exerciseController.js";
import { authenticate } from '../../middleware/Imasha/authMiddleware.js';

router.get('/', authenticate, exerciseController.getExerciseLogs);
router.post('/', authenticate, exerciseController.createExerciseLog);
router.put('/:id', authenticate, exerciseController.updateExerciseLog);
router.delete('/:id', authenticate, exerciseController.deleteExerciseLog);
router.get('/stats', authenticate, exerciseController.getStats);

export default router;