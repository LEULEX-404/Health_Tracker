import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/Imasha/AuthContext';
import { getAllUsers } from '../../utils/Imasha/adminApi';
import { getAllAlerts, deleteAlert, deleteAllAlerts, getAlertSettings, updateAlertSettings } from '../../utils/Tharindu/adminAlertsApi';
import { Bell, Settings, Trash2, Save, Loader2, Activity, Heart, Wind, Search, Filter, ChevronLeft, ChevronRight, AlertTriangle, User } from 'lucide-react';
import toast from 'react-hot-toast';
import '../../styles/Tharindu/adminAlerts.css';

export default function AdminAlertsTab() {
  const { token } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('monitoring'); // 'monitoring' | 'settings'
  
  // Monitoring State
  const [alerts, setAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Settings State
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [settings, setSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Fetch Patients List
  const fetchPatientsList = useCallback(async () => {
    try {
      const data = await getAllUsers(token, { role: 'patient' });
      setPatients(data.data || []);
      if (data.data && data.data.length > 0) {
        setSelectedPatient(data.data[0]._id);
      }
    } catch (err) {
      toast.error('Failed to load patients list');
    }
  }, [token]);

  // Fetch Alerts
  const fetchAlerts = useCallback(async () => {
    setLoadingAlerts(true);
    try {
      const data = await getAllAlerts(token);
      setAlerts(data);
    } catch (err) {
      toast.error('Failed to load system alerts');
    } finally {
      setLoadingAlerts(false);
    }
  }, [token]);

  // Initial Load
  useEffect(() => {
    fetchPatientsList().then(() => fetchAlerts());
  }, [fetchAlerts, fetchPatientsList]);

  // Fetch Settings when patient changes
  useEffect(() => {
    if (selectedPatient && activeSubTab === 'settings') {
      const fetchSettings = async () => {
        setLoadingSettings(true);
        try {
          const data = await getAlertSettings(token, selectedPatient);
          setSettings(data);
        } catch (err) {
          toast.error('Failed to load patient alert settings');
        } finally {
          setLoadingSettings(false);
        }
      };
      fetchSettings();
    }
  }, [selectedPatient, token, activeSubTab]);

  /* ─── ALERT ACTIONS (Admin only views & deletes) ─── */
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this alert log?')) return;
    setActionLoading(id + 'del');
    try {
      await deleteAlert(token, id);
      toast.success('Alert deleted');
      fetchAlerts();
    } catch (e) { toast.error(e.message); }
    finally { setActionLoading(null); }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('WARNING: Are you sure you want to delete ALL system alerts? This action cannot be undone.')) return;
    setActionLoading('deleteAll');
    try {
      await deleteAllAlerts(token);
      toast.success('All alerts deleted successfully');
      fetchAlerts();
    } catch (e) { toast.error(e.message); }
    finally { setActionLoading(null); }
  };

  /* ─── SETTINGS ACTIONS ─── */
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!settings) return;
    setSavingSettings(true);
    try {
      await updateAlertSettings(token, selectedPatient, settings);
      toast.success('Alert settings updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update settings');
    } finally {
      setSavingSettings(false);
    }
  };

  /* ─── FILTERING & PAGINATION ─── */
  const enrichedAlerts = useMemo(() => {
    return alerts.map(alert => {
      const patient = patients.find(p => p._id === alert.userId);
      return {
        ...alert,
        patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient',
        patientEmail: patient ? patient.email : 'No Email'
      };
    });
  }, [alerts, patients]);

  const filteredAlerts = useMemo(() => {
    return enrichedAlerts.filter(a => {
      // Filter by Status
      if (statusFilter !== 'All' && a.status !== statusFilter) return false;
      // Filter by Severity
      if (severityFilter !== 'All' && a.severity !== severityFilter) return false;
      
      // Filter by Search (Name, Email, or Alert ID)
      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        const matchName = a.patientName.toLowerCase().includes(lowerSearch);
        const matchEmail = a.patientEmail.toLowerCase().includes(lowerSearch);
        const matchId = a._id.toLowerCase().includes(lowerSearch);
        if (!matchName && !matchEmail && !matchId) return false;
      }
      return true;
    });
  }, [enrichedAlerts, statusFilter, severityFilter, searchTerm]);

  const totalPages = Math.ceil(filteredAlerts.length / ITEMS_PER_PAGE) || 1;
  const paginatedAlerts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAlerts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAlerts, currentPage]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, severityFilter, searchTerm]);

  return (
    <div className="admin-module-card tharindu-alerts-module">
      <div className="module-header tharindu-tabs-header pb-0">
        <div className="tharindu-tabs">
          <button 
            className={`tharindu-tab ${activeSubTab === 'monitoring' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('monitoring')}
          >
            <Bell size={18} /> System Monitoring
          </button>
          <button 
            className={`tharindu-tab ${activeSubTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('settings')}
          >
            <Settings size={18} /> Patient Alert Settings
          </button>
        </div>
      </div>

      {activeSubTab === 'monitoring' && (
        <>
          <div className="tharindu-filters-bar">
            <div className="tharindu-search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search by Patient Name, Email or Alert ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="tharindu-filter-group">
              <Filter size={18} className="filter-icon" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="tharindu-filter-select">
                <option value="All">All Statuses</option>
                <option value="New">New</option>
                <option value="Acknowledged">Acknowledged</option>
                <option value="Resolved">Resolved</option>
              </select>
              <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="tharindu-filter-select">
                <option value="All">All Severities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            {paginatedAlerts.length > 0 && (
              <button 
                 className="action-btn danger ml-auto" 
                 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                 onClick={handleDeleteAll}
                 disabled={actionLoading !== null}
              >
                {actionLoading === 'deleteAll' ? <Loader2 size={16} className="spin" /> : <Trash2 size={16} />}
                Delete All
              </button>
            )}
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Alert Details</th>
                  <th>Patient</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Time</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingAlerts ? (
                  <tr><td colSpan="6" className="loading-state">Loading active alerts...</td></tr>
                ) : paginatedAlerts.length === 0 ? (
                  <tr><td colSpan="6" className="empty-state">No matching alerts found.</td></tr>
                ) : (
                  paginatedAlerts.map((a) => (
                    <tr key={a._id} className={a.status === 'New' ? 'tharindu-row-new' : ''}>
                      <td>
                        <div className="font-medium text-primary">
                          {a.parameter === 'HeartRate' && <Heart size={14} className="inline-icon" />}
                          {a.parameter === 'Oxygen' && <Wind size={14} className="inline-icon" />}
                          {a.parameter === 'GlucoseLevel' && <Activity size={14} className="inline-icon" />}
                          {' '} {a.parameter}
                        </div>
                        <div className="font-bold text-danger mt-1">{a.value}</div>
                        <div className="text-xs admin-text-muted mt-1" title={a._id}>ID: {...a._id.slice(-6)}</div>
                      </td>
                      <td>
                        <div className="font-medium">{a.patientName}</div>
                        <div className="text-xs admin-text-muted">{a.patientEmail}</div>
                      </td>
                      <td>
                        <span className={`status-pill tharindu-severity-${a.severity?.toLowerCase() || 'low'}`}>
                          {a.severity}
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill ${a.status === 'Resolved' ? 'success' : a.status === 'Acknowledged' ? 'active' : 'warn'}`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="text-sm">{new Date(a.triggeredAt).toLocaleString()}</td>
                      <td className="text-right">
                        <div className="action-btns">
                          <button onClick={() => handleDelete(a._id)} className="action-btn danger" title="Delete Log">
                            {actionLoading === a._id + 'del' ? <Loader2 size={16} className="spin" /> : <Trash2 size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="tharindu-pagination">
              <span className="tharindu-page-info">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredAlerts.length)} of {filteredAlerts.length} entries
              </span>
              <div className="tharindu-page-controls">
                <button 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="tharindu-page-btn"
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                <div className="tharindu-page-numbers">
                  Page {currentPage} of {totalPages}
                </div>
                <button 
                  disabled={currentPage === totalPages} 
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="tharindu-page-btn"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {activeSubTab === 'settings' && (
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2.5rem', minHeight: '500px' }}>
          
          {/* Patient Selector Card */}
          <div style={{ background: 'var(--admin-card-bg)', padding: '1.5rem 2rem', borderRadius: '16px', border: '1px solid var(--admin-border)', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--admin-text)', fontWeight: 600, fontSize: '1.05rem' }}>
              <div style={{ padding: '0.4rem', background: 'rgba(0,180,216,0.1)', borderRadius: '8px', color: 'var(--p-cyan)' }}>
                <User size={18} />
              </div>
              Select Patient to Configure
            </label>
            <div style={{ position: 'relative' }}>
              <select 
                value={selectedPatient} 
                onChange={(e) => setSelectedPatient(e.target.value)}
                style={{ width: '100%', padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--admin-border)', borderRadius: '12px', color: 'var(--admin-text)', fontSize: '1rem', outline: 'none', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}
              >
                {patients.map(p => (
                  <option key={p._id} value={p._id} style={{ color: '#000' }}>
                    {p.firstName} {p.lastName} — {p.email}
                  </option>
                ))}
              </select>
              <div style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--admin-text-muted)' }}>
                <ChevronRight size={18} style={{ transform: 'rotate(90deg)' }} />
              </div>
            </div>
          </div>

          {loadingSettings ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
              <Loader2 className="spin" size={36} color="var(--p-green)" />
            </div>
          ) : settings ? (
            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Thresholds Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                
                {/* Heart Rate */}
                <div style={{ background: 'var(--glass-bg)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--admin-border)', display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--admin-text)', fontWeight: 600 }}>
                    <Heart size={18} color="#ef4444" /> Max Heart Rate (bpm)
                  </label>
                  <input 
                    type="number" 
                    value={settings.heartRateMax || ''} 
                    onChange={e => setSettings({...settings, heartRateMax: e.target.value})} 
                    placeholder="e.g. 100"
                    style={{ padding: '0.8rem 1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', color: 'var(--admin-text)', outline: 'none' }}
                  />
                  <small style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>Triggers alert if patient heart rate exceeds this value.</small>
                </div>

                {/* Oxygen Level */}
                <div style={{ background: 'var(--glass-bg)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--admin-border)', display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--admin-text)', fontWeight: 600 }}>
                    <Wind size={18} color="var(--p-cyan)" /> Min Oxygen Level (%)
                  </label>
                  <input 
                    type="number" 
                    value={settings.oxygenMin || ''} 
                    onChange={e => setSettings({...settings, oxygenMin: e.target.value})} 
                    placeholder="e.g. 95"
                    style={{ padding: '0.8rem 1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', color: 'var(--admin-text)', outline: 'none' }}
                  />
                  <small style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>Triggers alert if oxygen drops below this value.</small>
                </div>

                {/* Glucose Level */}
                <div style={{ background: 'var(--glass-bg)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--admin-border)', display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--admin-text)', fontWeight: 600 }}>
                    <Activity size={18} color="var(--p-green)" /> Max Glucose Level (mg/dL)
                  </label>
                  <input 
                    type="number" 
                    value={settings.glucoseMax || ''} 
                    onChange={e => setSettings({...settings, glucoseMax: e.target.value})} 
                    placeholder="e.g. 140"
                    style={{ padding: '0.8rem 1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', color: 'var(--admin-text)', outline: 'none' }}
                  />
                  <small style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>Triggers alert if glucose exceeds this value.</small>
                </div>

                {/* Escalation Time */}
                <div style={{ background: 'var(--glass-bg)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--admin-border)', display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--admin-text)', fontWeight: 600 }}>
                    <AlertTriangle size={18} color="#f59e0b" /> Escalation Time (Mins)
                  </label>
                  <input 
                    type="number" 
                    value={settings.escalationTimeMinutes || 10} 
                    onChange={e => setSettings({...settings, escalationTimeMinutes: e.target.value})} 
                    style={{ padding: '0.8rem 1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', color: 'var(--admin-text)', outline: 'none' }}
                  />
                  <small style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>Time before unacknowledged alerts escalate to Critical.</small>
                </div>

              </div>

              {/* Toggles */}
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', padding: '1.5rem 2rem', background: 'var(--admin-card-bg)', borderRadius: '16px', border: '1px solid var(--admin-border)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', color: 'var(--admin-text)' }}>
                  <input 
                    type="checkbox" 
                    checked={settings.smsEnabled || false} 
                    onChange={e => setSettings({...settings, smsEnabled: e.target.checked})} 
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--p-cyan)' }}
                  />
                  <span>Enable <strong>SMS</strong> Notifications for Critical Alerts</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', color: 'var(--admin-text)' }}>
                  <input 
                    type="checkbox" 
                    checked={settings.emailEnabled !== false} 
                    onChange={e => setSettings({...settings, emailEnabled: e.target.checked})} 
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--p-green)' }}
                  />
                  <span>Enable <strong>Email</strong> Notifications for Alerts</span>
                </label>
              </div>

              {/* Save Layout */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button 
                  type="submit" 
                  disabled={savingSettings}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', background: 'linear-gradient(135deg, var(--p-green), var(--p-cyan))', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', opacity: savingSettings ? 0.7 : 1, transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(0, 200, 151, 0.3)' }}
                >
                  {savingSettings ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
                  {savingSettings ? 'Saving...' : 'Save Configurations'}
                </button>
              </div>
            </form>
          ) : (
            <div className="empty-state" style={{ padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <Settings size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p style={{ margin: 0, color: 'var(--admin-text)' }}>Select a patient to configure their alert thresholds.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
