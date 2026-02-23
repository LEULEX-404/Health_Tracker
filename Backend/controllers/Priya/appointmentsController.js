import Appointment from "../../models/Priya/Appointment.js";
import { sendBookingReceivedToPatient } from "./bookingEmailController.js";

const DEFAULT_AVATAR = 'https://i.pravatar.cc/150?img=12';

const getAppointments = async (req, res) => {
    try {
        const list = await Appointment.find().sort({ createdAt: -1 });
        const appointments = list.map((doc) => {
            const o = doc.toObject ? doc.toObject() : doc;
            return { ...o, avatar: o.avatar && o.avatar.trim() ? o.avatar : DEFAULT_AVATAR };
        });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch appointments.' });
    }
};

const getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found.' });
        }
        return res.json(appointment);
    } catch (error) {
        return res.status(400).json({ message: 'Invalid appointment id.' });
    }
};

const createAppointment = async (req, res) => {
    try {
        const { doctor, date, time, patientName, patientEmail, patientPhone } = req.body || {};
        if (!doctor || !date || !time) {
            return res.status(400).json({ message: 'doctor, date and time are required.' });
        }

        const appointment = await Appointment.create({
            ...req.body,
            status: req.body.status || 'Pending',
            avatar: req.body.avatar || 'https://i.pravatar.cc/150?img=12',
            patientName: patientName || req.body.fullName || '',
            patientEmail: patientEmail || req.body.email || '',
            patientPhone: patientPhone || req.body.phone || ''
        });

        if (appointment.patientEmail && appointment.patientEmail.trim()) {
            try {
                const result = await sendBookingReceivedToPatient(appointment);
                if (!result.sent) {
                    console.warn('Booking email not sent:', result.error);
                }
            } catch (emailErr) {
                console.error('Booking email error:', emailErr);
            }
        }

        return res.status(201).json(appointment);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to create appointment.' });
    }
};

const updateAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found.' });
        }

        return res.json(appointment);
    } catch (error) {
        return res.status(400).json({ message: 'Failed to update appointment.' });
    }
};

const deleteAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndDelete(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found.' });
        }

        return res.json({ message: 'Appointment deleted.' });
    } catch (error) {
        return res.status(400).json({ message: 'Invalid appointment id.' });
    }
};

const cancelAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status: 'Cancelled' },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found.' });
        }

        return res.json(appointment);
    } catch (error) {
        return res.status(400).json({ message: 'Invalid appointment id.' });
    }
};

export default {
    getAppointments,
    getAppointmentById,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    cancelAppointment
};
