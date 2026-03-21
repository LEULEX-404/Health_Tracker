import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/Imasha/AuthContext';
import { getAllAlerts, acknowledgeAlert, resolveAlert } from '../../utils/Tharindu/adminAlertsApi';
import { Bell, AlertTriangle, CheckCircle, Loader2, Activity, Heart, Wind, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PatientAlertsTab() {
  const { token, user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');

  const fetchAlerts = useCallback(async () => {
    if (!user || (!user.id && !user._id)) return;
    setLoading(true);
    try {
      const userId = user.id || user._id;
      const data = await getAllAlerts(token, userId);
      setAlerts(data);
    } catch (err) {
      toast.error('Failed to load your alerts');
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  /* ─── ACTIONS ─── */
  const handleAcknowledge = async (id) => {
    setActionLoading(id + 'ack');
    try {
      // Patient acknowledges their own alert
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

  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      if (statusFilter !== 'All' && a.status !== statusFilter) return false;
      if (severityFilter !== 'All' && a.severity !== severityFilter) return false;
      return true;
    });
  }, [alerts, statusFilter, severityFilter]);

  return (
    <div className="tharindu-patient-alerts">
      <div className="tharindu-filters-bar mb-4" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', background: 'var(--admin-card-bg)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--admin-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--admin-text-muted)', fontWeight: '600', fontSize: '14px' }}>
          <Filter size={18} /> Filters:
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="tharindu-filter-select" style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--admin-text)' }}>
          <option value="All">All Statuses</option>
          <option value="New">New</option>
          <option value="Acknowledged">Acknowledged</option>
          <option value="Resolved">Resolved</option>
        </select>
        <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="tharindu-filter-select" style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--admin-text)' }}>
          <option value="All">All Severities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>
      </div>

      <div className="tharindu-alerts-grid" style={{ display: 'grid', gap: '1rem' }}>
        {loading ? (
          <div className="loading-state" style={{ padding: '2rem', textAlign: 'center', color: 'var(--admin-text-muted)' }}><Loader2 className="spin inline-icon" /> Loading your health alerts...</div>
        ) : filteredAlerts.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem', textAlign: 'center', color: 'var(--admin-text-muted)', background: 'var(--admin-card-bg)', borderRadius: '12px', border: '1px dashed var(--admin-border)' }}>
            <Bell size={24} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
            No alerts found based on your filters.
          </div>
        ) : (
          filteredAlerts.map(a => (
            <div key={a._id} className={`tharindu-alert-card ${a.status === 'New' ? 'new-alert' : ''}`} style={{ background: 'var(--admin-card-bg)', padding: '1.25rem', borderRadius: '12px', border: `1px solid ${a.status === 'New' ? 'rgba(239, 68, 68, 0.3)' : 'var(--admin-border)'}`, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span className={`status-pill tharindu-severity-${a.severity?.toLowerCase() || 'low'}`}>
                      {a.severity}
                    </span>
                    <span className={`status-pill ${a.status === 'Resolved' ? 'success' : a.status === 'Acknowledged' ? 'active' : 'warn'}`}>
                      {a.status}
                    </span>
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--admin-text)' }}>
                    {a.parameter === 'HeartRate' && <Heart size={18} />}
                    {a.parameter === 'Oxygen' && <Wind size={18} />}
                    {a.parameter === 'GlucoseLevel' && <Activity size={18} />}
                    {a.parameter} Alert
                  </h3>
                  <p style={{ margin: '0.4rem 0 0', fontSize: '0.9rem', color: 'var(--admin-text-muted)' }}>
                    Recorded Value: <strong style={{ color: 'var(--admin-text)' }}>{a.value}</strong>
                  </p>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
                    {new Date(a.triggeredAt).toLocaleString()}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {a.status === 'New' && (
                    <button 
                      onClick={() => handleAcknowledge(a._id)} 
                      style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      disabled={actionLoading !== null}
                    >
                      {actionLoading === a._id + 'ack' ? <Loader2 size={16} className="spin" /> : <AlertTriangle size={16} />} 
                      Acknowledge
                    </button>
                  )}
                  {(a.status === 'New' || a.status === 'Acknowledged') && (
                    <button 
                      onClick={() => handleResolve(a._id)}
                      style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      disabled={actionLoading !== null}
                    >
                      {actionLoading === a._id + 'res' ? <Loader2 size={16} className="spin" /> : <CheckCircle size={16} />} 
                      Mark Resolved
                    </button>
                  )}
                </div>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
