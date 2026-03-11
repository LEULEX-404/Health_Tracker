import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/Imasha/AuthContext';
import { getAllUsers, updateUserStatus, deleteUser, createCaregiver, updateCaregiver } from '../../../utils/Imasha/adminApi';
import { Search, Filter, Plus, Edit2, Trash2, UserX, UserCheck, Mail, HeartHandshake } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CaregiversTab = () => {
    const { token } = useAuth();
    const [caregivers, setCaregivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Form Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', password: '',
        qualifications: '', experienceYears: ''
    });

    const fetchCaregivers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllUsers(token, {
                role: 'caregiver',
                search: search || undefined,
                isActive: statusFilter === 'all' ? undefined : statusFilter === 'active'
            });
            setCaregivers(data.data || []);
        } catch (err) {
            toast.error('Failed to fetch caregivers.');
        } finally {
            setLoading(false);
        }
    }, [token, search, statusFilter]);

    useEffect(() => {
        const timer = setTimeout(fetchCaregivers, 500);
        return () => clearTimeout(timer);
    }, [fetchCaregivers]);

    const handleToggleActive = async (user) => {
        try {
            await updateUserStatus(token, user._id, !user.isActive);
            toast.success(`Caregiver ${user.isActive ? 'deactivated' : 'activated'} successfully.`);
            fetchCaregivers();
        } catch (err) {
            toast.error('Failed to update status.');
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this caregiver?')) return;
        try {
            await deleteUser(token, userId);
            toast.success('Caregiver removed successfully.');
            fetchCaregivers();
        } catch (err) {
            toast.error('Failed to delete caregiver.');
        }
    };

    const handleOpenModal = (user = null) => {
        if (user) {
            setIsEditing(true);
            setCurrentId(user._id);
            setFormData({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                password: '',
                qualifications: user.qualifications || '',
                experienceYears: user.experienceYears || ''
            });
        } else {
            setIsEditing(false);
            setCurrentId(null);
            setFormData({
                firstName: '', lastName: '', email: '', password: '',
                qualifications: '', experienceYears: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await updateCaregiver(token, currentId, formData);
                toast.success('Caregiver updated successfully.');
            } else {
                await createCaregiver(token, formData);
                toast.success('Caregiver created successfully.');
            }
            setIsModalOpen(false);
            fetchCaregivers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save caregiver details.');
        }
    };

    return (
        <div className="admin-module-card">
            <div className="module-header">
                <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search caregivers..."
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
                <button className="Imasha-btn-primary admin-add-btn" onClick={() => handleOpenModal()}>
                    <Plus size={18} /> Add Caregiver
                </button>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Caregiver</th>
                            <th>Contact</th>
                            <th>Status</th>
                            <th>Joined</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="loading-state">Loading caregivers...</td></tr>
                        ) : caregivers.length === 0 ? (
                            <tr><td colSpan="5" className="empty-state">No caregivers found.</td></tr>
                        ) : caregivers.map((c) => (
                            <tr key={c._id}>
                                <td>
                                    <div className="user-info-cell">
                                        <div className="avatar-placeholder caregiver-icon"><HeartHandshake size={20} /></div>
                                        <div>
                                            <span className="user-name">{c.firstName} {c.lastName}</span>
                                            <span className="user-id">Caregiver</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="contact-cell">
                                        <span><Mail size={12} /> {c.email}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className={`status-pill ${c.isActive ? 'active' : 'inactive'}`}>
                                        {c.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                                <td className="text-right">
                                    <div className="action-btns">
                                        <button
                                            onClick={() => handleToggleActive(c)}
                                            className={`action-btn ${c.isActive ? 'warn' : 'success'}`}
                                            title={c.isActive ? 'Deactivate' : 'Activate'}
                                        >
                                            {c.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                                        </button>
                                        <button
                                            onClick={() => handleOpenModal(c)}
                                            className="action-btn"
                                            title="Edit Caregiver"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(c._id)}
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

            {/* Simple Modal for Add/Edit */}
            {isModalOpen && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-content">
                        <h3>{isEditing ? 'Edit Caregiver' : 'Add New Caregiver'}</h3>
                        <form onSubmit={handleFormSubmit} className="admin-form">
                            <div className="form-row">
                                <input type="text" placeholder="First Name" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} required />
                                <input type="text" placeholder="Last Name" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} required />
                            </div>
                            <input type="email" placeholder="Email Address" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required={!isEditing} />
                            {!isEditing && (
                                <input type="password" placeholder="Temporary Password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required />
                            )}
                            <div className="form-row">
                                <input type="text" placeholder="Qualifications" value={formData.qualifications} onChange={e => setFormData({ ...formData, qualifications: e.target.value })} />
                                <input type="number" placeholder="Experience (Years)" value={formData.experienceYears} onChange={e => setFormData({ ...formData, experienceYears: e.target.value })} />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="admin-btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="Imasha-btn-primary">Save Caregiver</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CaregiversTab;
