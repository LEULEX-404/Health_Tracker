import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Calendar, Clock, Mail, Phone, HeartHandshake } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../context/Imasha/AuthContext';
import {
    getAdminAppointments,
    getAdminCaregiverBookings,
    approveAppointment,
    rejectAppointment,
    updateAdminCaregiverBookingStatus,
} from '../../../utils/Imasha/adminApi';

const FALLBACK_AVATAR = '/images/Priya/doctor-01.png';

const AppointmentsTab = () => {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState('doctor');
    const [doctorAppointments, setDoctorAppointments] = useState([]);
    const [caregiverBookings, setCaregiverBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const loadDoctorAppointments = useCallback(async () => {
        const params = statusFilter === 'all' ? {} : { status: statusFilter };
        const data = await getAdminAppointments(token, params);
        setDoctorAppointments(Array.isArray(data) ? data : []);
    }, [token, statusFilter]);

    const loadCaregiverBookings = useCallback(async () => {
        const data = await getAdminCaregiverBookings(token);
        setCaregiverBookings(Array.isArray(data) ? data : []);
    }, [token]);

    const loadAppointments = useCallback(async () => {
        setLoading(true);
        try {
            if (activeTab === 'doctor') {
                await loadDoctorAppointments();
            } else {
                await loadCaregiverBookings();
            }
        } catch {
            toast.error(`Failed to load ${activeTab === 'doctor' ? 'doctor appointments' : 'caregiver appointments'}.`);
            if (activeTab === 'doctor') {
                setDoctorAppointments([]);
            } else {
                setCaregiverBookings([]);
            }
        } finally {
            setLoading(false);
        }
    }, [activeTab, loadCaregiverBookings, loadDoctorAppointments]);

    useEffect(() => {
        loadAppointments();
    }, [loadAppointments]);

    const handleApprove = async (appointmentId) => {
        setUpdatingId(appointmentId);
        try {
            const result = await approveAppointment(token, appointmentId);
            if (result?.emailSent === false) {
                toast.success(`Appointment confirmed. Email failed${result?.emailError ? `: ${result.emailError}` : '.'}`);
            } else {
                toast.success('Appointment confirmed and email sent.');
            }
            await loadDoctorAppointments();
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to confirm appointment.');
        } finally {
            setUpdatingId('');
        }
    };

    const handleReject = async (appointmentId) => {
        const ok = window.confirm('Do you want to cancel this appointment?');
        if (!ok) return;

        setUpdatingId(appointmentId);
        try {
            const result = await rejectAppointment(token, appointmentId);
            if (result?.emailSent === false) {
                toast.success(`Appointment cancelled. Email failed${result?.emailError ? `: ${result.emailError}` : '.'}`);
            } else {
                toast.success('Appointment cancelled and email sent.');
            }
            await loadDoctorAppointments();
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to cancel appointment.');
        } finally {
            setUpdatingId('');
        }
    };

    const handleCaregiverStatusUpdate = async (bookingId, status) => {
        const actionLabel = status === 'Approved' ? 'confirm' : 'cancel';
        if (status === 'Cancelled') {
            const ok = window.confirm('Do you want to cancel this caregiver appointment?');
            if (!ok) return;
        }

        setUpdatingId(bookingId);
        try {
            await updateAdminCaregiverBookingStatus(token, bookingId, status);
            toast.success(`Caregiver appointment ${actionLabel}ed.`);
            await loadCaregiverBookings();
        } catch (error) {
            toast.error(error?.response?.data?.message || `Failed to ${actionLabel} caregiver appointment.`);
        } finally {
            setUpdatingId('');
        }
    };

    const filteredCaregiverBookings = caregiverBookings.filter((booking) => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'Pending') return booking.status?.toLowerCase() === 'pending';
        if (statusFilter === 'Confirmed') return ['approved', 'confirmed'].includes(booking.status?.toLowerCase());
        if (statusFilter === 'Cancelled') return ['cancelled', 'rejected'].includes(booking.status?.toLowerCase());
        return true;
    });

    return (
        <div className="admin-module-card">
            <div className="module-header" style={{ alignItems: 'flex-start', gap: '1rem' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Appointments</h3>
                    <p style={{ margin: '0.35rem 0 0', color: 'var(--admin-text-muted)', fontSize: '0.9rem' }}>
                        Manage both doctor and caregiver appointments from one tab.
                    </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            className="admin-btn-secondary"
                            style={{ minWidth: 'auto', padding: '0.45rem 0.85rem', background: activeTab === 'doctor' ? 'var(--admin-hover)' : 'transparent' }}
                            onClick={() => setActiveTab('doctor')}
                        >
                            Doctor
                        </button>
                        <button
                            type="button"
                            className="admin-btn-secondary"
                            style={{ minWidth: 'auto', padding: '0.45rem 0.85rem', background: activeTab === 'caregiver' ? 'var(--admin-hover)' : 'transparent' }}
                            onClick={() => setActiveTab('caregiver')}
                        >
                            Caregiver
                        </button>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            className="admin-btn-secondary"
                            style={{ minWidth: 'auto', padding: '0.45rem 0.85rem', background: statusFilter === 'all' ? 'var(--admin-hover)' : 'transparent' }}
                            onClick={() => setStatusFilter('all')}
                        >
                            All
                        </button>
                        <button
                            type="button"
                            className="admin-btn-secondary"
                            style={{ minWidth: 'auto', padding: '0.45rem 0.85rem', background: statusFilter === 'Pending' ? 'var(--admin-hover)' : 'transparent' }}
                            onClick={() => setStatusFilter('Pending')}
                        >
                            Pending
                        </button>
                        <button
                            type="button"
                            className="admin-btn-secondary"
                            style={{ minWidth: 'auto', padding: '0.45rem 0.85rem', background: statusFilter === 'Confirmed' ? 'var(--admin-hover)' : 'transparent' }}
                            onClick={() => setStatusFilter('Confirmed')}
                        >
                            Confirmed
                        </button>
                        <button
                            type="button"
                            className="admin-btn-secondary"
                            style={{ minWidth: 'auto', padding: '0.45rem 0.85rem', background: statusFilter === 'Cancelled' ? 'var(--admin-hover)' : 'transparent' }}
                            onClick={() => setStatusFilter('Cancelled')}
                        >
                            Cancelled
                        </button>
                    </div>
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        {activeTab === 'doctor' ? (
                            <tr>
                                <th>Patient</th>
                                <th>Doctor</th>
                                <th>Schedule</th>
                                <th>Contact</th>
                                <th>Requested</th>
                                <th>Actions</th>
                            </tr>
                        ) : (
                            <tr>
                                <th>Patient</th>
                                <th>Caregiver</th>
                                <th>Schedule</th>
                                <th>Contact</th>
                                <th>Requested</th>
                                <th>Status</th>
                            </tr>
                        )}
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="loading-state">
                                    Loading {activeTab === 'doctor' ? 'doctor appointments' : 'caregiver appointments'}...
                                </td>
                            </tr>
                        ) : activeTab === 'doctor' ? (
                            doctorAppointments.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="empty-state">No doctor appointments found.</td>
                                </tr>
                            ) : doctorAppointments.map((apt) => (
                                <tr key={apt._id}>
                                    <td>
                                        <div className="user-name">{apt.patientName || 'Unknown Patient'}</div>
                                    </td>
                                    <td>
                                        <div className="user-info-cell">
                                            <img
                                                src={apt.avatar || FALLBACK_AVATAR}
                                                alt={apt.doctor || 'Doctor'}
                                                onError={(e) => {
                                                    e.currentTarget.onerror = null;
                                                    e.currentTarget.src = FALLBACK_AVATAR;
                                                }}
                                            />
                                            <div>
                                                <span className="user-name">{apt.doctor || 'Doctor'}</span>
                                                <span className="user-id">{apt.specialty || 'Consultation'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="contact-cell">
                                            <span><Calendar size={14} />{apt.date || '-'}</span>
                                            <span><Clock size={14} />{apt.time || '-'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="contact-cell">
                                            <span><Mail size={14} />{apt.patientEmail || '-'}</span>
                                            <span><Phone size={14} />{apt.patientPhone || '-'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>
                                            {apt.createdAt ? new Date(apt.createdAt).toLocaleString() : '-'}
                                        </span>
                                    </td>
                                    <td>
                                        {apt.status === 'Pending' ? (
                                            <div className="action-btns">
                                                <button
                                                    className="action-btn success"
                                                    type="button"
                                                    onClick={() => handleApprove(apt._id)}
                                                    disabled={updatingId === apt._id}
                                                    title="Confirm Appointment"
                                                >
                                                    <CheckCircle2 size={16} />
                                                </button>
                                                <button
                                                    className="action-btn danger"
                                                    type="button"
                                                    onClick={() => handleReject(apt._id)}
                                                    disabled={updatingId === apt._id}
                                                    title="Cancel Appointment"
                                                >
                                                    <XCircle size={16} />
                                                </button>
                                            </div>
                                        ) : apt.status === 'Confirmed' ? (
                                            <span className="status-pill success">Confirmed Action</span>
                                        ) : (
                                            <span className="status-pill danger">Cancelled Action</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : filteredCaregiverBookings.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="empty-state">No caregiver appointments found.</td>
                            </tr>
                        ) : filteredCaregiverBookings.map((booking) => (
                            <tr key={booking._id}>
                                <td>
                                    <div className="user-name">
                                        {booking.patientId ? `${booking.patientId.firstName || ''} ${booking.patientId.lastName || ''}`.trim() : 'Unknown Patient'}
                                    </div>
                                </td>
                                <td>
                                    <div className="user-info-cell">
                                        <div className="avatar-placeholder caregiver-icon" style={{ width: 42, height: 42 }}>
                                            <HeartHandshake size={18} />
                                        </div>
                                        <div>
                                            <span className="user-name">
                                                {booking.caregiverId ? `${booking.caregiverId.firstName || ''} ${booking.caregiverId.lastName || ''}`.trim() : 'Caregiver'}
                                            </span>
                                            <span className="user-id">Caregiver Service</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="contact-cell">
                                        <span><Calendar size={14} />{booking.date ? new Date(booking.date).toLocaleDateString() : '-'}</span>
                                        <span><Clock size={14} />{booking.startTime || '-'} - {booking.endTime || '-'}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="contact-cell">
                                        <span><Mail size={14} />{booking.patientId?.email || '-'}</span>
                                        <span><Phone size={14} />{booking.patientId?.phone || booking.caregiverId?.phone || '-'}</span>
                                    </div>
                                </td>
                                <td>
                                    <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>
                                        {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : '-'}
                                    </span>
                                </td>
                                <td>
                                    {booking.status?.toLowerCase() === 'pending' ? (
                                        <div className="action-btns">
                                            <button
                                                className="action-btn success"
                                                type="button"
                                                onClick={() => handleCaregiverStatusUpdate(booking._id, 'Approved')}
                                                disabled={updatingId === booking._id}
                                                title="Confirm Caregiver Appointment"
                                            >
                                                <CheckCircle2 size={16} />
                                            </button>
                                            <button
                                                className="action-btn danger"
                                                type="button"
                                                onClick={() => handleCaregiverStatusUpdate(booking._id, 'Cancelled')}
                                                disabled={updatingId === booking._id}
                                                title="Cancel Caregiver Appointment"
                                            >
                                                <XCircle size={16} />
                                            </button>
                                        </div>
                                    ) : ['approved', 'confirmed'].includes(booking.status?.toLowerCase()) ? (
                                        <span className="status-pill success">Confirmed</span>
                                    ) : ['cancelled', 'rejected'].includes(booking.status?.toLowerCase()) ? (
                                        <span className="status-pill danger">Cancelled</span>
                                    ) : (
                                        <span className="status-pill warn">Pending</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AppointmentsTab;
