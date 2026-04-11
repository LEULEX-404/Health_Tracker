import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/Imasha/AuthContext';
import AdminSidebar from '../../../components/Imasha/Admin/AdminSidebar';
import PatientsTable from './PatientsTable';
import DoctorsTab from './DoctorsTab';
import CaregiversTab from './CaregiversTab';
import ReportsTab from './ReportsTab';
import AppointmentsTab from './AppointmentsTab';
import AdminAlertsTab from '../../Tharindu/AdminAlertsTab';
import AdminAppointmentsTab from '../../Tharindu/AdminAppointmentsTab';
import SupportMessagesTab from './SupportMessagesTab';
import { Users, UserCheck, UserPlus, Activity, ShieldAlert, LogOut, Sun, Moon, Menu, Clock, FileText, CheckCircle, X, Heart, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getAdminDashboardStats, getAuditLogs } from '../../../utils/Imasha/adminApi';

import '../../../styles/Imasha/AdminDashboard.css';

const StatCardBackground = ({ src, alt }) => {
    const [loaded, setLoaded] = useState(false);
    return (
        <motion.img
            initial={{ opacity: 0 }}
            animate={{ opacity: loaded ? 1 : 0 }}
            transition={{ duration: 0.8 }}
            onLoad={() => setLoaded(true)}
            src={src}
            alt={alt}
            className="card-bg-img"
            loading="lazy"
        />
    );
};

