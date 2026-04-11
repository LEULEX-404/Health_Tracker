/* eslint-disable no-unused-vars */
import {
    useState, useRef, useEffect, useCallback, useMemo, memo
} from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Phone, MapPin, Calendar,
    Camera, LogOut, Save, Bell, Activity,
    ClipboardList, Settings, ChevronRight,
    Loader2, ShieldCheck, CheckCircle2,
    TrendingUp, Zap, Star, Clock, Heart, Sparkles,
    IdCard, Briefcase, Globe, Home, BriefcaseIcon, PhoneCall, X
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
import PatientHealthTab from '../Tharuka/PatientHealthTab';
import './ProfilePage.css';

/* ── Static data ────────────────────────────────────────── */
const TABS = [
    { id: 'settings',     label: 'Settings',      icon: Settings },
    { id: 'appointments', label: 'Appointments',  icon: ClipboardList },
    { id: 'health',       label: 'Health Data',   icon: Activity },
    { id: 'alerts',       label: 'Alerts',        icon: Bell },
];

const HEALTH_CONDITIONS = [
    'diabetes', 'hypertension', 'obesity', 'heart_disease',
    'kidney_disease', 'celiac', 'lactose_intolerant',
    'high_cholesterol', 'anemia', 'osteoporosis', 'other',
];

/* ── Animation presets ──────────────────────────────────── */
const FADE_UP = {
    hidden:  { opacity: 0, y: 16 },
    visible: {
        opacity: 1, y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 24 }
    },
};

const STAGGER = {
    hidden:  { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.06, delayChildren: 0.04 }
    },
};

const CARD_HOVER = { y: -4, scale: 1.015 };
const CARD_TAP   = { scale: 0.98 };

