/* eslint-disable no-unused-vars */
import {
    useState, useRef, useEffect, useCallback, useMemo, memo
} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Phone, MapPin, Calendar,
    Camera, LogOut, Save, Bell, Activity,
    ClipboardList, Settings, ChevronRight,
    Loader2, ShieldCheck, CheckCircle2,
    TrendingUp, Zap, Star, Clock, Heart, Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/Imasha/AuthContext';
import { useTheme } from '../../context/Tharuka/ThemeContext';
import Header from '../../components/Tharuka/Header/Header';
import Footer from '../../components/Tharuka/Footer/Footer';
import BackgroundEffect from '../../components/Tharuka/Common/BackgroundEffect';
import toast from 'react-hot-toast';
import PatientAlertsTab from '../Tharindu/PatientAlertsTab';
import ModernDatePicker from '../../components/Imasha/ModernDatePicker';
import PatientAppointmentsTab from '../Tharindu/PatientAppointmentsTab';
import './ProfilePage.css';

/* ── Static data ────────────────────────────────────────── */
const TABS = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'appointments', label: 'Appointments', icon: ClipboardList },
    { id: 'health', label: 'Health Data', icon: Activity },
    { id: 'alerts', label: 'Alerts', icon: Bell },
];

/* ── Animation presets ──────────────────────────────────── */
const FADE_UP = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1, y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 24 }
    },
};

const STAGGER = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.06, delayChildren: 0.04 }
    },
};

const CARD_HOVER = { y: -4, scale: 1.015 };
const CARD_TAP = { scale: 0.98 };

/* ── Memoised form field ────────────────────────────────── */
const ProfileField = memo(({
    label, icon: Icon, name, value, onChange,
    placeholder, type = 'text', fullWidth = false,
    disabled = false, options = []
}) => (
    <motion.div
        variants={FADE_UP}
        className={`ims-profile__input-container${fullWidth ? ' full' : ''}`}
        style={{ position: 'relative', zIndex: type === 'date' ? 50 : 1 }}
    >
        <label><Icon size={13} />{label}</label>
        <div className="ims-profile__input-wrapper">
            <Icon size={15} className="ims-profile__input-icon" />
            {type === 'select' ? (
                <select name={name} value={value} onChange={onChange} disabled={disabled}>
                    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            ) : type === 'date' ? (
                <ModernDatePicker
                    name={name}
                    value={value}
                    onChange={onChange}
                    placement="top"
                    customTrigger={({ displayValue, isOpen, setIsOpen }) => (
                        <input
                            type="text"
                            name={name}
                            value={displayValue}
                            onChange={() => { }}
                            placeholder={placeholder || 'mm/dd/yyyy'}
                            readOnly
                            onClick={() => !disabled && setIsOpen(!isOpen)}
                            style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
                            disabled={disabled}
                        />
                    )}
                />
            ) : (
                <input
                    type={type} name={name} value={value}
                    onChange={onChange} placeholder={placeholder}
                    disabled={disabled}
                />
            )}
        </div>
    </motion.div>
));
ProfileField.displayName = 'ProfileField';

/* ── Memoised stat card ─────────────────────────────────── */
const StatCard = memo(({ icon: Icon, iconClass, value, label, trend, trendClass, barColor, loading = false }) => (
    <motion.div
        variants={FADE_UP}
        whileHover={CARD_HOVER}
        transition={{ type: 'spring', stiffness: 320, damping: 20 }}
        className="ims-profile__stat-card"
    >
        <div className={`ims-profile__stat-icon ${iconClass}`}>
            <Icon size={17} />
        </div>
        {loading ? (
            <>
                <div className="ims-profile__stat-skeleton ims-profile__stat-skeleton--value" />
                <div className="ims-profile__stat-skeleton ims-profile__stat-skeleton--label" />
            </>
        ) : (
            <>
                <div className="ims-profile__stat-value">{value}</div>
                <div className="ims-profile__stat-label">{label}</div>
                {trend && <div className={`ims-profile__stat-trend ${trendClass}`}>{trend}</div>}
            </>
        )}
        <div
            className="ims-profile__stat-bar"
            style={{ background: `linear-gradient(90deg, ${barColor}, transparent)` }}
        />
    </motion.div>
));
StatCard.displayName = 'StatCard';