const AdminDashboard = () => {
    const { user, logout, token } = useAuth();
    const [theme, setTheme] = useState('dark');
    const [activeTab, setActiveTab] = useState('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [heroLoaded, setHeroLoaded] = useState(false);

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

    const tabTitles = {
        overview: 'Overview',
        patients: 'Patients',
        doctors: 'Doctors',
        caregivers: 'Caregivers',
        reports: 'Reports',
        appointments: 'Appointments',
        alerts: 'Alerts',
        support: 'Doctor Support',
    };

    useEffect(() => {
        if (activeTab === 'overview') {
            const fetchDashboardData = async () => {
                setDashboardStats(prev => ({ ...prev, loading: true }));
                setLogsLoading(true);
                try {
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
            const logsData = await getAuditLogs(token, { limit: 100 });
            setFullAuditLogs(logsData.data || []);
        } catch {
            toast.error("Failed to load audit logs");
        } finally {
            setFullLogsLoading(false);
        }
    };

    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good Morning';
        if (h < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'patients': return <PatientsTable />;
            case 'doctors': return <DoctorsTab />;
            case 'caregivers': return <CaregiversTab />;
            case 'reports': return <ReportsTab />;
            case 'appointments': return <AdminAppointmentsTab />;
            case 'alerts': return <AdminAlertsTab />;
            case 'support': return <SupportMessagesTab />;
            default: return (
                <div className="admin-overview">

                    {/* ── Hero Welcome Banner ── */}
                    <div className="admin-hero-banner">
                        <div className="hero-left">
                            <div className="hero-live-pill">
                                <span className="hero-live-dot" />
                                LIVE MONITORING
                            </div>
                            <h2 className="hero-greeting">
                                {getGreeting()},{' '}
                                <span className="hero-name">
                                    {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Super Admin'}
                                </span>
                            </h2>
                            <p className="hero-subtitle">
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                &nbsp;·&nbsp; PulseNova Health Command Center
                            </p>
                            <div className="hero-quick-stats">
                                <div className="hero-qstat qstat-green">
                                    <div className="qstat-icon-wrap">
                                        <Users size={15} />
                                    </div>
                                    <div className="qstat-body">
                                        <span className="qstat-value">{dashboardStats.loading ? '—' : dashboardStats.totalPatients}</span>
                                        <span className="qstat-label">Patients Active</span>
                                    </div>
                                </div>
                                <div className="hero-qstat qstat-cyan">
                                    <div className="qstat-icon-wrap">
                                        <Clock size={15} />
                                    </div>
                                    <div className="qstat-body">
                                        <span className="qstat-value">{dashboardStats.loading ? '—' : auditLogs.length}</span>
                                        <span className="qstat-label">Audits Today</span>
                                    </div>
                                </div>
                                <div className="hero-qstat qstat-amber">
                                    <div className="qstat-icon-wrap">
                                        <ShieldAlert size={15} />
                                    </div>
                                    <div className="qstat-body">
                                        <span className="qstat-value">2</span>
                                        <span className="qstat-label">Alerts</span>
                                    </div>
                                </div>
                                <div className="hero-qstat qstat-purple">
                                    <div className="qstat-icon-wrap">
                                        <Activity size={15} />
                                    </div>
                                    <div className="qstat-body">
                                        <span className="qstat-value">99.8%</span>
                                        <span className="qstat-label">Uptime</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="hero-image-wrap">
                            <motion.img
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: heroLoaded ? 1 : 0, scale: heroLoaded ? 1 : 0.96 }}
                                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                                onLoad={() => setHeroLoaded(true)}
                                src="/images/Imasha/Admin/admin_Dashboard.png"
                                srcSet="/images/Imasha/Admin/admin_Dashboard.png 2000w"
                                sizes="(max-width: 1024px) 100vw, 40vw"
                                fetchPriority="high"
                                loading="eager"
                                alt="Admin Visual"
                                className="hero-doctor-img"
                                onError={(e) => { e.target.onerror = null; e.target.src = '/images/Priya/doctor-01.png'; }}
                            />
                        </div>
                    </div>
                    {/* ── End Hero Banner ── */}

                    <div className="admin-stats-grid">
                        {/* Card 1: Total Users */}
                        <div className="admin-stat-card card-users">
                            <div className="card-bg-glow" />
                            <div className="card-top-row">
                                <div className="card-icon-wrap"><Users size={18} /></div>
                                <span className="card-status-pill">Active</span>
                            </div>
                            <div className="card-middle">
                                <p className="card-value">{dashboardStats.loading ? '...' : dashboardStats.totalUsers}</p>
                                <h3 className="card-label">TOTAL USERS</h3>
                            </div>
                            <div className="card-bottom">
                                <div className="card-trend">
                                    <span className="trend-val">↑ +12%</span>
                                    <span className="trend-sub">vs last month</span>
                                </div>
                            </div>
                            <StatCardBackground src="/images/Imasha/Admin/stats_1.png" alt="Users Bg" />
                        </div>

                        {/* Card 2: Active Users */}
                        <div className="admin-stat-card card-active">
                            <div className="card-bg-glow" />
                            <div className="card-top-row">
                                <div className="card-icon-wrap"><UserCheck size={18} /></div>
                                <span className="card-status-pill">Online</span>
                            </div>
                            <div className="card-middle">
                                <p className="card-value">{dashboardStats.loading ? '...' : dashboardStats.totalActive}</p>
                                <h3 className="card-label">ACTIVE USERS</h3>
                            </div>
                            <div className="card-bottom">
                                <div className="card-trend">
                                    <span className="trend-val">↑ +5.2%</span>
                                    <span className="trend-sub">this week</span>
                                </div>
                            </div>
                            <StatCardBackground src="/images/Imasha/Admin/stats_2.png" alt="Users Bg" />
                        </div>

                        {/* Card 3: Active Patients */}
                        <div className="admin-stat-card card-patients">
                            <div className="card-bg-glow" />
                            <div className="card-top-row">
                                <div className="card-icon-wrap"><Heart size={18} /></div>
                                <span className="card-status-pill">Monitored</span>
                            </div>
                            <div className="card-middle">
                                <p className="card-value">{dashboardStats.loading ? '...' : dashboardStats.totalPatients}</p>
                                <h3 className="card-label">ACTIVE PATIENTS</h3>
                            </div>
                            <div className="card-bottom">
                                <div className="card-trend">
                                    <span className="trend-val">↑ +3 Today</span>
                                    <span className="trend-sub">under monitoring</span>
                                </div>
                            </div>
                            <StatCardBackground src="/images/Imasha/Admin/stats_3.png" alt="Patients Bg" />
                        </div>

                        {/* Card 4: System Health */}
                        <div className="admin-stat-card card-health">
                            <div className="card-bg-glow" />
                            <div className="card-top-row">
                                <div className="card-icon-wrap"><ShieldCheck size={18} /></div>
                                <span className="card-status-pill">Secured</span>
                            </div>
                            <div className="card-middle">
                                <p className="card-value">99.8%</p>
                                <h3 className="card-label">SYSTEM HEALTH</h3>
                            </div>
                            <div className="card-bottom">
                                <div className="card-trend">
                                    <span className="trend-val">↑ Optimal</span>
                                    <span className="trend-sub">overall uptime</span>
                                </div>
                            </div>
                            <StatCardBackground src="/images/Imasha/Admin/stats_4.png" alt="Health Bg" />
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
                            {tabTitles[activeTab] || 'Overview'}
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
