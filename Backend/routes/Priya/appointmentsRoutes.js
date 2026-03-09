import express from "express";
const router = express.Router();
import appointmentsController from "../../controllers/Priya/appointmentsController.js";
import { authenticate } from '../../middleware/Imasha/authMiddleware.js';

router.get('/', authenticate, appointmentsController.getAppointments);
router.get('/:id', authenticate, appointmentsController.getAppointmentById);
router.post('/', authenticate, appointmentsController.createAppointment);
router.put('/:id', authenticate, appointmentsController.updateAppointment);
router.put('/:id/cancel', authenticate, appointmentsController.cancelAppointment);
router.delete('/:id', authenticate, appointmentsController.deleteAppointment);

export default router;
