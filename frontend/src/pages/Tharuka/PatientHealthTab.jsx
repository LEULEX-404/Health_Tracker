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

// Helper component for highly attractive Stats Cards
// Helper component for highly attractive Stats Cards - Memoized for performance
const StatCard = React.memo(({ title, value, unit, icon: Icon, color, normalRange, recentData, trend, delay }) => {
    let statusText = 'Normal';
    let statusColor = 'var(--p-green)';
    let AlertIcon = CheckCircle2;
    
    if (recentData === null || recentData === undefined) {
        statusText = 'No data';
        statusColor = 'var(--admin-text-muted)';
        AlertIcon = Activity;
    } else if (recentData < normalRange[0]) {
        statusText = 'Low Warning';
        statusColor = '#fca130';
        AlertIcon = AlertCircle;
    } else if (recentData > normalRange[1]) {
        statusText = 'High Alert';
        statusColor = '#f93e3e';
        AlertIcon = AlertCircle;
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            whileHover={{ y: -5, boxShadow: `0 10px 25px -5px ${color}30`, borderColor: `${color}60` }}
            style={{ 
                background: 'var(--glass-bg)', 
                backdropFilter: 'blur(16px)',
                border: `1px solid var(--glass-border)`, 
                borderRadius: '24px', 
                padding: '1.5rem', 
                position: 'relative', 
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                transition: 'all 0.3s'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.2rem' }}>
                <div style={{ 
                    width: '42px', height: '42px', borderRadius: '12px', 
                    background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`, 
                    boxShadow: `inset 0 0 0 1px ${color}20`,
                    color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}>
                    <Icon size={22} />
                </div>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.05rem', letterSpacing: '0.5px' }}>{title}</span>
            </div>

            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                {value || '--'} 
                <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>{unit}</span>
            </div>

            <div style={{ marginTop: '1rem', padding: '0.6rem 0.8rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', fontSize: '0.85rem', color: statusColor, display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                <AlertIcon size={16} /> {statusText}
            </div>
        </motion.div>
    );
});

// Helper for Individual Animated Charts
// Helper for Individual Animated Charts - Memoized for performance
const AnimatedChartCard = React.memo(({ title, dataKey, color, data, yDomain, isDouble = false, dataKey2, color2, icon: Icon, delay }) => (
    <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay, duration: 0.5 }}
        style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '20px', padding: '1.5rem', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(0,0,0,0.05)' }}
    >
        <h5 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: 700 }}>
            <div style={{ padding: '6px', background: `${color}15`, borderRadius: '8px' }}>
                <Icon size={18} color={color} />
            </div>
            {title}
        </h5>
        
        {data && data.length > 0 ? (
            <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer>
                    <AreaChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                            <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.15}/>
                                <stop offset="95%" stopColor={color} stopOpacity={0}/>
                            </linearGradient>
                            {isDouble && (
                                <linearGradient id={`grad-${dataKey2}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color2} stopOpacity={0.15}/>
                                    <stop offset="95%" stopColor={color2} stopOpacity={0}/>
                                </linearGradient>
                            )}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                        <XAxis dataKey="date" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 500 }} tickLine={false} axisLine={false} dy={10} />
                        <YAxis domain={yDomain || ['auto', 'auto']} stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 500 }} tickLine={false} axisLine={false} />
                        <Tooltip 
                            contentStyle={{ background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', border: `1px solid var(--glass-border)`, borderRadius: '12px', color: 'var(--text-primary)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                            itemStyle={{ fontWeight: 700, fontSize: '12px' }}
                            labelStyle={{ color: 'var(--text-muted)', marginBottom: '5px', fontSize: '11px', fontWeight: 600 }}
                            cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '5 5' }}
                        />
                        <Area isAnimationActive={true} animationDuration={2000} type="monotone" dataKey={dataKey} name={title} stroke={color} strokeWidth={2} fillOpacity={1} fill={`url(#grad-${dataKey})`} activeDot={{ r: 4, strokeWidth: 0, fill: color }} />
                        {isDouble && (
                            <Area isAnimationActive={true} animationDuration={2000} type="monotone" dataKey={dataKey2} name="Diastolic" stroke={color2} strokeWidth={2} fillOpacity={1} fill={`url(#grad-${dataKey2})`} activeDot={{ r: 4, strokeWidth: 0, fill: color2 }} />
                        )}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        ) : (
            <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-text-muted)' }}>
                Not enough data points.
            </div>
        )}
    </motion.div>
));

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
                    // Fix: Use recordedAt for sorting as per backend schema
                    const sorted = data.data.sort((a, b) => {
                        const dateA = new Date(a.recordedAt || a.createdAt || a.date);
                        const dateB = new Date(b.recordedAt || b.createdAt || b.date);
                        return dateA - dateB;
                    });
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

    // Format Date Function (Safely extracts date values)
    const formatDate = (raw) => {
        if (!raw) return '—';
        const d = new Date(raw);
        if (isNaN(d.getTime())) return '—';
        return d.toLocaleString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // Data Processing for Chart with Fixed Date Fetching
    const chartData = useMemo(() => {
        return records.map(r => {
            const rawDate = r.recordedAt || r.createdAt || r.date;
            const parsedDate = new Date(rawDate);
            
            // Format loosely but cleanly for charts
            let displayDate = 'Unknown';
            if (!isNaN(parsedDate.getTime())) {
                displayDate = parsedDate.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            }

            return {
                rawDate: parsedDate,
                date: displayDate,
                heartRate: r.heartRate || null,
                oxygen: r.oxygenLevel || null,
                systolic: r.bloodPressure?.systolic || null,
                diastolic: r.bloodPressure?.diastolic || null,
                temperature: r.temperature || null,
                glucose: r.glucoseLevel || null
            };
        });
    }, [records]);

    // Latest Vitals
    const latest = useMemo(() => {
        if (!records.length) return null;
        return records[records.length - 1]; 
    }, [records]);

    const handleDownloadReport = async (type) => {
        const userId = user.id || user._id;
        const setLoader = type === 'weekly' ? setDownloadingWeekly : setDownloadingMonthly;
        setLoader(true);

        try {
            const baseUrl = import.meta.env.VITE_API_URL;
            const res = await fetch(`${baseUrl}/reports/export/pdf/${userId}?type=${type}`, {
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
            link.download = `PulseNova_Report_${type}_${new Date().toISOString().split('T')[0]}.pdf`;
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
        if (val < min) return '#fca130'; 
        if (val > max) return '#f93e3e'; 
        return 'var(--p-green)'; 
    };

    if (loading) {
        return (
            <div style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                    <Loader2 size={40} color="var(--p-cyan)" />
                </motion.div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', width: '100%', paddingBottom: '2rem' }}
        >
            {/* Header Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: 'var(--glass-bg)', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--glass-border)', boxShadow: '0 8px 32px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 800 }}>
                    <div style={{ padding: '8px', background: 'rgba(0,180,216,0.1)', borderRadius: '12px' }}>
                        <Activity size={26} color="var(--p-cyan)" /> 
                    </div>
                    Health Analytics Core
                </h3>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <motion.button 
                        whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(0,180,216,0.3)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleDownloadReport('weekly')}
                        disabled={downloadingWeekly}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.2rem', background: 'linear-gradient(135deg, rgba(0,180,216,0.1) 0%, rgba(0,140,200,0.1) 100%)', border: '1px solid var(--p-cyan)', color: 'var(--p-cyan)', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', opacity: downloadingWeekly ? 0.7 : 1 }}
                    >
                        {downloadingWeekly ? <Loader2 size={18} className="spin" /> : <Download size={18} />} 
                        Weekly Export
                    </motion.button>
                    <motion.button 
                        whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(0,200,151,0.3)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleDownloadReport('monthly')}
                        disabled={downloadingMonthly}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.2rem', background: 'linear-gradient(135deg, rgba(0,200,151,0.1) 0%, rgba(0,160,120,0.1) 100%)', border: '1px solid var(--p-green)', color: 'var(--p-green)', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', opacity: downloadingMonthly ? 0.7 : 1 }}
                    >
                        {downloadingMonthly ? <Loader2 size={18} className="spin" /> : <Download size={18} />} 
                        Monthly Export
                    </motion.button>
                </div>
            </div>

            {/* Quick Vitals Dashboard */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                <StatCard 
                    title="Heart Rate" 
                    value={latest?.heartRate} 
                    unit="bpm" 
                    icon={Heart} 
                    color="#f93e3e" 
                    normalRange={[60, 100]} 
                    recentData={latest?.heartRate}
                    delay={0.1}
                />
                <StatCard 
                    title="SpO2 Level" 
                    value={latest?.oxygenLevel} 
                    unit="%" 
                    icon={Wind} 
                    color="#00b4d8" 
                    normalRange={[95, 100]} 
                    recentData={latest?.oxygenLevel}
                    delay={0.2}
                />
                <StatCard 
                    title="Blood Pressure" 
                    value={latest?.bloodPressure?.systolic ? `${latest.bloodPressure.systolic}/${latest.bloodPressure.diastolic}` : null} 
                    unit="mmHg" 
                    icon={Droplets} 
                    color="#00c897" 
                    normalRange={[90, 140]} // Checking generic systolic for alert purpose
                    recentData={latest?.bloodPressure?.systolic}
                    delay={0.3}
                />
                <StatCard 
                    title="Temperature" 
                    value={latest?.temperature} 
                    unit="°C" 
                    icon={Thermometer} 
                    color="#fca130" 
                    normalRange={[36.1, 37.5]} 
                    recentData={latest?.temperature}
                    delay={0.4}
                />
            </div>

            {/* 4 Separate Detailed Charts */}
            {chartData.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
                    <AnimatedChartCard 
                        title="Heart Rate Monitor" 
                        dataKey="heartRate" 
                        color="#f93e3e" 
                        data={chartData} 
                        icon={Heart}
                        delay={0.1}
                    />
                    <AnimatedChartCard 
                        title="Oxygen Saturation Tracker" 
                        dataKey="oxygen" 
                        color="#00b4d8" 
                        data={chartData} 
                        yDomain={[80, 100]}
                        icon={Wind}
                        delay={0.2}
                    />
                    <AnimatedChartCard 
                        title="Blood Pressure Analytics" 
                        dataKey="systolic" 
                        color="#00c897" 
                        isDouble={true}
                        dataKey2="diastolic"
                        color2="#fca130"
                        data={chartData} 
                        icon={Droplets}
                        delay={0.3}
                    />
                    <AnimatedChartCard 
                        title="Body Temperature Fluctuation" 
                        dataKey="temperature" 
                        color="#fca130" 
                        data={chartData} 
                        yDomain={[35, 41]}
                        icon={Thermometer}
                        delay={0.4}
                    />
                </div>
            )}

            {/* Recent History Table */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '24px', padding: '2rem', overflowX: 'auto', backdropFilter: 'blur(16px)', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
                    <div style={{ padding: '8px', background: 'rgba(0,200,151,0.1)', borderRadius: '12px' }}>
                        <Calendar size={22} color="var(--p-green)" />
                    </div>
                    <h4 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--text-primary)', fontWeight: 800 }}>Recent Log History</h4>
                </div>
                
                {records.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Date & Time</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Heart Rate</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Blood Pressure</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Oxygen</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Source</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...records].reverse().slice(0, 10).map((log, index) => {
                                // Fix Date parsing for the table
                                const rawDate = log.recordedAt || log.createdAt || log.date;
                                const displayDate = formatDate(rawDate);

                                return (
                                <motion.tr 
                                    initial={{ opacity: 0, x: -10 }} 
                                    animate={{ opacity: 1, x: 0 }} 
                                    transition={{ delay: 0.6 + (index * 0.05) }}
                                    key={log._id || index} 
                                    style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s', cursor: 'default' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '1.2rem 1rem', color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 600 }}>
                                        {displayDate}
                                    </td>
                                    <td style={{ padding: '1.2rem 1rem', color: getStatusColor(log.heartRate, 60, 100), fontWeight: 800, fontSize: '1.05rem' }}>
                                        {log.heartRate || '-'} <span style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.8 }}>bpm</span>
                                    </td>
                                    <td style={{ padding: '1.2rem 1rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                                        {log.bloodPressure?.systolic || '-'}/{log.bloodPressure?.diastolic || '-'} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>mmHg</span>
                                    </td>
                                    <td style={{ padding: '1.2rem 1rem', color: getStatusColor(log.oxygenLevel, 95, 100), fontWeight: 800, fontSize: '1.05rem' }}>
                                        {log.oxygenLevel || '-'} <span style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.8 }}>%</span>
                                    </td>
                                    <td style={{ padding: '1.2rem 1rem' }}>
                                        <span style={{ 
                                            padding: '6px 12px', 
                                            borderRadius: '20px', 
                                            fontSize: '0.75rem', 
                                            fontWeight: 700, 
                                            background: log.source === 'pdf' ? 'rgba(0,180,216,0.15)' : 'rgba(0,200,151,0.15)', 
                                            color: log.source === 'pdf' ? 'var(--p-cyan)' : 'var(--p-green)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            {log.source || 'Manual'}
                                        </span>
                                    </td>
                                </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <div style={{ color: 'var(--admin-text-muted)', textAlign: 'center', padding: '3rem 0', background: 'rgba(0,0,0,0.2)', borderRadius: '16px' }}>
                        <Activity size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                        <div>No health records found in the database.</div>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
