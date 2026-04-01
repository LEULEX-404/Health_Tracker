import CaregiverBooking from "../../models/Tharindu/CaregiverBooking.js";
import User from "../../models/Imasha/User.js";
import { sendNotification } from "../../services/Tharindu/notificationService.js";
import PDFDocument from "pdfkit";

/**
 * Request a new caregiver booking (Patient action)
 */
export const requestBooking = async (req, res) => {
    try {
        const { caregiverId, date, startTime, endTime, notes } = req.body;
        const patientId = req.user._id;

        // Verify caregiver exists and is actually a caregiver
        const caregiver = await User.findById(caregiverId);
        if (!caregiver || caregiver.role !== "caregiver") {
            return res.status(404).json({ message: "Caregiver not found" });
        }

        const booking = await CaregiverBooking.create({
            patientId,
            caregiverId,
            date,
            startTime,
            endTime,
            notes,
        });

        // Notify Caregiver
        const message = `New booking request from patient for ${date} at ${startTime}.`;
        await sendNotification(caregiverId, "inApp", message, {
            bookingId: booking._id,
            patientId,
        });

        res.status(201).json({
            success: true,
            data: booking,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get available caregivers (Patient action)
 */
export const getAvailableCaregivers = async (req, res) => {
    try {
        // Exclude the requesting user so caregivers cannot see/book themselves
        const caregivers = await User.find({
            role: "caregiver",
            _id: { $ne: req.user._id }
        })
            .select("firstName lastName email phone profilePicture")
            .sort({ firstName: 1 });

        res.status(200).json({
            success: true,
            data: caregivers
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get bookings for the logged-in user (Patient or Caregiver)
 */
export const getMyBookings = async (req, res) => {
    try {
        const userId = req.user._id;
        const role = req.user.role;

        const query = role === "caregiver" ? { caregiverId: userId } : { patientId: userId };

        const bookings = await CaregiverBooking.find(query)
            .populate("patientId", "firstName lastName name email phone")
            .populate("caregiverId", "firstName lastName name email phone")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Generate PDF report of user's caregiver bookings (Patient)
 */
export const downloadMyBookingsReport = async (req, res) => {
    try {
        if (req.user.role !== "patient") {
            return res.status(403).json({ message: "Only patients can download their caregiver bookings report." });
        }

        const bookings = await CaregiverBooking.find({ patientId: req.user._id })
            .populate("caregiverId", "firstName lastName email phone")
            .sort({ date: 1, startTime: 1 });

        // Initialize PDF Document
        const doc = new PDFDocument({ margin: 50, size: 'A4' });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="PulseNova_Caregiver_Bookings_${Date.now()}.pdf"`
        );
        doc.pipe(res);

        // --- Theme Colors (From Imasha Admin Theme) ---
        const PRIMARY = '#00C897';
        const PRIMARY_DARK = '#00A07A';
        const SECONDARY = '#333333';
        const LIGHT_GRAY = '#F4F7F6';
        const TEXT_MUTED = '#666666';

        // --- Top Header Bar ---
        doc.rect(0, 0, doc.page.width, 10).fill(PRIMARY);

        // --- Header Section ---
        doc.moveDown(1);
        
        // PulseNova Logo Vector
        doc.circle(68, 55, 17).lineWidth(2).strokeColor(PRIMARY).stroke();
        doc.strokeColor(PRIMARY_DARK).lineWidth(2.2)
           .moveTo(54, 55).lineTo(60, 55).lineTo(63, 48).lineTo(66, 62)
           .lineTo(69, 51).lineTo(72, 57).lineTo(75, 55).lineTo(82, 55)
           .stroke();

        // Company Details
        doc.fillColor(PRIMARY_DARK).font('Helvetica-Bold').fontSize(28).text('PulseNova', 100, 40, { align: 'left' });
        doc.fillColor(SECONDARY).font('Helvetica').fontSize(10).text('Every Pulse Matters', 100, 70, { align: 'left' });

        doc.fillColor(TEXT_MUTED).fontSize(9)
           .text('100, Kandy road, malabe', 50, 45, { align: 'right' })
           .text('support@healthcare.com', 50, 58, { align: 'right' })
           .text('+94 76 215 7137', 50, 71, { align: 'right' });

        // Divider Line
        doc.moveTo(50, 110).lineTo(doc.page.width - 50, 110).lineWidth(1).strokeColor('#E0E0E0').stroke();

        // --- Report Title & Meta ---
        doc.moveDown(4);

        doc.rect(50, 130, doc.page.width - 100, 80).fill(LIGHT_GRAY);

        doc.fillColor(SECONDARY).font('Helvetica-Bold').fontSize(22).text("Caregiver Appointments Report", 70, 145, { align: 'left' });

        doc.font('Helvetica').fontSize(10).fillColor(TEXT_MUTED)
           .text(`Report Type: `, 70, 175, { continued: true }).font('Helvetica-Bold').fillColor(PRIMARY_DARK).text("Patient Booking Records")
           .font('Helvetica').fillColor(TEXT_MUTED).text(`Date Generated: `, 70, 190, { continued: true }).font('Helvetica-Bold').fillColor(SECONDARY).text(`${new Date().toLocaleDateString()}`);

        doc.font('Helvetica').fillColor(TEXT_MUTED).fontSize(9)
           .text(`Patient: ${req.user.firstName} ${req.user.lastName}`, 50, 175, { align: 'right', width: doc.page.width - 120 })
           .text(`Email: ${req.user.email}`, 50, 190, { align: 'right', width: doc.page.width - 120 });

        doc.moveDown(3);

        // --- Summary Metrics Box Layout ---
        doc.fillColor(PRIMARY_DARK).font('Helvetica-Bold').fontSize(16).text('EXECUTIVE SUMMARY', 50, doc.y);
        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).lineWidth(2).strokeColor(PRIMARY).stroke();
        doc.moveDown(1);

        const total = bookings.length;
        const approvedCount = bookings.filter(b => b.status?.toLowerCase() === "approved").length;
        const pending = bookings.filter(b => b.status?.toLowerCase() === "pending").length;

        // Metric Cards
        const startY = doc.y;
        const drawMetricCard = (x, y, title, value) => {
            doc.rect(x, y, 140, 60).fill('white').lineWidth(1).strokeColor('#E0E0E0').stroke();
            doc.fillColor(TEXT_MUTED).font('Helvetica').fontSize(9).text(title, x, y + 15, { width: 140, align: 'center' });
            doc.fillColor(PRIMARY_DARK).font('Helvetica-Bold').fontSize(18).text(String(value), x, y + 35, { width: 140, align: 'center' });
        };

        drawMetricCard(50, startY, 'Total Bookings', total);
        drawMetricCard(210, startY, 'Approved', approvedCount);
        drawMetricCard(370, startY, 'Pending Requests', pending);

        doc.moveDown(6);

        // --- Detailed Data Section ---
        doc.fillColor(PRIMARY_DARK).font('Helvetica-Bold').fontSize(16).text('DETAILED BOOKING LOGS', 50, doc.y);
        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).lineWidth(2).strokeColor(PRIMARY).stroke();
        doc.moveDown(1);

        doc.rect(50, doc.y, doc.page.width - 100, 20).fill(PRIMARY_DARK);
        let headY = doc.y + 6;
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#FFFFFF');
        doc.text('Date', 60, headY, { continued: false });
        doc.text('Time', 160, headY, { continued: false });
        doc.text('Caregiver Name', 270, headY, { continued: false });
        doc.text('Status', 420, headY, { continued: false });

        doc.moveDown(1.5);
        doc.font('Helvetica').fontSize(9);

        if (total === 0) {
            doc.fillColor(TEXT_MUTED).text("No caregiver appointments found on record.", 60, doc.y + 10);
        } else {
            bookings.forEach((bk, i) => {
                if (i % 2 === 0) doc.rect(50, doc.y - 2, doc.page.width - 100, 18).fill('#FAFAFA');
                
                const dateStr = new Date(bk.date).toLocaleDateString();
                const timeStr = `${bk.startTime} - ${bk.endTime}`;
                const cgName = bk.caregiverId ? `${bk.caregiverId.firstName} ${bk.caregiverId.lastName}` : "Unknown";
                const statStr = bk.status.toUpperCase();
                
                doc.fillColor(TEXT_MUTED).text(dateStr, 60, doc.y + 2);
                doc.fillColor(SECONDARY).text(timeStr, 160, doc.y - 11);
                doc.fillColor(PRIMARY_DARK).text(cgName, 270, doc.y - 11);
                
                const statColor = bk.status === "approved" ? PRIMARY_DARK : bk.status === "pending" ? "#f59e0b" : "#D9534F";
                doc.fillColor(statColor).font('Helvetica-Bold').text(statStr, 420, doc.y - 11);
                doc.font('Helvetica');
                
                doc.moveDown(0.5);
            });
            doc.moveTo(50, doc.y + 5).lineTo(doc.page.width - 50, doc.y + 5).lineWidth(1).strokeColor('#E0E0E0').stroke();
        }

        // --- Footer ---
        const pageHeight = doc.page.height;
        doc.moveTo(50, pageHeight - 65).lineTo(doc.page.width - 50, pageHeight - 65).lineWidth(1).strokeColor('#E0E0E0').stroke();

        doc.fontSize(8).fillColor('#aaaaaa')
           .text('PulseNova Health Tracking System - Confidential & Proprietary', 50, pageHeight - 50, { align: 'center', lineBreak: false })
           .text('Patient Caregiver Appointments Summary', 50, pageHeight - 40, { align: 'center', lineBreak: false });

        doc.rect(0, pageHeight - 10, doc.page.width, 10).fill(PRIMARY_DARK);

        doc.end();

    } catch (error) {
        console.error("PDF Generation Error:", error);
        res.status(500).json({ message: "Error generating PDF report." });
    }
};

/**
 * Update booking status (Caregiver action)
 */
export const updateBookingStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { status } = req.body;
        const caregiverId = req.user._id;

        const booking = await CaregiverBooking.findOne({ _id: bookingId, caregiverId });

        if (!booking) {
            return res.status(404).json({ message: "Booking not found or unauthorized" });
        }

        booking.status = status;
        await booking.save();

        // Notify Patient
        const message = `Your caregiver booking request has been ${status.toLowerCase()}.`;
        await sendNotification(booking.patientId, "inApp", message, {
            bookingId: booking._id,
            status,
        });

        res.status(200).json({
            success: true,
            data: booking,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Delete a booking (Patient or Caregiver action)
 */
export const deleteBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const userId = req.user._id;

        // Find booking where the user is either the patient or the caregiver
        const booking = await CaregiverBooking.findOne({
            _id: bookingId,
            $or: [{ patientId: userId }, { caregiverId: userId }]
        });

        if (!booking) {
            return res.status(404).json({ message: "Booking not found or unauthorized" });
        }

        await CaregiverBooking.findByIdAndDelete(bookingId);

// existing line
        res.status(200).json({
            success: true,
            message: "Booking deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get all caregiver bookings (Admin access)
 */
export const getAllBookingsAdmin = async (req, res) => {
    try {
        const bookings = await CaregiverBooking.find()
            .populate("patientId", "firstName lastName email phone")
            .populate("caregiverId", "firstName lastName email phone")
            .sort({ createdAt: -1 });

        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
