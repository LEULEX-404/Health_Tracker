import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/Imasha/AuthContext';
import { getAllUsers, updateUserStatus, deleteUser } from '../../../utils/Imasha/adminApi';
import { Search, Filter, Trash2, UserX, UserCheck, Mail, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PatientsTable = () => {
    const { token } = useAuth();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchPatients = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllUsers(token, {
                role: 'patient',
                search: search || undefined,
                isActive: statusFilter === 'all' ? undefined : statusFilter === 'active'
            });
            setPatients(data.data || []);
        } catch (err) {
            toast.error('Failed to fetch patients.');
        } finally {
            setLoading(false);
        }
    }, [token, search, statusFilter]);

    useEffect(() => {
        const timer = setTimeout(fetchPatients, 500);
        return () => clearTimeout(timer);
    }, [fetchPatients]);

    const handleToggleActive = async (patient) => {
        try {
            await updateUserStatus(token, patient._id, !patient.isActive);
            toast.success(`Patient ${patient.isActive ? 'deactivated' : 'activated'} successfully.`);
            fetchPatients();
        } catch (err) {
            toast.error('Failed to update status.');
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this patient? This is a soft delete.')) return;
        try {
            await deleteUser(token, userId);
            toast.success('Patient removed successfully.');
            fetchPatients();
        } catch (err) {
            toast.error('Failed to delete patient.');
        }
    };

    const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    };

    return (
        <div className="admin-module-card">
            <div className="module-header">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search patients by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <Filter size={18} />
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="all">All Status</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">Inactive Only</option>
                    </select>
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Patient</th>
                            <th>Contact</th>
                            <th>Status</th>
                            <th>Joined</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="loading-state">Loading patients...</td></tr>
                        ) : patients.length === 0 ? (
                            <tr><td colSpan="5" className="empty-state">No patients found.</td></tr>
                        ) : patients.map((p) => (
                            <tr key={p._id}>
                                <td>
                                    <div className="user-info-cell">
                                        {p.profileImage ? (
                                            <img
                                                src={p.profileImage}
                                                alt=""
                                                onError={(e) => { e.target.onerror = null; e.target.src = '/images/default-avatar.png'; }}
                                            />
                                        ) : (
                                            <div className="avatar-placeholder" style={{ background: 'var(--admin-primary)', color: 'white', fontWeight: 'bold' }}>
                                                {getInitials(p.firstName, p.lastName)}
                                            </div>
                                        )}
                                        <div>
                                            <span className="user-name">{p.firstName} {p.lastName}</span>
                                            <span className="user-id">ID: {p._id.slice(-6)}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="contact-cell">
                                        <span><Mail size={12} /> {p.email}</span>
                                        {p.isEmailVerified && <span className="verified-badge"><Shield size={10} /> Verified</span>}
                                    </div>
                                </td>
                                <td>
                                    <span className={`status-pill ${p.isActive ? 'active' : 'inactive'}`}>
                                        {p.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                                <td className="text-right">
                                    <div className="action-btns">
                                        <button
                                            onClick={() => handleToggleActive(p)}
                                            className={`action-btn ${p.isActive ? 'warn' : 'success'}`}
                                            title={p.isActive ? 'Deactivate' : 'Activate'}
                                        >
                                            {p.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(p._id)}
                                            className="action-btn danger"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PatientsTable;
