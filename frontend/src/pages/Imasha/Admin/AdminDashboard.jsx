import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/Imasha/AuthContext';
import AdminSidebar from '../../../components/Imasha/Admin/AdminSidebar';
import PatientsTable from './PatientsTable';
import DoctorsTab from './DoctorsTab';
import CaregiversTab from './CaregiversTab';
import ReportsTab from './ReportsTab';
import { Users, UserCheck, UserPlus, Activity, ShieldAlert, LogOut, Sun, Moon, Menu, Clock, FileText, CheckCircle, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

import '../../../styles/Imasha/AdminDashboard.css';

const AdminDashboard = () => {
    const { user, logout, token } = useAuth();
    const [theme, setTheme] = useState('dark');
    const [activeTab, setActiveTab] = useState('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Stats state
    const [dashboardStats, setDashboardStats] = useState({
        totalUsers: 0,
        totalActive: 0,
        totalPatients: 0,
        totalDoctors: 0,
        totalCaregivers: 0,
        loading: true
    });

    // Audit logs state
    const [auditLogs, setAuditLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(true);

    // View All Audit logs modal state
    const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
    const [fullAuditLogs, setFullAuditLogs] = useState([]);
    const [fullLogsLoading, setFullLogsLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'overview') {
            const fetchDashboardData = async () => {
                setDashboardStats(prev => ({ ...prev, loading: true }));
                setLogsLoading(true);
                try {
                    const { getAdminDashboardStats, getAuditLogs } = await import('../../../utils/Imasha/adminApi');
                    const [stats, logsData] = await Promise.all([
                        getAdminDashboardStats(token),
                        getAuditLogs(token, { limit: 10 })
                    ]);

                    setDashboardStats({ ...stats, loading: false });
                    setAuditLogs(logsData.data || []);
                } catch (error) {
                    console.error("Failed to load dashboard data", error);
                    setDashboardStats(prev => ({ ...prev, loading: false }));
                } finally {
                    setLogsLoading(false);
                }
            };
            fetchDashboardData();
        }
    }, [activeTab, token]);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        document.documentElement.classList.toggle('light-theme', newTheme === 'light');
    };

    const openAuditModal = async () => {
        setIsAuditModalOpen(true);
        setFullLogsLoading(true);
        try {
            const { getAuditLogs } = await import('../../../utils/Imasha/adminApi');
            const logsData = await getAuditLogs(token, { limit: 100 });
            setFullAuditLogs(logsData.data || []);
        } catch (error) {
            toast.error("Failed to load audit logs");
        } finally {
            setFullLogsLoading(false);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'patients': return <PatientsTable />;
            case 'doctors': return <DoctorsTab />;
            case 'caregivers': return <CaregiversTab />;
            case 'reports': return <ReportsTab />;
            case 'appointments': return <div className="admin-placeholder">Appointments Management (Coming Soon)</div>;
            case 'alerts': return <div className="admin-placeholder">Alerts Monitoring (Coming Soon)</div>;
            default: return (
                <div className="admin-overview">
                    <div className="admin-stats-grid">
                        <div className="admin-stat-card unique">
                            <div className="stat-icon"><Users size={24} /></div>
                            <div className="stat-details">
                                <h3>Total Users</h3>
                                <p className="stat-value">{dashboardStats.loading ? '...' : dashboardStats.totalUsers}</p>
                                <span className="stat-change">+12% this month</span>
                            </div>
                        </div>
                        <div className="admin-stat-card unique">
                            <div className="stat-icon"><UserCheck size={24} /></div>
                            <div className="stat-details">
                                <h3>Active Users</h3>
                                <p className="stat-value">{dashboardStats.loading ? '...' : dashboardStats.totalActive}</p>
                                <span className="stat-change">+5.2%</span>
                            </div>
                        </div>
                        <div className="admin-stat-card unique">
                            <div className="stat-icon"><Activity size={24} /></div>
                            <div className="stat-details">
                                <h3>Active Patients</h3>
                                <p className="stat-value">{dashboardStats.loading ? '...' : dashboardStats.totalPatients}</p>
                                <span className="stat-change status-good">Optimal Growth</span>
                            </div>
                        </div>
                        <div className="admin-stat-card unique">
                            <div className="stat-icon"><ShieldAlert size={24} /></div>
                            <div className="stat-details">
                                <h3>System Health</h3>
                                <p className="stat-value">99.8%</p>
                                <span className="stat-change status-good">All Services Online</span>
                            </div>
                        </div>
                    </div>

                    <div className="admin-module-card" style={{ marginTop: '2rem' }}>
                        <div className="module-header">
                            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Recent Audit Logs</h3>
                            <button className="admin-btn-secondary" onClick={openAuditModal} style={{ padding: '0.5rem 1rem', minWidth: 'auto', fontSize: '0.85rem' }}>View All</button>
                        </div>
                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Action</th>
                                        <th>User/Entity</th>
                                        <th>Details</th>
                                        <th>Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logsLoading ? (
                                        <tr><td colSpan="4" className="loading-state">Loading logs...</td></tr>
                                    ) : auditLogs.length === 0 ? (
                                        <tr><td colSpan="4" className="empty-state">No recent activity.</td></tr>
                                    ) : auditLogs.map((log) => (
                                        <tr key={log._id}>
                                            <td>
                                                <span className={`status-pill ${log.status === 'success' ? 'active' : 'warn'}`}>
                                                    <CheckCircle size={10} style={{ marginRight: 4 }} /> {log.action}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="user-name">{log.userId?.firstName} {log.userId?.lastName}</div>
                                                <div className="user-id">{log.userId?.role || 'System'}</div>
                                            </td>
                                            <td>{log.description}</td>
                                            <td>
                                                <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* View All Audit Logs Modal */}
                    {isAuditModalOpen && (
                        <div className="admin-modal-overlay">
                            <div className="admin-modal-content" style={{ maxWidth: '800px', width: '90%' }}>
                                <div className="modal-header space-between">
                                    <h3>System Audit Logs</h3>
                                    <button type="button" className="close-btn" onClick={() => setIsAuditModalOpen(false)}>
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="admin-table-container" style={{ maxHeight: '60vh', overflowY: 'auto', marginTop: '1rem' }}>
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Action</th>
                                                <th>User/Entity</th>
                                                <th>Details</th>
                                                <th>Time</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {fullLogsLoading ? (
                                                <tr><td colSpan="4" className="loading-state">Loading logs...</td></tr>
                                            ) : fullAuditLogs.length === 0 ? (
                                                <tr><td colSpan="4" className="empty-state">No activity found.</td></tr>
                                            ) : fullAuditLogs.map((log) => (
                                                <tr key={`full-${log._id}`}>
                                                    <td>
                                                        <span className={`status-pill ${log.status === 'success' ? 'active' : 'warn'}`}>
                                                            <CheckCircle size={10} style={{ marginRight: 4 }} /> {log.action}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="user-name">{log.userId?.firstName} {log.userId?.lastName}</div>
                                                        <div className="user-id">{log.userId?.role || 'System'}</div>
                                                    </td>
                                                    <td>{log.description}</td>
                                                    <td>
                                                        <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>
                                                            {new Date(log.createdAt).toLocaleString()}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            );
        }
    };

    return (
        <div className={`admin-dashboard-container ${theme}-theme`}>
            <AdminSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isOpen={isSidebarOpen}
                toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                theme={theme}
                toggleTheme={toggleTheme}
            />

            <main className={`admin-main-content ${isSidebarOpen ? '' : 'sidebar-collapsed'}`}>
                <header className="admin-top-bar">
                    <div className="top-bar-left">
                        <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                            <Menu size={20} />
                        </button>
                        <h2 className="admin-page-title">
                            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                        </h2>
                    </div>

                    <div className="top-bar-right">
                        <div className="admin-profile-pill">
                            <img
                                src={user?.profileImage || '/images/default-avatar.png'}
                                alt="Admin"
                                className="admin-avatar"
                                onError={(e) => { e.target.onerror = null; e.target.src = '/images/default-avatar.png'; }}
                            />
                            <div className="admin-info">
                                <span className="admin-name">{user?.firstName || 'Admin'}</span>
                                <span className="admin-role">Super Admin</span>
                            </div>
                            <button onClick={logout} className="logout-mini-btn" title="Logout">
                                <LogOut size={16} />
                            </button>
                        </div>
                    </div>
                </header>

                <div className="admin-content-area">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
