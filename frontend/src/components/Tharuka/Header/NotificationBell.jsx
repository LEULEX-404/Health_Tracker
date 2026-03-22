import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, AlertTriangle, CheckCircle, Info, X, BellOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/Imasha/AuthContext';
import {
  getUserNotifications,
  getUserAlerts,
  markNotificationRead,
  markAllNotificationsRead,
  resolveAlert,
  resolveAllAlerts,
} from '../../../services/Tharindu/notificationService';
import './NotificationBell.css';

// Severity → colour class
const SEVERITY_CLASS = {
  Critical: 'notif-pill--critical',
  High:     'notif-pill--high',
  Medium:   'notif-pill--medium',
  Low:      'notif-pill--low',
};

// Notification type → icon
function TypeIcon({ type, severity }) {
  if (type === 'alert' || severity) {
    const cls = severity === 'Critical' || severity === 'High' ? 'notif-icon--danger' : 'notif-icon--warn';
    return <AlertTriangle size={15} className={cls} />;
  }
  if (type === 'email' || type === 'inApp') return <Info size={15} className="notif-icon--info" />;
  return <CheckCircle size={15} className="notif-icon--ok" />;
}

/** Format a date string to a relative label */
function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)   return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [open, setOpen]           = useState(false);
  const [items, setItems]         = useState([]);   // merged notifications + alerts
  const [loading, setLoading]     = useState(false);
  const popupRef = useRef(null);

  const userId = user?._id || user?.id;
  const isPatient = user?.role === 'patient';

  // ── Fetch data ──────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    if (!userId || !token) return;
    setLoading(true);
    try {
      const [notifs, alerts] = await Promise.allSettled([
        getUserNotifications(userId, 5),
        isPatient ? getUserAlerts(userId) : Promise.resolve([]),
      ]);

      const notifList = (notifs.status === 'fulfilled' ? notifs.value : [])
        .filter(n => !n.message.includes('Alert resolved'));
      const alertList = alerts.status === 'fulfilled' ? alerts.value : [];

      // Normalise alerts into notification-like shape
      const mappedAlerts = alertList
        .filter(a => a.status !== 'Resolved' && (a.severity === 'High' || a.severity === 'Critical' || a.isEmergency))
        .slice(0, 5)
        .map(a => ({
          _id: a._id,
          message: `${a.parameter} reading of ${a.value} is out of range (${a.severity} severity)`,
          isRead: a.status === 'Acknowledged',
          createdAt: a.triggeredAt || a.createdAt,
          type: 'alert',
          severity: a.severity,
        }));

      // Merge: alerts first, then notifications; keep max 5
      const merged = [...mappedAlerts, ...notifList].slice(0, 5);
      setItems(merged);
    } catch (_) {
      // silent fail – don't break the header
    } finally {
      setLoading(false);
    }
  }, [userId, token, isPatient]);

  // Fetch on mount and every 60 s
  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, 60_000);
    return () => clearInterval(id);
  }, [fetchAll]);

  // Close popup when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Handlers ────────────────────────────────────────────────
  const handleMarkRead = async (item) => {
    try {
      if (item.type === 'alert') {
        await resolveAlert(item._id);
        navigate('/profile#alerts'); // Fallback route assuming profile handles alerts or nav
        setOpen(false); // Close popup
      } else {
        await markNotificationRead(item._id);
      }
      setItems(prev => prev.filter(n => n._id !== item._id)); 
    } catch (_) {}
  };

  const handleMarkAllRead = async () => {
    if (!userId) return;
    try {
      await Promise.allSettled([
        markAllNotificationsRead(userId),
        isPatient ? resolveAllAlerts(userId) : Promise.resolve()
      ]);
      setItems([]); 
    } catch (_) {}
  };

  // Derived
  const unreadCount = items.length;
  const hasUnread   = items.length > 0;

  return (
    <div className="pn-notifbell" ref={popupRef}>
      {/* Bell button */}
      <button
        className={`pn-hctrl__icon-btn pn-notifbell__btn ${open ? 'active' : ''}`}
        aria-label="Notifications"
        onClick={() => { setOpen(prev => !prev); if (!open) fetchAll(); }}
      >
        <Bell size={20} />
        {hasUnread && <span className="pn-notifbell__dot" aria-hidden="true" />}
      </button>

      {/* Popup */}
      {open && (
        <div className="pn-notifbell__popup glass">
          {/* Header row */}
          <div className="pn-notifbell__header">
            <span className="pn-notifbell__title">
              Notifications {hasUnread && <span className="pn-notifbell__count">{unreadCount}</span>}
            </span>
            <div className="pn-notifbell__hdr-actions">
              {hasUnread && (
                <button className="pn-notifbell__mark-all" onClick={handleMarkAllRead} title="Mark all as read">
                  <CheckCircle size={14} /> All read
                </button>
              )}
              <button className="pn-notifbell__close-btn" onClick={() => setOpen(false)}>
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="pn-notifbell__body">
            {loading ? (
              <div className="pn-notifbell__empty">
                <div className="pn-notifbell__spinner" />
              </div>
            ) : items.length === 0 ? (
              <div className="pn-notifbell__empty">
                <CheckCircle size={32} className="pn-notifbell__empty-icon" style={{ color: 'var(--primary-color)', opacity: 1 }} />
                <p style={{ marginTop: '4px', fontWeight: 500, color: 'var(--text-primary)' }}>All alerts have been read</p>
                <span style={{ fontSize: '0.75rem' }}>You're all caught up!</span>
              </div>
            ) : (
              <ul className="pn-notifbell__list">
                {items.map(item => (
                  <li
                    key={item._id}
                    className={`pn-notifbell__item ${!item.isRead ? 'unread' : ''}`}
                    onClick={() => handleMarkRead(item)}
                  >
                    <div className="pn-notifbell__item-icon">
                      <TypeIcon type={item.type} severity={item.severity} />
                    </div>
                    <div className="pn-notifbell__item-body">
                      <p className="pn-notifbell__item-msg">{item.message}</p>
                      <div className="pn-notifbell__item-meta">
                        {item.severity && (
                          <span className={`pn-notifbell__pill ${SEVERITY_CLASS[item.severity] || ''}`}>
                            {item.severity}
                          </span>
                        )}
                        <span className="pn-notifbell__time">{timeAgo(item.createdAt)}</span>
                      </div>
                    </div>
                    {!item.isRead && <span className="pn-notifbell__unread-dot" />}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
