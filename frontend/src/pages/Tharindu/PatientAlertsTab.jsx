import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/Imasha/AuthContext';
import { getAllAlerts, acknowledgeAlert, resolveAlert } from '../../utils/Tharindu/adminAlertsApi';
import {
  Bell, AlertTriangle, CheckCircle, Loader2, Activity,
  Heart, Wind, Thermometer, Droplets, Filter, CheckCircle2, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import './PatientAlertsTab.css';

export default function PatientAlertsTab() {
  const { token, user } = useAuth();
  const [alerts, setAlerts]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [statusFilter, setStatusFilter]   = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');

  const fetchAlerts = useCallback(async () => {
    if (!user || (!user.id && !user._id)) return;
    setLoading(true);
    try {
      const userId = user.id || user._id;
      const data   = await getAllAlerts(token, userId);
      setAlerts(data);
    } catch {
      toast.error('Failed to load your alerts');
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  /* ── actions ── */
  const handleAcknowledge = async (id) => {
    setActionLoading(id + 'ack');
    try {
      await acknowledgeAlert(token, id, user.id || user._id);
      toast.success('Alert acknowledged');
      fetchAlerts();
    } catch (e) { toast.error(e.message); }
    finally { setActionLoading(null); }
  };

  const handleResolve = async (id) => {
    setActionLoading(id + 'res');
    try {
      await resolveAlert(token, id);
      toast.success('Alert resolved');
      fetchAlerts();
    } catch (e) { toast.error(e.message); }
    finally { setActionLoading(null); }
  };

  const handleMarkAllResolved = async () => {
    setActionLoading('all');
    try {
      const active = alerts.filter(a => a.status !== 'Resolved');
      await Promise.allSettled(active.map(a => resolveAlert(token, a._id)));
      toast.success('All alerts resolved');
      fetchAlerts();
    } catch { toast.error('Failed to resolve some alerts'); }
    finally { setActionLoading(null); }
  };

  /* ── filter + limit ── */
  const filteredAlerts = useMemo(() =>
    alerts
      .filter(a => {
        if (statusFilter   !== 'All' && a.status   !== statusFilter)   return false;
        if (severityFilter !== 'All' && a.severity !== severityFilter) return false;
        return true;
      })
      .slice(0, 5),   // max 5
  [alerts, statusFilter, severityFilter]);

  const hasUnresolved = alerts.some(a => a.status !== 'Resolved');

  /* ── helpers ── */
  const getParamMeta = (param = '') => {
    const p = param.toLowerCase();
    if (p.includes('heart'))    return { Icon: Heart,       cls: 'heartrate',     unit: 'bpm',  label: 'Heart Rate'    };
    if (p.includes('oxygen'))   return { Icon: Wind,        cls: 'oxygen',        unit: '%',    label: 'SpO₂'          };
    if (p.includes('glucose'))  return { Icon: Droplets,    cls: 'glucose',       unit: 'mg/dL',label: 'Glucose'       };
    if (p.includes('pressure')) return { Icon: Heart,       cls: 'bloodpressure', unit: 'mmHg', label: 'Blood Pressure'};
    if (p.includes('temp'))     return { Icon: Thermometer, cls: 'temperature',   unit: '°C',   label: 'Temperature'   };
    return                             { Icon: Activity,    cls: 'default',       unit: '',     label: param            };
  };

  /** How far is value outside normal? Returns 0-100 for the bar */
  const calcBarPct = (value, min, max) => {
    if (value == null) return 50;
    if (value > max) return Math.min(100, 50 + ((value - max) / (max || 1)) * 50);
    if (value < min) return Math.min(100, 50 + ((min - value) / (min || 1)) * 50);
    return 20; // within range (shouldn't happen for an alert, but fallback)
  };

  const fmt = (d) => new Date(d).toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="ims-alerts-tab">
      {/* ── Filter bar ── */}
      <div className="ims-alerts-filter-bar">
        <div className="ims-alerts-filter-group">
          <div className="ims-alerts-filter-label"><Filter size={15} /> Filters:</div>

          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="ims-alerts-select">
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Acknowledged">Acknowledged</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} className="ims-alerts-select">
            <option value="All">All Severities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        <button
          className="ims-alerts-mark-all-btn"
          onClick={handleMarkAllResolved}
          disabled={!hasUnresolved || actionLoading === 'all'}
        >
          {actionLoading === 'all'
            ? <Loader2 size={15} className="spin" />
            : <CheckCircle2 size={15} />}
          All Read
        </button>
      </div>

      {/* ── Alerts list ── */}
      <div className="ims-alerts-grid">
        {loading ? (
          <div className="ims-alerts-state">
            <Loader2 size={40} className="spin ims-alerts-state-icon" style={{ color: 'var(--p-cyan)' }} />
            <p>Syncing Health Alerts…</p>
            <span>Securely fetching your monitoring data</span>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="ims-alerts-state">
            <CheckCircle size={48} className="ims-alerts-state-icon" style={{ color: 'var(--p-green)' }} />
            <p>All alerts have been read</p>
            <span>You're all caught up!</span>
          </div>
        ) : (
          <AnimatePresence>
            {filteredAlerts.map(a => {
              const { Icon, cls, unit, label } = getParamMeta(a.parameter);
              const barPct = calcBarPct(a.value, a.minThreshold, a.maxThreshold);
              const sev    = (a.severity || 'low').toLowerCase();
              const isResolved = a.status === 'Resolved';
              const anyLoading = actionLoading !== null;

              return (
                <motion.div
                  key={a._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                  className={`ims-alert-card status-${a.status}`}
                >
                  {/* ── LEFT: info ── */}
                  <div className="ims-alert-left">
                    {/* Pills */}
                    <div className="ims-alert-pills">
                      <span className={`ims-pill severity-${sev}`}>{a.severity}</span>
                      <span className={`ims-pill status-${a.status.toLowerCase()}`}>{a.status}</span>
                    </div>

                    {/* Title */}
                    <h3 className="ims-alert-title">
                      <div className={`ims-alert-icon-wrap ${cls}`}><Icon size={16} /></div>
                      {label} Alert
                    </h3>

                    {/* Detail chips */}
                    <div className="ims-alert-detail-grid">
                      <div className="ims-alert-detail-chip">
                        <span className="ims-alert-detail-chip-label">Recorded Value</span>
                        <span className="ims-alert-detail-chip-value">{a.value} {unit}</span>
                      </div>
                      {a.minThreshold != null && (
                        <div className="ims-alert-detail-chip">
                          <span className="ims-alert-detail-chip-label">Normal Min</span>
                          <span className="ims-alert-detail-chip-value">{a.minThreshold} {unit}</span>
                        </div>
                      )}
                      {a.maxThreshold != null && (
                        <div className="ims-alert-detail-chip">
                          <span className="ims-alert-detail-chip-label">Normal Max</span>
                          <span className="ims-alert-detail-chip-value">{a.maxThreshold} {unit}</span>
                        </div>
                      )}
                      {a.isEmergency && (
                        <div className="ims-alert-detail-chip">
                          <span className="ims-alert-detail-chip-label">Type</span>
                          <span className="ims-alert-detail-chip-value" style={{ color: '#ef4444' }}>🚨 Emergency</span>
                        </div>
                      )}
                    </div>

                    {/* Deviation bar */}
                    {a.value != null && (
                      <div className="ims-alert-value-bar-wrap">
                        <div className="ims-alert-value-bar-label">
                          <span>Deviation from Normal</span>
                          <span>{barPct.toFixed(0)}%</span>
                        </div>
                        <div className="ims-alert-value-bar-track">
                          <div
                            className={`ims-alert-value-bar-fill bar-${sev}`}
                            style={{ width: `${barPct}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Timestamp */}
                    <p className="ims-alert-time">
                      <Clock size={12} />
                      {fmt(a.triggeredAt || a.createdAt)}
                    </p>
                  </div>

                  {/* ── RIGHT: actions ── */}
                  <div className="ims-alert-right">
                    {/* Resolve */}
                    <button
                      className={`ims-alert-resolve-btn ${isResolved ? 'resolved' : ''}`}
                      onClick={() => !isResolved && handleResolve(a._id)}
                      disabled={isResolved || anyLoading}
                      title={isResolved ? 'Already resolved' : 'Mark as resolved'}
                    >
                      {actionLoading === a._id + 'res'
                        ? <Loader2 size={22} className="spin" />
                        : <CheckCircle size={22} />}
                      {isResolved ? 'Resolved' : 'Mark Resolved'}
                    </button>

                    {/* Acknowledge (only if New) */}
                    {a.status === 'New' && (
                      <button
                        className="ims-alert-ack-btn"
                        onClick={() => handleAcknowledge(a._id)}
                        disabled={anyLoading}
                      >
                        {actionLoading === a._id + 'ack'
                          ? <Loader2 size={13} className="spin" />
                          : <AlertTriangle size={13} />}
                        Acknowledge
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
