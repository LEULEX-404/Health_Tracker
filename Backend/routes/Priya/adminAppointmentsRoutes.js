import express from "express";
const router = express.Router();
import adminAppointmentsController from "../../controllers/Priya/adminAppointmentsController.js";
import { authenticate, isAdmin } from '../../middleware/Imasha/authMiddleware.js';

router.get('/pending', authenticate, isAdmin, adminAppointmentsController.getPendingAppointments);
router.put('/:id/approve', authenticate, isAdmin, adminAppointmentsController.confirmAppointment);
router.put('/:id/reject', authenticate, isAdmin, adminAppointmentsController.cancelAppointmentByAdmin);

export default router;