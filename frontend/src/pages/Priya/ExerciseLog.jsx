import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Flame, Clock, Calendar, Save, Pencil, Trash2 } from 'lucide-react';
import { apiUrl } from '../lib/api';

const ExerciseLog = () => {
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [formData, setFormData] = useState({
        type: '',
        duration: '',
        calories: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ type: '', duration: '', calories: '', date: '' });
    const [error, setError] = useState('');

    const loadLogs = async () => {
        try {
            setError('');
            const res = await fetch(apiUrl('/api/exercise'));
            if (!res.ok) throw new Error('Failed to load exercise logs.');
            const data = await res.json();
            setLogs(Array.isArray(data) ? data : []);
        } catch (err) {
            setLogs([]);
            setError(err?.message || 'Failed to load exercise logs.');
        }
    };

    useEffect(() => { loadLogs(); }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            const res = await fetch(apiUrl('/api/exercise'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (!res.ok) throw new Error('Failed to create exercise log.');
            const newLog = await res.json();
            setLogs([newLog, ...logs]);
            setFormData({ type: '', duration: '', calories: '', date: new Date().toISOString().split('T')[0] });
            navigate('/records');
        } catch (err) {
            setError(err?.message || 'Failed to create exercise log.');
        }
    };

    const normalizeDateInput = (value) => {
        if (!value) return '';
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return '';
        return d.toISOString().split('T')[0];
    };

    const handleStartEdit = (log) => {
        setEditingId(log.id || log._id);
        setEditForm({
            type: log.type || '',
            duration: log.duration ?? '',
            calories: log.calories ?? '',
            date: normalizeDateInput(log.date)
        });
    };

    const handleSaveEdit = async () => {
        if (!editingId) return;
        try {
            setError('');
            const res = await fetch(apiUrl(`/api/exercise/${editingId}`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });
            if (!res.ok) throw new Error('Failed to update exercise log.');
            const updated = await res.json();
            setLogs(logs.map(l => (l.id === editingId || l._id === editingId ? updated : l)));
            setEditingId(null);
        } catch (err) {
            setError(err?.message || 'Failed to update exercise log.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this exercise record?')) return;
        try {
            setError('');
            const res = await fetch(apiUrl(`/api/exercise/${id}`), { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete exercise log.');
            await loadLogs();
        } catch (err) {
            setError(err?.message || 'Failed to delete exercise log.');
        }
    };

    return (
        <div>
            <h1 style={{ marginBottom: '8px' }}>Log Exercise</h1>
            <p style={{ color: '#6b7280', marginBottom: '32px' }}>Keep track of your fitness journey and reach your goals.</p>

            {error ? (
                <div className="card" style={{ border: '1px solid #fecaca', background: '#fef2f2', color: '#991b1b', marginBottom: '16px' }}>
                    {error}
                </div>
            ) : null}

            <div className="layout" style={{ gap: '32px', minHeight: 'auto' }}>
                {/* Left: Form */}
                <div style={{ flex: 2 }}>
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                            <Activity color="#3b82f6" />
                            <h3 style={{ fontSize: '1.1rem' }}>Activity Details</h3>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Exercise Type</label>
                                <select name="type" value={formData.type} onChange={handleChange} required>
                                    <option value="">Select activity (e.g. Running, Cycling)</option>
                                    <option value="Running">Running</option>
                                    <option value="Cycling">Cycling</option>
                                    <option value="Yoga">Yoga</option>
                                    <option value="Weight Training">Weight Training</option>
                                    <option value="Swimming">Swimming</option>
                                </select>
                            </div>

                            <div className="grid-cols-2" style={{ marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Duration (min)</label>
                                    <div style={{ position: 'relative' }}>
                                        <input type="number" name="duration" value={formData.duration} onChange={handleChange} placeholder="45" required />
                                        <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-30%)', color: '#9ca3af', fontSize: '0.8rem' }}>MIN</span>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Calories Burned (kcal)</label>
                                    <div style={{ position: 'relative' }}>
                                        <input type="number" name="calories" value={formData.calories} onChange={handleChange} placeholder="320" required />
                                        <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-30%)', color: '#9ca3af', fontSize: '0.8rem' }}>KCAL</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Average Heart Rate (BPM)</label>
                                <div style={{ position: 'relative' }}>
                                    <HeartIcon />
                                    <input type="number" placeholder="135" style={{ paddingLeft: '36px' }} />
                                    <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-30%)', color: '#9ca3af', fontSize: '0.8rem' }}>BPM</span>
                                </div>
                            </div>

                            <div style={{ marginBottom: '32px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Date of Activity</label>
                                <input type="date" name="date" value={formData.date} onChange={handleChange} required />
                            </div>

                            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                                <Save size={18} /> Save Activity
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right: Summary */}
                <div style={{ flex: 1 }}>
                    <div className="grid-cols-2" style={{ marginBottom: '24px', gap: '16px' }}>
                        <div className="card" style={{ background: '#eff6ff', border: '1px solid #dbeafe' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '4px', textTransform: 'uppercase' }}>TODAY'S TOTAL</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>124 <span style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>min</span></div>
                        </div>
                        <div className="card" style={{ background: '#ecfdf5', border: '1px solid #d1fae5' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#10b981', marginBottom: '4px', textTransform: 'uppercase' }}>CALORIES</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>840 <span style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>kcal</span></div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex-between" style={{ marginBottom: '16px' }}>
                            <h3>Recent History</h3>
                            <Link to="/records" style={{ fontSize: '0.8rem', color: '#3b82f6', textDecoration: 'none' }}>View All</Link>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {logs.map((log, i) => {
                                const logId = log.id || log._id;
                                const isEditing = editingId === logId;
                                return (
                                    <div key={logId} style={{ display: 'flex', gap: '12px', paddingBottom: '12px', borderBottom: i < logs.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                                        <div style={{ background: '#f3f4f6', padding: '10px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Activity size={20} color="#3b82f6" />
                                        </div>
                                        {isEditing ? (
                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <select value={editForm.type} onChange={e => setEditForm(f => ({ ...f, type: e.target.value }))} style={{ padding: '6px', borderRadius: '6px', flex: 1 }}>
                                                    <option value="">Select activity</option>
                                                    <option value="Running">Running</option>
                                                    <option value="Cycling">Cycling</option>
                                                    <option value="Yoga">Yoga</option>
                                                    <option value="Weight Training">Weight Training</option>
                                                    <option value="Swimming">Swimming</option>
                                                </select>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <input type="number" value={editForm.duration} onChange={e => setEditForm(f => ({ ...f, duration: e.target.value }))} placeholder="Duration (min)" style={{ width: '80px', padding: '6px', borderRadius: '6px' }} />
                                                    <input type="number" value={editForm.calories} onChange={e => setEditForm(f => ({ ...f, calories: e.target.value }))} placeholder="Calories" style={{ width: '80px', padding: '6px', borderRadius: '6px' }} />
                                                    <input type="date" value={editForm.date} onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))} style={{ padding: '6px', borderRadius: '6px' }} />
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button type="button" className="btn-primary" style={{ padding: '6px 12px' }} onClick={handleSaveEdit}>Save</button>
                                                    <button type="button" className="btn-outline" style={{ padding: '6px 12px' }} onClick={() => setEditingId(null)}>Cancel</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '0.95rem', fontWeight: '600' }}>{log.type}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#6b7280', display: 'flex', gap: '12px' }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {log.duration} min</span>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Flame size={12} /> {log.calories} kcal</span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{log.date}</span>
                                                    <button type="button" className="btn-outline" style={{ padding: '4px' }} onClick={() => handleStartEdit(log)} title="Edit"><Pencil size={14} /></button>
                                                    <button type="button" className="btn-outline" style={{ padding: '4px', color: '#ef4444', borderColor: '#ef4444' }} onClick={() => handleDelete(logId)} title="Delete"><Trash2 size={14} /></button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="card" style={{ background: '#3b82f6', color: 'white', marginTop: '24px' }}>
                        <h3>Keep it up, Jane!</h3>
                        <p style={{ opacity: 0.9, marginTop: '8px', fontSize: '0.9rem' }}>
                            You're only 3 workouts away from your weekly goal. Consistency is the key to longevity.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper for heart icon inside input
const HeartIcon = () => (
    <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-30%)' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#ef4444" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
    </div>
);

export default ExerciseLog;
