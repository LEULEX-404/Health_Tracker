import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/Imasha/AuthContext';
import { getAllUsers } from '../../utils/Imasha/adminApi';
import { getAllAlerts, deleteAlert, getAlertSettings, updateAlertSettings } from '../../utils/Tharindu/adminAlertsApi';
import { Bell, Settings, Trash2, Save, Loader2, Activity, Heart, Wind, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const ITEMS_PER_PAGE = 20;

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
        <div className="tharindu-settings-container">
          <div className="tharindu-patient-selector">
            <label>Select Patient to Configure:</label>
            <select 
              value={selectedPatient} 
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="tharindu-select"
            >
              {patients.map(p => (
                <option key={p._id} value={p._id}>
                  {p.firstName} {p.lastName} ({p.email})
                </option>
              ))}
            </select>
          </div>

          {loadingSettings ? (
            <div className="loading-state py-8"><Loader2 className="spin inline-icon" /> Loading thresholds...</div>
          ) : settings ? (
            <form onSubmit={handleSaveSettings} className="tharindu-settings-form">
              <div className="tharindu-form-grid">
                
                <div className="tharindu-form-group">
                  <label><Heart size={16}/> Max Heart Rate (bpm)</label>
                  <input 
                    type="number" 
                    value={settings.heartRateMax || ''} 
                    onChange={e => setSettings({...settings, heartRateMax: e.target.value})} 
                    placeholder="e.g. 100"
                  />
                  <small>Triggers alert if patient heart rate exceeds this value</small>
                </div>

                <div className="tharindu-form-group">
                  <label><Wind size={16}/> Min Oxygen Level (%)</label>
                  <input 
                    type="number" 
                    value={settings.oxygenMin || ''} 
                    onChange={e => setSettings({...settings, oxygenMin: e.target.value})} 
                    placeholder="e.g. 95"
                  />
                  <small>Triggers alert if oxygen drops below this value</small>
                </div>

                <div className="tharindu-form-group">
                  <label><Activity size={16}/> Max Glucose Level (mg/dL)</label>
                  <input 
                    type="number" 
                    value={settings.glucoseMax || ''} 
                    onChange={e => setSettings({...settings, glucoseMax: e.target.value})} 
                    placeholder="e.g. 140"
                  />
                  <small>Triggers alert if glucose exceeds this value</small>
                </div>

                <div className="tharindu-form-group">
                  <label><AlertTriangle size={16} className="inline-icon"/> Escalation Time (Minutes)</label>
                  <input 
                    type="number" 
                    value={settings.escalationTimeMinutes || 10} 
                    onChange={e => setSettings({...settings, escalationTimeMinutes: e.target.value})} 
                  />
                  <small>Time before unacknowledged alerts escalate to Critical</small>
                </div>

              </div>

              <div className="tharindu-form-toggles">
                <label className="tharindu-toggle-row">
                  <input 
                    type="checkbox" 
                    checked={settings.smsEnabled || false} 
                    onChange={e => setSettings({...settings, smsEnabled: e.target.checked})} 
                  />
                  <span className="tharindu-toggle-text">Enable SMS Notifications for Critical Alerts</span>
                </label>
                <label className="tharindu-toggle-row">
                  <input 
                    type="checkbox" 
                    checked={settings.emailEnabled !== false} 
                    onChange={e => setSettings({...settings, emailEnabled: e.target.checked})} 
                  />
                  <span className="tharindu-toggle-text">Enable Email Notifications for Alerts</span>
                </label>
              </div>

              <div className="tharindu-form-actions">
                <button type="submit" className="admin-btn-primary" disabled={savingSettings}>
                  {savingSettings ? <><Loader2 size={16} className="spin inline-icon" /> Saving...</> : <><Save size={16} className="inline-icon" /> Save Configurations</>}
                </button>
              </div>
            </form>
          ) : (
            <div className="empty-state">Select a patient to configure their alert thresholds.</div>
          )}
        </div>
      )}
    </div>
  );
}
