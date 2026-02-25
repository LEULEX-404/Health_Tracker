import express from "express";
const router = express.Router();
import adminAppointmentsController from "../../controllers/Priya/adminAppointmentsController.js";

router.get('/pending', adminAppointmentsController.getPendingAppointments);
router.put('/:id/confirm', adminAppointmentsController.confirmAppointment);
router.put('/:id/cancel', adminAppointmentsController.cancelAppointmentByAdmin);

export default router;
