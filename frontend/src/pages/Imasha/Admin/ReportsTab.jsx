/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../context/Imasha/AuthContext';
import {
    getReports,
    generateNewReport,
    deleteReport,
    downloadReport,
    getAllUsers,
} from '../../../utils/Imasha/adminApi';
import AdminTablePagination from '../../../components/Imasha/Admin/AdminTablePagination';
import {
    Activity,
    Calendar,
    CheckCircle2,
    Download,
    Eye,
    FileText,
    HeartHandshake,
    Plus,
    Server,
    ShieldCheck,
    Stethoscope,
    Trash2,
    TrendingUp,
    Users,
    X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ComposedChart,
    Line,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const ROLE_META = [
    { key: 'patient', label: 'Patients', color: '#00c897', icon: Users },
    { key: 'doctor', label: 'Doctors', color: '#00b4d8', icon: Stethoscope },
    { key: 'caregiver', label: 'Caregivers', color: '#f59e0b', icon: HeartHandshake },
];

const CHART_COLORS = ROLE_META.map((item) => item.color);
const REPORT_DATE_WINDOW_MONTHS = 6;
const REPORTS_PER_PAGE = 10;

function formatCompactNumber(value) {
    return new Intl.NumberFormat('en', {
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(value || 0);
}

function formatFullNumber(value) {
    return new Intl.NumberFormat('en').format(value || 0);
}

function getRoleLabel(role) {
    return ROLE_META.find((item) => item.key === role)?.label || role;
}

function getMonthBuckets() {
    const months = [];
    const now = new Date();

    for (let offset = REPORT_DATE_WINDOW_MONTHS - 1; offset >= 0; offset -= 1) {
        const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const label = date.toLocaleDateString('en-US', { month: 'short' });
        months.push({ key, label });
    }

    return months;
}

function AnalyticsTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;

    return (
        <div className="admin-chart-tooltip">
            <p className="admin-chart-tooltip__title">{label}</p>
            {payload.map((entry) => (
                <div key={entry.dataKey} className="admin-chart-tooltip__row">
                    <span className="admin-chart-tooltip__dot" style={{ backgroundColor: entry.color }} />
                    <span className="admin-chart-tooltip__label">{entry.name}</span>
                    <strong className="admin-chart-tooltip__value">{formatFullNumber(entry.value)}</strong>
                </div>
            ))}
        </div>
    );
}

const ReportsTab = () => {
    const { token } = useAuth();
    const [reports, setReports] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        type: 'user_activity',
        title: '',
        dateFrom: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
        dateTo: new Date().toISOString().split('T')[0],
    });

    const [previewUrl, setPreviewUrl] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const fetchReportsAndData = useCallback(async () => {
        setLoading(true);
        try {
            const [reportResponse, userResponse] = await Promise.all([
                getReports(token, { limit: 1000 }),
                getAllUsers(token, { limit: 1000 }),
            ]);

            setReports(reportResponse.data || []);
            setUsers(userResponse.data || []);
        } catch (err) {
            toast.error('Failed to fetch reports interface data.');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchReportsAndData();
    }, [fetchReportsAndData]);

    const totalReportPages = Math.max(1, Math.ceil(reports.length / REPORTS_PER_PAGE));

    useEffect(() => {
        setCurrentPage((prevPage) => Math.min(prevPage, totalReportPages));
    }, [totalReportPages]);

    const analytics = useMemo(() => {
        const totalUsers = users.length;
        const activeUsers = users.filter((user) => user.isActive).length;
        const verifiedUsers = users.filter((user) => user.isEmailVerified).length;

        const roleDistribution = ROLE_META.map((role) => {
            const value = users.filter((user) => user.role === role.key).length;
            const percentage = totalUsers ? Math.round((value / totalUsers) * 100) : 0;
            return { ...role, value, percentage };
        });

        const months = getMonthBuckets();
        const monthlyRegistrations = months.map((month) => ({
            name: month.label,
            key: month.key,
            Patients: 0,
            Doctors: 0,
            Caregivers: 0,
            total: 0,
            cumulative: 0,
        }));

        const monthIndex = new Map(months.map((month, index) => [month.key, index]));
        let baselineUsers = 0;

        users.forEach((user) => {
            const createdAt = new Date(user.createdAt);
            if (Number.isNaN(createdAt.getTime())) return;

            const key = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
            const index = monthIndex.get(key);

            if (index == null) {
                baselineUsers += 1;
                return;
            }

            const roleLabel = getRoleLabel(user.role);
            if (monthlyRegistrations[index][roleLabel] != null) {
                monthlyRegistrations[index][roleLabel] += 1;
            }
            monthlyRegistrations[index].total += 1;
        });

        let cumulative = baselineUsers;
        monthlyRegistrations.forEach((month) => {
            cumulative += month.total;
            month.cumulative = cumulative;
        });

        const topMonth = monthlyRegistrations.reduce(
            (best, month) => (month.total > best.total ? month : best),
            { name: 'N/A', total: 0 }
        );

        const previousMonthTotal =
            monthlyRegistrations.length > 1
                ? monthlyRegistrations[monthlyRegistrations.length - 2].total
                : 0;
        const currentMonthTotal =
            monthlyRegistrations.length > 0
                ? monthlyRegistrations[monthlyRegistrations.length - 1].total
                : 0;

        const growthRate =
            previousMonthTotal > 0
                ? Math.round(((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100)
                : currentMonthTotal > 0
                    ? 100
                    : 0;

        const totalRegistrationsInWindow = monthlyRegistrations.reduce(
            (sum, month) => sum + month.total,
            0
        );
        const averageRegistrations = monthlyRegistrations.length
            ? Math.round(totalRegistrationsInWindow / monthlyRegistrations.length)
            : 0;

        const dominantRole = roleDistribution.reduce(
            (best, role) => (role.value > best.value ? role : best),
            roleDistribution[0] || { label: 'N/A', value: 0, percentage: 0 }
        );

        const roleQuality = ROLE_META.map((role) => {
            const roleUsers = users.filter((user) => user.role === role.key);
            const total = roleUsers.length;
            const active = roleUsers.filter((user) => user.isActive).length;
            const verified = roleUsers.filter((user) => user.isEmailVerified).length;

            return {
                ...role,
                total,
                active,
                verified,
                activeRate: total ? Math.round((active / total) * 100) : 0,
                verifiedRate: total ? Math.round((verified / total) * 100) : 0,
            };
        });

        const roleComparison = roleQuality.map((role) => ({
            name: role.label,
            activeRate: role.activeRate,
            verifiedRate: role.verifiedRate,
        }));

        const latestMonth = monthlyRegistrations[monthlyRegistrations.length - 1] || {
            name: 'N/A',
            total: 0,
            cumulative: totalUsers,
        };

        return {
            roleDistribution,
            roleQuality,
            roleComparison,
            monthlyRegistrations,
            summaryCards: [
                {
                    label: 'Total Accounts',
                    value: formatFullNumber(totalUsers),
                    accent: 'mint',
                    icon: Users,
                    detail: `${formatCompactNumber(activeUsers)} active now`,
                },
                {
                    label: 'Verified Accounts',
                    value: `${totalUsers ? Math.round((verifiedUsers / totalUsers) * 100) : 0}%`,
                    accent: 'cyan',
                    icon: ShieldCheck,
                    detail: `${formatFullNumber(verifiedUsers)} verified users`,
                },
                {
                    label: 'Strongest Month',
                    value: topMonth.name,
                    accent: 'amber',
                    icon: TrendingUp,
                    detail: `${formatFullNumber(topMonth.total)} new registrations`,
                },
                {
                    label: 'Reports Generated',
                    value: formatFullNumber(reports.length),
                    accent: 'violet',
                    icon: FileText,
                    detail: `${reports.filter((report) => report.status === 'completed').length} completed`,
                },
            ],
            dominantRole,
            averageRegistrations,
            latestMonth,
            totalRegistrationsInWindow,
            growthRate,
        };
    }, [reports.length, users]);

    const paginatedReports = useMemo(() => {
        const startIndex = (currentPage - 1) * REPORTS_PER_PAGE;
        return reports.slice(startIndex, startIndex + REPORTS_PER_PAGE);
    }, [currentPage, reports]);

    const handleGenerate = async (e) => {
        e.preventDefault();
        setIsGenerating(true);
        try {
            await generateNewReport(token, formData);
            toast.success('Report generation initiated successfully.');
            setIsModalOpen(false);
            setCurrentPage(1);
            fetchReportsAndData();
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

    return (
        <div className="admin-reports">
            <section className="admin-report-summary-grid">
                {analytics.summaryCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <article key={card.label} className={`admin-report-summary-card ${card.accent}`}>
                            <div className="admin-report-summary-card__top">
                                <span className="admin-report-summary-card__label">{card.label}</span>
                                <div className="admin-report-summary-card__icon">
                                    <Icon size={18} />
                                </div>
                            </div>
                            <strong className="admin-report-summary-card__value">{card.value}</strong>
                            <span className="admin-report-summary-card__detail">{card.detail}</span>
                        </article>
                    );
                })}
            </section>

            <section className="admin-report-visual-grid">
                <article className="admin-report-card admin-report-card--distribution">
                    <div className="admin-report-card__header">
                        <div>
                            <h3>User Distribution</h3>
                            <p>Role share across the platform with exact contribution detail</p>
                        </div>
                        <span className="admin-report-card__chip">Live mix</span>
                    </div>

                    <div className="admin-report-distribution">
                        <div className="admin-report-distribution__chart">
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie
                                        data={analytics.roleDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={72}
                                        outerRadius={102}
                                        paddingAngle={4}
                                        dataKey="value"
                                        stroke="transparent"
                                    >
                                        {analytics.roleDistribution.map((entry, index) => (
                                            <Cell key={entry.key} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<AnalyticsTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="admin-report-distribution__center">
                                <span>Total users</span>
                                <strong>{formatFullNumber(users.length)}</strong>
                            </div>
                        </div>

                        <div className="admin-report-distribution__legend">
                            {analytics.roleDistribution.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div key={item.key} className="admin-report-legend-row">
                                        <div className="admin-report-legend-row__left">
                                            <span className="admin-report-legend-row__swatch" style={{ background: item.color }} />
                                            <span className="admin-report-legend-row__icon">
                                                <Icon size={14} />
                                            </span>
                                            <div>
                                                <strong>{item.label}</strong>
                                                <p>{item.percentage}% of platform users</p>
                                            </div>
                                        </div>
                                        <strong className="admin-report-legend-row__value">
                                            {formatFullNumber(item.value)}
                                        </strong>
                                        <div className="admin-report-legend-row__meter">
                                            <span
                                                className="admin-report-legend-row__meter-fill"
                                                style={{ width: `${item.percentage}%`, background: item.color }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </article>

                <article className="admin-report-card admin-report-card--growth">
                    <div className="admin-report-card__header">
                        <div>
                            <h3>Platform Growth Curve</h3>
                            <p>Cumulative account expansion over the last 6 months</p>
                        </div>
                        <span className={`admin-report-card__chip ${analytics.growthRate >= 0 ? 'positive' : 'negative'}`}>
                            {analytics.growthRate >= 0 ? '+' : ''}
                            {analytics.growthRate}% vs prev. month
                        </span>
                    </div>

                    <div className="admin-report-growth-highlights">
                        <div className="admin-report-growth-highlights__item">
                            <span>Latest month</span>
                            <strong>{formatFullNumber(analytics.latestMonth.total)}</strong>
                            <small>{analytics.latestMonth.name} registrations</small>
                        </div>
                        <div className="admin-report-growth-highlights__item">
                            <span>Average pace</span>
                            <strong>{formatFullNumber(analytics.averageRegistrations)}</strong>
                            <small>accounts per month</small>
                        </div>
                        <div className="admin-report-growth-highlights__item">
                            <span>6-month total</span>
                            <strong>{formatFullNumber(analytics.totalRegistrationsInWindow)}</strong>
                            <small>new users added</small>
                        </div>
                    </div>

                    <div className="admin-report-growth-chart">
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={analytics.monthlyRegistrations}>
                                <defs>
                                    <linearGradient id="adminGrowthFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00c897" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#00c897" stopOpacity={0.02} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="4 4" stroke="var(--admin-border)" vertical={false} />
                                <XAxis dataKey="name" stroke="var(--admin-text-muted)" tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--admin-text-muted)" tickLine={false} axisLine={false} />
                                <Tooltip content={<AnalyticsTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="cumulative"
                                    name="Total users"
                                    stroke="#00c897"
                                    strokeWidth={3}
                                    fill="url(#adminGrowthFill)"
                                    activeDot={{ r: 6, fill: '#00c897', stroke: '#ffffff', strokeWidth: 2 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="admin-report-growth-footer">
                        {analytics.monthlyRegistrations.map((month) => (
                            <div key={month.key} className="admin-report-growth-footer__item">
                                <span>{month.name}</span>
                                <strong>{formatFullNumber(month.total)}</strong>
                                <small>new accounts</small>
                            </div>
                        ))}
                    </div>
                </article>

                <article className="admin-report-card admin-report-card--quality">
                    <div className="admin-report-card__header">
                        <div>
                            <h3>Role Quality Snapshot</h3>
                            <p>Activity and verification health by account type</p>
                        </div>
                        <span className="admin-report-card__chip">
                            {analytics.dominantRole.label} lead
                        </span>
                    </div>

                    <div className="admin-report-quality-list">
                        {analytics.roleQuality.map((role) => {
                            const Icon = role.icon;
                            return (
                                <div key={role.key} className="admin-report-quality-row">
                                    <div className="admin-report-quality-row__header">
                                        <div className="admin-report-quality-row__identity">
                                            <span
                                                className="admin-report-quality-row__icon"
                                                style={{ background: `${role.color}1A`, color: role.color }}
                                            >
                                                <Icon size={15} />
                                            </span>
                                            <div>
                                                <strong>{role.label}</strong>
                                                <p>{formatFullNumber(role.total)} total accounts</p>
                                            </div>
                                        </div>
                                        <strong className="admin-report-quality-row__share">
                                            {role.total ? `${Math.round((role.total / users.length) * 100)}%` : '0%'}
                                        </strong>
                                    </div>

                                    <div className="admin-report-quality-row__metric">
                                        <div className="admin-report-quality-row__metric-head">
                                            <span>Active accounts</span>
                                            <strong>{formatFullNumber(role.active)} / {formatFullNumber(role.total)}</strong>
                                        </div>
                                        <div className="admin-report-progress">
                                            <span
                                                className="admin-report-progress__fill"
                                                style={{ width: `${role.activeRate}%`, background: role.color }}
                                            />
                                        </div>
                                    </div>

                                    <div className="admin-report-quality-row__metric">
                                        <div className="admin-report-quality-row__metric-head">
                                            <span>Verified accounts</span>
                                            <strong>{formatFullNumber(role.verified)} / {formatFullNumber(role.total)}</strong>
                                        </div>
                                        <div className="admin-report-progress admin-report-progress--soft">
                                            <span
                                                className="admin-report-progress__fill"
                                                style={{ width: `${role.verifiedRate}%`, background: role.color }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </article>

                <article className="admin-report-card admin-report-card--quality-chart">
                    <div className="admin-report-card__header">
                        <div>
                            <h3>Role Health Comparison</h3>
                            <p>Side-by-side active and verified rates for each role</p>
                        </div>
                        <span className="admin-report-card__chip">Quality chart</span>
                    </div>

                    <div className="admin-report-quality-chart">
                        <ResponsiveContainer width="100%" height={320}>
                            <BarChart data={analytics.roleComparison} barGap={12}>
                                <CartesianGrid strokeDasharray="4 4" stroke="var(--admin-border)" vertical={false} />
                                <XAxis dataKey="name" stroke="var(--admin-text-muted)" tickLine={false} axisLine={false} />
                                <YAxis
                                    domain={[0, 100]}
                                    tickFormatter={(value) => `${value}%`}
                                    stroke="var(--admin-text-muted)"
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip content={<AnalyticsTooltip />} />
                                <Bar
                                    dataKey="activeRate"
                                    name="Active rate"
                                    fill="#00c897"
                                    radius={[8, 8, 0, 0]}
                                />
                                <Bar
                                    dataKey="verifiedRate"
                                    name="Verified rate"
                                    fill="#00b4d8"
                                    radius={[8, 8, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="admin-report-inline-legend admin-report-inline-legend--quality">
                        <div className="admin-report-inline-legend__item">
                            <span className="admin-report-inline-legend__swatch" style={{ background: '#00c897' }} />
                            <span>Active rate</span>
                        </div>
                        <div className="admin-report-inline-legend__item">
                            <span className="admin-report-inline-legend__swatch" style={{ background: '#00b4d8' }} />
                            <span>Verified rate</span>
                        </div>
                    </div>
                </article>

                <article className="admin-report-card admin-report-card--breakdown">
                    <div className="admin-report-card__header">
                        <div>
                            <h3>Monthly Role Breakdown</h3>
                            <p>Registrations by role with total trend overlay</p>
                        </div>
                        <span className="admin-report-card__chip">Detailed view</span>
                    </div>

                    <div className="admin-report-breakdown-chart">
                        <ResponsiveContainer width="100%" height={320}>
                            <ComposedChart data={analytics.monthlyRegistrations} barGap={6}>
                                <CartesianGrid strokeDasharray="4 4" stroke="var(--admin-border)" vertical={false} />
                                <XAxis dataKey="name" stroke="var(--admin-text-muted)" tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--admin-text-muted)" tickLine={false} axisLine={false} />
                                <Tooltip content={<AnalyticsTooltip />} />
                                <Bar dataKey="Patients" stackId="roles" fill="#00c897" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="Doctors" stackId="roles" fill="#00b4d8" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="Caregivers" stackId="roles" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                                <Line
                                    type="monotone"
                                    dataKey="total"
                                    name="Total registrations"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }}
                                    activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#ffffff', strokeWidth: 2 }}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="admin-report-inline-legend">
                        {ROLE_META.map((role) => (
                            <div key={role.key} className="admin-report-inline-legend__item">
                                <span className="admin-report-inline-legend__swatch" style={{ background: role.color }} />
                                <span>{role.label}</span>
                            </div>
                        ))}
                        <div className="admin-report-inline-legend__item">
                            <span className="admin-report-inline-legend__line" />
                            <span>Total registrations</span>
                        </div>
                    </div>
                </article>
            </section>

            <div className="admin-module-card">
                <div className="module-header space-between">
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>System Reports</h3>
                        <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                            Manage and generate insights for PulseNova operations.
                        </p>
                    </div>
                    <button
                        className="Imasha-btn-primary admin-add-btn admin-add-btn--report"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <span className="admin-add-btn__icon-wrap">
                            <Plus size={18} />
                        </span>
                        <span className="admin-add-btn__content">
                            <span className="admin-add-btn__eyebrow">Analytics</span>
                            <span className="admin-add-btn__label">Generate New Report</span>
                        </span>
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
                            ) : paginatedReports.map((report) => (
                                <tr key={report._id}>
                                    <td>
                                        <div className="user-info-cell">
                                            <div className="avatar-placeholder report-icon">
                                                {report.type === 'user_activity' ? <Activity size={20} /> : <Server size={20} />}
                                            </div>
                                            <div>
                                                <span className="user-name">{report.title}</span>
                                                <span className="user-id">
                                                    by {report.generatedBy?.firstName || 'Admin'} | {new Date(report.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ textTransform: 'capitalize', fontWeight: 500, color: 'var(--admin-text-main)' }}>
                                            {report.type.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="contact-cell">
                                            <span><Calendar size={12} /> {new Date(report.dateRange?.from).toLocaleDateString()}</span>
                                            <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.75rem' }}>
                                                to {new Date(report.dateRange?.to).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="status-pill completed">
                                            <CheckCircle2 size={10} style={{ marginRight: 4 }} />
                                            Completed
                                        </span>
                                    </td>
                                    <td className="text-right">
                                        <div className="action-btns">
                                            <button
                                                onClick={() => handleView(report)}
                                                className="action-btn"
                                                title="View Report"
                                                style={{ color: 'var(--admin-primary)', background: 'rgba(0, 200, 151, 0.1)' }}
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDownload(report)}
                                                className="action-btn success"
                                                title="Download Report"
                                            >
                                                <Download size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(report._id)}
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

                {!loading && (
                    <AdminTablePagination
                        currentPage={currentPage}
                        totalItems={reports.length}
                        itemsPerPage={REPORTS_PER_PAGE}
                        onPageChange={setCurrentPage}
                        itemLabel="reports"
                    />
                )}

                {isModalOpen && (
                    <div className="admin-modal-overlay">
                        <div className="admin-modal-content">
                            <h3>Generate Report</h3>
                            <form onSubmit={handleGenerate} className="admin-form">
                                <div className="form-group">
                                    <label>Report Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
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
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>From Date</label>
                                        <input
                                            type="date"
                                            value={formData.dateFrom}
                                            onChange={(e) => setFormData({ ...formData, dateFrom: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>To Date</label>
                                        <input
                                            type="date"
                                            value={formData.dateTo}
                                            onChange={(e) => setFormData({ ...formData, dateTo: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="modal-actions mt-4">
                                    <button type="button" className="admin-btn-secondary" onClick={() => setIsModalOpen(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="Imasha-btn-primary" disabled={isGenerating}>
                                        {isGenerating ? 'Initiating...' : 'Generate New Report'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {isPreviewOpen && (
                    <div className="admin-modal-overlay">
                        <div
                            className="admin-modal-content"
                            style={{ maxWidth: '1000px', width: '90%', height: '85vh', display: 'flex', flexDirection: 'column' }}
                        >
                            <div
                                className="modal-header space-between"
                                style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--admin-border)', marginBottom: '1rem' }}
                            >
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
                                    />
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