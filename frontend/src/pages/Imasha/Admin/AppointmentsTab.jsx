import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Calendar, Clock, Mail, Phone } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../context/Imasha/AuthContext';
import {
    getAdminAppointments,
    approveAppointment,
    rejectAppointment,
} from '../../../utils/Imasha/adminApi';

const FALLBACK_AVATAR = '/images/Priya/doctor-01.png';

const AppointmentsTab = () => {
    const { token } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const loadAppointments = useCallback(async () => {
        setLoading(true);
        try {
            const params = statusFilter === 'all' ? {} : { status: statusFilter };
            const data = await getAdminAppointments(token, params);
            setAppointments(Array.isArray(data) ? data : []);
        } catch {
            toast.error('Failed to load appointments.');
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    }, [token, statusFilter]);

    useEffect(() => {
        loadAppointments();
    }, [loadAppointments]);

    const handleApprove = async (appointmentId) => {
        setUpdatingId(appointmentId);
        try {
            await approveAppointment(token, appointmentId);
            toast.success('Appointment confirmed.');
            loadAppointments();
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
            await rejectAppointment(token, appointmentId);
            toast.success('Appointment cancelled.');
            loadAppointments();
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to cancel appointment.');
        } finally {
            setUpdatingId('');
        }
    };

    return (
        <div className="admin-module-card">
            <div className="module-header">
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Appointments</h3>
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

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Patient</th>
                            <th>Doctor</th>
                            <th>Schedule</th>
                            <th>Contact</th>
                            <th>Requested</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="loading-state">Loading appointments...</td>
                            </tr>
                        ) : appointments.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="empty-state">No appointments found.</td>
                            </tr>
                        ) : appointments.map((apt) => (
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
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AppointmentsTab;
