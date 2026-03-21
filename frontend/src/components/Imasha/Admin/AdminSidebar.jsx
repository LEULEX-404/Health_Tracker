import React from 'react';
import {
    LayoutDashboard,
    Users,
    UserPlus,
    Stethoscope,
    HeartHandshake,
    FileText,
    Calendar,
    Bell,
    Settings,
    ChevronLeft,
    ChevronRight,
    Sun,
    Moon
} from 'lucide-react';
import Logo from '../../Tharuka/Common/Logo';

const AdminSidebar = ({ activeTab, setActiveTab, isOpen, toggleSidebar, theme, toggleTheme }) => {

    const menuItems = [
        { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { id: 'patients', label: 'Patients', icon: <Users size={20} /> },
        { id: 'doctors', label: 'Doctors', icon: <Stethoscope size={20} /> },
        { id: 'caregivers', label: 'Caregivers', icon: <HeartHandshake size={20} /> },
        { id: 'reports', label: 'Reports', icon: <FileText size={20} /> },
        { id: 'appointments', label: 'Appointments', icon: <Calendar size={20} /> },
        { id: 'alerts', label: 'Alerts', icon: <Bell size={20} /> },
    ];

    return (
        <aside className={`admin-sidebar ${isOpen ? 'open' : 'collapsed'}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <Logo />
                </div>
                <button className="sidebar-toggle" onClick={toggleSidebar}>
                    {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </button>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(item.id)}
                        title={!isOpen ? item.label : ''}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        {isOpen && <span className="nav-label">{item.label}</span>}
                    </button>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button className="theme-toggle-btn" onClick={toggleTheme}>
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    {isOpen && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
                </button>

                <button className="nav-item settings-btn">
                    <span className="nav-icon"><Settings size={20} /></span>
                    {isOpen && <span className="nav-label">Settings</span>}
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
