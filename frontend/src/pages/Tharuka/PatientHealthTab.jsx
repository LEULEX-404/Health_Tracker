import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/Imasha/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Activity, Heart, TrendingUp, Download, Loader2, 
    Calendar, AlertCircle, Droplets, Thermometer, Wind, CheckCircle2 
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import toast from 'react-hot-toast';

export default function PatientHealthTab() {
    const { token, user } = useAuth();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloadingWeekly, setDownloadingWeekly] = useState(false);
    const [downloadingMonthly, setDownloadingMonthly] = useState(false);

    useEffect(() => {
        const fetchHealthData = async () => {
            if (!token || !user) return;
            const userId = user.id || user._id;
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/health-data/${userId}?limit=30`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok && data.data) {
                    // Sort records chronologically for the chart
                    const sorted = data.data.sort((a, b) => new Date(a.date) - new Date(b.date));
                    setRecords(sorted);
                }
            } catch (error) {
                console.error("Failed to fetch health data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHealthData();
    }, [token, user]);

    // Data Processing for Chart
    const chartData = useMemo(() => {
        return records.map(r => ({
            date: new Date(r.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            heartRate: r.heartRate || null,
            oxygen: r.oxygenLevel || null,
            glucose: r.glucoseLevel || null
        }));
    }, [records]);

    // Latest Vitals
    const latest = useMemo(() => {
        if (!records.length) return null;
        return records[records.length - 1]; // Because we sorted chronologically
    }, [records]);

    const handleDownloadReport = async (type) => {
        const userId = user.id || user._id;
        const setLoader = type === 'weekly' ? setDownloadingWeekly : setDownloadingMonthly;
        setLoader(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/reports/export/pdf/${userId}?type=${type}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to download report');
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Health_Report_${type}_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} report downloaded!`);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoader(false);
        }
    };

    const getStatusColor = (val, min, max) => {
        if (!val) return 'var(--admin-text-muted)';
        if (val < min) return '#fca130'; // Warning (amber)
        if (val > max) return '#f93e3e'; // Critical (red)
        return 'var(--p-green)'; // Normal (green)
    };

    if (loading) {
        return (
            <div style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="spin" size={32} color="var(--p-cyan)" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}
        >
            {/* Header Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Activity size={24} color="var(--p-cyan)" /> Health Analytics
                </h3>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                        onClick={() => handleDownloadReport('weekly')}
                        disabled={downloadingWeekly}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', background: 'rgba(0,180,216,0.1)', border: '1px solid var(--p-cyan)', color: 'var(--p-cyan)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', opacity: downloadingWeekly ? 0.7 : 1 }}
                    >
                        {downloadingWeekly ? <Loader2 size={16} className="spin" /> : <Download size={16} />} 
                        Weekly Report
                    </button>
                    <button 
                        onClick={() => handleDownloadReport('monthly')}
                        disabled={downloadingMonthly}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', background: 'rgba(0,180,216,0.1)', border: '1px solid var(--p-cyan)', color: 'var(--p-cyan)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', opacity: downloadingMonthly ? 0.7 : 1 }}
                    >
                        {downloadingMonthly ? <Loader2 size={16} className="spin" /> : <Download size={16} />} 
                        Monthly Report
                    </button>
                </div>
            </div>

            {/* Quick Vitals Dashboard */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {/* Heart Rate */}
                <motion.div whileHover={{ y: -4 }} style={{ background: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', borderRadius: '16px', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.05, transform: 'scale(2)' }}>
                        <Heart size={100} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(249,62,62,0.15)', color: '#f93e3e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Heart size={16} />
                        </div>
                        <span style={{ color: 'var(--admin-text-muted)', fontWeight: 600 }}>Heart Rate</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--admin-text)' }}>
                        {latest?.heartRate || '--'} <span style={{ fontSize: '1rem', color: 'var(--admin-text-muted)', fontWeight: 500 }}>bpm</span>
                    </div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: getStatusColor(latest?.heartRate, 60, 100), display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {latest?.heartRate ? (latest.heartRate > 100 || latest.heartRate < 60 ? <><AlertCircle size={14} /> Attention Needed</> : <><CheckCircle2 size={14} /> Normal</>) : 'No recent data'}
                    </div>
                </motion.div>

                {/* Oxygen Level */}
                <motion.div whileHover={{ y: -4 }} style={{ background: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', borderRadius: '16px', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.05, transform: 'scale(2)' }}>
                        <Wind size={100} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(0,180,216,0.15)', color: 'var(--p-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Wind size={16} />
                        </div>
                        <span style={{ color: 'var(--admin-text-muted)', fontWeight: 600 }}>SpO2 Level</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--admin-text)' }}>
                        {latest?.oxygenLevel || '--'} <span style={{ fontSize: '1rem', color: 'var(--admin-text-muted)', fontWeight: 500 }}>%</span>
                    </div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: getStatusColor(latest?.oxygenLevel, 95, 100), display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {latest?.oxygenLevel ? (latest.oxygenLevel < 95 ? <><AlertCircle size={14} /> Low Oxygen</> : <><CheckCircle2 size={14} /> Healthy</>) : 'No recent data'}
                    </div>
                </motion.div>

                {/* Blood Pressure */}
                <motion.div whileHover={{ y: -4 }} style={{ background: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', borderRadius: '16px', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.05, transform: 'scale(2)' }}>
                        <Droplets size={100} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(0,200,151,0.15)', color: 'var(--p-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Droplets size={16} />
                        </div>
                        <span style={{ color: 'var(--admin-text-muted)', fontWeight: 600 }}>Blood Pressure</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--admin-text)' }}>
                        {latest?.bloodPressure?.systolic || '-'}/{latest?.bloodPressure?.diastolic || '-'} <span style={{ fontSize: '1rem', color: 'var(--admin-text-muted)', fontWeight: 500 }}>mmHg</span>
                    </div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--admin-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Systolic / Diastolic
                    </div>
                </motion.div>

                {/* Body Temperature / Glucose */}
                <motion.div whileHover={{ y: -4 }} style={{ background: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', borderRadius: '16px', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.05, transform: 'scale(2)' }}>
                        <Thermometer size={100} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(252,161,48,0.15)', color: '#fca130', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Thermometer size={16} />
                        </div>
                        <span style={{ color: 'var(--admin-text-muted)', fontWeight: 600 }}>Temperature</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--admin-text)' }}>
                        {latest?.temperature || '--'} <span style={{ fontSize: '1rem', color: 'var(--admin-text-muted)', fontWeight: 500 }}>°C</span>
                    </div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--admin-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {latest?.glucoseLevel ? `Glucose: ${latest.glucoseLevel} mg/dL` : 'No glucose data'}
                    </div>
                </motion.div>
            </div>

            {/* Health Trends Chart */}
            <div style={{ background: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', borderRadius: '16px', padding: '2rem', marginTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
                    <TrendingUp size={20} color="var(--p-cyan)" />
                    <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--admin-text)' }}>Health Trend Overview</h4>
                </div>
                
                {chartData.length > 0 ? (
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorHeart" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f93e3e" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#f93e3e" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorOxygen" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--p-cyan)" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="var(--p-cyan)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="date" stroke="var(--admin-text-muted)" tick={{ fill: 'var(--admin-text-muted)', fontSize: 12 }} tickLine={false} axisLine={false} />
                                <YAxis yAxisId="left" stroke="var(--admin-text-muted)" tick={{ fill: 'var(--admin-text-muted)', fontSize: 12 }} tickLine={false} axisLine={false} />
                                <YAxis yAxisId="right" orientation="right" stroke="var(--admin-text-muted)" tick={{ fill: 'var(--admin-text-muted)', fontSize: 12 }} tickLine={false} axisLine={false} domain={[80, 100]} />
                                <Tooltip 
                                    contentStyle={{ background: 'var(--glass-bg)', border: '1px solid var(--admin-border)', borderRadius: '8px', color: 'var(--admin-text)' }}
                                    itemStyle={{ fontWeight: 600 }}
                                />
                                <Area yAxisId="left" type="monotone" dataKey="heartRate" name="Heart Rate (bpm)" stroke="#f93e3e" strokeWidth={3} fillOpacity={1} fill="url(#colorHeart)" activeDot={{ r: 6, strokeWidth: 0 }} />
                                <Area yAxisId="right" type="monotone" dataKey="oxygen" name="Oxygen (%)" stroke="var(--p-cyan)" strokeWidth={3} fillOpacity={1} fill="url(#colorOxygen)" activeDot={{ r: 6, strokeWidth: 0 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-text-muted)' }}>
                        Not enough data to display trends. Log more vitals.
                    </div>
                )}
            </div>

            {/* Recent History Table */}
            <div style={{ background: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', borderRadius: '16px', padding: '1.5rem', marginTop: '1rem', overflowX: 'auto' }}>
                <h4 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={18} color="var(--p-green)" /> Recent Logs
                </h4>
                
                {records.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ padding: '1rem', color: 'var(--admin-text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>Date & Time</th>
                                <th style={{ padding: '1rem', color: 'var(--admin-text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>Heart Rate</th>
                                <th style={{ padding: '1rem', color: 'var(--admin-text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>Blood Pressure</th>
                                <th style={{ padding: '1rem', color: 'var(--admin-text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>Oxygen</th>
                                <th style={{ padding: '1rem', color: 'var(--admin-text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>Source</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...records].reverse().slice(0, 5).map((log, index) => (
                                <motion.tr 
                                    initial={{ opacity: 0, y: 10 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    transition={{ delay: index * 0.05 }}
                                    key={log._id || index} 
                                    style={{ borderBottom: index < 4 ? '1px solid rgba(255,255,255,0.05)' : 'none', transition: 'background 0.2s', cursor: 'default' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '1rem', color: 'var(--admin-text)', fontSize: '0.95rem' }}>
                                        {new Date(log.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                    </td>
                                    <td style={{ padding: '1rem', color: getStatusColor(log.heartRate, 60, 100), fontWeight: 600 }}>
                                        {log.heartRate || '-'} <span style={{ fontSize: '0.75rem', fontWeight: 400, opacity: 0.7 }}>bpm</span>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--admin-text)' }}>
                                        {log.bloodPressure?.systolic || '-'}/{log.bloodPressure?.diastolic || '-'} <span style={{ fontSize: '0.75rem', fontWeight: 400, opacity: 0.7 }}>mmHg</span>
                                    </td>
                                    <td style={{ padding: '1rem', color: getStatusColor(log.oxygenLevel, 95, 100), fontWeight: 600 }}>
                                        {log.oxygenLevel || '-'} <span style={{ fontSize: '0.75rem', fontWeight: 400, opacity: 0.7 }}>%</span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ 
                                            padding: '4px 8px', 
                                            borderRadius: '20px', 
                                            fontSize: '0.75rem', 
                                            fontWeight: 600, 
                                            background: log.source === 'pdf' ? 'rgba(0,180,216,0.1)' : 'rgba(0,200,151,0.1)', 
                                            color: log.source === 'pdf' ? 'var(--p-cyan)' : 'var(--p-green)',
                                            textTransform: 'capitalize' 
                                        }}>
                                            {log.source || 'Manual'}
                                        </span>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div style={{ color: 'var(--admin-text-muted)', textAlign: 'center', padding: '2rem 0' }}>
                        No health records found. Go to Health Data Hub to start logging.
                    </div>
                )}
            </div>
        </motion.div>
    );
}
