import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Heart, Droplet, Clock, ChevronRight } from 'lucide-react';
import { apiUrl } from '../lib/api';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const formatDateBox = (dateStr) => {
    if (!dateStr) return { month: '—', day: '—' };
    const [y, m, d] = dateStr.split('-').map(Number);
    if (isNaN(m) || isNaN(d)) return { month: '—', day: '—' };
    return { month: MONTHS[m - 1] || '—', day: String(d).padStart(2, '0') };
};

const isUpcoming = (apt) => {
    if (!apt.date) return false;
    const aptDate = new Date(apt.date + 'T12:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    aptDate.setHours(0, 0, 0, 0);
    return aptDate >= today && apt.status !== 'Cancelled';
};

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch(apiUrl('/api/stats')).then(r => r.json()),
            fetch(apiUrl('/api/appointments')).then(r => r.json())
        ])
            .then(([statsData, apts]) => {
                setStats(statsData);
                const upcoming = Array.isArray(apts)
                    ? apts.filter(isUpcoming).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 5)
                    : [];
                setAppointments(upcoming);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Loading...</div>;

    const exerciseData = [
        { name: 'Completed', value: stats.activeMinutes },
        { name: 'Remaining', value: 200 - stats.activeMinutes }
    ];
    const COLORS = ['#3b82f6', '#e5e7eb'];

    return (
        <div>
            <h1 style={{ marginBottom: '24px' }}>Good morning, Jane</h1>

            <div className="grid-cols-2" style={{ gridTemplateColumns: '2fr 1fr' }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* Quick Actions / Featured Card */}
                    <div className="card" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white' }}>
                        <div className="flex-between">
                            <div>
                                <h3>Book New Appointment</h3>
                                <p style={{ opacity: 0.9, marginTop: '4px' }}>Find a specialist near you</p>
                            </div>
                            <Link to="/doctors">
                                <button style={{ background: 'white', color: '#2563eb' }}>Book Now</button>
                            </Link>
                        </div>
                    </div>

                    {/* Upcoming Appointments Preview */}
                    <div className="card">
                        <div className="flex-between" style={{ marginBottom: '16px' }}>
                            <h3>Upcoming Appointments</h3>
                            <Link to="/appointments" style={{ color: '#3b82f6', fontSize: '0.9rem', textDecoration: 'none' }}>See all</Link>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {appointments.length === 0 ? (
                                <p style={{ color: '#6b7280', fontSize: '0.9rem', padding: '12px' }}>No upcoming appointments.</p>
                            ) : (
                                appointments.map((apt) => {
                                    const { month, day } = formatDateBox(apt.date);
                                    const isConfirmed = (apt.status || '').toLowerCase() === 'confirmed';
                                    return (
                                        <div key={apt._id || apt.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                                            <div style={{
                                                background: isConfirmed ? '#dbeafe' : '#f3f4f6',
                                                color: isConfirmed ? '#1e40af' : '#374151',
                                                padding: '8px',
                                                borderRadius: '8px',
                                                textAlign: 'center',
                                                minWidth: '50px'
                                            }}>
                                                <div style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>{month}</div>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{day}</div>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: '600' }}>{apt.doctor || 'Doctor'}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{apt.specialty || 'Appointment'} • {apt.time || '—'}</div>
                                            </div>
                                            <span className={`badge ${(apt.status || 'pending').toLowerCase()}`}>{apt.status || 'Pending'}</span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Grid of smaller stats */}
                    <div className="grid-cols-2">
                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#ef4444' }}>
                                <Heart size={20} fill="#ef4444" />
                                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#6b7280' }}>HEART RATE</span>
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.heartRate} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: '#6b7280' }}>bpm</span></div>
                            <div style={{ fontSize: '0.8rem', color: '#10b981' }}>Normal range</div>
                        </div>

                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#3b82f6' }}>
                                <Droplet size={20} fill="#3b82f6" />
                                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#6b7280' }}>HYDRATION</span>
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.hydration} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: '#6b7280' }}>Liters</span></div>
                            <div style={{ height: '6px', background: '#e5e7eb', borderRadius: '4px', marginTop: '8px' }}>
                                <div style={{ width: '60%', height: '100%', background: '#3b82f6', borderRadius: '4px' }}></div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* Weekly Exercise Chart */}
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div className="flex-between" style={{ width: '100%', marginBottom: '16px' }}>
                            <h3>Weekly Exercise</h3>
                        </div>

                        <div style={{ width: '200px', height: '200px', position: 'relative' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={exerciseData}
                                        innerRadius={70}
                                        outerRadius={90}
                                        startAngle={90}
                                        endAngle={-270}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {exerciseData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.activeMinutes}</div>
                                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>MINS</div>
                            </div>
                        </div>

                        <div className="grid-cols-2" style={{ width: '100%', marginTop: '20px', gap: '10px' }}>
                            <div className="card" style={{ background: '#f9fafb', padding: '12px', textAlign: 'center', boxShadow: 'none' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{stats.caloriesBurned}</div>
                                <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>CALORIES</div>
                            </div>
                            <div className="card" style={{ background: '#f9fafb', padding: '12px', textAlign: 'center', boxShadow: 'none' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{stats.distanceKm}</div>
                                <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>KILOMETERS</div>
                            </div>
                        </div>
                    </div>

                    {/* Health Tip */}
                    <div className="card" style={{ background: '#eff6ff', border: '1px solid #dbeafe' }}>
                        <h4 style={{ color: '#1e40af', marginBottom: '8px' }}>Health Tip</h4>
                        <p style={{ fontSize: '0.9rem', color: '#1e3a8a' }}>
                            Try to incorporate 10 minutes of stretching after your morning routine to improve circulation.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Dashboard;
