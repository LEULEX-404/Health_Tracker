import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarCheck, Clock, CheckCircle2, XCircle, ChevronRight,
  Shield, LogOut, Trash2, Filter, RefreshCw, User, LayoutDashboard,
  Calendar, ClipboardList, Check, X, Loader2, UserCheck,
  CalendarDays, CalendarClock, Mail, Phone, Activity, TrendingUp,
  Bell, Star, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/Imasha/AuthContext';
import { getMyBookings, updateBookingStatus, deleteBooking } from '../../utils/Tharindu/caregiverApi';
import Logo from '../../components/Tharuka/Common/Logo';
import '../../styles/Tharindu/careGiver.css';

/* ─── animation presets ─── */
const fadeUp   = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } } };
const fadeIn   = { hidden: { opacity: 0 },         show: { opacity: 1, transition: { duration: 0.35 } } };
const stagger  = { show: { transition: { staggerChildren: 0.07 } } };
const scaleIn  = { hidden: { opacity: 0, scale: 0.92 }, show: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: 'easeOut' } } };

/* ─── helpers ─── */
const fmtDate      = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
const fmtDateShort = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const fmtTime      = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hr = parseInt(h, 10);
  return `${hr > 12 ? hr - 12 : hr || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
};
const timeAgo = (d) => {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60)    return 'Just now';
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

/* ─── status config ─── */
const STATUS_CFG = {
  Pending:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',   icon: Clock,        label: 'Pending'   },
  Approved:  { color: '#10b981', bg: 'rgba(16,185,129,0.12)',   icon: CheckCircle2, label: 'Approved'  },
  Rejected:  { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',    icon: XCircle,      label: 'Rejected'  },
  Completed: { color: '#00c897', bg: 'rgba(0,200,151,0.12)',    icon: CheckCircle2, label: 'Completed' },
  Cancelled: { color: '#6b9b80', bg: 'rgba(107,155,128,0.12)', icon: X,            label: 'Cancelled' },
};

const SIDEBAR_ITEMS = [
  { key: 'overview', label: 'Overview',     icon: LayoutDashboard },
  { key: 'bookings', label: 'All Bookings', icon: CalendarCheck   },
  { key: 'pending',  label: 'Pending',      icon: Clock           },
  { key: 'schedule', label: 'My Schedule',  icon: CalendarDays    },
];

/* ─── animated counter ─── */
function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const start = prev.current;
    const end   = value;
    if (start === end) return;
    const duration = 600;
    const startTime = performance.now();
    const step = (now) => {
      const p = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (p < 1) requestAnimationFrame(step);
      else prev.current = end;
    };
    requestAnimationFrame(step);
  }, [value]);
  return <>{display}</>;
}

/* ═══════════════════════════════════════════════════════════
   CAREGIVER DASHBOARD
   ═══════════════════════════════════════════════════════════ */
const POLL_INTERVAL = 30_000; // 30s real-time polling

export default function CaregiverDashboard() {
  const { user, token, logout } = useAuth();

  if (user && user.role !== 'caregiver') return <Navigate to="/" replace />;

  const [activeTab,     setActiveTab]     = useState('overview');
  const [bookings,      setBookings]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);
  const [bookingFilter, setBookingFilter] = useState('All');
  const [actionLoading, setActionLoading] = useState(null);
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [lastUpdated,   setLastUpdated]   = useState(null);

  /* ── fetch bookings ── */
  const fetchBookings = useCallback(async (silent = false) => {
    if (!token || !user) return;
    if (!silent) setLoading(true);
    else         setRefreshing(true);
    try {
      const res = await getMyBookings(token);
      setBookings(res?.data || res || []);
      setLastUpdated(new Date());
    } catch {
      if (!silent) toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, user]);

  /* initial load */
  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  /* real-time polling */
  useEffect(() => {
    const id = setInterval(() => fetchBookings(true), POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchBookings]);

  /* ── booking actions ── */
  const handleBookingAction = async (id, status) => {
    setActionLoading(id + status);
    try {
      await updateBookingStatus(token, id, status);
      toast.success(`Booking ${status.toLowerCase()} successfully`);
      fetchBookings(true);
    } catch (e) { toast.error(e.message); }
    finally { setActionLoading(null); }
  };

  const handleDeleteBooking = async (id) => {
    setActionLoading(id + 'delete');
    try {
      await deleteBooking(token, id);
      toast.success('Booking removed');
      fetchBookings(true);
    } catch (e) { toast.error(e.message); }
    finally { setActionLoading(null); }
  };

  /* ── derived data ── */
  const stats = useMemo(() => ({
    total:     bookings.length,
    pending:   bookings.filter(b => b.status === 'Pending').length,
    approved:  bookings.filter(b => b.status === 'Approved').length,
    completed: bookings.filter(b => b.status === 'Completed').length,
  }), [bookings]);

  const pendingBookings  = useMemo(() => bookings.filter(b => b.status === 'Pending'),  [bookings]);
  const approvedBookings = useMemo(() => bookings.filter(b => b.status === 'Approved'), [bookings]);

  const filteredBookings = useMemo(() => {
    if (bookingFilter === 'All') return bookings;
    return bookings.filter(b => b.status === bookingFilter);
  }, [bookings, bookingFilter]);

  const todayStr     = new Date().toDateString();
  const todayBookings = useMemo(() =>
    bookings.filter(b => b.status === 'Approved' && new Date(b.date).toDateString() === todayStr),
  [bookings, todayStr]);

  /* ── loading state ── */
  if (loading) {
    return (
      <div className="cg-dashboard cg-dashboard--loading">
        <div className="cg-loading">
          <div className="cg-loading__ring">
            <div /><div /><div /><div />
          </div>
          <p>Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const STAT_CARDS = [
    { label: 'Total Bookings',   value: stats.total,     icon: CalendarCheck, accent: '#00c897', grad: 'linear-gradient(135deg,#00c897 0%,#00b4d8 100%)' },
    { label: 'Pending Requests', value: stats.pending,   icon: Clock,         accent: '#f59e0b', grad: 'linear-gradient(135deg,#f59e0b 0%,#f97316 100%)' },
    { label: 'Approved',         value: stats.approved,  icon: UserCheck,     accent: '#10b981', grad: 'linear-gradient(135deg,#10b981 0%,#059669 100%)' },
    { label: 'Completed',        value: stats.completed, icon: CheckCircle2,  accent: '#00b4d8', grad: 'linear-gradient(135deg,#00b4d8 0%,#7c3aed 100%)' },
  ];

  return (
    <div className="cg-dashboard">
      {/* Mobile toggle */}
      <button className="cg-sidebar-toggle" onClick={() => setSidebarOpen(o => !o)} aria-label="Toggle sidebar">
        <LayoutDashboard size={20} />
      </button>

      {/* Backdrop */}
      {sidebarOpen && <div className="cg-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

      {/* ─── Sidebar ─── */}
      <aside className={`cg-sidebar ${sidebarOpen ? 'cg-sidebar--open' : ''}`}>
        <div className="cg-sidebar__brand">
          <Logo />
        </div>

        <div className="cg-sidebar__profile">
          <div className="cg-sidebar__avatar-wrap">
            <div className="cg-sidebar__avatar">
              {user?.firstName?.[0]?.toUpperCase() || 'C'}
            </div>
            <span className="cg-sidebar__online-dot" />
          </div>
          <div className="cg-sidebar__info">
            <h4>{user?.firstName} {user?.lastName}</h4>
            <span className="cg-sidebar__role">
              <Shield size={11} /> Caregiver
            </span>
          </div>
        </div>

        <nav className="cg-sidebar__nav">
          {SIDEBAR_ITEMS.map(item => {
            const Icon  = item.icon;
            const badge = item.key === 'pending' ? stats.pending : 0;
            return (
              <button
                key={item.key}
                className={`cg-sidebar__link ${activeTab === item.key ? 'cg-sidebar__link--active' : ''}`}
                onClick={() => { setActiveTab(item.key); setSidebarOpen(false); }}
              >
                <span className="cg-sidebar__link-icon"><Icon size={17} /></span>
                <span>{item.label}</span>
                {badge > 0 && (
                  <span className="cg-sidebar__badge">
                    <AnimatePresence mode="wait">
                      <motion.span key={badge} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 6, opacity: 0 }} transition={{ duration: 0.15 }}>
                        {badge}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {lastUpdated && (
          <p className="cg-sidebar__last-updated">
            <Activity size={11} /> Updated {timeAgo(lastUpdated)}
          </p>
        )}

        <button className="cg-sidebar__logout" onClick={logout}>
          <LogOut size={17} />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* ─── Main ─── */}
      <main className="cg-main">
        {/* Welcome bar */}
        <motion.div className="cg-welcome" initial="hidden" animate="show" variants={fadeUp}>
          <div className="cg-welcome__left">
            <div className="cg-welcome__text">
              <h2>Welcome back, <span className="cg-gradient-text">{user?.firstName || 'Caregiver'}</span> 👋</h2>
              <p>Here's what's happening with your patients today.</p>
            </div>
          </div>
          <div className="cg-welcome__actions">
            {refreshing && <span className="cg-live-pill"><Zap size={10} /> Live</span>}
            <button
              className={`cg-refresh-btn ${refreshing ? 'cg-refresh-btn--spinning' : ''}`}
              onClick={() => fetchBookings(true)}
              disabled={refreshing}
            >
              <RefreshCw size={15} />
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </motion.div>

        {/* ── Stat Cards ── */}
        <motion.div className="cg-stats" variants={stagger} initial="hidden" animate="show">
          {STAT_CARDS.map(s => {
            const Icon = s.icon;
            return (
              <motion.div key={s.label} className="cg-stat-card" variants={scaleIn}>
                <div className="cg-stat-card__gradient-bar" style={{ background: s.grad }} />
                <div className="cg-stat-card__icon-wrap" style={{ background: `${s.accent}18` }}>
                  <Icon size={22} style={{ color: s.accent }} />
                </div>
                <div className="cg-stat-card__body">
                  <span className="cg-stat-card__value" style={{ color: s.accent }}>
                    <AnimatedNumber value={s.value} />
                  </span>
                  <span className="cg-stat-card__label">{s.label}</span>
                </div>
                <TrendingUp size={40} className="cg-stat-card__watermark" style={{ color: s.accent }} />
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">

          {/* ═══ OVERVIEW ═══ */}
          {activeTab === 'overview' && (
            <motion.div key="overview" className="cg-tab-content" initial="hidden" animate="show" exit="hidden" variants={fadeIn}>
              <div className="cg-overview-grid">

                {/* Pending Requests */}
                <div className="cg-panel cg-panel--full">
                  <div className="cg-panel__header">
                    <div className="cg-panel__title">
                      <div className="cg-panel__title-icon pending-icon"><Clock size={16} /></div>
                      <h3>Pending Requests</h3>
                    </div>
                    {pendingBookings.length > 0 && (
                      <span className="cg-badge cg-badge--warning">
                        <Bell size={11} /> {pendingBookings.length} awaiting
                      </span>
                    )}
                  </div>
                  {pendingBookings.length === 0 ? (
                    <EmptyState icon={<CheckCircle2 size={40} />} title="All caught up!" desc="No pending requests right now." />
                  ) : (
                    <motion.div className="cg-card-list" variants={stagger} initial="hidden" animate="show">
                      {pendingBookings.map(b => (
                        <BookingCard key={b._id} booking={b} actionLoading={actionLoading}
                          onApprove={() => handleBookingAction(b._id, 'Approved')}
                          onReject={() => handleBookingAction(b._id, 'Rejected')}
                          onDelete={() => handleDeleteBooking(b._id)} />
                      ))}
                    </motion.div>
                  )}
                </div>

                {/* Today's Schedule */}
                <div className="cg-panel">
                  <div className="cg-panel__header">
                    <div className="cg-panel__title">
                      <div className="cg-panel__title-icon schedule-icon"><CalendarDays size={16} /></div>
                      <h3>Today's Schedule</h3>
                    </div>
                    {todayBookings.length > 0 && (
                      <span className="cg-badge cg-badge--success">{todayBookings.length} today</span>
                    )}
                  </div>
                  {todayBookings.length === 0 ? (
                    <EmptyState icon={<CalendarClock size={36} />} title="Free today" desc="No appointments scheduled for today." compact />
                  ) : (
                    <div className="cg-schedule-list">
                      {todayBookings.map(b => <ScheduleItem key={b._id} booking={b} />)}
                    </div>
                  )}
                </div>

                {/* Recent Bookings */}
                <div className="cg-panel">
                  <div className="cg-panel__header">
                    <div className="cg-panel__title">
                      <div className="cg-panel__title-icon recent-icon"><Star size={16} /></div>
                      <h3>Recent Bookings</h3>
                    </div>
                    <button className="cg-link-btn" onClick={() => setActiveTab('bookings')}>
                      View all <ChevronRight size={14} />
                    </button>
                  </div>
                  {bookings.length === 0 ? (
                    <EmptyState icon={<ClipboardList size={36} />} title="No bookings yet" desc="" compact />
                  ) : (
                    <div className="cg-compact-list">
                      {bookings.slice(0, 5).map(b => <BookingRow key={b._id} booking={b} />)}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ ALL BOOKINGS ═══ */}
          {activeTab === 'bookings' && (
            <motion.div key="bookings" className="cg-tab-content" initial="hidden" animate="show" exit="hidden" variants={fadeIn}>
              <div className="cg-panel">
                <div className="cg-panel__header cg-panel__header--wrap">
                  <div className="cg-panel__title">
                    <div className="cg-panel__title-icon"><CalendarCheck size={16} /></div>
                    <h3>All Bookings</h3>
                    <span className="cg-count-chip">{bookings.length}</span>
                  </div>
                  <div className="cg-filter-group">
                    <Filter size={13} />
                    {['All', 'Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled'].map(f => (
                      <button key={f}
                        className={`cg-chip ${bookingFilter === f ? 'cg-chip--active' : ''}`}
                        onClick={() => setBookingFilter(f)}
                      >
                        {f} {f !== 'All' && `(${bookings.filter(b => b.status === f).length})`}
                      </button>
                    ))}
                  </div>
                </div>
                {filteredBookings.length === 0 ? (
                  <EmptyState icon={<ClipboardList size={44} />} title="No bookings found" desc={`No ${bookingFilter !== 'All' ? bookingFilter.toLowerCase() : ''} bookings yet.`} />
                ) : (
                  <motion.div className="cg-card-list" variants={stagger} initial="hidden" animate="show">
                    {filteredBookings.map(b => (
                      <BookingCard key={b._id} booking={b} actionLoading={actionLoading}
                        onApprove={() => handleBookingAction(b._id, 'Approved')}
                        onReject={() => handleBookingAction(b._id, 'Rejected')}
                        onDelete={() => handleDeleteBooking(b._id)} />
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* ═══ PENDING ═══ */}
          {activeTab === 'pending' && (
            <motion.div key="pending" className="cg-tab-content" initial="hidden" animate="show" exit="hidden" variants={fadeIn}>
              <div className="cg-panel">
                <div className="cg-panel__header">
                  <div className="cg-panel__title">
                    <div className="cg-panel__title-icon pending-icon"><Clock size={16} /></div>
                    <h3>Pending Requests</h3>
                  </div>
                  <span className="cg-badge cg-badge--warning"><Bell size={11} /> {pendingBookings.length} pending</span>
                </div>
                {pendingBookings.length === 0 ? (
                  <EmptyState icon={<CheckCircle2 size={44} />} title="All clear!" desc="No pending requests—all caught up." />
                ) : (
                  <motion.div className="cg-card-list" variants={stagger} initial="hidden" animate="show">
                    {pendingBookings.map(b => (
                      <BookingCard key={b._id} booking={b} actionLoading={actionLoading}
                        onApprove={() => handleBookingAction(b._id, 'Approved')}
                        onReject={() => handleBookingAction(b._id, 'Rejected')}
                        onDelete={() => handleDeleteBooking(b._id)} />
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* ═══ SCHEDULE ═══ */}
          {activeTab === 'schedule' && (
            <motion.div key="schedule" className="cg-tab-content" initial="hidden" animate="show" exit="hidden" variants={fadeIn}>
              <div className="cg-panel">
                <div className="cg-panel__header">
                  <div className="cg-panel__title">
                    <div className="cg-panel__title-icon schedule-icon"><CalendarDays size={16} /></div>
                    <h3>My Schedule</h3>
                  </div>
                  <span className="cg-badge cg-badge--success">{approvedBookings.length} upcoming</span>
                </div>
                {approvedBookings.length === 0 ? (
                  <EmptyState icon={<CalendarClock size={44} />} title="No scheduled appointments" desc="Approved bookings will appear here." />
                ) : (
                  <motion.div className="cg-card-list" variants={stagger} initial="hidden" animate="show">
                    {approvedBookings.map(b => (
                      <BookingCard key={b._id} booking={b} actionLoading={actionLoading}
                        onApprove={() => handleBookingAction(b._id, 'Completed')}
                        onDelete={() => handleDeleteBooking(b._id)} showComplete />
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════ */

function EmptyState({ icon, title, desc, compact }) {
  return (
    <div className={`cg-empty ${compact ? 'cg-empty--compact' : ''}`}>
      <div className="cg-empty__icon">{icon}</div>
      <p className="cg-empty__title">{title}</p>
      {desc && <p className="cg-empty__desc">{desc}</p>}
    </div>
  );
}

function BookingCard({ booking, actionLoading, onApprove, onReject, onDelete, showComplete }) {
  const b       = booking;
  const cfg     = STATUS_CFG[b.status] || STATUS_CFG.Pending;
  const StatusIcon = cfg.icon;
  const patient = b.patientId;
  const isL     = (s) => actionLoading === b._id + s;

  return (
    <motion.div className="cg-booking-card" variants={fadeUp} layout>
      <div className="cg-booking-card__status-bar" style={{ background: cfg.color }} />

      <div className="cg-booking-card__avatar">
        <User size={20} />
      </div>

      <div className="cg-booking-card__body">
        <div className="cg-booking-card__top">
          <div>
            <h4 className="cg-booking-card__name">{patient?.name || 'Patient'}</h4>
            <div className="cg-booking-card__meta">
              <span><Calendar size={12} /> {fmtDate(b.date)}</span>
              <span className="cg-time-pill">{fmtTime(b.startTime)} – {fmtTime(b.endTime)}</span>
            </div>
          </div>
          <div className="cg-booking-card__top-right">
            <span className="cg-status-chip" style={{ background: cfg.bg, color: cfg.color }}>
              <StatusIcon size={11} /> {cfg.label}
            </span>
            <span className="cg-booking-card__ago">{timeAgo(b.createdAt)}</span>
          </div>
        </div>

        {(patient?.email || patient?.phone) && (
          <div className="cg-booking-card__contacts">
            {patient?.email && <span><Mail size={11} /> {patient.email}</span>}
            {patient?.phone && <span><Phone size={11} /> {patient.phone}</span>}
          </div>
        )}
        {b.notes && <p className="cg-booking-card__notes">{b.notes}</p>}

        <div className="cg-booking-card__actions">
          {b.status === 'Pending' && !showComplete && (
            <>
              <button className="cg-btn cg-btn--approve" onClick={onApprove} disabled={isL('Approved')}>
                {isL('Approved') ? <Loader2 size={13} className="cg-spin" /> : <Check size={13} />} Approve
              </button>
              <button className="cg-btn cg-btn--reject" onClick={onReject} disabled={isL('Rejected')}>
                {isL('Rejected') ? <Loader2 size={13} className="cg-spin" /> : <X size={13} />} Reject
              </button>
            </>
          )}
          {showComplete && b.status === 'Approved' && (
            <button className="cg-btn cg-btn--complete" onClick={onApprove} disabled={isL('Completed')}>
              {isL('Completed') ? <Loader2 size={13} className="cg-spin" /> : <CheckCircle2 size={13} />} Mark Complete
            </button>
          )}
          <button className="cg-icon-btn cg-icon-btn--danger" onClick={onDelete} disabled={isL('delete')} title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function BookingRow({ booking }) {
  const b   = booking;
  const cfg = STATUS_CFG[b.status] || STATUS_CFG.Pending;
  const StatusIcon = cfg.icon;
  const patient = b.patientId;

  return (
    <div className="cg-compact-row">
      <div className="cg-compact-row__avatar"><User size={14} /></div>
      <div className="cg-compact-row__info">
        <span className="cg-compact-row__name">{patient?.name || 'Patient'}</span>
        <span className="cg-compact-row__date">{fmtDateShort(b.date)} · {fmtTime(b.startTime)}</span>
      </div>
      <span className="cg-status-chip cg-status-chip--sm" style={{ background: cfg.bg, color: cfg.color }}>
        <StatusIcon size={10} /> {cfg.label}
      </span>
    </div>
  );
}

function ScheduleItem({ booking }) {
  const b       = booking;
  const patient = b.patientId;
  return (
    <div className="cg-schedule-item">
      <div className="cg-schedule-item__time">
        <span className="cg-schedule-item__start">{fmtTime(b.startTime)}</span>
        <span className="cg-schedule-item__end">{fmtTime(b.endTime)}</span>
      </div>
      <div className="cg-schedule-item__line" />
      <div className="cg-schedule-item__body">
        <h4>{patient?.name || 'Patient'}</h4>
        {b.notes && <p>{b.notes}</p>}
      </div>
    </div>
  );
}