/* ── Premium Gender Selector ────────────────────────────── */
const GenderSelector = ({ name, value, onChange, options, disabled }) => {
    return (
        <div className="ims-profile__gender-selector">
            {options.filter(o => o.value !== '').map(option => {
                const isSelected = value === option.value;
                return (
                    <motion.button
                        key={option.value}
                        type="button"
                        onClick={() => !disabled && onChange({ target: { name, value: option.value } })}
                        className={`ims-profile__gender-chip ${isSelected ? 'active' : ''}`}
                        whileHover={!disabled ? { y: -2, backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'rgba(0,0,0,0.03)' } : {}}
                        whileTap={!disabled ? { scale: 0.97 } : {}}
                        disabled={disabled}
                    >
                        {isSelected && (
                            <motion.div 
                                layoutId="gender-focus"
                                className="ims-profile__gender-indicator"
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="ims-profile__gender-text">{option.label}</span>
                    </motion.button>
                );
            })}
        </div>
    );
};

/* ── Memoised form field ────────────────────────────────── */
const ProfileField = memo(({
    label, icon: Icon, name, value, onChange,
    placeholder, type = 'text', fullWidth = false,
    disabled = false, options = [], placement = 'bottom'
}) => (
    <motion.div
        variants={FADE_UP}
        className={`ims-profile__input-container${fullWidth ? ' full' : ''} type-${type}`}
        data-field={name}
        style={{ position: 'relative', zIndex: type === 'date' ? 50 : 1 }}
    >
        <label><Icon size={13} />{label}</label>
        
        {type === 'gender' ? (
            <GenderSelector 
                name={name} 
                value={value} 
                onChange={onChange} 
                options={options} 
                disabled={disabled} 
            />
        ) : (
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
                        placement={placement}
                        customTrigger={({ displayValue, isOpen, setIsOpen }) => (
                            <input
                                type="text"
                                name={name}
                                value={displayValue}
                                onChange={() => {}}
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
        )}
    </motion.div>
));
ProfileField.displayName = 'ProfileField';

const StatCard = memo(({ icon: Icon, iconClass, value, unit, label, trend, trendClass, barColor, bgImage, overlayColor, loading = false }) => {
    // Determine progress fill width based on value
    const progressWidth = useMemo(() => {
        if (loading) return 0;
        const val = parseFloat(value);
        if (isNaN(val)) return 70; // fallback aesthetic width
        if (label?.toLowerCase().includes('complete') || label?.toLowerCase().includes('oxygen')) {
             return Math.min(Math.max(val, 5), 100);
        }
        return 75; // aesthetic width for counts
    }, [value, label, loading]);

    return (
        <motion.div
            variants={FADE_UP}
            whileHover={CARD_HOVER}
            transition={{ type: 'spring', stiffness: 320, damping: 20 }}
            className="ims-profile__stat-card"
        >
            {bgImage && (
                <div className="ims-profile__stat-bg" style={{ backgroundImage: `url(${bgImage})` }} />
            )}
            <div className="ims-profile__stat-overlay" style={{ background: overlayColor }} />

            <div className="ims-profile__stat-content">
                <div className="ims-profile__stat-top">
                    <div className="ims-profile__stat-icon-wrap">
                        <Icon size={18} />
                    </div>
                    {trend && !loading && (
                        <div className={`ims-profile__stat-status-badge ${trendClass}`}>
                            {trend}
                        </div>
                    )}
                </div>

                <div className="ims-profile__stat-main">
                    {loading ? (
                        <div className="ims-profile__stat-skeleton" />
                    ) : (
                        <div className="ims-profile__stat-value-group">
                            <span className="ims-profile__stat-value">{value}</span>
                            {unit && <span className="ims-profile__stat-unit">{unit}</span>}
                        </div>
                    )}
                    <div className="ims-profile__stat-name">{label}</div>
                    
                    <div className="ims-profile__stat-progress">
                        <div 
                            className="ims-profile__stat-progress-fill" 
                            style={{ 
                                width: `${progressWidth}%`,
                                background: barColor 
                            }} 
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
});
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
        const userId    = user?.id || user?._id;
        const userEmail = user?.email;
        let cancelled   = false;

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
            fetch(`${import.meta.env.VITE_API_URL}/tharindu/bookings/my-bookings`, { headers })
                .then(r => r.ok ? r.json() : { data: [] })
                .catch(() => ({ data: [] }))
        ])
        .then(([appts, healthRes, caregiverRes]) => {
            if (cancelled) return;

            // Filter appointments to this user by email
            const userId   = user?.id || user?._id;
            const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim().toLowerCase();
            const myAppts  = Array.isArray(appts)
                ? appts.filter((a) => {
                    const byUserId = userId && (a.patientUserId === userId || a.patientUserId?._id === userId);
                    const byEmail  = a.patientEmail && a.patientEmail.toLowerCase() === (userEmail || '').toLowerCase();
                    const byName   = a.patientName && a.patientName.toLowerCase() === fullName;
                    return byUserId || byEmail || byName;
                  })
                : [];

            const caregiverApptsCount = Array.isArray(caregiverRes?.data) ? caregiverRes.data.length : 0;
            const totalApptsCount     = myAppts.length + caregiverApptsCount;

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
                appointments:  totalApptsCount,
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
    const [activeTab, setActiveTab]           = useState('settings');
    const [isUpdating, setIsUpdating]         = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [updateSection, setUpdateSection] = useState('personal');
    const [imageLoading, setImageLoading]     = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const triggerStatsRefresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    // Real stats from APIs
    const profileStats = useProfileStats(user, token, refreshTrigger);

    const [formData, setFormData] = useState({
        firstName: '', lastName: '', phone: '',
        address: '', dateOfBirth: '', gender: '',
        city: '', country: '', occupation: '',
        emergencyContactName: '', emergencyContactPhone: '', emergencyContactEmail: '',
        healthConditions: [],
    });
    const [recentAppointments, setRecentAppointments]     = useState([]);
    const [appointmentsLoading, setAppointmentsLoading]   = useState(false);

    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!isUpdateModalOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [isUpdateModalOpen]);

    const loadRecentAppointments = useCallback(async () => {
        if (!token || !user?.email) return;
        setAppointmentsLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/appointments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || 'Failed to fetch appointments');

            const list     = Array.isArray(data) ? data : [];
            const userId   = user?.id || user?._id;
            const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim().toLowerCase();
            const mine = list
                .filter((a) => {
                    const byUserId = userId && (a.patientUserId === userId || a.patientUserId?._id === userId);
                    const byEmail  = (a.patientEmail || '').toLowerCase() === user.email.toLowerCase();
                    const byName   = (a.patientName  || '').toLowerCase() === fullName;
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
            firstName:   user.firstName   || '',
            lastName:    user.lastName    || '',
            phone:       user.phone       || '',
            address:     user.address     || '',
            dateOfBirth: user.dateOfBirth
                ? new Date(user.dateOfBirth).toISOString().split('T')[0]
                : '',
            gender:      user.gender      || '',
            city:        user.city        || '',
            country:     user.country     || '',
            occupation:  user.occupation  || '',
            emergencyContactName: user.emergencyContactName || '',
            emergencyContactPhone: user.emergencyContactPhone || '',
            emergencyContactEmail: user.emergencyContactEmail || '',
            healthConditions: Array.isArray(user.healthConditions) ? user.healthConditions : [],
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
            formData.city, formData.country, formData.occupation,
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

    const toggleHealthCondition = useCallback((condition) => {
        setFormData((prev) => {
            const current = Array.isArray(prev.healthConditions) ? prev.healthConditions : [];
            return {
                ...prev,
                healthConditions: current.includes(condition)
                    ? current.filter((c) => c !== condition)
                    : [...current, condition],
            };
        });
    }, []);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const userId = user?.id || user?._id;
            const res    = await fetch(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Profile updated successfully!');
                if (updateUser) updateUser(data.data);
                setIsUpdateModalOpen(false);
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

                if (updateUser && d.user) {
                    updateUser(d.user);
                } else if (updateUser && d.data?.profileImage) {
                    updateUser({ profileImage: d.data.profileImage });
                } else if (updateUser && d.profileImage) {
                    updateUser({ profileImage: d.profileImage });
                }

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
    const ActiveIcon  = TABS.find(t => t.id === activeTab)?.icon ?? Settings;

    const renderModalSectionContent = () => {
        if (updateSection === 'personal') {
            return (
                <div className="ims-profile__form-grid">
                    <ProfileField label="First Name" icon={User} name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="First name" />
                    <ProfileField label="Last Name" icon={User} name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Last name" />
                    <ProfileField label="Phone Number" icon={Phone} name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone number" />
                    <ProfileField label="Date of Birth" icon={Calendar} name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleInputChange} placement="top" />
                    <ProfileField
                        label="Gender" icon={ShieldCheck} name="gender" type="gender"
                        value={formData.gender} onChange={handleInputChange}
                        options={[
                            { value: 'male', label: 'Male' },
                            { value: 'female', label: 'Female' },
                            { value: 'other', label: 'Other / Prefer not to say' },
                        ]}
                    />
                </div>
            );
        }

        if (updateSection === 'location') {
            return (
                <div className="ims-profile__form-grid">
                    <ProfileField label="Address" icon={Home} name="address" value={formData.address} onChange={handleInputChange} placeholder="Street address" />
                    <ProfileField label="City" icon={MapPin} name="city" value={formData.city} onChange={handleInputChange} placeholder="City" />
                    <ProfileField label="Country" icon={Globe} name="country" value={formData.country} onChange={handleInputChange} placeholder="Country" />
                    <ProfileField label="Occupation" icon={BriefcaseIcon} name="occupation" value={formData.occupation} onChange={handleInputChange} placeholder="Occupation" />
                </div>
            );
        }

        if (updateSection === 'health') {
            return (
                <div className="ims-profile__conditions-group">
                    {HEALTH_CONDITIONS.map((condition) => {
                        const active = formData.healthConditions?.includes(condition);
                        return (
                            <button
                                key={condition}
                                type="button"
                                className={`ims-profile__condition-chip ${active ? 'active' : ''}`}
                                onClick={() => toggleHealthCondition(condition)}
                            >
                                <div className="ims-profile__chip-inner">
                                    {active && <CheckCircle2 size={14} className="ims-profile__chip-check" />}
                                    <span>{condition.replace(/_/g, ' ')}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            );
        }

        return (
            <div className="ims-profile__form-grid">
                <ProfileField label="Contact Name" icon={User} name="emergencyContactName" value={formData.emergencyContactName} onChange={handleInputChange} placeholder="Contact name" />
                <ProfileField label="Phone" icon={Phone} name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleInputChange} placeholder="Phone number" />
                <ProfileField label="Email" icon={Mail} name="emergencyContactEmail" value={formData.emergencyContactEmail} onChange={handleInputChange} placeholder="Email address" />
            </div>
        );
    };

    /* ── Tab content ─────────────────────────────────────── */
    const renderTabContent = () => {

        /* ── Settings ── */
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
                        <form className="ims-profile__form-clinical">
                            <div className="ims-profile__section-actions">
                                <button
                                    type="button"
                                    className="ims-profile__save-btn"
                                    onClick={() => setIsUpdateModalOpen(true)}
                                >
                                    <Settings size={16} />
                                    <span>Edit Profile Sections</span>
                                </button>
                            </div>
                            {/* Section 1: Personal Information */}
                            <div className="ims-profile__settings-card">
                                <h3 className="ims-profile__settings-card-title">
                                    <User size={16} /> PERSONAL INFORMATION
                                </h3>
                                <div className="ims-profile__form-grid">
                                    <ProfileField
                                        label="First Name" icon={User}
                                        name="firstName" value={formData.firstName}
                                        onChange={handleInputChange} placeholder="First name" disabled
                                    />
                                    <ProfileField
                                        label="Last Name" icon={User}
                                        name="lastName" value={formData.lastName}
                                        onChange={handleInputChange} placeholder="Last name" disabled
                                    />
                                    <ProfileField
                                        label="Phone Number" icon={Phone}
                                        name="phone" value={formData.phone}
                                        onChange={handleInputChange} placeholder="Phone number" disabled
                                    />
                                    <ProfileField
                                        label="Date of Birth" icon={Calendar}
                                        name="dateOfBirth" type="date"
                                        value={formData.dateOfBirth}
                                        onChange={handleInputChange}
                                        placement="bottom"
                                        disabled
                                    />
                                    <ProfileField
                                        label="Gender" icon={ShieldCheck}
                                        name="gender" type="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        disabled
                                        options={[
                                            { value: 'male',   label: 'Male' },
                                            { value: 'female', label: 'Female' },
                                            { value: 'other',  label: 'Other / Prefer not to say' },
                                        ]}
                                    />
                                </div>
                            </div>

                            {/* Section 2: Address & Location */}
                            <div className="ims-profile__settings-card">
                                <h3 className="ims-profile__settings-card-title">
                                    <MapPin size={16} /> ADDRESS &amp; LOCATION
                                </h3>
                                <div className="ims-profile__form-grid">
                                    <ProfileField
                                        label="Address" icon={Home}
                                        name="address" value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="Street address"
                                        disabled
                                    />
                                    <ProfileField
                                        label="City" icon={MapPin}
                                        name="city" value={formData.city}
                                        onChange={handleInputChange}
                                        placeholder="City"
                                        disabled
                                    />
                                    <ProfileField
                                        label="Country" icon={Globe}
                                        name="country" value={formData.country}
                                        onChange={handleInputChange}
                                        placeholder="Country"
                                        disabled
                                    />
                                    <ProfileField
                                        label="Occupation" icon={BriefcaseIcon}
                                        name="occupation" value={formData.occupation}
                                        onChange={handleInputChange}
                                        placeholder="Occupation"
                                        disabled
                                    />
                                </div>
                            </div>

                            {/* Section 3: Emergency Contact */}
                            <div className="ims-profile__settings-card">
                                <h3 className="ims-profile__settings-card-title">
                                    <Heart size={16} /> HEALTH CONDITIONS
                                </h3>
                                <div className="ims-profile__conditions-current">
                                    <span className="ims-profile__conditions-current-label">Current health profile</span>
                                    <span className="ims-profile__conditions-current-value">
                                        {formData.healthConditions?.length
                                            ? `${formData.healthConditions.length} condition${formData.healthConditions.length > 1 ? 's' : ''} selected`
                                            : 'No conditions selected'}
                                    </span>
                                </div>
                                <div className="ims-profile__conditions-group">
                                    {HEALTH_CONDITIONS.map((condition) => {
                                        const active = formData.healthConditions?.includes(condition);
                                        return (
                                            <button
                                                key={condition}
                                                type="button"
                                                className={`ims-profile__condition-chip ${active ? 'active' : ''}`}
                                                onClick={() => {}}
                                                disabled
                                            >
                                                {condition.replace(/_/g, ' ')}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Section 4: Emergency Contact */}
                            <div className="ims-profile__settings-card">
                                <h3 className="ims-profile__settings-card-title emergency">
                                    <PhoneCall size={16} /> EMERGENCY CONTACT
                                </h3>
                                <div className="ims-profile__form-grid">
                                    <ProfileField
                                        label="Contact Name" icon={User}
                                        name="emergencyContactName" value={formData.emergencyContactName}
                                        onChange={handleInputChange}
                                        placeholder="Contact name"
                                        disabled
                                    />
                                    <ProfileField
                                        label="Phone" icon={Phone}
                                        name="emergencyContactPhone" value={formData.emergencyContactPhone}
                                        onChange={handleInputChange}
                                        placeholder="Phone number"
                                        disabled
                                    />
                                    <ProfileField
                                        label="Email" icon={Mail}
                                        name="emergencyContactEmail" value={formData.emergencyContactEmail}
                                        onChange={handleInputChange}
                                        placeholder="Email address"
                                        disabled
                                    />
                                </div>
                            </div>

                        </form>
                </motion.div>
            );
        }

        /* ── Appointments ── */
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
                            <ClipboardList size={12} />Appointments &amp; Bookings
                        </h3>
                        <Link
                            to="/Appointment"
                            className="ims-profile__save-btn"
                            style={{
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 'auto',
                                padding: '0 14px',
                                height: 36,
                                fontSize: '13px',
                            }}
                        >
                            View All History
                        </Link>
                    </div>

                    <div className="ims-profile__appointments-layout" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

                        {/* Caregiver Bookings Section */}
                        <div className="ims-profile__section">
                            <h4 style={{ fontSize: '14px', marginBottom: '15px', color: 'var(--p-cyan)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Sparkles size={14} /> Caregiver Services
                            </h4>
                            <PatientAppointmentsTab onBookingSuccess={triggerStatsRefresh} />
                        </div>

                        <div className="ims-profile__divider" style={{ margin: '10px 0' }} />

                        {/* Recent Doctor Appointments */}
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

                    </div>
                </motion.div>
            );
        }

        /* ── Alerts ── */
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

        /* ── Health Data ── */
        if (activeTab === 'health') {
            return (
                <motion.div
                    key="health"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="ims-profile__settings"
                >
                    <PatientHealthTab />
                </motion.div>
            );
        }

        /* ── Placeholder (Any other remaining) ── */
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

    /* ── Render ──────────────────────────────────────────── */
    return (
        <>
            <BackgroundEffect />
            <Header />

            <AnimatePresence mode="wait">
                <motion.main
                    key="profile-main"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
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
                            className={`ims-profile__sidebar ${isDark ? 'is-dark' : ''}`}
                        >
                            {/* ── Green header section ── */}
                            <div className="ims-profile__sidebar-header">
                                <span className="ims-sidebar-deco ims-sidebar-deco--1" />
                                <span className="ims-sidebar-deco ims-sidebar-deco--2" />
                            </div>

                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" hidden />

                            {/* ── Body section ── */}
                            <div className="ims-profile__sidebar-body">
                                {/* Avatar Overlap */}
                                <div className="ims-profile__avatar-container">
                                    <div
                                        className="ims-profile__avatar-ring"
                                        onClick={() => fileInputRef.current?.click()}
                                        title="Change photo"
                                    >
                                        <div className="ims-profile__avatar-wrap">
                                            {user?.profileImage
                                                ? <img 
                                                    src={user.profileImage}
                                                    fetchPriority="high"
                                                    loading="eager"
                                                    alt={displayName} 
                                                    className="ims-profile__avatar" 
                                                  />
                                                : <div className="ims-profile__avatar-placeholder"><User size={32} /></div>
                                            }
                                            {imageLoading
                                                ? <div className="ims-profile__avatar-loader"><Loader2 className="spin" size={22} /></div>
                                                : <div className="ims-profile__avatar-overlay"><Camera size={18} /><span>Change</span></div>
                                            }
                                        </div>
                                    </div>
                                    <span className="ims-profile__online-badge">● Online</span>
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

                                {/* Health Score bar */}
                                <div className="ims-profile__health-score">
                                    <div className="ims-profile__health-score-row">
                                        <span className="ims-profile__health-score-label">Health Score</span>
                                        <span className="ims-profile__health-score-value">{profileScore}/100</span>
                                    </div>
                                    <div className="ims-profile__health-score-track">
                                        <div className="ims-profile__health-score-fill" style={{ width: `${profileScore}%` }} />
                                    </div>
                                </div>

                                <div className="ims-profile__divider" />

                                {/* Nav section header */}
                                <div className="ims-profile__nav-section-header">
                                    <span className="ims-profile__nav-section-label">Navigation</span>
                                    <span className="ims-profile__nav-section-active">{TABS.find(t => t.id === activeTab)?.label || ''}</span>
                                </div>

                                {/* Nav */}
                                <nav className="ims-profile__nav">
                                    {TABS.map(({ id, label, icon: Icon }) => (
                                        <button
                                            key={id}
                                            className={`ims-profile__nav-item${activeTab === id ? ' active' : ''}`}
                                            onClick={() => setActiveTab(id)}
                                        >
                                            <span className="ims-profile__nav-icon-wrap">
                                                <Icon size={17} />
                                            </span>
                                            <span>{label}</span>
                                            <ChevronRight size={13} className="nav-arrow" />
                                        </button>
                                    ))}
                                </nav>

                                <div className="ims-profile__divider" />

                                <button className="ims-profile__nav-item logout" onClick={logout}>
                                    <span className="ims-profile__nav-icon-wrap logout-icon">
                                        <LogOut size={17} />
                                    </span>
                                    <span>Sign Out</span>
                                </button>

                            </div>
                        </motion.aside>

                        {/* ── Main Content ──────────────────────────── */}
                        <section className="ims-profile__content">

                            {/* User Data Banner */}
                            <motion.div
                                initial={{ opacity: 0, y: -14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.08 }}
                                className="ims-profile__user-banner"
                            >
                                <img
                                    src="/images/stats/banner_background_v2.png"
                                    srcSet="/images/stats/banner_background_v2.png 1200w"
                                    sizes="(max-width: 1024px) 100vw, 75vw"
                                    alt="Background"
                                    className="ims-profile__banner-bg"
                                    loading="eager"
                                    fetchPriority="high"
                                />
                                <div className="ims-profile__banner-overlay" />

                                <div className="ims-profile__banner-content-new">
                                    {/* Left side: header info */}
                                    <div className="ims-profile__banner-header-left">
                                        <div className="ims-profile__header-title-inner">
                                            <div className="ims-profile__header-icon-wrap" style={{ 
                                                background: 'rgba(0,0,0,0.4)', 
                                                border: '1px solid rgba(255,255,255,0.6)',
                                                boxShadow: '0 4px 15px rgba(0,0,0,0.4)' 
                                            }}>
                                                <User size={20} color="#ffffff" strokeWidth={2.5} />
                                            </div>
                                            <div className="ims-profile__header-text">
                                                <h2 style={{ color: '#ffffff', textShadow: '0 2px 8px rgba(0,0,0,0.8)', fontWeight: 800 }}>User Data</h2>
                                                <p style={{ color: 'rgba(255,255,255,0.95)', fontWeight: 500 }}>Personal information & profile settings</p>
                                            </div>
                                        </div>
                                        <div className="ims-profile__banner-badges">
                                            <div className="ims-profile__banner-badge">
                                                <IdCard size={14} />
                                                <span>{user?.id ? `PN-2024-${user.id}` : 'PN-2024-00142'}</span>
                                            </div>
                                            <div className="ims-profile__banner-badge">
                                                <MapPin size={14} />
                                                <span>{user?.address || user?.location || 'Colombo, Sri Lanka'}</span>
                                            </div>
                                            <div className="ims-profile__banner-badge">
                                                <Briefcase size={14} />
                                                <span>{user?.role || 'Patient'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right side: name and email */}
                                    <div className="ims-profile__banner-user-right">
                                        <h2 className="ims-profile__banner-name">{displayName}</h2>
                                        <p className="ims-profile__banner-email">{user?.email}</p>
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
                                    value={profileScore}
                                    unit="%"
                                    label="Profile Complete"
                                    trend={profileScore >= 80 ? 'Great' : profileScore >= 50 ? 'Good' : 'Fill in'}
                                    trendClass=""
                                    barColor="#ffffff"
                                    bgImage="/images/stats/stat_completeness.png"
                                    overlayColor="linear-gradient(135deg, rgba(220, 38, 38, 0.6) 0%, rgba(185, 28, 28, 0.75) 100%)"
                                    loading={false}
                                />
                                <StatCard
                                    icon={Zap}
                                    value={accountDays}
                                    unit="Days"
                                    label="Days Active"
                                    trend="Streak"
                                    trendClass=""
                                    barColor="#ffffff"
                                    bgImage="/images/stats/stat_days.png"
                                    overlayColor="linear-gradient(135deg, rgba(8, 145, 178, 0.6) 0%, rgba(15, 118, 110, 0.75) 100%)"
                                    loading={false}
                                />
                                <StatCard
                                    icon={Heart}
                                    value={
                                        profileStats.loading ? '—'
                                        : profileStats.avgOxygen != null ? profileStats.avgOxygen
                                        : 'N/A'
                                    }
                                    unit={!profileStats.loading && profileStats.avgOxygen != null ? '%' : ''}
                                    label="Avg O₂ Level"
                                    trend={
                                        !profileStats.loading && profileStats.avgOxygen != null
                                            ? profileStats.avgOxygen >= 95 ? 'Normal'
                                            : profileStats.avgOxygen >= 90 ? 'Low'
                                            : 'Critical'
                                            : null
                                    }
                                    trendClass=""
                                    barColor="#ffffff"
                                    bgImage="/images/stats/stat_oxygen.png"
                                    overlayColor="linear-gradient(135deg, rgba(16, 185, 129, 0.6) 0%, rgba(5, 150, 105, 0.75) 100%)"
                                    loading={profileStats.loading}
                                />
                                <StatCard
                                    icon={ClipboardList}
                                    value={
                                        profileStats.loading ? '—'
                                        : profileStats.appointments != null ? profileStats.appointments
                                        : 0
                                    }
                                    unit="Total"
                                    label="Appointments"
                                    trend="Active"
                                    trendClass=""
                                    barColor="#ffffff"
                                    bgImage="/images/stats/stat_appointments.png"
                                    overlayColor="linear-gradient(135deg, rgba(245, 158, 11, 0.6) 0%, rgba(217, 119, 6, 0.75) 100%)"
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
            </AnimatePresence>

            {createPortal(
                <AnimatePresence>
                    {isUpdateModalOpen && (
                        <motion.div
                            className="ims-profile__modal-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsUpdateModalOpen(false)}
                        >
                            <motion.div
                                className="ims-profile__update-modal"
                                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 14, scale: 0.98 }}
                                transition={{ duration: 0.24 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="ims-profile__update-modal-head">
                                    <h3><Sparkles size={16} /> Edit Profile</h3>
                                    <button
                                        type="button"
                                        className="ims-profile__modal-close"
                                        onClick={() => setIsUpdateModalOpen(false)}
                                        aria-label="Close modal"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                <div className="ims-profile__update-sections">
                                    <button type="button" className={updateSection === 'personal' ? 'active' : ''} onClick={() => setUpdateSection('personal')}>Personal</button>
                                    <button type="button" className={updateSection === 'location' ? 'active' : ''} onClick={() => setUpdateSection('location')}>Location</button>
                                    <button type="button" className={updateSection === 'health' ? 'active' : ''} onClick={() => setUpdateSection('health')}>Health</button>
                                    <button type="button" className={updateSection === 'emergency' ? 'active' : ''} onClick={() => setUpdateSection('emergency')}>Emergency</button>
                                </div>

                                <form onSubmit={handleUpdateProfile} className="ims-profile__update-modal-body">
                                    {renderModalSectionContent()}
                                    <div className="ims-profile__update-modal-actions">
                                        <button type="button" className="ims-profile__modal-cancel" onClick={() => setIsUpdateModalOpen(false)}>
                                            Cancel
                                        </button>
                                        <button type="submit" className="ims-profile__save-btn" disabled={isUpdating}>
                                            {isUpdating
                                                ? <><Loader2 className="spin" size={16} /><span>Saving…</span></>
                                                : <><Save size={16} /><span>Save Changes</span></>
                                            }
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            <Footer />
        </>
    );
}