/* ── Custom hook: fetch real Stats ─────────────────────── */
function useProfileStats(user, token, refreshTrigger) {
    const [stats, setStats] = useState({
        appointments: null,   // total appointment count for this user
        healthRecords: null,  // total health entries
        avgOxygen: null,      // average oxygen level (0-100)
        loading: true,
    });

    useEffect(() => {
        if (!user || !token) return;
        const userId = user?.id || user?._id;
        const userEmail = user?.email;
        let cancelled = false;

        const headers = { Authorization: `Bearer ${token}` };

        Promise.all([
            // 1. All appointments — filter by this user's email client-side
            fetch(`${import.meta.env.VITE_API_URL}/appointments`, { headers })
                .then(r => r.ok ? r.json() : [])
                .catch(() => []),

            // 2. Health records for this user
            fetch(`${import.meta.env.VITE_API_URL}/health-data/${userId}`, { headers })
                .then(r => r.ok ? r.json() : { data: [] })
                .catch(() => ({ data: [] })),

            // 3. Caregiver bookings for this user
            fetch('http://localhost:5000/api/tharindu/bookings/my-bookings', { headers })
                .then(r => r.ok ? r.json() : { data: [] })
                .catch(() => ({ data: [] }))
        ])
            .then(([appts, healthRes, caregiverRes]) => {
                if (cancelled) return;

                // Filter appointments to this user by email
                const userId = user?.id || user?._id;
                const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim().toLowerCase();
                const myAppts = Array.isArray(appts)
                    ? appts.filter((a) => {
                        const byUserId = userId && (a.patientUserId === userId || a.patientUserId?._id === userId);
                        const byEmail = a.patientEmail && a.patientEmail.toLowerCase() === (userEmail || '').toLowerCase();
                        const byName = a.patientName && a.patientName.toLowerCase() === fullName;
                        return byUserId || byEmail || byName;
                    })
                    : [];

                const caregiverApptsCount = Array.isArray(caregiverRes?.data) ? caregiverRes.data.length : 0;
                const totalApptsCount = myAppts.length + caregiverApptsCount;

                // Health records
                const records = Array.isArray(healthRes?.data) ? healthRes.data : [];

                // Average oxygen level from records that have it
                const oxygenRecords = records.filter(r => r.oxygenLevel != null);
                const avgOxygen = oxygenRecords.length > 0
                    ? Math.round(
                        oxygenRecords.reduce((sum, r) => sum + r.oxygenLevel, 0)
                        / oxygenRecords.length
                    )
                    : null;

                setStats({
                    appointments: totalApptsCount,
                    healthRecords: records.length,
                    avgOxygen,
                    loading: false,
                });
            })
            .catch(() => {
                if (!cancelled) setStats(s => ({ ...s, loading: false }));
            });

        return () => { cancelled = true; };
    }, [user, token, refreshTrigger]);

    return stats;
}

