import Appointment from "../../models/Priya/Appointment.js";
import { sendBookingReceivedToPatient } from "./bookingEmailController.js";
import Doctor from "../../models/Imasha/Doctor.js";

const DEFAULT_AVATAR = 'https://i.pravatar.cc/150?img=12';
const DOCTOR_POPULATE = {
    path: "doctorId",
    populate: {
        path: "user",
        match: { isDeleted: false, role: "doctor" },
        select: "firstName lastName email phone profileImage",
    },
};

function normalizeDoctorName(name) {
    return (name || "").toLowerCase().replace(/^dr\.\s*/i, "").trim();
}

function getBookingDateBounds() {
    const now = new Date();
    const day = now.getDay();
    const toMonday = day === 0 ? -6 : 1 - day;
    const startCurrentWeek = new Date(now);
    startCurrentWeek.setDate(now.getDate() + toMonday);
    startCurrentWeek.setHours(0, 0, 0, 0);

    const endNextWeek = new Date(startCurrentWeek);
    endNextWeek.setDate(startCurrentWeek.getDate() + 13);
    endNextWeek.setHours(23, 59, 59, 999);

    return { startCurrentWeek, endNextWeek };
}

function isDateWithinBookingWindow(dateStr) {
    if (!dateStr) return false;
    const date = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(date.getTime())) return false;

    const { startCurrentWeek, endNextWeek } = getBookingDateBounds();
    return date >= startCurrentWeek && date <= endNextWeek;
}

function isValidSriLankaMobile(phone) {
    const digits = String(phone || '').replace(/\D/g, '');
    return /^(070|071|072|074|076|077|078)\d{7}$/.test(digits);
}

function shouldUseStoredAvatar(avatar) {
    const value = String(avatar || '').trim();
    if (!value) return false;
    if (value === DEFAULT_AVATAR) return false;
    if (/i\.pravatar\.cc\/150\?img=\d+/i.test(value)) return false;
    return true;
}

function normalizeMobile(phone) {
    return String(phone || '').replace(/\D/g, '').slice(0, 10);
}

function getResolvedDoctorFromPopulated(populatedDoctor) {
    const user = populatedDoctor?.user;
    if (!populatedDoctor || !user) return null;

    return {
        doctorId: populatedDoctor._id,
        doctor: `Dr. ${user.firstName} ${user.lastName}`,
        specialty: populatedDoctor.specialization || "",
        avatar: user.profileImage || DEFAULT_AVATAR,
        doctorDetails: {
            doctorId: populatedDoctor._id,
            userId: user._id,
            email: user.email,
            phone: user.phone || "",
        },
    };
}

function enrichAppointmentObject(appointmentObj, fallbackDoctorDoc = null) {
    const populatedResolved = getResolvedDoctorFromPopulated(appointmentObj.doctorId);
    if (populatedResolved) {
        return {
            ...appointmentObj,
            doctorId: populatedResolved.doctorId,
            doctor: populatedResolved.doctor,
            specialty: appointmentObj.specialty || populatedResolved.specialty,
            avatar: shouldUseStoredAvatar(appointmentObj.avatar)
                ? appointmentObj.avatar
                : populatedResolved.avatar,
            doctorDetails: populatedResolved.doctorDetails,
        };
    }

    const fallbackResolved = getResolvedDoctorFromPopulated(fallbackDoctorDoc);
    if (fallbackResolved) {
        return {
            ...appointmentObj,
            doctorId: fallbackResolved.doctorId,
            doctor: fallbackResolved.doctor,
            specialty: appointmentObj.specialty || fallbackResolved.specialty,
            avatar: shouldUseStoredAvatar(appointmentObj.avatar)
                ? appointmentObj.avatar
                : fallbackResolved.avatar,
            doctorDetails: fallbackResolved.doctorDetails,
        };
    }

    return {
        ...appointmentObj,
        avatar: shouldUseStoredAvatar(appointmentObj.avatar) ? appointmentObj.avatar : '',
        doctorDetails: null,
    };
}

async function findDoctorByAppointmentInput({ doctorId, doctorName }) {
    if (doctorId) {
        const byId = await Doctor.findOne({ _id: doctorId, isDeleted: false }).populate(DOCTOR_POPULATE.populate);

        if (byId?.user) return byId;
    }

    if (doctorName) {
        const doctors = await Doctor.find({ isDeleted: false }).populate(DOCTOR_POPULATE.populate);

        const normalizedTarget = normalizeDoctorName(doctorName);
        return (
            doctors.find((doc) => {
                const fullName = normalizeDoctorName(`${doc.user?.firstName || ""} ${doc.user?.lastName || ""}`);
                return fullName === normalizedTarget;
            }) || null
        );
    }

    return null;
}

const getAppointments = async (req, res) => {
    try {
        const list = await Appointment.find().populate(DOCTOR_POPULATE).sort({ createdAt: -1 });
        const doctorDocs = await Doctor.find({ isDeleted: false }).populate(DOCTOR_POPULATE.populate);

        const doctorsByName = new Map();
        doctorDocs.forEach((doc) => {
            if (!doc.user) return;
            const fullName = normalizeDoctorName(`${doc.user.firstName || ""} ${doc.user.lastName || ""}`);
            if (!fullName) return;
            doctorsByName.set(fullName, doc);
        });

        const appointments = list.map((doc) => {
            const o = doc.toObject ? doc.toObject() : doc;
            const normalizedDoctorName = normalizeDoctorName(o.doctor || "");
            const matchedDoctor = doctorsByName.get(normalizedDoctorName);
            return enrichAppointmentObject(o, matchedDoctor);
        });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch appointments.' });
    }
};

const getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id).populate(DOCTOR_POPULATE);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found.' });
        }

        const obj = appointment.toObject ? appointment.toObject() : appointment;
        let fallbackDoctor = null;
        if (!obj.doctorId && obj.doctor) {
            fallbackDoctor = await findDoctorByAppointmentInput({ doctorName: obj.doctor });
        }

        return res.json(enrichAppointmentObject(obj, fallbackDoctor));
    } catch (error) {
        return res.status(400).json({ message: 'Invalid appointment id.' });
    }
};

const createAppointment = async (req, res) => {
    try {
        const { doctor, doctorId, date, time, patientName, patientEmail, patientPhone } = req.body || {};
        if ((!doctor && !doctorId) || !date || !time) {
            return res.status(400).json({ message: 'doctor (or doctorId), date and time are required.' });
        }
        const normalizedPatientPhone = normalizeMobile(patientPhone || req.body.phone || '');
        if (!isValidSriLankaMobile(normalizedPatientPhone)) {
            return res.status(400).json({ message: 'patientPhone must be 10 digits and start with 070, 071, 072, 074, 076, 077, or 078.' });
        }
        if (!isDateWithinBookingWindow(date)) {
            return res.status(400).json({ message: 'Date must be within current week or next week.' });
        }

        const matchedDoctor = await findDoctorByAppointmentInput({ doctorId, doctorName: doctor });
        if (!matchedDoctor?.user) {
            return res.status(400).json({ message: 'Selected doctor not found.' });
        }

        const resolved = getResolvedDoctorFromPopulated(matchedDoctor);

        const appointment = await Appointment.create({
            ...req.body,
            patientUserId: req.user?._id || req.user?.id || null,
            doctorId: matchedDoctor._id,
            doctor: resolved.doctor,
            specialty: req.body.specialty || resolved.specialty,
            status: req.body.status || 'Pending',
            avatar: req.body.avatar || resolved.avatar,
            patientName: patientName || req.body.fullName || '',
            patientEmail: patientEmail || req.body.email || '',
            patientPhone: normalizedPatientPhone
        });

        let emailSent = false;
        let emailError = null;
        if (appointment.patientEmail && appointment.patientEmail.trim()) {
            try {
                const result = await sendBookingReceivedToPatient(appointment);
                emailSent = !!result?.sent;
                if (!result.sent) {
                    console.warn('Booking email not sent:', result.error);
                    emailError = result?.error || 'Failed to send booking email';
                }
            } catch (emailErr) {
                console.error('Booking email error:', emailErr);
                emailError = emailErr?.message || 'Failed to send booking email';
            }
        }

        const created = await Appointment.findById(appointment._id).populate(DOCTOR_POPULATE);
        const createdObj = created.toObject ? created.toObject() : created;
        return res.status(201).json({
            ...enrichAppointmentObject(createdObj),
            emailSent,
            emailError,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to create appointment.' });
    }
};

const updateAppointment = async (req, res) => {
    try {
        const updates = { ...req.body };
        if (updates.phone !== undefined && updates.patientPhone === undefined) {
            updates.patientPhone = updates.phone;
        }
        if (updates.patientPhone !== undefined) {
            updates.patientPhone = normalizeMobile(updates.patientPhone);
        }
        if (updates.patientPhone !== undefined && !isValidSriLankaMobile(updates.patientPhone)) {
            return res.status(400).json({ message: 'patientPhone must be 10 digits and start with 070, 071, 072, 074, 076, 077, or 078.' });
        }
        if (updates.date && !isDateWithinBookingWindow(updates.date)) {
            return res.status(400).json({ message: 'Date must be within current week or next week.' });
        }
        if (updates.doctorId || updates.doctor) {
            const matchedDoctor = await findDoctorByAppointmentInput({
                doctorId: updates.doctorId,
                doctorName: updates.doctor,
            });

            if (!matchedDoctor?.user) {
                return res.status(400).json({ message: 'Selected doctor not found.' });
            }

            const resolved = getResolvedDoctorFromPopulated(matchedDoctor);
            updates.doctorId = matchedDoctor._id;
            updates.doctor = resolved.doctor;
            updates.specialty = updates.specialty || resolved.specialty;
            updates.avatar = updates.avatar || resolved.avatar;
        }

        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        ).populate(DOCTOR_POPULATE);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found.' });
        }

        const updatedObj = appointment.toObject ? appointment.toObject() : appointment;
        return res.json(enrichAppointmentObject(updatedObj));
    } catch (error) {
        return res.status(400).json({ message: error?.message || 'Failed to update appointment.' });
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
        ).populate(DOCTOR_POPULATE);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found.' });
        }

        const cancelledObj = appointment.toObject ? appointment.toObject() : appointment;
        return res.json(enrichAppointmentObject(cancelledObj));
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
