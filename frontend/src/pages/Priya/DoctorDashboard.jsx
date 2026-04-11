import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  Headset,
  LayoutDashboard,
  LogOut,
  Moon,
  Search,
  Stethoscope,
  Sun,
  Users,
  XCircle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/Imasha/AuthContext';
import Logo from '../../components/Tharuka/Common/Logo';
import {
  createSupportMessage,
  getMySupportMessages,
} from '../../utils/Imasha/supportApi';
import '../../styles/Priya/DoctorDashboard.css';

const APPOINTMENTS_API = `${import.meta.env.VITE_API_URL}/appointments`;
const PAGE_SIZE = 4;

function matchesDoctor(appointment, user) {
  const doctorUserId = appointment?.doctorDetails?.userId;
  const currentUserId = user?.id || user?._id;
  const doctorName = String(appointment?.doctor || '').toLowerCase();
  const currentName = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim()
    .toLowerCase();

  const byUserId = doctorUserId && currentUserId && String(doctorUserId) === String(currentUserId);
  const byName = currentName && doctorName.includes(currentName);

  return byUserId || byName;
}

function formatDateLabel(dateValue) {
  if (!dateValue) return '-';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(date);
}

function getInitials(name) {
  const words = String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2);
  if (!words.length) return 'PT';
  return words.map((word) => word[0]?.toUpperCase()).join('');
}

function StatCard({ title, value, icon: Icon, className }) {
  return (
    <article className={`pr-md-stat pr-md-stat--${className}`}>
      <div className="pr-md-stat__content">
        <span>{title}</span>
        <strong>{String(value).padStart(2, '0')}</strong>
      </div>
      <div className="pr-md-stat__icon" aria-hidden="true">
        <Icon size={34} />
      </div>
    </article>
  );
}

