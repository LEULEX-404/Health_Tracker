import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/Imasha/AuthContext';
import { getAllUsers, updateUserStatus, deleteUser, createDoctor, updateDoctor } from '../../../utils/Imasha/adminApi';
import { Search, Filter, Plus, Edit2, Trash2, UserX, UserCheck, Mail, Award, Stethoscope } from 'lucide-react';
import { toast } from 'react-hot-toast';

const DoctorsTab = () => {
    const { token } = useAuth();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Form Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentDoctorId, setCurrentDoctorId] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', password: '',
        specialty: '', qualifications: '', experienceYears: ''
    });

    const fetchDoctors = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllUsers(token, {
                role: 'doctor',
                search: search || undefined,
                isActive: statusFilter === 'all' ? undefined : statusFilter === 'active'
            });
            // We fetch the basic user data. To get doctor specific info, 
            // the backend might need to populate it if it's stored in a separate collection,
            // or the user schema might hold it. 
            setDoctors(data.data || []);
        } catch (err) {
            toast.error('Failed to fetch doctors.');
        } finally {
            setLoading(false);
        }
    }, [token, search, statusFilter]);

    useEffect(() => {
        const timer = setTimeout(fetchDoctors, 500);
        return () => clearTimeout(timer);
    }, [fetchDoctors]);

    const handleToggleActive = async (doctor) => {
        try {
            await updateUserStatus(token, doctor._id, !doctor.isActive);
            toast.success(`Doctor ${doctor.isActive ? 'deactivated' : 'activated'} successfully.`);
            fetchDoctors();
        } catch (err) {
            toast.error('Failed to update status.');
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this doctor?')) return;
        try {
            await deleteUser(token, userId);
            toast.success('Doctor removed successfully.');
            fetchDoctors();
        } catch (err) {
            toast.error('Failed to delete doctor.');
        }
    };

    const handleOpenModal = (doctor = null) => {
        if (doctor) {
            setIsEditing(true);
            setCurrentDoctorId(doctor._id);
            // Pre-fill with available data. For a real app, you might fetch full doctor profile here
            setFormData({
                firstName: doctor.firstName,
                lastName: doctor.lastName,
                email: doctor.email,
                password: '',
                specialty: doctor.specialty || '', // Assuming it's in user or we just mock it for now
                qualifications: doctor.qualifications || '',
                experienceYears: doctor.experienceYears || ''
            });
        } else {
            setIsEditing(false);
            setCurrentDoctorId(null);
            setFormData({
                firstName: '', lastName: '', email: '', password: '',
                specialty: '', qualifications: '', experienceYears: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                // Determine the correct data payload based on your admin routes
                await updateDoctor(token, currentDoctorId, formData);
                toast.success('Doctor updated successfully.');
            } else {
                await createDoctor(token, formData);
                toast.success('Doctor created successfully.');
            }
            setIsModalOpen(false);
            fetchDoctors();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save doctor details.');
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
                            placeholder="Search doctors..."
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
                    <Plus size={18} /> Add Doctor
                </button>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Doctor</th>
                            <th>Contact</th>
                            <th>Status</th>
                            <th>Joined</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="loading-state">Loading doctors...</td></tr>
                        ) : doctors.length === 0 ? (
                            <tr><td colSpan="5" className="empty-state">No doctors found.</td></tr>
                        ) : doctors.map((d) => (
                            <tr key={d._id}>
                                <td>
                                    <div className="user-info-cell">
                                        <div className="avatar-placeholder"><Stethoscope size={20} /></div>
                                        <div>
                                            <span className="user-name">Dr. {d.firstName} {d.lastName}</span>
                                            <span className="user-id">Specialist</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="contact-cell">
                                        <span><Mail size={12} /> {d.email}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className={`status-pill ${d.isActive ? 'active' : 'inactive'}`}>
                                        {d.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>{new Date(d.createdAt).toLocaleDateString()}</td>
                                <td className="text-right">
                                    <div className="action-btns">
                                        <button
                                            onClick={() => handleToggleActive(d)}
                                            className={`action-btn ${d.isActive ? 'warn' : 'success'}`}
                                            title={d.isActive ? 'Deactivate' : 'Activate'}
                                        >
                                            {d.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                                        </button>
                                        <button
                                            onClick={() => handleOpenModal(d)}
                                            className="action-btn"
                                            title="Edit Doctor"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(d._id)}
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
                        <h3>{isEditing ? 'Edit Doctor' : 'Add New Doctor'}</h3>
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
                                <input type="text" placeholder="Specialty" value={formData.specialty} onChange={e => setFormData({ ...formData, specialty: e.target.value })} required />
                                <input type="number" placeholder="Experience (Years)" value={formData.experienceYears} onChange={e => setFormData({ ...formData, experienceYears: e.target.value })} />
                            </div>
                            <input type="text" placeholder="Qualifications" value={formData.qualifications} onChange={e => setFormData({ ...formData, qualifications: e.target.value })} />

                            <div className="modal-actions">
                                <button type="button" className="admin-btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="Imasha-btn-primary">Save Doctor</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorsTab;
