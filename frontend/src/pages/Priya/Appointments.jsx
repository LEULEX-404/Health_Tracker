import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Video, MapPin, Search, User } from 'lucide-react';
import { apiUrl } from '../lib/api';

const DEFAULT_AVATAR = 'https://i.pravatar.cc/150?img=12';

const AppointmentAvatar = ({ src, alt }) => {
    const [imgError, setImgError] = useState(false);
    const url = imgError || !src ? DEFAULT_AVATAR : src;
    return (
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {imgError ? (
                <User size={28} color="#9ca3af" />
            ) : (
                <img
                    src={url}
                    alt={alt || 'Doctor'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={() => setImgError(true)}
                />
            )}
        </div>
    );
};

const SLOT_WEEKDAY_MAP = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 };
const WEEKDAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const getWeekdayFromSlot = (slot) => {
    if (!slot || typeof slot !== 'string') return null;
    const match = slot.trim().match(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s/i);
    if (!match) return null;
    const key = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
    return SLOT_WEEKDAY_MAP[key];
};

const getMinDateForSlotWeekday = (slot) => {
    const weekday = getWeekdayFromSlot(slot);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (weekday === null) {
        return today.toISOString().split('T')[0];
    }

    const day = today.getDay();
    let add = weekday - day;
    if (add < 0) add += 7;
    const next = new Date(today);
    next.setDate(today.getDate() + add);
    return next.toISOString().split('T')[0];
};

const getMaxDateForTwoWeekWindow = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const day = today.getDay();
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + (14 - day));
    return maxDate.toISOString().split('T')[0];
};

const isWithinTwoWeekWindow = (dateValue) => {
    if (!dateValue) return false;
    const [y, m, d] = dateValue.split('-').map(Number);
    const selected = new Date(y, m - 1, d);
    selected.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const day = today.getDay();
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + (14 - day));

    return selected >= today && selected <= maxDate;
};

// Sri Lanka mobile: 0/94/+94 followed by 7x (70,71,72,74,75,76,77,78) + 7 digits
const MOBILE_REGEX = /^(?:0|94|\+94)?(7[01245678]\d{7})$/;
const validateMobile = (value) => {
    const trimmed = (value || '').trim();
    if (!trimmed) return { valid: false, message: 'Phone number is required' };
    if (!MOBILE_REGEX.test(trimmed)) return { valid: false, message: 'Please enter a valid mobile number (e.g. 0771234567 or +94771234567)' };
    return { valid: true };
};

const Appointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [activeTab, setActiveTab] = useState('upcoming');
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ date: '', time: '', phone: '' });
    const [editError, setEditError] = useState('');

    const loadAppointments = () => {
        fetch(apiUrl('/api/appointments'))
            .then(res => res.json())
            .then(data => setAppointments(Array.isArray(data) ? data : []))
            .catch(() => setAppointments([]));
    };

    useEffect(() => {
        loadAppointments();
        fetch(apiUrl('/api/doctors'))
            .then((res) => res.json())
            .then((data) => setDoctors(Array.isArray(data) ? data : []))
            .catch(() => setDoctors([]));
    }, []);

    const filteredAppointments = appointments.filter(apt => {
        const aptDate = apt.date ? new Date(apt.date + 'T12:00:00') : null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isPastDate = aptDate ? (aptDate.setHours(0, 0, 0, 0), aptDate < today) : false;
        const matchesSearch = !searchTerm || apt.doctor?.toLowerCase().includes(searchTerm.toLowerCase());
        if (activeTab === 'upcoming') return !isPastDate && apt.status !== 'Cancelled' && matchesSearch;
        return (isPastDate || apt.status === 'Completed' || apt.status === 'Cancelled') && matchesSearch;
    });

    const handleDelete = async (id) => {
        if (!window.confirm('Do you want to delete this appointment?')) return;
        await fetch(apiUrl(`/api/appointments/${id}`), { method: 'DELETE' });
        loadAppointments();
    };

    const handleStartEdit = (apt) => {
        setEditingId(apt._id || apt.id);
        setEditForm({ date: apt.date || '', time: apt.time || '', phone: apt.patientPhone || '' });
        setEditError('');
    };

    const handleSaveEdit = async (apt) => {
        const id = apt._id || apt.id;
        const selectedDateValue = editForm.date;
        const selectedTime = editForm.time;
        const phoneResult = validateMobile(editForm.phone);
        if (!phoneResult.valid) {
            setEditError(phoneResult.message);
            return;
        }
        if (!selectedDateValue) {
            setEditError('Please select a valid date.');
            return;
        }
        if (!selectedTime) {
            setEditError('Please select an available time slot.');
            return;
        }

        const [y, m, d] = selectedDateValue.split('-').map(Number);
        const selectedDate = new Date(y, m - 1, d);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            setEditError('Appointment date cannot be in the past.');
            return;
        }

        if (!isWithinTwoWeekWindow(selectedDateValue)) {
            setEditError('Please select a date within this week or next week only.');
            return;
        }

        const doctorRecord = doctors.find((doc) => doc.name === apt.doctor);
        const availableSlots = Array.isArray(doctorRecord?.availableSlots) ? doctorRecord.availableSlots : [];
        if (availableSlots.length && !availableSlots.includes(selectedTime)) {
            setEditError('Please select a valid available slot for this doctor.');
            return;
        }

        const slotWeekday = getWeekdayFromSlot(selectedTime);
        if (slotWeekday !== null && selectedDate.getDay() !== slotWeekday) {
            setEditError(`This doctor slot is available only on ${WEEKDAY_LABELS[slotWeekday]}s.`);
            return;
        }

        setEditError('');
        await fetch(apiUrl(`/api/appointments/${id}`), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date: editForm.date, time: editForm.time, patientPhone: editForm.phone.trim() })
        });
        setEditingId(null);
        loadAppointments();
    };

    return (
        <div>
            <div className="flex-between" style={{ marginBottom: '24px' }}>
                <h1>My Appointments</h1>
                <Link to="/doctors">
                    <button className="btn-primary">+ Schedule New</button>
                </Link>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid #e5e7eb', marginBottom: '20px' }}>
                    <button
                        style={{
                            background: 'none',
                            borderBottom: activeTab === 'upcoming' ? '2px solid #3b82f6' : 'none',
                            color: activeTab === 'upcoming' ? '#3b82f6' : '#6b7280',
                            paddingBottom: '12px',
                            borderRadius: 0
                        }}
                        onClick={() => setActiveTab('upcoming')}
                    >
                        Upcoming
                    </button>
                    <button
                        style={{
                            background: 'none',
                            borderBottom: activeTab === 'past' ? '2px solid #3b82f6' : 'none',
                            color: activeTab === 'past' ? '#3b82f6' : '#6b7280',
                            paddingBottom: '12px',
                            borderRadius: 0
                        }}
                        onClick={() => setActiveTab('past')}
                    >
                        Past History
                    </button>

                    <div style={{ marginLeft: 'auto', position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', top: '12px', left: '12px', color: '#9ca3af' }} />
                        <input
                            type="text"
                            placeholder="Filter by doctor..."
                            style={{ paddingLeft: '36px', width: '250px' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {filteredAppointments.map(apt => (
                        (() => {
                            const doctorRecord = doctors.find((doc) => doc.name === apt.doctor);
                            const availableSlots = Array.isArray(doctorRecord?.availableSlots) && doctorRecord.availableSlots.length
                                ? doctorRecord.availableSlots
                                : [apt.time].filter(Boolean);
                            const avatarUrl = (apt.avatar && apt.avatar.trim()) || doctorRecord?.image || DEFAULT_AVATAR;

                            return (
                        <div key={apt._id || apt.id} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <AppointmentAvatar src={avatarUrl} alt={apt.doctor} />

                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                                    <h3 style={{ fontSize: '1.1rem' }}>{apt.doctor}</h3>
                                    <span className={`badge ${(apt.status || 'pending').toLowerCase()}`}>{apt.status || 'Pending'}</span>
                                </div>
                                <div style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '8px' }}>{apt.specialty}</div>

                                {editingId === (apt._id || apt.id) ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', alignItems: 'center' }}>
                                        <input
                                            type="date"
                                            value={editForm.date}
                                            min={getMinDateForSlotWeekday(editForm.time || apt.time)}
                                            max={getMaxDateForTwoWeekWindow()}
                                            onChange={(e) => {
                                                setEditForm((prev) => ({ ...prev, date: e.target.value }));
                                                setEditError('');
                                            }}
                                        />
                                        <select
                                            value={editForm.time}
                                            onChange={(e) => {
                                                setEditForm((prev) => ({ ...prev, time: e.target.value }));
                                                setEditError('');
                                            }}
                                        >
                                            {availableSlots.map((slot) => (
                                                <option key={slot} value={slot}>{slot}</option>
                                            ))}
                                        </select>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '4px' }}>Phone number</label>
                                            <input
                                                type="tel"
                                                value={editForm.phone}
                                                placeholder="e.g. 0771234567 or +94771234567"
                                                onChange={(e) => {
                                                    setEditForm((prev) => ({ ...prev, phone: e.target.value }));
                                                    setEditError('');
                                                }}
                                                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                                            />
                                        </div>
                                        {getWeekdayFromSlot(editForm.time || apt.time) !== null && (
                                            <p style={{ gridColumn: '1 / -1', margin: 0, fontSize: '0.82rem', color: '#6b7280' }}>
                                                This slot can only be scheduled on {WEEKDAY_LABELS[getWeekdayFromSlot(editForm.time || apt.time)]}s.
                                            </p>
                                        )}
                                        {editError && (
                                            <p style={{ gridColumn: '1 / -1', margin: 0, fontSize: '0.85rem', color: '#ef4444' }}>{editError}</p>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', gap: '24px', fontSize: '0.9rem', color: '#374151' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Calendar size={16} /> {apt.date}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Clock size={16} /> {apt.time}
                                        </div>
                                        {apt.type === 'Virtual' ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6' }}>
                                                <Video size={16} /> Virtual Meeting
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <MapPin size={16} /> {apt.location || 'Clinic'}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {activeTab !== 'past' && (
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    {editingId === (apt._id || apt.id) ? (
                                        <>
                                            <button className="btn-outline" onClick={() => setEditingId(null)}>Close</button>
                                            <button className="btn-primary" onClick={() => handleSaveEdit(apt)}>Save</button>
                                        </>
                                    ) : (
                                        <>
                                            <button className="btn-outline" onClick={() => handleStartEdit(apt)}>Edit</button>
                                            <button className="btn-outline" onClick={() => handleDelete(apt._id || apt.id)} style={{ color: '#ef4444', borderColor: '#ef4444' }}>
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                            );
                        })()
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Appointments;
