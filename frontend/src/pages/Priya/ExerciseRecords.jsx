import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Flame, Clock, Calendar, ChevronLeft, Pencil, Trash2 } from 'lucide-react';
import { apiUrl } from '../lib/api';

const ExerciseRecords = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ type: '', duration: '', calories: '', date: '' });
    const [error, setError] = useState('');

    const loadLogs = async () => {
        setLoading(true);
        try {
            setError('');
            const res = await fetch(apiUrl('/api/exercise'));
            if (!res.ok) throw new Error('Failed to load exercise logs.');
            const data = await res.json();
            setLogs(Array.isArray(data) ? data : []);
        } catch (err) {
            setLogs([]);
            setError(err?.message || 'Failed to load exercise logs.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadLogs(); }, []);

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <Link to="/exercise" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#3b82f6', fontSize: '0.9rem', textDecoration: 'none' }}>
                    <ChevronLeft size={20} /> Back to Activity Log
                </Link>
            </div>
            <h1 style={{ marginBottom: '8px' }}>Exercise Records</h1>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>All your logged exercise activities.</p>

            {error ? (
                <div className="card" style={{ border: '1px solid #fecaca', background: '#fef2f2', color: '#991b1b', marginBottom: '16px' }}>
                    {error}
                </div>
            ) : null}

            <div className="card">
                {loading ? (
                    <p style={{ color: '#6b7280', padding: '20px' }}>Loading...</p>
                ) : logs.length === 0 ? (
                    <p style={{ color: '#6b7280', padding: '20px' }}>No exercise records yet. <Link to="/exercise" style={{ color: '#3b82f6' }}>Log your first activity</Link>.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                        {logs.map((log, i) => {
                            const logId = log.id || log._id;
                            const isEditing = editingId === logId;
                            return (
                                <div
                                    key={logId}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        padding: '16px 0',
                                        borderBottom: i < logs.length - 1 ? '1px solid #e5e7eb' : 'none'
                                    }}
                                >
                                    <div style={{ background: '#f3f4f6', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Activity size={24} color="#3b82f6" />
                                    </div>
                                    {isEditing ? (
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <select value={editForm.type} onChange={e => setEditForm(f => ({ ...f, type: e.target.value }))} style={{ padding: '8px', borderRadius: '8px' }}>
                                                <option value="">Select activity</option>
                                                <option value="Running">Running</option>
                                                <option value="Cycling">Cycling</option>
                                                <option value="Yoga">Yoga</option>
                                                <option value="Weight Training">Weight Training</option>
                                                <option value="Swimming">Swimming</option>
                                            </select>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                <input type="number" value={editForm.duration} onChange={e => setEditForm(f => ({ ...f, duration: e.target.value }))} placeholder="Duration (min)" style={{ padding: '8px', borderRadius: '8px', width: '100px' }} />
                                                <input type="number" value={editForm.calories} onChange={e => setEditForm(f => ({ ...f, calories: e.target.value }))} placeholder="Calories" style={{ padding: '8px', borderRadius: '8px', width: '100px' }} />
                                                <input type="date" value={editForm.date} onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))} style={{ padding: '8px', borderRadius: '8px' }} />
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button type="button" className="btn-primary" style={{ padding: '8px 16px' }} onClick={handleSaveEdit}>Save</button>
                                                <button type="button" className="btn-outline" style={{ padding: '8px 16px' }} onClick={() => setEditingId(null)}>Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '1rem', fontWeight: '600' }}>{log.type}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#6b7280', display: 'flex', gap: '16px', marginTop: '4px' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> {log.duration} min</span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Flame size={14} /> {log.calories} kcal</span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span style={{ fontSize: '0.9rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} /> {log.date}</span>
                                                <button type="button" className="btn-outline" style={{ padding: '6px' }} onClick={() => handleStartEdit(log)} title="Edit"><Pencil size={16} /></button>
                                                <button type="button" className="btn-outline" style={{ padding: '6px', color: '#ef4444', borderColor: '#ef4444' }} onClick={() => handleDelete(logId)} title="Delete"><Trash2 size={16} /></button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExerciseRecords;
