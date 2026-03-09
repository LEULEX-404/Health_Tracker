import React, { useEffect, useState } from 'react';
import { Check, X, Mail } from 'lucide-react';
import { apiUrl } from '../lib/api';

const AdminAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionError, setActionError] = useState('');

    const loadPending = () => {
        setLoading(true);
        fetch(apiUrl('/api/admin/appointments/pending'))
            .then((res) => res.json())
            .then((data) => {
                setAppointments(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => {
                setAppointments([]);
                setLoading(false);
            });
    };

    useEffect(() => {
        loadPending();
    }, []);

    const handleAction = async (id, action) => {
        setActionError('');
        const res = await fetch(apiUrl(`/api/appointments/${action}`), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setActionError(data.message || 'Action failed. Try again.');
            return;
        }
        loadPending();
    };

    return (
        <div>
            <div className="flex-between" style={{ marginBottom: '24px' }}>
                <h1>Pending Appointments</h1>
            </div>

            {actionError && (
                <p style={{ color: '#ef4444', marginBottom: '12px' }}>{actionError}</p>
            )}

            {loading ? (
                <div>Loading...</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {appointments.length === 0 && (
                        <div className="card" style={{ textAlign: 'center', color: '#6b7280' }}>
                            No pending appointments.
                        </div>
                    )}
                    {appointments.map((apt) => (
                        <div key={apt._id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <img src={apt.avatar} alt={apt.doctor} style={{ width: '60px', height: '60px', borderRadius: '50%' }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '600' }}>{apt.doctor}</div>
                                <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>{apt.specialty}</div>
                                <div style={{ fontSize: '0.9rem', color: '#374151', marginTop: '6px' }}>
                                    {apt.date} at {apt.time}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Mail size={14} /> {apt.patientEmail || 'No email'}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn-primary" onClick={() => handleAction(apt._id, 'confirm')}>
                                    <Check size={16} style={{ marginRight: '6px' }} /> Confirm
                                </button>
                                <button className="btn-outline" onClick={() => handleAction(apt._id, 'cancel')}>
                                    <X size={16} style={{ marginRight: '6px' }} /> Cancel
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminAppointments;
