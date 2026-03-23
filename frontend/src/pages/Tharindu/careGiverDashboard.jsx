import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarCheck, Clock, CheckCircle2, XCircle, ChevronRight,
  Shield, LogOut, Trash2, Filter, RefreshCw, User, LayoutDashboard,
  Calendar, ClipboardList, Check, X, Loader2, UserCheck, UserX,
  CalendarDays, CalendarClock, Mail, Phone
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/Imasha/AuthContext';
import { getMyBookings, updateBookingStatus, deleteBooking } from '../../utils/Tharindu/caregiverApi';
import Logo from '../../components/Tharuka/Common/Logo';
import '../../styles/Tharindu/careGiver.css';

/* ─── animation presets ─── */
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

/* ─── helper: time formatting ─── */
const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
const fmtDateShort = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const fmtTime = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hr = parseInt(h, 10);
  return `${hr > 12 ? hr - 12 : hr || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
};
const timeAgo = (d) => {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return 'Just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

/* ─── status config ─── */
const STATUS_CFG = {
  Pending:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: Clock,         label: 'Pending' },
  Approved:  { color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: CheckCircle2,   label: 'Approved' },
  Rejected:  { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  icon: XCircle,        label: 'Rejected' },
  Completed: { color: '#00c897', bg: 'rgba(0,200,151,0.12)',  icon: CheckCircle2,   label: 'Completed' },
  Cancelled: { color: '#6b9b80', bg: 'rgba(107,155,128,0.12)', icon: X,             label: 'Cancelled' },
};

const SIDEBAR_ITEMS = [
  { key: 'overview',  label: 'Overview',       icon: LayoutDashboard },
  { key: 'bookings',  label: 'All Bookings',   icon: CalendarCheck },
  { key: 'pending',   label: 'Pending',        icon: Clock },
  { key: 'schedule',  label: 'My Schedule',    icon: CalendarDays },
];

/* ═══════════════════════════════════════════════════════════
   CAREGIVER DASHBOARD
   ═══════════════════════════════════════════════════════════ */
export default function CaregiverDashboard() {
  const { user, token, logout } = useAuth();

  // Redirect patients/admins who might manually browse here
  if (user && user.role !== 'caregiver') {
    return <Navigate to="/" replace />;
  }

  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookingFilter, setBookingFilter] = useState('All');
  const [actionLoading, setActionLoading] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ── fetch bookings ── */
  const fetchBookings = useCallback(async (silent = false) => {
    if (!token || !user) return;
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await getMyBookings(token);
      setBookings(res?.data || res || []);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, user]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

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
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'Pending').length,
    approved: bookings.filter(b => b.status === 'Approved').length,
    completed: bookings.filter(b => b.status === 'Completed').length,
  }), [bookings]);

  const pendingBookings = useMemo(() => bookings.filter(b => b.status === 'Pending'), [bookings]);
  const approvedBookings = useMemo(() => bookings.filter(b => b.status === 'Approved'), [bookings]);

  const filteredBookings = useMemo(() => {
    if (bookingFilter === 'All') return bookings;
    return bookings.filter(b => b.status === bookingFilter);
  }, [bookings, bookingFilter]);

  /* ── today's schedule ── */
  const todayStr = new Date().toDateString();
  const todayBookings = useMemo(() =>
    bookings.filter(b => b.status === 'Approved' && new Date(b.date).toDateString() === todayStr),
  [bookings, todayStr]);

  if (loading) {
    return (
      <div className="cg-dashboard cg-dashboard--loading">
        <div className="cg-loading">
          <div className="cg-loading__spinner" />
          <p>Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cg-dashboard">
        {/* ─── Mobile toggle ─── */}
        <button className="cg-sidebar-toggle" onClick={() => setSidebarOpen(o => !o)} aria-label="Toggle sidebar">
          <LayoutDashboard size={20} />
        </button>

        {/* ─── Sidebar ─── */}
        {sidebarOpen && <div className="cg-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
        <aside className={`cg-sidebar ${sidebarOpen ? 'cg-sidebar--open' : ''}`}>
          
          <div className="cg-sidebar__box">
            <div className="cg-sidebar__brand">
              <Logo />
            </div>
          </div>

          <div className="cg-sidebar__box" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="cg-sidebar__profile">
              <div className="cg-sidebar__avatar">
                {user?.name?.[0]?.toUpperCase() || 'C'}
              </div>
              <div className="cg-sidebar__info">
                <h4>{user?.name || 'Caregiver'}</h4>
                <span className="cg-sidebar__role">
                  <Shield size={12} /> Caregiver
                </span>
              </div>
            </div>

            <nav className="cg-sidebar__nav">
              {SIDEBAR_ITEMS.map(item => {
                const Icon = item.icon;
                const badge = item.key === 'pending' ? stats.pending : 0;
                return (
                  <button
                    key={item.key}
                    className={`cg-sidebar__link ${activeTab === item.key ? 'cg-sidebar__link--active' : ''}`}
                    onClick={() => { setActiveTab(item.key); setSidebarOpen(false); }}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                    {badge > 0 && <span className="cg-sidebar__badge">{badge}</span>}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="cg-sidebar__box" style={{ padding: '0.75rem' }}>
            <button className="cg-sidebar__logout" onClick={logout}>
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* ─── Main Content ─── */}
        <main className="cg-main">
          {/* Welcome bar */}
          <motion.div className="cg-welcome" initial="hidden" animate="show" variants={fadeUp}>
            <div className="cg-welcome__text">
              <h2>Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0] || 'Caregiver'}</span></h2>
              <p>Manage your patient appointments and schedule</p>
            </div>
            <button className={`cg-refresh-btn ${refreshing ? 'cg-refresh-btn--spinning' : ''}`} onClick={() => fetchBookings(true)} disabled={refreshing}>
              <RefreshCw size={16} /> {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          </motion.div>

          {/* ── Stats ── */}
          <motion.div className="cg-stats" variants={stagger} initial="hidden" animate="show">
            {[
              { label: 'Total Bookings',   value: stats.total,     icon: CalendarCheck, accent: '#00c897' },
              { label: 'Pending Requests',  value: stats.pending,   icon: Clock,         accent: '#f59e0b' },
              { label: 'Approved',          value: stats.approved,  icon: UserCheck,     accent: '#10b981' },
              { label: 'Completed',         value: stats.completed, icon: CheckCircle2,  accent: '#00b4d8' },
            ].map(s => {
              const Icon = s.icon;
              return (
                <motion.div key={s.label} className="cg-stat-card glass" variants={fadeUp}>
                  <div className="cg-stat-card__icon" style={{ background: `${s.accent}15`, color: s.accent }}>
                    <Icon size={24} />
                  </div>
                  <div className="cg-stat-card__body">
                    <span className="cg-stat-card__value">{s.value}</span>
                    <span className="cg-stat-card__label">{s.label}</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* ── Tab Content ── */}
          <AnimatePresence mode="wait">

            {/* ═══ OVERVIEW ═══ */}
            {activeTab === 'overview' && (
              <motion.div key="overview" className="cg-content" initial="hidden" animate="show" exit="hidden" variants={fadeUp}>
                <div className="cg-content-grid">
                  {/* Pending Requests — highlight section */}
                  <div className="cg-panel glass cg-panel--full">
                    <div className="cg-panel__header">
                      <h3><Clock size={20} /> Pending Requests</h3>
                      {pendingBookings.length > 0 && (
                        <span className="cg-panel__badge">{pendingBookings.length} awaiting response</span>
                      )}
                    </div>
                    {pendingBookings.length === 0 ? (
                      <div className="cg-empty">
                        <CheckCircle2 size={44} />
                        <p>All caught up! No pending requests.</p>
                      </div>
                    ) : (
                      <div className="cg-booking-list">
                        {pendingBookings.map(b => (
                          <BookingCard key={b._id} booking={b} actionLoading={actionLoading} onApprove={() => handleBookingAction(b._id, 'Approved')} onReject={() => handleBookingAction(b._id, 'Rejected')} onDelete={() => handleDeleteBooking(b._id)} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Today's Schedule */}
                  <div className="cg-panel glass">
                    <div className="cg-panel__header">
                      <h3><CalendarDays size={20} /> Today's Schedule</h3>
                    </div>
                    {todayBookings.length === 0 ? (
                      <div className="cg-empty cg-empty--compact">
                        <CalendarClock size={36} />
                        <p>No appointments scheduled for today</p>
                      </div>
                    ) : (
                      <div className="cg-schedule-list">
                        {todayBookings.map(b => (
                          <ScheduleItem key={b._id} booking={b} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Activity */}
                  <div className="cg-panel glass">
                    <div className="cg-panel__header">
                      <h3><CalendarCheck size={20} /> Recent Bookings</h3>
                      <button className="cg-link-btn" onClick={() => setActiveTab('bookings')}>View all <ChevronRight size={14} /></button>
                    </div>
                    {bookings.length === 0 ? (
                      <div className="cg-empty cg-empty--compact">
                        <ClipboardList size={36} />
                        <p>No bookings yet</p>
                      </div>
                    ) : (
                      <div className="cg-booking-list cg-booking-list--compact">
                        {bookings.slice(0, 4).map(b => (
                          <BookingRow key={b._id} booking={b} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ═══ ALL BOOKINGS ═══ */}
            {activeTab === 'bookings' && (
              <motion.div key="bookings" className="cg-content" initial="hidden" animate="show" exit="hidden" variants={fadeUp}>
                <div className="cg-panel glass">
                  <div className="cg-panel__header">
                    <h3><CalendarCheck size={20} /> All Bookings</h3>
                    <div className="cg-filter-group">
                      <Filter size={14} />
                      {['All', 'Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled'].map(f => (
                        <button key={f} className={`cg-filter-chip ${bookingFilter === f ? 'cg-filter-chip--active' : ''}`} onClick={() => setBookingFilter(f)}>
                          {f} {f !== 'All' ? `(${bookings.filter(b => b.status === f).length})` : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                  {filteredBookings.length === 0 ? (
                    <div className="cg-empty">
                      <ClipboardList size={44} />
                      <p>No {bookingFilter !== 'All' ? bookingFilter.toLowerCase() : ''} bookings found</p>
                    </div>
                  ) : (
                    <div className="cg-booking-list">
                      {filteredBookings.map(b => (
                        <BookingCard key={b._id} booking={b} actionLoading={actionLoading} onApprove={() => handleBookingAction(b._id, 'Approved')} onReject={() => handleBookingAction(b._id, 'Rejected')} onDelete={() => handleDeleteBooking(b._id)} />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ═══ PENDING ═══ */}
            {activeTab === 'pending' && (
              <motion.div key="pending" className="cg-content" initial="hidden" animate="show" exit="hidden" variants={fadeUp}>
                <div className="cg-panel glass">
                  <div className="cg-panel__header">
                    <h3><Clock size={20} /> Pending Requests</h3>
                    <span className="cg-panel__badge">{pendingBookings.length} pending</span>
                  </div>
                  {pendingBookings.length === 0 ? (
                    <div className="cg-empty">
                      <CheckCircle2 size={44} />
                      <p>No pending requests — all caught up!</p>
                    </div>
                  ) : (
                    <div className="cg-booking-list">
                      {pendingBookings.map(b => (
                        <BookingCard key={b._id} booking={b} actionLoading={actionLoading} onApprove={() => handleBookingAction(b._id, 'Approved')} onReject={() => handleBookingAction(b._id, 'Rejected')} onDelete={() => handleDeleteBooking(b._id)} />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ═══ SCHEDULE ═══ */}
            {activeTab === 'schedule' && (
              <motion.div key="schedule" className="cg-content" initial="hidden" animate="show" exit="hidden" variants={fadeUp}>
                <div className="cg-panel glass">
                  <div className="cg-panel__header">
                    <h3><CalendarDays size={20} /> My Schedule</h3>
                    <span className="cg-panel__badge">{approvedBookings.length} upcoming</span>
                  </div>
                  {approvedBookings.length === 0 ? (
                    <div className="cg-empty">
                      <CalendarClock size={44} />
                      <p>No scheduled appointments</p>
                    </div>
                  ) : (
                    <div className="cg-booking-list">
                      {approvedBookings.map(b => (
                        <BookingCard key={b._id} booking={b} actionLoading={actionLoading} onApprove={() => handleBookingAction(b._id, 'Completed')} onDelete={() => handleDeleteBooking(b._id)} showComplete />
                      ))}
                    </div>
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

/* Full booking card with actions */
function BookingCard({ booking, actionLoading, onApprove, onReject, onDelete, showComplete }) {
  const b = booking;
  const cfg = STATUS_CFG[b.status] || STATUS_CFG.Pending;
  const StatusIcon = cfg.icon;
  const patient = b.patientId;
  const isLoading = (s) => actionLoading === b._id + s;

  return (
    <motion.div className="cg-booking-card" variants={fadeUp} layout>
      <div className="cg-booking-card__left">
        <div className="cg-booking-card__avatar">
          <User size={22} />
        </div>
        <div className="cg-booking-card__details">
          <h4>{patient?.name || 'Patient'}</h4>
          <div className="cg-booking-card__meta">
            <span><Calendar size={13} /> {fmtDate(b.date)}</span>
            <span className="cg-booking-card__time-pill">{fmtTime(b.startTime)} – {fmtTime(b.endTime)}</span>
          </div>
          {patient?.email && (
            <span className="cg-booking-card__contact"><Mail size={12} /> {patient.email}</span>
          )}
          {patient?.phone && (
            <span className="cg-booking-card__contact"><Phone size={12} /> {patient.phone}</span>
          )}
          {b.notes && <p className="cg-booking-card__notes">{b.notes}</p>}
        </div>
      </div>

      <div className="cg-booking-card__right">
        <div className="cg-booking-card__status" style={{ background: cfg.bg, color: cfg.color }}>
          <StatusIcon size={13} /> {cfg.label}
        </div>
        <span className="cg-booking-card__ago">{timeAgo(b.createdAt)}</span>

        <div className="cg-booking-card__actions">
          {b.status === 'Pending' && !showComplete && (
            <>
              <button className="cg-action-btn cg-action-btn--approve" onClick={onApprove} disabled={isLoading('Approved')}>
                {isLoading('Approved') ? <Loader2 size={14} className="cg-spin" /> : <CheckCircle2 size={14} />} Approve
              </button>
              <button className="cg-action-btn cg-action-btn--reject" onClick={onReject} disabled={isLoading('Rejected')}>
                {isLoading('Rejected') ? <Loader2 size={14} className="cg-spin" /> : <XCircle size={14} />} Reject
              </button>
            </>
          )}
          {showComplete && b.status === 'Approved' && (
            <button className="cg-action-btn cg-action-btn--complete" onClick={onApprove} disabled={isLoading('Completed')}>
              {isLoading('Completed') ? <Loader2 size={14} className="cg-spin" /> : <CheckCircle2 size={14} />} Mark Complete
            </button>
          )}
          <button className="cg-icon-btn cg-icon-btn--danger" onClick={onDelete} disabled={isLoading('delete')} title="Delete booking">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* Compact booking row for recent activity */
function BookingRow({ booking }) {
  const b = booking;
  const cfg = STATUS_CFG[b.status] || STATUS_CFG.Pending;
  const StatusIcon = cfg.icon;
  const patient = b.patientId;

  return (
    <div className="cg-booking-row-compact">
      <div className="cg-booking-row-compact__avatar">
        <User size={16} />
      </div>
      <div className="cg-booking-row-compact__info">
        <span className="cg-booking-row-compact__name">{patient?.name || 'Patient'}</span>
        <span className="cg-booking-row-compact__date">{fmtDateShort(b.date)} · {fmtTime(b.startTime)}</span>
      </div>
      <div className="cg-booking-row-compact__status" style={{ background: cfg.bg, color: cfg.color }}>
        <StatusIcon size={11} /> {cfg.label}
      </div>
    </div>
  );
}

/* Schedule item for today */
function ScheduleItem({ booking }) {
  const b = booking;
  const patient = b.patientId;

  return (
    <div className="cg-schedule-item">
      <div className="cg-schedule-item__time">
        <span className="cg-schedule-item__start">{fmtTime(b.startTime)}</span>
        <span className="cg-schedule-item__end">{fmtTime(b.endTime)}</span>
      </div>
      <div className="cg-schedule-item__line" />
      <div className="cg-schedule-item__details">
        <h4>{patient?.name || 'Patient'}</h4>
        {b.notes && <p>{b.notes}</p>}
      </div>
    </div>
  );
}
