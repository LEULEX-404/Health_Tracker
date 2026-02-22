import express from "express";
const router = express.Router();
import appointmentsController from "../../controllers/Priya/appointmentsController.js";

router.get('/', appointmentsController.getAppointments);
router.get('/:id', appointmentsController.getAppointmentById);
router.post('/', appointmentsController.createAppointment);
router.put('/:id', appointmentsController.updateAppointment);
router.put('/:id/cancel', appointmentsController.cancelAppointment);
router.delete('/:id', appointmentsController.deleteAppointment);

export default router;