/* ── Main Component ─────────────────────────────────────── */
export default function ProfilePage() {
    const { user, token, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const [activeTab, setActiveTab] = useState('settings');
    const [isUpdating, setIsUpdating] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const triggerStatsRefresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    // Real stats from APIs
    const profileStats = useProfileStats(user, token, refreshTrigger);

    const [formData, setFormData] = useState({
        firstName: '', lastName: '', phone: '',
        address: '', dateOfBirth: '', gender: '',
    });
    const [recentAppointments, setRecentAppointments] = useState([]);
    const [appointmentsLoading, setAppointmentsLoading] = useState(false);

    const fileInputRef = useRef(null);

    const loadRecentAppointments = useCallback(async () => {
        if (!token || !user?.email) return;
        setAppointmentsLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/appointments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || 'Failed to fetch appointments');

            const list = Array.isArray(data) ? data : [];
            const userId = user?.id || user?._id;
            const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim().toLowerCase();
            const mine = list
                .filter((a) => {
                    const byUserId = userId && (a.patientUserId === userId || a.patientUserId?._id === userId);
                    const byEmail = (a.patientEmail || '').toLowerCase() === user.email.toLowerCase();
                    const byName = (a.patientName || '').toLowerCase() === fullName;
                    return byUserId || byEmail || byName;
                })
                .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            setRecentAppointments(mine);
        } catch {
            setRecentAppointments([]);
        } finally {
            setAppointmentsLoading(false);
        }
    }, [token, user?.email]);

    // Sync user → form once
    useEffect(() => {
        if (!user) return;
        setFormData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            phone: user.phone || '',
            address: user.address || '',
            dateOfBirth: user.dateOfBirth
                ? new Date(user.dateOfBirth).toISOString().split('T')[0]
                : '',
            gender: user.gender || '',
        });
    }, [user]);
 
    useEffect(() => {
        if (activeTab === 'appointments') {
            loadRecentAppointments();
        }
    }, [activeTab, loadRecentAppointments]);

    // profile completeness score
    const profileScore = useMemo(() => {
        const fields = [
            formData.firstName, formData.lastName, formData.phone,
            formData.address, formData.dateOfBirth, formData.gender,
            user?.email,
        ];
        const filled = fields.filter(Boolean).length;
        return Math.round((filled / fields.length) * 100);
    }, [formData, user]);

    // account age in days
    const accountDays = useMemo(() => {
        if (!user?.createdAt) return 1;
        const ms = Date.now() - new Date(user.createdAt).getTime();
        return Math.max(1, Math.floor(ms / 86400000));
    }, [user]);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const userId = user?.id || user?._id;
            const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Profile updated!');
                if (updateUser) updateUser(formData);
            } else {
                toast.error(data.message || 'Update failed');
            }
        } catch {
            toast.error('Network error — try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { toast.error('Max 5 MB'); return; }
        setImageLoading(true);
        const body = new FormData();
        body.append('profileImage', file);
        try {
            const userId = user?.id || user?._id;
            const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${userId}/profile-image`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
                body,
            });
            if (res.ok) {
                const d = await res.json();
                toast.success('Photo updated!');
                if (updateUser && d.user) updateUser(d.user);
                else if (updateUser && d.profileImage) updateUser({ profileImage: d.profileImage });
            } else {
                const d = await res.json();
                toast.error(d.message || 'Upload failed');
            }
        } catch { toast.error('Upload failed'); }
        finally { setImageLoading(false); }
    };

    const handleDeleteAppointment = async (appointmentId) => {
        const ok = window.confirm('Do you want to delete this appointment?');
        if (!ok) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/appointments/${appointmentId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || 'Failed to delete appointment');
            toast.success('Appointment deleted');
            loadRecentAppointments();
        } catch (error) {
            toast.error(error.message || 'Failed to delete appointment');
        }
    };

    const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'User';
    const ActiveIcon = TABS.find(t => t.id === activeTab)?.icon ?? Settings;

    /* ── Tab content ─────────────────────────────────────── */
    const renderTabContent = () => {
        if (activeTab === 'settings') {
            return (
                <motion.div
                    key="settings"
                    variants={STAGGER}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, y: -10 }}
                    className="ims-profile__settings"
                >
                    <div>
                        <h3 className="ims-profile__form-section-title">
                            <User size={12} />Personal Information
                        </h3>
                        <form onSubmit={handleUpdateProfile} className="ims-profile__form">
                            <div className="ims-profile__form-grid">
                                <ProfileField
                                    label="First Name" icon={User}
                                    name="firstName" value={formData.firstName}
                                    onChange={handleInputChange} placeholder="e.g. John"
                                />
                                <ProfileField
                                    label="Last Name" icon={User}
                                    name="lastName" value={formData.lastName}
                                    onChange={handleInputChange} placeholder="e.g. Doe"
                                />
                                <ProfileField
                                    label="Phone Number" icon={Phone}
                                    name="phone" value={formData.phone}
                                    onChange={handleInputChange} placeholder="+1 555 000 0000"
                                />
                                <ProfileField
                                    label="Date of Birth" icon={Calendar}
                                    name="dateOfBirth" type="date"
                                    value={formData.dateOfBirth}
                                    onChange={handleInputChange}
                                />
                                <ProfileField
                                    label="Gender" icon={ShieldCheck}
                                    name="gender" type="select"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    options={[
                                        { value: '', label: 'Select gender' },
                                        { value: 'male', label: 'Male' },
                                        { value: 'female', label: 'Female' },
                                        { value: 'other', label: 'Other / Prefer not to say' },
                                    ]}
                                />
                                <ProfileField
                                    label="Registered Email" icon={Mail}
                                    value={user?.email || ''}
                                    disabled placeholder="Email"
                                />
                                <ProfileField
                                    label="Address" icon={MapPin}
                                    name="address" value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="Street, City, Country"
                                    fullWidth
                                />
                            </div>
                            <div className="ims-profile__form-footer">
                                <motion.button
                                    whileHover={{ scale: 1.04, y: -3 }}
                                    whileTap={{ scale: 0.97 }}
                                    type="submit"
                                    className="ims-profile__save-btn"
                                    disabled={isUpdating}
                                >
                                    {isUpdating
                                        ? <><Loader2 className="spin" size={16} /><span>Saving…</span></>
                                        : <><Save size={16} /><span>Save Changes</span></>
                                    }
                                </motion.button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            );
        }

        if (activeTab === 'appointments') {
            return (
                <motion.div
                    key="appointments"
                    variants={STAGGER}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, y: -10 }}
                    className="ims-profile__settings"
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h3 className="ims-profile__form-section-title" style={{ margin: 0 }}>
                            <ClipboardList size={12} />Appointments & Bookings
                        </h3>
                        <Link to="/Appointment" className="ims-profile__save-btn" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 'auto', padding: '0 14px', height: 36, fontSize: '13px' }}>
                            View All History
                        </Link>
                    </div>

                    <div className="ims-profile__appointments-layout" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        {/* Caregiver Bookings Section (Integrated) */}
                        <div className="ims-profile__section">
                            <h4 style={{ fontSize: '14px', marginBottom: '15px', color: 'var(--p-cyan)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Sparkles size={14} /> Caregiver Services
                            </h4>
                            <PatientAppointmentsTab onBookingSuccess={triggerStatsRefresh} />
                        </div>

                        <div className="ims-profile__divider" style={{ margin: '10px 0' }} />

                        {/* Recent Doctor Appointments List */}
                        <div className="ims-profile__section">
                            <h4 style={{ fontSize: '14px', marginBottom: '15px', opacity: 0.8 }}>Recent Doctor Appointments</h4>
                            {appointmentsLoading ? (
                                <div className="ims-profile__placeholder-content">
                                    <p>Loading appointments...</p>
                                </div>
                            ) : recentAppointments.length === 0 ? (
                                <div className="ims-profile__placeholder-content">
                                    <p>No recent doctor appointments found.</p>
                                </div>
                            ) : (
                                <div className="ims-profile__form-grid">
                                    {recentAppointments.slice(0, 4).map((apt) => (
                                        <div key={apt._id} className="ims-profile__appointment-card full">
                                            <div className="ims-profile__appointment-left">
                                                <img
                                                    src={apt.avatar || '/images/Priya/doctor-01.png'}
                                                    alt={apt.doctor || 'Doctor'}
                                                    className="ims-profile__appointment-avatar"
                                                />
                                                <div>
                                                    <label>{apt.doctor || 'Doctor'}</label>
                                                    <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{apt.date || '-'} at {apt.time || '-'}</div>
                                                    <div className={`ims-profile__status-tag ${apt.status?.toLowerCase() || 'pending'}`}>
                                                        {apt.status || 'Scheduled'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="ims-profile__appointment-actions">
                                                <button type="button" onClick={() => navigate('/Appointment')}>Manage</button>
                                                <button type="button" className="cancel-btn" onClick={() => handleDeleteAppointment(apt._id)}>Cancel</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            );
        }

        if (activeTab === 'alerts') {
            return (
                <motion.div
                    key="alerts"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="ims-profile__settings"
                >
                    <PatientAlertsTab />
                </motion.div>
            );
        }

        return (
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="ims-profile__placeholder"
            >
                <div className="ims-profile__placeholder-content">
                    <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="ims-profile__placeholder-icon"
                    >
                        <ActiveIcon size={36} />
                    </motion.div>
                    <h3>Coming in Phase 2</h3>
                    <p>
                        A premium <strong>{TABS.find(t => t.id === activeTab)?.label}</strong> experience
                        is being built. It'll be unlocked in the next release.
                    </p>
                    <div className="ims-profile__dev-badge">Phase 2 · In Development</div>
                </div>
            </motion.div>
        );
    };

                    return (
                    <AnimatePresence>
                        <BackgroundEffect />
                        <Header />

                        <motion.main
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.35 }}
                            className="ims-profile-page"
                        >
                            {/* Floating ambient orbs — GPU composited, 0 layout cost */}
                            <div className="ims-profile__orb ims-profile__orb--1" aria-hidden="true" />
                            <div className="ims-profile__orb ims-profile__orb--2" aria-hidden="true" />
                            <div className="ims-profile__orb ims-profile__orb--3" aria-hidden="true" />

                            <div className="container">
                                <div className="ims-profile__layout">

                                    {/* ── Sidebar ──────────────────────────────────── */}
                                    <motion.aside
                                        initial={{ x: -36, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ duration: 0.42, ease: [0.4, 0, 0.2, 1] }}
                                        className="ims-profile__sidebar"
                                    >
                                        {/* Avatar */}
                                        <div className="ims-profile__avatar-container">
                                            <div
                                                className="ims-profile__avatar-ring"
                                                onClick={() => fileInputRef.current?.click()}
                                                title="Change photo"
                                            >
                                                <div className="ims-profile__avatar-wrap">
                                                    {user?.profileImage
                                                        ? <img src={user.profileImage} alt={displayName} className="ims-profile__avatar" />
                                                        : <div className="ims-profile__avatar-placeholder"><User size={32} /></div>
                                                    }
                                                    {imageLoading
                                                        ? <div className="ims-profile__avatar-loader"><Loader2 className="spin" size={22} /></div>
                                                        : <div className="ims-profile__avatar-overlay"><Camera size={18} /><span>Change</span></div>
                                                    }
                                                </div>
                                            </div>

                                            <div className="ims-profile__user-info">
                                                <h2 className="ims-profile__user-name">{displayName}</h2>
                                                <p className="ims-profile__user-email">{user?.email}</p>
                                                {user?.role && (
                                                    <div className="ims-profile__role-badge">
                                                        <CheckCircle2 size={9} />{user.role}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" hidden />

                                        {/* Mini stats */}
                                        <div className="ims-profile__mini-stats">
                                            <div className="ims-profile__mini-stat">
                                                <div className="ims-profile__mini-stat-value">{profileScore}%</div>
                                                <div className="ims-profile__mini-stat-label">Profile</div>
                                            </div>
                                            <div className="ims-profile__mini-stat">
                                                <div className="ims-profile__mini-stat-value">{accountDays}</div>
                                                <div className="ims-profile__mini-stat-label">Days Active</div>
                                            </div>
                                        </div>

                                        <div className="ims-profile__divider" />

                                        {/* Nav */}
                                        <nav className="ims-profile__nav">
                                            {TABS.map(({ id, label, icon: Icon }) => (
                                                <button
                                                    key={id}
                                                    className={`ims-profile__nav-item${activeTab === id ? ' active' : ''}`}
                                                    onClick={() => setActiveTab(id)}
                                                >
                                                    <Icon size={17} />
                                                    <span>{label}</span>
                                                    <ChevronRight size={13} className="nav-arrow" />
                                                </button>
                                            ))}
                                            <button className="ims-profile__nav-item logout" onClick={logout}>
                                                <LogOut size={17} />
                                                <span>Sign Out</span>
                                            </button>
                                        </nav>

                                        <div className="ims-profile__divider" />

                                        {/* Branding */}
                                        <div className="ims-profile__branding">
                                            <div className="ims-profile__logo">
                                                <div className="ims-profile__logo-dot">P</div>
                                                <span className="ims-profile__logo-text">PulseNova</span>
                                            </div>
                                            <span className="ims-profile__version">Enterprise v2.5</span>
                                        </div>
                                    </motion.aside>

                                    {/* ── Main Content ──────────────────────────── */}
                                    <section className="ims-profile__content">

                                        {/* Hero banner */}
                                        <motion.div
                                            initial={{ opacity: 0, y: -14 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.4, delay: 0.08 }}
                                            className="ims-profile__hero"
                                        >
                                            <img
                                                src="/profile_hero_art.png"
                                                alt="Profile hero"
                                                className="ims-profile__hero-img"
                                                loading="eager"
                                                decoding="async"
                                            />
                                            <div className="ims-profile__hero-overlay">
                                                <div className="ims-profile__hero-text">
                                                    <h2>Welcome back, {user?.firstName || 'User'} <Sparkles size={22} color="var(--p-green)" style={{ display: 'inline', marginLeft: '4px', verticalAlign: '-3px' }} /></h2>
                                                    <p>Manage your health journey from one place</p>
                                                    <div className="ims-profile__hero-badge">
                                                        <span className="pulse-dot" />
                                                        PulseNova Active
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* Quick stats row */}
                                        <motion.div
                                            variants={STAGGER}
                                            initial="hidden"
                                            animate="visible"
                                            className="ims-profile__stats-row"
                                        >
                                            <StatCard
                                                icon={TrendingUp}
                                                iconClass="ims-profile__stat-icon--green"
                                                value={`${profileScore}%`}
                                                label="Profile Complete"
                                                trend={profileScore >= 80 ? '↑ Great' : profileScore >= 50 ? '↑ Good' : '⬤ Fill in'}
                                                trendClass={profileScore >= 80 ? 'ims-profile__stat-trend--up' : 'ims-profile__stat-trend--stable'}
                                                barColor="var(--p-green)"
                                                loading={false}
                                            />
                                            <StatCard
                                                icon={Zap}
                                                iconClass="ims-profile__stat-icon--cyan"
                                                value={accountDays}
                                                label="Days Active"
                                                trend="↑ Streak"
                                                trendClass="ims-profile__stat-trend--stable"
                                                barColor="var(--p-cyan)"
                                                loading={false}
                                            />
                                            <StatCard
                                                icon={Heart}
                                                iconClass="ims-profile__stat-icon--amber"
                                                value={
                                                    profileStats.loading ? '—'
                                                        : profileStats.avgOxygen != null ? `${profileStats.avgOxygen}%`
                                                            : 'N/A'
                                                }
                                                label="Avg O₂ Level"
                                                trend={
                                                    !profileStats.loading && profileStats.avgOxygen != null
                                                        ? profileStats.avgOxygen >= 95 ? '↑ Normal'
                                                            : profileStats.avgOxygen >= 90 ? '⚠ Low'
                                                                : '↓ Critical'
                                                        : null
                                                }
                                                trendClass={
                                                    !profileStats.loading && profileStats.avgOxygen != null
                                                        ? profileStats.avgOxygen >= 95
                                                            ? 'ims-profile__stat-trend--up'
                                                            : 'ims-profile__stat-trend--stable'
                                                        : ''
                                                }
                                                barColor="#f59e0b"
                                                loading={profileStats.loading}
                                            />
                                            <StatCard
                                                icon={ClipboardList}
                                                iconClass="ims-profile__stat-icon--purple"
                                                value={
                                                    profileStats.loading ? '—'
                                                        : profileStats.appointments != null ? profileStats.appointments
                                                            : 0
                                                }
                                                label="Appointments"
                                                trend={
                                                    !profileStats.loading && profileStats.appointments != null
                                                        ? `${profileStats.appointments} total`
                                                        : null
                                                }
                                                trendClass="ims-profile__stat-trend--stable"
                                                barColor="#8b5cf6"
                                                loading={profileStats.loading}
                                            />
                                        </motion.div>

                                        {/* Tab header */}
                                        <motion.div
                                            initial={{ opacity: 0, y: -12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.38, delay: 0.15 }}
                                            className="ims-profile__header"
                                        >
                                            <div className="ims-profile__header-left">
                                                <div className="ims-profile__header-icon">
                                                    <ActiveIcon size={19} />
                                                </div>
                                                <div className="ims-profile__header-text">
                                                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        {TABS.find(t => t.id === activeTab)?.label}
                                                        {activeTab === 'appointments' && !profileStats.loading && (
                                                            <span className="ims-profile__header-count">
                                                                {profileStats.appointments}
                                                            </span>
                                                        )}
                                                    </h1>
                                                    <p>Manage your PulseNova profile &amp; preferences</p>
                                                </div>
                                            </div>
                                            <div className="ims-profile__header-right">
                                                <div className="ims-profile__header-badge">
                                                    <span className="pulse-dot" />
                                                    Active Session
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* Tab body */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 14 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.38, delay: 0.2 }}
                                            className="ims-profile__body"
                                        >
                                            <AnimatePresence mode="wait">
                                                {renderTabContent()}
                                            </AnimatePresence>
                                        </motion.div>

                                    </section>
                                </div>
                            </div>
                        </motion.main>

                        <Footer />
                    </AnimatePresence>
                    );
}
