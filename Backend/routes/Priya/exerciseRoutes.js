import express from "express";
const router = express.Router();
import exerciseController from "../../controllers/Priya/exerciseController.js";

router.get('/', exerciseController.getExerciseLogs);
router.post('/', exerciseController.createExerciseLog);
router.put('/:id', exerciseController.updateExerciseLog);
router.delete('/:id', exerciseController.deleteExerciseLog);
router.get('/stats', exerciseController.getStats);

export default router;