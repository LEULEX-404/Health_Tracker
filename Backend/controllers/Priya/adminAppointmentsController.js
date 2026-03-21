import Appointment from "../../models/Priya/Appointment.js";
import { sendBookingStatusToPatient } from "./bookingEmailController.js";
import AdminActionLog from "../../models/Priya/AdminActionLog.js";

const DOCTOR_POPULATE = {
    path: "doctorId",
    populate: {
        path: "user",
        match: { isDeleted: false, role: "doctor" },
        select: "firstName lastName email phone profileImage",
    },
};

export const getPendingAppointments = async (req, res) => {
    try {
        const pending = await Appointment.find({ status: 'Pending' })
            .populate(DOCTOR_POPULATE)
            .sort({ createdAt: -1 });
        res.json(pending);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch pending appointments.' });
    }
};

export const confirmAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status: 'Confirmed' },
            { new: true }
        ).populate(DOCTOR_POPULATE);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found.' });
        }

        await AdminActionLog.create({
            appointmentId: appointment._id,
            action: 'confirm',
            status: appointment.status,
            actor: req.user?.email || 'admin',
            meta: {
                doctorId: appointment.doctorId?._id || appointment.doctorId || null,
                doctor: appointment.doctor,
                date: appointment.date,
                time: appointment.time,
                patientEmail: appointment.patientEmail
            }
        });

        if (appointment.patientEmail) {
            await sendBookingStatusToPatient(appointment, 'Confirmed');
        }

        return res.json(appointment);
    } catch (error) {
        return res.status(400).json({ message: 'Failed to confirm appointment.' });
    }
};

export const confirmAppointmentByBody = async (req, res) => {
    const { id } = req.body || {};
    if (!id) {
        return res.status(400).json({ message: 'Appointment id is required.' });
    }
    req.params = { id };
    return exports.confirmAppointment(req, res);
};

export const cancelAppointmentByAdmin = async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status: 'Cancelled' },
            { new: true }
        ).populate(DOCTOR_POPULATE);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found.' });
        }

        await AdminActionLog.create({
            appointmentId: appointment._id,
            action: 'cancel',
            status: appointment.status,
            actor: req.user?.email || 'admin',
            meta: {
                doctorId: appointment.doctorId?._id || appointment.doctorId || null,
                doctor: appointment.doctor,
                date: appointment.date,
                time: appointment.time,
                patientEmail: appointment.patientEmail
            }
        });

        if (appointment.patientEmail) {
            await sendBookingStatusToPatient(appointment, 'Cancelled');
        }

        return res.json(appointment);
    } catch (error) {
        return res.status(400).json({ message: 'Failed to cancel appointment.' });
    }
};

export const cancelAppointmentByBody = async (req, res) => {
    const { id } = req.body || {};
    if (!id) {
        return res.status(400).json({ message: 'Appointment id is required.' });
    }
    req.params = { id };
    return exports.cancelAppointmentByAdmin(req, res);
};

export default {
    getPendingAppointments,
    confirmAppointment,
    confirmAppointmentByBody,
    cancelAppointmentByAdmin,
    cancelAppointmentByBody
};
