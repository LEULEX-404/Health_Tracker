import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/Imasha/AuthContext';
import { getReports, generateNewReport, deleteReport, downloadReport } from '../../../utils/Imasha/adminApi';
import { FileText, Trash2, Download, Plus, Calendar, Activity, Server, Clock, Eye, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for charts if no real reports or while waiting for backend aggregation
const mockRoleData = [
    { name: 'Patients', value: 842 },
    { name: 'Doctors', value: 124 },
    { name: 'Caregivers', value: 318 },
];

// We will dynamically generate growth data from real API stats

const COLORS = ['#00c897', '#33d4a8', '#10b981'];

const ReportsTab = () => {
    const { token } = useAuth();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    // Real Stats State
    const [roleData, setRoleData] = useState([
        { name: 'Patients', value: 0 },
        { name: 'Doctors', value: 0 },
        { name: 'Caregivers', value: 0 },
    ]);
    const [growthData, setGrowthData] = useState([]);

    // Generator Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        type: 'user_activity',
        title: '',
        dateFrom: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0], // Last month
        dateTo: new Date().toISOString().split('T')[0] // Today
    });

    // View Modal
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const fetchReportsAndData = useCallback(async () => {
        setLoading(true);
        try {
            const { getAdminDashboardStats, getAllUsers } = await import('../../../utils/Imasha/adminApi');
            const [data, stats, allUsers] = await Promise.all([
                getReports(token),
                getAdminDashboardStats(token),
                getAllUsers(token, { limit: 1000 })
            ]);
            setReports(data.data || []);
            setRoleData([
                { name: 'Patients', value: stats.totalPatients },
                { name: 'Doctors', value: stats.totalDoctors },
                { name: 'Caregivers', value: stats.totalCaregivers },
            ]);

            if (allUsers?.data) {
                // Calculate monthly growth based on user createdAt
                const monthsStr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const monthCounts = {};
                allUsers.data.forEach(u => {
                    const d = new Date(u.createdAt);
                    if (!isNaN(d)) {
                        const mStr = monthsStr[d.getMonth()];
                        monthCounts[mStr] = (monthCounts[mStr] || 0) + 1;
                    }
                });

                // Get last 5 months relative to now
                const currentMonth = new Date().getMonth();
                const calculatedGrowth = [];
                let cumulative = 0;

                // Add up base users (older than 4 months)
                allUsers.data.forEach(u => {
                    const d = new Date(u.createdAt);
                    if (!isNaN(d) && (currentMonth - d.getMonth() > 4 || currentMonth - d.getMonth() < 0)) cumulative++;
                });

                for (let i = 4; i >= 0; i--) {
                    let mIndex = currentMonth - i;
                    if (mIndex < 0) mIndex += 12;
                    const mName = monthsStr[mIndex];
                    cumulative += (monthCounts[mName] || 0);
                    calculatedGrowth.push({ name: mName, users: cumulative });
                }
                setGrowthData(calculatedGrowth);
            }

        } catch (err) {
            toast.error('Failed to fetch reports interface data.');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchReportsAndData();
    }, [fetchReportsAndData]);

    const handleGenerate = async (e) => {
        e.preventDefault();
        setIsGenerating(true);
        try {
            await generateNewReport(token, formData);
            toast.success('Report generation initiated successfully.');
            setIsModalOpen(false);
            fetchReportsAndData(); // Refresh list to show 'generating' status
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to generate report.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDelete = async (reportId) => {
        if (!window.confirm('Delete this report?')) return;
        try {
            await deleteReport(token, reportId);
            toast.success('Report deleted.');
            fetchReportsAndData();
        } catch (err) {
            toast.error('Failed to delete report.');
        }
    };

    const handleDownload = async (report) => {
        try {
            toast.loading(`Preparing ${report.title}...`, { id: report._id });
            const blob = await downloadReport(token, report._id);
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('link');
            const a = document.createElement('a');
            a.href = url;
            a.download = `PulseNova_${report.type}_Report.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success('Download complete!', { id: report._id });
        } catch (error) {
            toast.error('Failed to download report.', { id: report._id });
        }
    };

    const handleView = async (report) => {
        try {
            toast.loading(`Loading ${report.title}...`, { id: `view-${report._id}` });
            const blob = await downloadReport(token, report._id);
            const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
            setPreviewUrl(url);
            setIsPreviewOpen(true);
            toast.dismiss(`view-${report._id}`);
        } catch (error) {
            toast.error('Failed to load report preview.', { id: `view-${report._id}` });
        }
    };

    const getStatusColors = (status) => {
        switch (status) {
            case 'completed': return 'success';
            case 'failed': return 'danger';
            case 'generating': return 'warn';
            default: return 'inactive';
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Visual Dashboard Section */}
            <div className="admin-stats-grid" style={{ marginBottom: 0 }}>
                <div className="admin-stat-card unique" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1.5rem', gridColumn: 'span 1' }}>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--admin-text-main)', fontSize: '1.1rem' }}>User Distribution</h3>
                    <div style={{ width: '100%', height: 220 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={roleData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {roleData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', borderRadius: '8px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="admin-stat-card unique" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1.5rem', gridColumn: 'span 2' }}>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--admin-text-main)', fontSize: '1.1rem' }}>User Growth Overview</h3>
                    <div style={{ width: '100%', height: 220 }}>
                        <ResponsiveContainer>
                            <BarChart data={growthData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" vertical={false} />
                                <XAxis dataKey="name" stroke="var(--admin-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--admin-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'var(--admin-hover)' }}
                                    contentStyle={{ backgroundColor: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', borderRadius: '8px' }}
                                />
                                <Bar dataKey="users" fill="var(--admin-primary)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="admin-module-card">
                <div className="module-header space-between">
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>System Reports</h3>
                        <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                            Manage and generate insights for PulseNova operations.
                        </p>
                    </div>
                    <button className="Imasha-btn-primary admin-add-btn" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} /> Generate New Report
                    </button>
                </div>

                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Report Details</th>
                                <th>Type</th>
                                <th>Period</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="loading-state">Loading reports...</td></tr>
                            ) : reports.length === 0 ? (
                                <tr><td colSpan="5" className="empty-state">No reports generated yet.</td></tr>
                            ) : reports.map((r) => (
                                <tr key={r._id}>
                                    <td>
                                        <div className="user-info-cell">
                                            <div className="avatar-placeholder report-icon">
                                                {r.type === 'user_activity' ? <Activity size={20} /> : <Server size={20} />}
                                            </div>
                                            <div>
                                                <span className="user-name">{r.title}</span>
                                                <span className="user-id">by {r.generatedBy?.firstName || 'Admin'} • {new Date(r.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ textTransform: 'capitalize', fontWeight: 500, color: 'var(--admin-text-main)' }}>
                                            {r.type.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="contact-cell">
                                            <span><Calendar size={12} /> {new Date(r.dateRange?.from).toLocaleDateString()}</span>
                                            <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.75rem' }}>to {new Date(r.dateRange?.to).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-pill completed`}>
                                            Completed
                                        </span>
                                    </td>
                                    <td className="text-right">
                                        <div className="action-btns">
                                            <button
                                                onClick={() => handleView(r)}
                                                className="action-btn"
                                                title="View Report"
                                                style={{ color: 'var(--admin-primary)', background: 'rgba(0, 200, 151, 0.1)' }}
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDownload(r)}
                                                className="action-btn success"
                                                title="Download Report"
                                            >
                                                <Download size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(r._id)}
                                                className="action-btn danger"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Generator Modal */}
                {isModalOpen && (
                    <div className="admin-modal-overlay">
                        <div className="admin-modal-content">
                            <h3>Generate Report</h3>
                            <form onSubmit={handleGenerate} className="admin-form">
                                <div className="form-group">
                                    <label>Report Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        className="admin-select"
                                    >
                                        <option value="user_activity">User Activity & Growth</option>
                                        <option value="system">System Health & Logs</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Optional Title</label>
                                    <input
                                        type="text"
                                        placeholder="Leave blank for auto-generated title"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>From Date</label>
                                        <input
                                            type="date"
                                            value={formData.dateFrom}
                                            onChange={e => setFormData({ ...formData, dateFrom: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>To Date</label>
                                        <input
                                            type="date"
                                            value={formData.dateTo}
                                            onChange={e => setFormData({ ...formData, dateTo: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="modal-actions mt-4">
                                    <button type="button" className="admin-btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="Imasha-btn-primary" disabled={isGenerating}>
                                        {isGenerating ? 'Initiating...' : 'Generate New Report'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* PDF Preview Modal */}
                {isPreviewOpen && (
                    <div className="admin-modal-overlay">
                        <div className="admin-modal-content" style={{ maxWidth: '1000px', width: '90%', height: '85vh', display: 'flex', flexDirection: 'column' }}>
                            <div className="modal-header space-between" style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--admin-border)', marginBottom: '1rem' }}>
                                <h3>Report Preview</h3>
                                <button
                                    type="button"
                                    className="close-btn"
                                    onClick={() => {
                                        setIsPreviewOpen(false);
                                        if (previewUrl) {
                                            window.URL.revokeObjectURL(previewUrl);
                                            setPreviewUrl(null);
                                        }
                                    }}
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div style={{ flex: 1, overflow: 'hidden', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>
                                {previewUrl ? (
                                    <iframe
                                        src={previewUrl}
                                        title="PDF Preview"
                                        width="100%"
                                        height="100%"
                                        style={{ border: 'none' }}
                                    ></iframe>
                                ) : (
                                    <div className="loading-state">Loading PDF...</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportsTab;