function AppointmentTable({ appointments, currentPage, setCurrentPage }) {
  const totalPages = Math.max(1, Math.ceil(appointments.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageItems = appointments.slice(start, start + PAGE_SIZE);

  useEffect(() => {
    if (currentPage !== safePage) {
      setCurrentPage(safePage);
    }
  }, [currentPage, safePage, setCurrentPage]);

  return (
    <div className="pr-md-panel">
      <div className="pr-md-table-wrap">
        <table className="pr-md-table">
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Date</th>
              <th>Time</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan="6" className="pr-md-empty-row">No appointments found for this filter.</td>
              </tr>
            ) : (
              pageItems.map((appointment) => (
                <tr key={appointment._id}>
                  <td>
                    <div className="pr-md-patient">
                      <div className={`pr-md-patient__avatar pr-md-patient__avatar--${String(appointment.status || '').toLowerCase()}`}>
                        {getInitials(appointment.patientName)}
                      </div>
                      <div>
                        <strong>{appointment.patientName || 'Unknown Patient'}</strong>
                        <span>{appointment.patientEmail || 'No email provided'}</span>
                      </div>
                    </div>
                  </td>
                  <td>{formatDateLabel(appointment.date)}</td>
                  <td>{appointment.time || '-'}</td>
                  <td>
                    <span className="pr-md-chip pr-md-chip--type">{appointment.type || 'Consultation'}</span>
                  </td>
                  <td>
                    <span className={`pr-md-chip pr-md-chip--${String(appointment.status || 'Pending').toLowerCase()}`}>
                      {appointment.status || 'Pending'}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="pr-md-action"
                      title="View appointment details"
                      onClick={() => {
                        toast.success(
                          `${appointment.patientName || 'Patient'} | ${formatDateLabel(appointment.date)} at ${appointment.time || '-'}`
                        );
                      }}
                    >
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="pr-md-pagination">
        <span>
          Showing {appointments.length === 0 ? 0 : start + 1}-
          {Math.min(start + PAGE_SIZE, appointments.length)} of {appointments.length} appointments
        </span>

        <div className="pr-md-pagination__controls">
          <button
            type="button"
            className="pr-md-pagination__btn"
            disabled={safePage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          >
            {'<'}
          </button>

          {Array.from({ length: totalPages }, (_, index) => {
            const page = index + 1;
            return (
              <button
                key={page}
                type="button"
                className={`pr-md-pagination__btn ${safePage === page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            );
          })}

          <button
            type="button"
            className="pr-md-pagination__btn"
            disabled={safePage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          >
            {'>'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SupportView({
  supportForm,
  onSupportChange,
  submitSupportMessage,
  submittingSupport,
  supportMessages,
  supportLoading,
}) {
  return (
    <div className="pr-md-support-grid">
      <section className="pr-md-panel pr-md-support-card">
        <div className="pr-md-section-head">
          <div>
            <h2>Support Session</h2>
            <p>Inform the admin team about clinical workflow issues, booking problems, or account concerns.</p>
          </div>
        </div>

        <form className="pr-md-support-form" onSubmit={submitSupportMessage}>
          <label htmlFor="supportSubject">Subject</label>
          <input
            id="supportSubject"
            name="subject"
            type="text"
            value={supportForm.subject}
            onChange={onSupportChange}
            placeholder="Example: Patient schedule is duplicated"
            maxLength={140}
            required
          />

          <label htmlFor="supportMessage">Message</label>
          <textarea
            id="supportMessage"
            name="message"
            value={supportForm.message}
            onChange={onSupportChange}
            rows={8}
            maxLength={3000}
            placeholder="Write the issue clearly so the admin team can act quickly."
            required
          />

          <button type="submit" className="pr-md-primary-btn" disabled={submittingSupport}>
            {submittingSupport ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </section>

      <section className="pr-md-panel pr-md-support-card">
        <div className="pr-md-section-head">
          <div>
            <h2>Support History</h2>
            <p>Track admin responses and resolution updates for the issues you already reported.</p>
          </div>
        </div>

        {supportLoading ? (
          <div className="pr-md-empty">Loading support messages...</div>
        ) : supportMessages.length === 0 ? (
          <div className="pr-md-empty">No support messages yet.</div>
        ) : (
          <div className="pr-md-support-list">
            {supportMessages.map((item) => (
              <article key={item._id} className="pr-md-support-item">
                <div className="pr-md-support-item__top">
                  <div>
                    <h3>{item.subject}</h3>
                    <span>{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                  <span className={`pr-md-chip pr-md-chip--${String(item.status || 'Open').toLowerCase()}`}>
                    {item.status}
                  </span>
                </div>
                <p>{item.message}</p>
                {item.adminNote ? (
                  <div className="pr-md-support-item__note">
                    <strong>Admin Note</strong>
                    <p>{item.adminNote}</p>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function DoctorDashboard() {
  const { user, token, logout } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [supportMessages, setSupportMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [supportLoading, setSupportLoading] = useState(true);
  const [submittingSupport, setSubmittingSupport] = useState(false);
  const [activeTab, setActiveTab] = useState('appointments');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [unseenCount, setUnseenCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('doctor-dashboard-theme') || 'light');
  const [supportForm, setSupportForm] = useState({
    subject: '',
    message: '',
  });
  const notificationsRef = useRef(null);

  const loadAppointments = useCallback(async () => {
    if (!token || !user) return;

    setLoading(true);
    try {
      const res = await fetch(APPOINTMENTS_API, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to load appointments');

      const list = Array.isArray(data) ? data : [];
      const mine = list.filter((appointment) => matchesDoctor(appointment, user));
      setAppointments(mine);
    } catch (error) {
      toast.error(error.message || 'Failed to load appointments.');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  const loadSupportMessages = useCallback(async () => {
    if (!token || !user) return;

    setSupportLoading(true);
    try {
      const response = await getMySupportMessages(token);
      setSupportMessages(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Failed to load support messages.');
      setSupportMessages([]);
    } finally {
      setSupportLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    loadAppointments();
    loadSupportMessages();
  }, [loadAppointments, loadSupportMessages]);

  useEffect(() => {
    localStorage.setItem('doctor-dashboard-theme', theme);
  }, [theme]);

  const todayLabel = new Date().toISOString().slice(0, 10);
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || 'Doctor';
  const displayRole = user?.doctorDetails?.specialization || 'Specialist';
  const currentUserId = user?.id || user?._id || user?.email || 'doctor';
  const notificationStorageKey = `doctor-dashboard-last-seen-${currentUserId}`;
  const doctorEmail = user?.email || 'Not available';
  const doctorPhone = user?.phone || user?.doctorDetails?.phone || 'Not available';
  const doctorHospital = user?.doctorDetails?.hospital || user?.doctorDetails?.clinic || 'PulseNova Network';

  const stats = useMemo(() => ({
    total: appointments.length,
    pending: appointments.filter((item) => item.status === 'Pending').length,
    confirmedToday: appointments.filter(
      (item) => item.status === 'Confirmed' && String(item.date || '').slice(0, 10) === todayLabel
    ).length,
    cancelled: appointments.filter((item) => item.status === 'Cancelled').length,
  }), [appointments, todayLabel]);

  const filteredAppointments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return appointments.filter((item) => {
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchesQuery = !query || [
        item.patientName,
        item.patientEmail,
        item.time,
        item.date,
        item.type,
      ].some((value) => String(value || '').toLowerCase().includes(query));

      return matchesStatus && matchesQuery;
    });
  }, [appointments, searchQuery, statusFilter]);

  const derivedPatients = useMemo(() => {
    const map = new Map();

    appointments.forEach((item) => {
      const key = `${item.patientName || ''}-${item.patientEmail || ''}`;
      if (!map.has(key)) {
        map.set(key, {
          patientName: item.patientName || 'Unknown Patient',
          patientEmail: item.patientEmail || 'No email',
          patientPhone: item.patientPhone || '-',
          totalAppointments: 0,
          lastDate: item.date || '',
        });
      }

      const current = map.get(key);
      current.totalAppointments += 1;
      if (String(item.date || '') > String(current.lastDate || '')) {
        current.lastDate = item.date || '';
      }
    });

    return Array.from(map.values());
  }, [appointments]);

  const recentAppointments = useMemo(
    () => [...appointments].sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))).slice(0, 5),
    [appointments]
  );

  const notificationItems = useMemo(() => {
    const seenCount = Number(localStorage.getItem(notificationStorageKey) || '0');
    return [...appointments]
      .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
      .slice(0, 6)
      .map((item, index) => ({
        ...item,
        isNew: index < Math.max(appointments.length - seenCount, 0),
      }));
  }, [appointments, notificationStorageKey]);

  useEffect(() => {
    const savedSeenCount = Number(localStorage.getItem(notificationStorageKey) || '0');
    const nextUnseen = Math.max(appointments.length - savedSeenCount, 0);
    setUnseenCount(nextUnseen);
  }, [appointments.length, notificationStorageKey]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, activeTab]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const onSupportChange = (e) => {
    const { name, value } = e.target;
    setSupportForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitSupportMessage = async (e) => {
    e.preventDefault();

    if (!supportForm.subject.trim() || !supportForm.message.trim()) {
      toast.error('Please enter both a subject and message.');
      return;
    }

    setSubmittingSupport(true);
    try {
      const response = await createSupportMessage(token, supportForm);
      toast.success(response?.message || 'Support message sent to admin.');
      setSupportForm({ subject: '', message: '' });
      await loadSupportMessages();
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Failed to send support message.');
    } finally {
      setSubmittingSupport(false);
    }
  };

  const handleNotificationClick = () => {
    const nextOpen = !notificationsOpen;
    setNotificationsOpen(nextOpen);
    setProfileOpen(false);

    if (nextOpen) {
      localStorage.setItem(notificationStorageKey, String(appointments.length));
      setUnseenCount(0);
    }
  };

  const toggleProfilePanel = () => {
    setNotificationsOpen(false);
    setProfileOpen((prev) => !prev);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  if (user && user.role !== 'doctor') {
    return <Navigate to="/" replace />;
  }

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'appointments', label: 'Appointments', icon: CalendarDays },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'support', label: 'Support', icon: Headset },
  ];

  return (
    <main className={`pr-md-page ${theme === 'dark' ? 'pr-md-page--dark' : ''}`}>
      <section className="pr-md-frame">
        <aside className="pr-md-sidebar">
          <div className="pr-md-brand">
            <Logo />
          </div>

          <nav className="pr-md-nav">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`pr-md-nav__item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon size={17} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="pr-md-sidebar__footer">
            <button type="button" className="pr-md-nav__item pr-md-nav__item--muted" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
              <span>{theme === 'dark' ? 'DarkMode' : 'LightMode'}</span>
            </button>
            <button type="button" className="pr-md-nav__item pr-md-nav__item--muted" onClick={logout}>
              <LogOut size={17} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <section className="pr-md-content">
          <header className="pr-md-topbar">
            <div className="pr-md-search">
              <Search size={16} />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patients or schedules..."
              />
            </div>

            <div className="pr-md-topbar__actions">
              <div className="pr-md-notifications" ref={notificationsRef}>
                <button
                  type="button"
                  className="pr-md-icon-btn pr-md-icon-btn--green"
                  aria-label="Notifications"
                  onClick={handleNotificationClick}
                >
                  <Bell size={16} />
                  {unseenCount > 0 ? <span className="pr-md-icon-btn__badge">{unseenCount}</span> : null}
                </button>
                {notificationsOpen ? (
                  <div className="pr-md-notifications__panel">
                    <div className="pr-md-notifications__head">
                      <div>
                        <h3>Notifications</h3>
                        <p>Recent appointment updates</p>
                      </div>
                    </div>
                    {notificationItems.length === 0 ? (
                      <div className="pr-md-notifications__empty">No appointments yet.</div>
                    ) : (
                      <div className="pr-md-notifications__list">
                        {notificationItems.map((item) => (
                          <article key={item._id} className="pr-md-notifications__item">
                            <div className={`pr-md-notifications__dot ${String(item.status || 'Pending').toLowerCase()}`} />
                            <div className="pr-md-notifications__content">
                              <div className="pr-md-notifications__row">
                                <strong>{item.patientName || 'Unknown Patient'}</strong>
                                {item.isNew ? <span className="pr-md-notifications__new">New</span> : null}
                              </div>
                              <p>{formatDateLabel(item.date)} at {item.time || '-'} | {item.status || 'Pending'}</p>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              <div className="pr-md-profile">
                <div className="pr-md-profile__meta">
                  <strong>{displayName}</strong>
                  <span>{displayRole}</span>
                </div>
                <button
                  type="button"
                  className="pr-md-profile__avatar pr-md-profile__avatar--icon"
                  aria-label="Open doctor profile"
                  onClick={toggleProfilePanel}
                >
                  <Stethoscope size={18} />
                </button>
                {profileOpen ? (
                  <div className="pr-md-profile-card">
                    <div className="pr-md-profile-card__head">
                      <div className="pr-md-profile-card__icon" aria-hidden="true">
                        <Stethoscope size={20} />
                      </div>
                      <div>
                        <h3>{displayName}</h3>
                        <p>{displayRole}</p>
                      </div>
                    </div>

                    <div className="pr-md-profile-card__body">
                      <div className="pr-md-profile-card__row">
                        <span>Email</span>
                        <strong>{doctorEmail}</strong>
                      </div>
                      <div className="pr-md-profile-card__row">
                        <span>Phone</span>
                        <strong>{doctorPhone}</strong>
                      </div>
                      <div className="pr-md-profile-card__row">
                        <span>Hospital</span>
                        <strong>{doctorHospital}</strong>
                      </div>
                      <div className="pr-md-profile-card__row">
                        <span>Role</span>
                        <strong>Doctor</strong>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </header>

          <div className="pr-md-body">
            {activeTab === 'appointments' && (
              <>
                <div className="pr-md-section-head">
                  <div>
                    <h1>Appointments Management</h1>
                    <p>Review and manage your daily clinical workflow.</p>
                  </div>
                  <button type="button" className="pr-md-primary-btn pr-md-primary-btn--small" onClick={loadAppointments}>
                    Refresh List
                  </button>
                </div>

                <div className="pr-md-stats">
                  <StatCard title="Total Booked" value={stats.total} icon={CalendarDays} className="booked" />
                  <StatCard title="Pending Review" value={stats.pending} icon={Clock3} className="pending" />
                  <StatCard title="Confirmed Today" value={stats.confirmedToday} icon={CheckCircle2} className="confirmed" />
                  <StatCard title="Cancellations" value={stats.cancelled} icon={XCircle} className="cancelled" />
                </div>

                <div className="pr-md-toolbar">
                  <div className="pr-md-filters">
                    {['All', 'Pending', 'Confirmed', 'Cancelled'].map((status) => (
                      <button
                        key={status}
                        type="button"
                        className={`pr-md-filter ${statusFilter === status ? 'active' : ''}`}
                        onClick={() => setStatusFilter(status)}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {loading ? (
                  <div className="pr-md-empty">Loading appointments...</div>
                ) : (
                  <AppointmentTable
                    appointments={filteredAppointments}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                  />
                )}
              </>
            )}

            {activeTab === 'dashboard' && (
              <>
                <div className="pr-md-section-head">
                  <div>
                    <h1>Doctor Dashboard</h1>
                    <p>Quick overview of your clinic queue and recent appointments.</p>
                  </div>
                </div>

                <div className="pr-md-stats">
                  <StatCard title="Total Booked" value={stats.total} icon={CalendarDays} className="booked" />
                  <StatCard title="Pending Review" value={stats.pending} icon={Clock3} className="pending" />
                  <StatCard title="Confirmed Today" value={stats.confirmedToday} icon={CheckCircle2} className="confirmed" />
                  <StatCard title="Open Support" value={supportMessages.filter((item) => item.status === 'Open').length} icon={Headset} className="support" />
                </div>

                <div className="pr-md-overview-grid">
                  <section className="pr-md-panel">
                    <div className="pr-md-section-head">
                      <div>
                        <h2>Recent Appointments</h2>
                        <p>Your latest patient bookings in read-only mode.</p>
                      </div>
                    </div>

                    {recentAppointments.length === 0 ? (
                      <div className="pr-md-empty">No appointments available.</div>
                    ) : (
                      <div className="pr-md-compact-list">
                        {recentAppointments.map((item) => (
                          <article key={item._id} className="pr-md-compact-item">
                            <div className="pr-md-patient">
                              <div className={`pr-md-patient__avatar pr-md-patient__avatar--${String(item.status || 'confirmed').toLowerCase()}`}>
                                {getInitials(item.patientName)}
                              </div>
                              <div>
                                <strong>{item.patientName}</strong>
                                <span>{formatDateLabel(item.date)} at {item.time || '-'}</span>
                              </div>
                            </div>
                            <span className={`pr-md-chip pr-md-chip--${String(item.status || 'Pending').toLowerCase()}`}>
                              {item.status || 'Pending'}
                            </span>
                          </article>
                        ))}
                      </div>
                    )}
                  </section>

                  <section className="pr-md-panel">
                    <div className="pr-md-section-head">
                      <div>
                        <h2>Workspace Note</h2>
                        <p>This layout matches the appointment management dashboard style you requested.</p>
                      </div>
                    </div>
                    <div className="pr-md-note">
                      <p>
                        Doctors can review appointments, open the support section, and follow admin responses here.
                        Appointment actions stay read-only so no booking data is changed from this workspace.
                      </p>
                    </div>
                  </section>
                </div>
              </>
            )}

            {activeTab === 'patients' && (
              <>
                <div className="pr-md-section-head">
                  <div>
                    <h1>Patients</h1>
                    <p>Patient list derived from appointments assigned to this doctor.</p>
                  </div>
                </div>

                <div className="pr-md-panel">
                  {derivedPatients.length === 0 ? (
                    <div className="pr-md-empty">No patient records available yet.</div>
                  ) : (
                    <div className="pr-md-patient-list">
                      {derivedPatients.map((patient) => (
                        <article key={`${patient.patientName}-${patient.patientEmail}`} className="pr-md-patient-list__item">
                          <div className="pr-md-patient">
                            <div className="pr-md-patient__avatar pr-md-patient__avatar--booked">
                              {getInitials(patient.patientName)}
                            </div>
                            <div>
                              <strong>{patient.patientName}</strong>
                              <span>{patient.patientEmail}</span>
                            </div>
                          </div>
                          <div className="pr-md-patient-list__meta">
                            <span>{patient.patientPhone}</span>
                            <span>{patient.totalAppointments} appointments</span>
                            <span>Latest: {formatDateLabel(patient.lastDate)}</span>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === 'support' && (
              <SupportView
                supportForm={supportForm}
                onSupportChange={onSupportChange}
                submitSupportMessage={submitSupportMessage}
                submittingSupport={submittingSupport}
                supportMessages={supportMessages}
                supportLoading={supportLoading}
              />
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
