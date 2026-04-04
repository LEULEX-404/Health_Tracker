import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Heart, Droplets, Thermometer, Activity, Zap, FlaskConical,
  Plus, Upload, Clock, CheckCircle2, AlertTriangle,
  XCircle, FileText, RefreshCw, ChevronDown, ChevronUp,
  Info, TrendingUp, TrendingDown, Minus, ShieldCheck,
  Search, Download, CalendarDays, Lock, Sparkles,
  Bot, Stethoscope, Scale, Calendar
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { useAuth } from '../../context/Imasha/AuthContext';
import Header from '../../components/Tharuka/Header/Header';
import Footer from '../../components/Tharuka/Footer/Footer';
import ScrollToTop from '../../components/Tharuka/Common/ScrollToTop';
import BackgroundEffect from '../../components/Tharuka/Common/BackgroundEffect';
import HeroBanner from '../../assets/health_hero_banner.png';
import AddVitalsBG from '../../assets/health_nature_bg.jpg';
import './HealthDataPage.css';

// ─── API base ─────────────────────────────────────────────────
const API = `${import.meta.env.VITE_API_URL}/health-data`;

// ─── Thresholds (mirrors backend alertService.js) ─────────────
const THRESHOLDS = {
  heartRate:    { low: 40, normal_low: 60, normal_high: 100, high: 120, critical: 150 },
  oxygenLevel:  { critical: 85, low: 90, normal: 95 },
  glucoseLevel: { normal_low: 70, normal_high: 140, high: 200, critical: 400 },
  bloodPressure:{ systolicHigh: 140, diastolicHigh: 90, systolicCritical: 180, diastolicCritical: 120 },
  temperature:  { normal_low: 36, normal_high: 37.5, high: 38.5, critical: 40 },
};

// ─── Vital status evaluator ────────────────────────────────────
const getVitalStatus = (key, value, bp) => {
  if (key === 'bloodPressure' && bp) {
    const { systolic, diastolic } = bp;
    if (systolic > THRESHOLDS.bloodPressure.systolicCritical || diastolic > THRESHOLDS.bloodPressure.diastolicCritical)
      return 'critical';
    if (systolic > THRESHOLDS.bloodPressure.systolicHigh || diastolic > THRESHOLDS.bloodPressure.diastolicHigh)
      return 'warning';
    return 'normal';
  }
  if (value === undefined || value === null) return 'no-data';
  const t = THRESHOLDS[key];
  if (!t) return 'normal';
  switch (key) {
    case 'heartRate':
      if (value > t.critical || value < t.low) return 'critical';
      if (value > t.high) return 'warning';
      return 'normal';
    case 'oxygenLevel':
      if (value < t.critical) return 'critical';
      if (value < t.low) return 'warning';
      return 'normal';
    case 'glucoseLevel':
      if (value > t.critical) return 'critical';
      if (value > t.high) return 'warning';
      return 'normal';
    case 'temperature':
      if (value >= t.critical) return 'critical';
      if (value >= t.high) return 'warning';
      return 'normal';
    default:
      return 'normal';
  }
};

// ─── Instruction map ───────────────────────────────────────────
const INSTRUCTIONS = {
  heartRate: {
    normal: ['hd_hr_normal_1', 'hd_hr_normal_2'],
    warning: ['hd_hr_warning_1', 'hd_hr_warning_2', 'hd_hr_warning_3'],
    critical: ['hd_hr_critical_1', 'hd_hr_critical_2'],
  },
  oxygenLevel: {
    normal: ['hd_o2_normal_1', 'hd_o2_normal_2'],
    warning: ['hd_o2_warning_1', 'hd_o2_warning_2', 'hd_o2_warning_3'],
    critical: ['hd_o2_critical_1', 'hd_o2_critical_2'],
  },
  bloodPressure: {
    normal: ['hd_bp_normal_1', 'hd_bp_normal_2'],
    warning: ['hd_bp_warning_1', 'hd_bp_warning_2', 'hd_bp_warning_3'],
    critical: ['hd_bp_critical_1', 'hd_bp_critical_2'],
  },
  temperature: {
    normal: ['hd_temp_normal_1', 'hd_temp_normal_2'],
    warning: ['hd_temp_warning_1', 'hd_temp_warning_2', 'hd_temp_warning_3'],
    critical: ['hd_temp_critical_1', 'hd_temp_critical_2'],
  },
  glucoseLevel: {
    normal: ['hd_gluc_normal_1', 'hd_gluc_normal_2'],
    warning: ['hd_gluc_warning_1', 'hd_gluc_warning_2', 'hd_gluc_warning_3'],
    critical: ['hd_gluc_critical_1', 'hd_gluc_critical_2'],
  },
};

// ─── Status badge helper ───────────────────────────────────────
const StatusIcon = ({ status }) => {
  if (status === 'critical') return <XCircle size={14} />;
  if (status === 'warning')  return <AlertTriangle size={14} />;
  if (status === 'normal')   return <CheckCircle2 size={14} />;
  return <Minus size={14} />;
};

// ─── Format BP display ────────────────────────────────────────
const formatBP = (bp) => {
  if (!bp || bp.systolic == null) return '—';
  return `${bp.systolic}/${bp.diastolic}`;
};

// ─── Format date ──────────────────────────────────────────────
const formatDate = (dt) => {
  if (!dt) return '—';
  return new Date(dt).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

// ─── Vital card config ────────────────────────────────────────
const VITAL_CONFIG = [
  { key: 'heartRate',    icon: Heart,        unit: 'bpm',   labelKey: 'hd_vital_heart',   color: '#ff579c' },
  { key: 'bloodPressure', icon: Droplets,     unit: 'mmHg',  labelKey: 'hd_vital_bp',      color: '#8e70ff' },
  { key: 'oxygenLevel',  icon: Zap,          unit: '%',     labelKey: 'hd_vital_o2',      color: '#33b8ff' },
  { key: 'temperature',  icon: Thermometer,  unit: '°C',    labelKey: 'hd_vital_temp',    color: '#ff9e33' },
  { key: 'glucoseLevel', icon: FlaskConical, unit: 'mg/dL', labelKey: 'hd_vital_glucose', color: '#4dc933' },
];

// ══════════════════════════════════════════════════════════════
export default function HealthDataPage() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const userId = user?.id || user?._id;

  const [records, setRecords]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [submitting, setSubmitting]     = useState(false);
  const [activeTab, setActiveTab]       = useState('manual'); // 'manual' | 'pdf'
  const [visibleCount, setVisibleCount] = useState(10);
  const [pdfDragging, setPdfDragging]   = useState(false);
  const [pdfFile, setPdfFile]           = useState(null);
  const [feedback, setFeedback]         = useState(null); // { type: 'success'|'error', msg }
  const [expandedTip, setExpandedTip]   = useState(null); // key of open tip section
  const [historyQuery, setHistoryQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    heartRate: '',
    systolic: '', diastolic: '',
    oxygenLevel: '',
    temperature: '',
    glucoseLevel: '',
    weight: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  // ─── Custom Tooltip ──────────────────────────────────────────
  const CustomTooltip = ({ active, payload, label, unit }) => {
    if (active && payload && payload.length) {
      return (
        <div className="hd-custom-tooltip">
          <p className="hd-tooltip-date">{label}</p>
          <div className="hd-tooltip-row">
            <span className="hd-tooltip-val">{payload[0].value}</span>
            <span className="hd-tooltip-unit">{unit}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // ─── Chart Data Processing ─────────────────────────────────
  const chartData = useMemo(() => {
    if (!records.length) return [];
    
    // Group records by local date
    const grouped = {};
    records.forEach(rec => {
      const d = new Date(rec.recordedAt).toLocaleDateString('en-CA'); // YYYY-MM-DD
      if (!grouped[d]) grouped[d] = { hr: [], gl: [], bp: [], o2: [] };
      if (rec.heartRate) grouped[d].hr.push(rec.heartRate);
      if (rec.glucoseLevel) grouped[d].gl.push(rec.glucoseLevel);
      if (rec.oxygenLevel) grouped[d].o2.push(rec.oxygenLevel);
      if (rec.bloodPressure?.systolic) grouped[d].bp.push(rec.bloodPressure.systolic);
    });

    const days = Object.keys(grouped).sort();
    const last7 = days.slice(-7);

    return last7.map(day => ({
      date: day,
      name: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
      hr: grouped[day].hr.length ? Math.round(grouped[day].hr.reduce((a, b) => a + b, 0) / grouped[day].hr.length) : 72,
      gl: grouped[day].gl.length ? Math.round(grouped[day].gl.reduce((a, b) => a + b, 0) / grouped[day].gl.length) : 95,
      bp: grouped[day].bp.length ? Math.round(grouped[day].bp.reduce((a, b) => a + b, 0) / grouped[day].bp.length) : 120,
      o2: grouped[day].o2.length ? Math.round(grouped[day].o2.reduce((a, b) => a + b, 0) / grouped[day].o2.length) : 98,
    }));
  }, [records]);

  // ─── Fetch records ─────────────────────────────────────────
  const fetchRecords = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${API}/${userId}?limit=10000`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) setRecords(json.data);
    } catch (err) {
      console.error('fetchRecords:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, token]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  // ─── Latest record (current vitals) ───────────────────────
  const latest = records[0] || null;

  // ─── Manual submit ─────────────────────────────────────────
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const body = { userId };
      if (form.heartRate)    body.heartRate    = Number(form.heartRate);
      if (form.oxygenLevel)  body.oxygenLevel  = Number(form.oxygenLevel);
      if (form.temperature)  body.temperature  = Number(form.temperature);
      if (form.glucoseLevel) body.glucoseLevel  = Number(form.glucoseLevel);
      if (form.systolic && form.diastolic) {
        body.bloodPressure = {
          systolic:  Number(form.systolic),
          diastolic: Number(form.diastolic),
        };
      }
      const res = await fetch(`${API}/manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback({ type: 'success', msg: t('hd_saved_ok') });
        setForm({ heartRate:'', systolic:'', diastolic:'', oxygenLevel:'', temperature:'', glucoseLevel:'' });
        await fetchRecords();
      } else {
        setFeedback({ type: 'error', msg: json.message || t('hd_saved_err') });
      }
    } catch {
      setFeedback({ type: 'error', msg: t('hd_saved_err') });
    } finally {
      setSubmitting(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  // ─── PDF submit ────────────────────────────────────────────
  const handlePdfSubmit = async (e) => {
    e.preventDefault();
    if (!pdfFile) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const fd = new FormData();
      fd.append('userId', userId);
      fd.append('pdf', pdfFile);
      const res = await fetch(`${API}/pdf-upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const json = await res.json();
      if (json.success) {
        setFeedback({ type: 'success', msg: t('hd_pdf_ok') });
        setPdfFile(null);
        await fetchRecords();
      } else {
        setFeedback({ type: 'error', msg: json.message || t('hd_saved_err') });
      }
    } catch {
      setFeedback({ type: 'error', msg: t('hd_saved_err') });
    } finally {
      setSubmitting(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  // ─── Drag/Drop handlers ────────────────────────────────────
  const onDrop = (e) => {
    e.preventDefault();
    setPdfDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') setPdfFile(file);
  };

  // ─── Render ────────────────────────────────────────────────
  const recordOverallStatus = (rec) => {
    const statuses = [
      getVitalStatus('heartRate', rec.heartRate, null),
      getVitalStatus('bloodPressure', null, rec.bloodPressure),
      getVitalStatus('oxygenLevel', rec.oxygenLevel, null),
      getVitalStatus('temperature', rec.temperature, null),
      getVitalStatus('glucoseLevel', rec.glucoseLevel, null),
    ];
    if (statuses.includes('critical')) return 'critical';
    if (statuses.includes('warning')) return 'warning';
    return 'normal';
  };

  const normalizedQuery = historyQuery.trim().toLowerCase();
  const filteredRecords = records.filter((rec) => {
    const recStatus = recordOverallStatus(rec);
    const statusPass = statusFilter === 'all' || recStatus === statusFilter;
    const searchTarget = [
      formatDate(rec.recordedAt),
      rec.source || '',
      String(rec.heartRate ?? ''),
      String(rec.oxygenLevel ?? ''),
      String(rec.temperature ?? ''),
      String(rec.glucoseLevel ?? ''),
      formatBP(rec.bloodPressure),
    ].join(' ').toLowerCase();
    const searchPass = !normalizedQuery || searchTarget.includes(normalizedQuery);
    return statusPass && searchPass;
  });
  useEffect(() => {
    setVisibleCount(10);
  }, [historyQuery, statusFilter]);

  const visibleHistory = filteredRecords.slice(0, visibleCount);
  const hasMore = visibleCount < filteredRecords.length;
  const remaining = filteredRecords.length - visibleCount;
  const normalMetricsCount = latest
    ? VITAL_CONFIG.reduce((count, vital) => {
      const rawVal = vital.key === 'bloodPressure' ? null : latest[vital.key];
      const status = getVitalStatus(vital.key, rawVal, latest.bloodPressure);
      return status === 'normal' ? count + 1 : count;
    }, 0)
    : 0;

  const recentAlerts = records
    .map((rec) => ({ rec, status: recordOverallStatus(rec) }))
    .filter((x) => x.status !== 'normal')
    .slice(0, 3);

  const exportCsv = () => {
    const header = ['Date Time', 'HR', 'BP', 'SPO2', 'TEMP', 'GLUCOSE', 'STATUS', 'SOURCE'];
    const rows = filteredRecords.map((rec) => ([
      formatDate(rec.recordedAt),
      rec.heartRate ?? '',
      formatBP(rec.bloodPressure),
      rec.oxygenLevel ?? '',
      rec.temperature ?? '',
      rec.glucoseLevel ?? '',
      recordOverallStatus(rec),
      rec.source ?? '',
    ]));
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'health-data-history.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <BackgroundEffect />
      <Header />
      <main className="page-wrapper hd-page pn-page">


        {/* ── Hero Banner ─────────────────────────────────────── */}
        <div className="hd-hero-banner">
          <img
            src={HeroBanner}
            alt="Health analytics"
            className="hd-hero-img"
            loading="eager"
            decoding="async"
          />
          <div className="hd-hero-overlay" />

          <div className="hd-hero-inner container">

            {/* ── LEFT: Text Content ── */}
            <div className="hd-hero-left">
              <motion.div
                className="hd-hero-badge"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <span className="hd-hero-badge-dot" />
                LIVE HEALTH DATA
                <span className="hd-hero-badge-sep">·</span>
                Last synced 2 min ago
              </motion.div>

              <motion.h1
                className="hd-hero-title"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1 }}
              >
                Your Health<br />
                <span className="hd-hero-title-accent">Vitals</span><br />
                At a Glance
              </motion.h1>

              <motion.p
                className="hd-hero-sub"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Monitor your current vitals, review historical data, and receive personalized AI-powered insights — all in one beautiful, secure health dashboard built for real wellness.
              </motion.p>

              <motion.div
                className="hd-hero-chips"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <span className="pn-chip"><TrendingUp size={13} /> Vital Trends</span>
                <span className="pn-chip"><Heart size={13} /> Pulse Analysis</span>
                <span className="pn-chip"><Zap size={13} /> AI Insights</span>
                <span className="pn-chip"><ShieldCheck size={13} /> Encrypted Data</span>
              </motion.div>

              <motion.div
                className="hd-hero-actions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <a href="#hd-add" className="hd-hero-action">
                  <Plus size={14} /> Log New Vitals <span className="hd-hero-action-arrow">→</span>
                </a>
                <a href="#hd-history" className="hd-hero-action hd-hero-action--ghost">
                  <Clock size={14} /> View History
                </a>
              </motion.div>
            </div>

            {/* ── RIGHT: Floating Vitals Cards ── */}
            <div className="hd-hero-right">

              {/* Heart Rate – top-left small card */}
              <motion.div
                className="hd-fc hd-fc--heart"
                initial={{ opacity: 0, scale: 0.85, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.5 }}
              >
                <div className="hd-fc-icon hd-fc-icon--heart">
                  <Heart size={16} />
                </div>
                <div className="hd-fc-body">
                  <span className="hd-fc-label">Heart Rate</span>
                  <div className="hd-fc-row">
                    <span className="hd-fc-value">{latest?.heartRate ?? 72}</span>
                    <span className="hd-fc-badge hd-fc-badge--normal">Normal</span>
                  </div>
                </div>
              </motion.div>

              {/* Overall Score – central large card */}
              <motion.div
                className="hd-fc hd-fc--score"
                initial={{ opacity: 0, scale: 0.88, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <div className="hd-fc-score-head">
                  <div className="hd-fc-icon hd-fc-icon--score">
                    <Activity size={16} />
                  </div>
                  <div>
                    <div className="hd-fc-score-title">Overall Score</div>
                  </div>
                  <span className="hd-fc-badge hd-fc-badge--good">GOOD</span>
                </div>
                <div className="hd-fc-score-num">
                  <span className="hd-fc-score-big">87</span>
                  <span className="hd-fc-score-denom">/100</span>
                </div>
                <div className="hd-fc-score-updated">Updated just now</div>
                <div className="hd-fc-score-bar">
                  <div className="hd-fc-score-fill" style={{ width: '87%' }} />
                </div>
                <div className="hd-fc-score-metrics">
                  <div className="hd-fc-metric">
                    <Heart size={13} style={{ color: '#ef4444' }} />
                    <span className="hd-fc-metric-val">{latest?.heartRate ?? 72}</span>
                    <span className="hd-fc-metric-lbl">Heart</span>
                  </div>
                  <div className="hd-fc-metric">
                    <Droplets size={13} style={{ color: '#00b4d8' }} />
                    <span className="hd-fc-metric-val">{latest?.oxygenLevel ?? 98}%</span>
                    <span className="hd-fc-metric-lbl">O₂</span>
                  </div>
                  <div className="hd-fc-metric">
                    <Thermometer size={13} style={{ color: '#f59e0b' }} />
                    <span className="hd-fc-metric-val">{latest?.temperature ?? 37}°</span>
                    <span className="hd-fc-metric-lbl">Temp</span>
                  </div>
                </div>
              </motion.div>

              {/* Blood Pressure – bottom-left small card */}
              <motion.div
                className="hd-fc hd-fc--bp"
                initial={{ opacity: 0, scale: 0.85, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.7 }}
              >
                <div className="hd-fc-icon hd-fc-icon--bp">
                  <Activity size={16} />
                </div>
                <div className="hd-fc-body">
                  <span className="hd-fc-label">Blood Press.</span>
                  <div className="hd-fc-row">
                    <span className="hd-fc-value hd-fc-value--sm">
                      {latest?.bloodPressure ? `${latest.bloodPressure.systolic}/${latest.bloodPressure.diastolic}` : '120/80'}
                    </span>
                    <span className="hd-fc-unit">/80</span>
                  </div>
                </div>
              </motion.div>

              {/* Oxygen Saturation – top-right small card */}
              <motion.div
                className="hd-fc hd-fc--o2"
                initial={{ opacity: 0, scale: 0.85, x: 10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 0.55, delay: 0.65 }}
              >
                <div className="hd-fc-icon hd-fc-icon--o2">
                  <Droplets size={16} />
                </div>
                <div className="hd-fc-body">
                  <span className="hd-fc-label">Oxygen Sat.</span>
                  <span className="hd-fc-value">{latest?.oxygenLevel ?? 98}<span className="hd-fc-unit-inline">%</span></span>
                </div>
              </motion.div>

              {/* Temperature – bottom-right small card */}
              <motion.div
                className="hd-fc hd-fc--temp"
                initial={{ opacity: 0, scale: 0.85, x: 10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 0.55, delay: 0.75 }}
              >
                <div className="hd-fc-icon hd-fc-icon--temp">
                  <Thermometer size={16} />
                </div>
                <div className="hd-fc-body">
                  <span className="hd-fc-label">Temperature</span>
                  <span className="hd-fc-value">{latest?.temperature ?? 37.1}<span className="hd-fc-unit-inline">°C</span></span>
                </div>
              </motion.div>

            </div>{/* end hd-hero-right */}
          </div>{/* end hd-hero-inner */}
        </div>

        {/* ── Current Vitals ── */}
        <section className="hd-section section-pad hd-current-vitals-section">
          <div className="container">
            {/* ── Header Area ── */}
            <div className="hd-vitals-header">
              <div className="hd-vitals-header__left">
                <motion.div 
                  className="hd-live-badge"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <span className="hd-live-dot" />
                  LIVE READINGS
                </motion.div>
                <h2 className="hd-vitals-title">Current Vitals</h2>
                <p className="hd-vitals-desc">
                  Real-time health metrics from your latest session. Click any card for detailed trends and AI analysis.
                </p>
              </div>

              <div className="hd-vitals-header__right">
                <div className="hd-pill-row">
                  <div className="hd-pill hd-pill--sync">
                    <RefreshCw size={14} className="hd-sync-icon" />
                    Auto-sync on
                  </div>
                  <div className="hd-pill hd-pill--date">
                    <CalendarDays size={14} />
                    {latest 
                      ? new Date(latest.recordedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) 
                      : 'Today'}
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="hd-skeleton-grid">
                {[...Array(5)].map((_, i) => <div key={i} className="hd-skeleton" />)}
              </div>
            ) : !latest ? (
              <div className="hd-empty">
                <Info size={36} />
                <p>{t('hd_no_data')}</p>
              </div>
            ) : (
              <>
                <div className="hd-vitals-grid">
                  {VITAL_CONFIG.map(({ key, icon: Icon, unit, labelKey, color }) => {
                    const rawVal = key === 'bloodPressure' ? latest.bloodPressure : latest[key];
                    const displayVal = key === 'bloodPressure' ? formatBP(latest.bloodPressure) : (rawVal ?? '—');
                    const status = getVitalStatus(key, rawVal, latest.bloodPressure);
                    
                    // Screenshot specific status labels
                    const getScreenshotStatus = (k, s) => {
                      if (s === 'critical') return 'Critical';
                      if (s === 'warning') return 'Watch';
                      if (k === 'bloodPressure' && s === 'normal') return 'Optimal';
                      if (k === 'oxygenLevel' && s === 'normal') return 'Excellent';
                      return 'Normal';
                    };

                    const screenshotStatus = getScreenshotStatus(key, status);
                    const statusClass = screenshotStatus.toLowerCase();

                    // Specific ranges for visualization reference
                    const ranges = {
                      heartRate: '60-100 bpm',
                      bloodPressure: '<120/80 mmHg',
                      oxygenLevel: '95-100%',
                      temperature: '36.1-37.2°C',
                      glucoseLevel: '70-100 mg/dL'
                    };

                    // Simulated sparkline path based on status
                    const sparkPath = status === 'normal' 
                      ? "M0,20 Q15,5 30,22 T60,18 T90,20" 
                      : "M0,25 L10,15 L20,30 L35,8 L50,35 L65,12 L80,25 L90,15";

                    return (
                      <motion.div
                        key={key}
                        className={`hd-v-card hd-v-card--${statusClass}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -10, scale: 1.05 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        style={{ '--vital-card-color': color }}
                      >
                        <div className="hd-v-card__top">
                          <div className="hd-v-card__icon-box" style={{ backgroundColor: `${color}15`, color: color }}>
                            <Icon size={22} fill={color} stroke="currentColor" strokeWidth={1.5} />
                          </div>
                          <div className={`hd-v-card__status hd-v-card__status--${statusClass}`}>
                            {screenshotStatus}
                          </div>
                        </div>

                        <div className="hd-v-card__label">{t(labelKey).replace('Heart Rate', 'HEART RATE').replace('Blood Pressure', 'BLOOD PRESSURE').replace('Oxygen Level', 'OXYGEN LEVEL').replace('Temperature', 'TEMPERATURE').replace('Glucose Level', 'GLUCOSE LEVEL')}</div>
                        
                        <div className="hd-v-card__value-row">
                          <span className="hd-v-card__val">{displayVal}</span>
                          <span className="hd-v-card__unit">{unit}</span>
                        </div>

                        <div className="hd-v-card__spark">
                          <svg viewBox="0 0 90 40" className="hd-spark-svg" preserveAspectRatio="none">
                            <motion.path
                              d={sparkPath}
                              stroke={color}
                              strokeWidth="2"
                              strokeLinecap="round"
                              fill="none"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 1.5 }}
                            />
                          </svg>
                        </div>

                        <div className="hd-v-card__range">
                          Normal: {ranges[key]}
                        </div>

                        <div className="hd-v-card__insights">
                          {screenshotStatus !== 'Watch' && screenshotStatus !== 'Critical' ? (
                            <>
                              <div className="hd-insight-item">
                                <CheckCircle2 size={14} className="hd-insight-icon" />
                                {key === 'heartRate' ? 'Resting heart rate within healthy range' : 'Metrics within healthy range'}
                              </div>
                              <div className="hd-insight-item">
                                {key === 'heartRate' ? (
                                  <><TrendingUp size={14} className="hd-insight-icon" style={{ color: '#0ea5e9' }} /> +2 vs yesterday</>
                                ) : (
                                  <><CheckCircle2 size={14} className="hd-insight-icon" /> Stable trend maintained</>
                                )}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="hd-insight-item hd-insight-item--warning">
                                <Info size={14} className="hd-insight-icon" />
                                Slightly elevated — consider a light walk
                              </div>
                              <div className="hd-insight-item hd-insight-item--warning">
                                <TrendingUp size={14} className="hd-insight-icon" />
                                +8 vs last check
                              </div>
                            </>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Summary Status Bar */}
                <div className="hd-vitals-summary">
                  <div className="hd-summary-left">
                    <div className="hd-summary-shield">
                      <ShieldCheck size={20} />
                    </div>
                    <div className="hd-summary-text">
                      <div className="hd-summary-main">
                        {normalMetricsCount} of {VITAL_CONFIG.length} metrics normal
                      </div>
                      <div className="hd-summary-sub">
                        {normalMetricsCount === 5 
                          ? "All health indicators are optimal." 
                          : "Some readings are outside the ideal range — no immediate action needed."}
                      </div>
                    </div>
                  </div>

                  <div className="hd-summary-center">
                    <div className="hd-legend">
                      <span className="hd-legend-item"><span className="hd-dot hd-dot--normal" /> Normal</span>
                      <span className="hd-legend-item"><span className="hd-dot hd-dot--watch" /> Watch</span>
                      <span className="hd-legend-item"><span className="hd-dot hd-dot--alert" /> Alert</span>
                    </div>
                  </div>

                  <div className="hd-summary-right">
                    <a href="#report" className="hd-report-link">
                      Full Health Report <span>→</span>
                    </a>
                  </div>
                </div>
              </>
            )}

            {latest && (
              <p className="hd-last-updated-slim">
                <Clock size={12} />
                Last synchronized: {formatDate(latest.recordedAt)}
              </p>
            )}


          </div>
        </section>

        {/* ── Add New Vitals ─────────────────────────────────── */}
        <section className="hd-add-section section-pad" id="hd-add">
          <div className="container hd-add-layout">
            {/* ── Left Sidebar ── */}
            <div className="hd-add-left">
              <div className="hd-entry-badge">
                <Plus size={14} /> DATA ENTRY
              </div>
              <h2 className="hd-add-title">
                Log New <span className="hd-title-accent">Vitals</span>
              </h2>
              <p className="hd-add-desc">
                Enter your latest health measurements manually or upload a medical PDF report. 
                Your data is encrypted and securely stored.
              </p>

              <div className="hd-feature-stack">
                <div className="hd-feature-mini">
                  <div className="hd-mini-icon"><Lock size={16} /></div>
                  <div className="hd-mini-text">
                    <strong>End-to-End Encrypted</strong>
                    <span>Military-grade encryption</span>
                  </div>
                </div>
                <div className="hd-feature-mini">
                  <div className="hd-mini-icon"><ShieldCheck size={16} /></div>
                  <div className="hd-mini-text">
                    <strong>HIPAA Compliant</strong>
                    <span>Fully certified platform</span>
                  </div>
                </div>
                <div className="hd-feature-mini">
                  <div className="hd-mini-icon"><Bot size={16} /></div>
                  <div className="hd-mini-text">
                    <strong>AI Analysis Ready</strong>
                    <span>Get instant insights after logging</span>
                  </div>
                </div>
              </div>

              <div className="hd-doctor-promo">
                <div className="hd-promo-icon">
                  <Stethoscope size={24} />
                </div>
                <div className="hd-promo-content">
                  <h3>Book Doctor Review</h3>
                  <p>Get a specialist to review your data</p>
                  <button className="hd-promo-btn">Schedule Review <span className="hd-arrow">→</span></button>
                </div>
              </div>
            </div>

            {/* ── Right Form Card ── */}
            <div className="hd-form-card">
              <div className="hd-form-header">
                <div className="hd-form-title-area">
                  <h3>Record Health Data</h3>
                  <p>All fields are optional — enter what you have</p>
                </div>
                
                <div className="hd-form-tabs">
                  <button 
                    className={`hd-form-tab ${activeTab === 'manual' ? 'active' : ''}`}
                    onClick={() => setActiveTab('manual')}
                  >
                    <Plus size={14} /> Manual Entry
                  </button>
                  <button 
                    className={`hd-form-tab ${activeTab === 'pdf' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pdf')}
                  >
                    <Upload size={14} /> Upload PDF
                  </button>
                </div>
              </div>

              {/* Feedback messages */}
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    className={`hd-feedback hd-feedback--${feedback.type}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    style={{ margin: '0 1.5rem 1.5rem' }}
                  >
                    {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                    {feedback.msg}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {activeTab === 'manual' ? (
                  <motion.form 
                    key="manual"
                    className="hd-main-form"
                    onSubmit={handleManualSubmit}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <div className="hd-input-grid">
                      {/* Heart Rate */}
                      <div className="hd-input-group">
                        <label>HEART RATE</label>
                        <div className="hd-input-box">
                          <Heart size={16} className="hd-input-icon hd-icon-hr" />
                          <input 
                            type="number" placeholder="e.g. 72" 
                            value={form.heartRate} 
                            onChange={e => setForm({...form, heartRate: e.target.value})}
                          />
                          <span className="hd-input-unit">bpm</span>
                        </div>
                      </div>

                      {/* Blood Pressure */}
                      <div className="hd-input-group">
                        <label>BLOOD PRESSURE</label>
                        <div className="hd-input-box">
                          <Droplets size={16} className="hd-input-icon hd-icon-bp" />
                          <input 
                            type="text" placeholder="e.g. 120/80" 
                            value={form.systolic && form.diastolic ? `${form.systolic}/${form.diastolic}` : ''}
                            onChange={e => {
                              const [s, d] = e.target.value.split('/');
                              setForm({...form, systolic: s || '', diastolic: d || ''});
                            }}
                          />
                          <span className="hd-input-unit">mmHg</span>
                        </div>
                      </div>

                      {/* Oxygen */}
                      <div className="hd-input-group">
                        <label>OXYGEN LEVEL</label>
                        <div className="hd-input-box">
                          <Zap size={16} className="hd-input-icon hd-icon-o2" />
                          <input 
                            type="number" placeholder="e.g. 98" 
                            value={form.oxygenLevel}
                            onChange={e => setForm({...form, oxygenLevel: e.target.value})}
                          />
                          <span className="hd-input-unit">%</span>
                        </div>
                      </div>

                      {/* Temperature */}
                      <div className="hd-input-group">
                        <label>BODY TEMPERATURE</label>
                        <div className="hd-input-box">
                          <Thermometer size={16} className="hd-input-icon hd-icon-temp" />
                          <input 
                            type="number" placeholder="e.g. 37.1" 
                            value={form.temperature}
                            onChange={e => setForm({...form, temperature: e.target.value})}
                          />
                          <span className="hd-input-unit">°C</span>
                        </div>
                      </div>

                      {/* Glucose */}
                      <div className="hd-input-group">
                        <label>GLUCOSE LEVEL</label>
                        <div className="hd-input-box">
                          <FlaskConical size={16} className="hd-input-icon hd-icon-gluc" />
                          <input 
                            type="number" placeholder="e.g. 95" 
                            value={form.glucoseLevel}
                            onChange={e => setForm({...form, glucoseLevel: e.target.value})}
                          />
                          <span className="hd-input-unit">mg/dL</span>
                        </div>
                      </div>

                      {/* Weight */}
                      <div className="hd-input-group">
                        <label>WEIGHT</label>
                        <div className="hd-input-box">
                          <Scale size={16} className="hd-input-icon hd-icon-weight" />
                          <input 
                            type="number" placeholder="e.g. 70.5" 
                            value={form.weight}
                            onChange={e => setForm({...form, weight: e.target.value})}
                          />
                          <span className="hd-input-unit">kg</span>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="hd-input-group">
                        <label>DATE</label>
                        <div className="hd-input-box">
                          <Calendar size={16} className="hd-input-icon" />
                          <input 
                            type="date" 
                            value={form.date}
                            onChange={e => setForm({...form, date: e.target.value})}
                          />
                        </div>
                      </div>

                      {/* Time */}
                      <div className="hd-input-group">
                        <label>TIME</label>
                        <div className="hd-input-box">
                          <Clock size={16} className="hd-input-icon" />
                          <input 
                            type="time" 
                            value={form.time}
                            onChange={e => setForm({...form, time: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="hd-form-notes">
                      <label>NOTES <span>(optional)</span></label>
                      <textarea 
                        placeholder="How are you feeling? Any symptoms or context to add..."
                        value={form.notes}
                        onChange={e => setForm({...form, notes: e.target.value})}
                      />
                    </div>

                    <button type="submit" className="hd-save-btn" disabled={submitting}>
                      <FileText size={18} /> {submitting ? 'Saving...' : 'Save Health Data'}
                    </button>
                  </motion.form>
                ) : (
                  <motion.div 
                    key="pdf"
                    className="hd-pdf-upload-area"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <div 
                      className={`hd-dropzone ${pdfDragging ? 'dragging' : ''}`}
                      onDragOver={e => { e.preventDefault(); setPdfDragging(true); }}
                      onDragLeave={() => setPdfDragging(false)}
                      onDrop={onDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={32} className="hd-drop-icon" />
                      <h4>Drop your health report here</h4>
                      <p>or click to browse your files (PDF only)</p>
                      <input 
                        ref={fileInputRef}
                        type="file" accept=".pdf" 
                        onChange={e => setPdfFile(e.target.files[0] || null)}
                        style={{ display: 'none' }}
                      />
                      <button type="button" className="hd-browse-btn" onClick={() => fileInputRef.current?.click()}>Browse PDF</button>
                    </div>

                    {pdfFile && (
                      <div className="hd-file-preview">
                        <FileText size={16} />
                        <span>{pdfFile.name} ({(pdfFile.size / 1024).toFixed(1)} KB)</span>
                        <button type="button" onClick={() => setPdfFile(null)}>Remove</button>
                      </div>
                    )}

                    <button 
                      className="hd-save-btn" 
                      onClick={handlePdfSubmit}
                      disabled={!pdfFile || submitting}
                    >
                      <Upload size={18} /> {submitting ? 'Analyzing...' : 'Parse & Extract Vitals'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* ── Recent History ── */}
        <section className="hd-section section-pad" id="hd-history">
          <div className="container">
            <div className="n-card n-log">
              <div className="n-log-header hd-section-head">
                <div className="hd-head-content">
                  <span className="hd-badge-label">{t('hd_label_history')}</span>
                  <h3 className="n-log-title">
                    <Clock size={20} /> {t('hd_history')}
                  </h3>
                  <p className="n-log-sub">{t('hd_history_sub')}</p>
                </div>
                <div className="n-log-actions">
                  <div className="hd-history-toolbar">
                    <div className="hd-search-wrap">
                      <Search size={14} />
                      <input
                        value={historyQuery}
                        onChange={(e) => setHistoryQuery(e.target.value)}
                        placeholder="Search records..."
                      />
                    </div>
                    <div className="hd-filter-chips">
                      {['all', 'normal', 'warning', 'critical'].map((status) => (
                        <button
                          key={status}
                          className={`hd-chip ${statusFilter === status ? 'active' : ''}`}
                          onClick={() => setStatusFilter(status)}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                    <button className="hd-export-btn" onClick={exportCsv}>
                      <Download size={14} /> Export CSV
                    </button>
                  </div>
                  <button className="hd-refresh-btn" onClick={fetchRecords} title={t('hd_refresh')}>
                    <RefreshCw size={15} className={loading ? 'hd-spin' : ''} />
                    {t('hd_refresh')}
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="n-loader">
                  <div className="n-spinner" />
                  <span>{t('hd_loading_history') || 'Loading history...'}</span>
                </div>
              ) : records.length === 0 ? (
                <div className="n-empty">
                  <div className="n-empty-icon"><Clock size={52} /></div>
                  <p>{t('hd_no_history')}</p>
                </div>
              ) : (
                <>
                  <div className="n-table-wrap">
                    <table className="n-table">
                      <thead>
                        <tr>
                          <th>{t('hd_col_date')} & TIME</th>
                          <th><Heart size={13} style={{ color: '#ff4d4d' }} /> HR</th>
                          <th><Activity size={13} style={{ color: '#7f56d9' }} /> BP</th>
                          <th><Droplets size={13} style={{ color: '#2e90fa' }} /> SPO<sub>2</sub></th>
                          <th><Thermometer size={13} style={{ color: '#f79009' }} /> TEMP</th>
                          <th><Zap size={13} style={{ color: '#0694a2' }} /> GLUCOSE</th>
                          <th>STATUS</th>
                          <th style={{ textAlign: 'right' }}>{t('hd_col_source')}</th>
                        </tr>
                      </thead>
                      <motion.tbody
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        {visibleHistory.map((rec, i) => {
                            const hrStatus  = getVitalStatus('heartRate',    rec.heartRate,    null);
                            const o2Status  = getVitalStatus('oxygenLevel',  rec.oxygenLevel,  null);
                            const tmpStatus = getVitalStatus('temperature',  rec.temperature,  null);
                            const glcStatus = getVitalStatus('glucoseLevel', rec.glucoseLevel, null);
                            const bpStatus  = getVitalStatus('bloodPressure', null, rec.bloodPressure);
                            
                            // Overall row status
                            const allS = [hrStatus, o2Status, tmpStatus, glcStatus, bpStatus];
                            let activeStatus = 'normal';
                            if(allS.includes('critical')) activeStatus = 'critical';
                            else if(allS.includes('warning')) activeStatus = 'warning';

                            const cls = (s) => s === 'critical' ? 'hd-val-critical' : s === 'warning' ? 'hd-val-warning' : s === 'normal' ? 'hd-val-normal' : 'hd-val-nodata';
                            
                            const dateObj = new Date(rec.recordedAt);
                            const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                            const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

                            return (
                          <motion.tr
                            key={rec._id}
                            variants={itemVariants}
                            className={i === 0 ? 'hd-history-table__latest' : ''}
                          >
                            <td className="hd-history-table__date">
                              <span className="hd-date-main">{dateStr}</span>
                              <span className="hd-time-sub">{timeStr}</span>
                            </td>
                            <td>
                              <span className={cls(hrStatus)}>{rec.heartRate ?? '—'}</span>
                              {rec.heartRate && <span className="hd-unit-inline">bpm</span>}
                            </td>
                            <td>
                              <span className={cls(bpStatus)}>{formatBP(rec.bloodPressure)}</span>
                              {rec.bloodPressure?.systolic && <span className="hd-unit-inline">mmHg</span>}
                            </td>
                            <td>
                              <span className={cls(o2Status)}>{rec.oxygenLevel ?? '—'}</span>
                              {rec.oxygenLevel && <span className="hd-unit-inline">%</span>}
                            </td>
                            <td>
                              <span className={cls(tmpStatus)}>{rec.temperature ?? '—'}</span>
                              {rec.temperature && <span className="hd-unit-inline">°C</span>}
                            </td>
                            <td>
                              <span className={cls(glcStatus)}>{rec.glucoseLevel ?? '—'}</span>
                              {rec.glucoseLevel && <span className="hd-unit-inline">mg/dL</span>}
                            </td>
                            <td>
                              <div className={`hd-status-pill hd-status-pill--${activeStatus}`}>
                                {activeStatus === 'critical' ? 'High' : activeStatus === 'warning' ? 'Elevated' : 'Normal'}
                              </div>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <span className="hd-source-badge">{rec.source}</span>
                            </td>
                          </motion.tr>
                            );
                          })}
                      </motion.tbody>
                    </table>
                  </div>

        {(hasMore || visibleCount > 10) && (
                    <div className="hd-history-actions">
                      {hasMore && (
                        <button
                          className="n-btn n-btn-outline hd-action-extra"
                          onClick={() => setVisibleCount(c => c + 10)}
                        >
                          <ChevronDown size={15} />
                          {t('hd_show_more', { count: Math.min(10, remaining) })}
                        </button>
                      )}
                      {visibleCount > 10 && (
                        <button
                          className="n-btn n-btn-outline hd-action-extra"
                          onClick={() => setVisibleCount(10)}
                        >
                          <ChevronUp size={15} /> {t('hd_show_less')}
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>

        {/* ── Smart Health Insights ── */}
        <section className="hd-section section-pad hd-insights-section" id="hd-insights">
          <div className="container">
            <div className="hd-section-head--ai">
              <div className="hd-ai-header-group">
                <motion.span 
                  className="hd-ai-badge-top"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Sparkles size={13} /> PULSENOVA AI
                </motion.span>
                <h2 className="hd-insights-title">Smart Health Insights</h2>
              </div>
              <p className="hd-insights-sub">Your personalized wellness intelligence dashboard. PulseNova AI analyzes your historical vitals to predict trends and provide data-backed health recommendations.</p>
            </div>

            <div className="hd-insights-grid">
              {/* Score Card */}
              <div className="hd-score-card">
                <div className="hd-score-top">
                   <div className="hd-score-label">WEEKLY HEALTH SCORE</div>
                   <div className="hd-score-badge">OPTIMAL</div>
                </div>
                <div className="hd-score-main">
                  <div className="hd-score-val-area">
                    <span className="hd-score-num">87</span>
                    <span className="hd-score-out-of">/100</span>
                  </div>
                  <div className="hd-score-chart-circle">
                    <div className="hd-score-icon-bg"><ShieldCheck size={36} fill="#fff" opacity={0.2} /></div>
                  </div>
                </div>
                
                <div className="hd-score-trend-strip">
                  <div className="hd-score-trend-box positive">
                    <TrendingUp size={16} />
                    <span>+6% this week</span>
                  </div>
                  <span className="hd-score-trend-desc">Health indicators stable</span>
                </div>

                <div className="hd-score-details">
                  <div className="hd-score-mini">
                    <Activity size={14} />
                    <div className="hd-mini-label">Activity Index</div>
                    <div className="hd-mini-val">High (8.4/10)</div>
                  </div>
                  <div className="hd-score-mini">
                      <Clock size={14} />
                      <div className="hd-mini-label">Sleep Quality</div>
                      <div className="hd-mini-val">82% (Excellent)</div>
                  </div>
                  <div className="hd-score-mini">
                      <Droplets size={14} />
                      <div className="hd-mini-label">Hydration Level</div>
                      <div className="hd-mini-val">2.2L (Stable)</div>
                  </div>
                </div>
              </div>

              {/* Trend Cards */}
              <div className="hd-trend-card hr">
                <div className="hd-trend-top">
                  <div className="hd-trend-icon"><Heart size={18} /></div>
                  <span className="hd-trend-status improving">Improving</span>
                </div>
                <h4 className="hd-trend-title">Heart Rate Trend</h4>
                <p className="hd-trend-val">-4 bpm avg vs last week</p>
                <div className="hd-trend-mini-chart">
                  <ResponsiveContainer width="100%" height={70}>
                    <BarChart data={chartData}>
                      <Tooltip content={<CustomTooltip unit="bpm" />} cursor={{ fill: 'rgba(255, 77, 77, 0.1)' }} />
                      <Bar dataKey="hr" radius={[3, 3, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#ff4d4d' : '#ff4d4d44'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="hd-chart-days">
                    {chartData.map(d => <span key={d.date}>{d.name}</span>)}
                  </div>
                </div>
              </div>

              <div className="hd-trend-card bp">
                <div className="hd-trend-top">
                  <div className="hd-trend-icon"><Activity size={18} /></div>
                  <span className="hd-trend-status stable">Stable</span>
                </div>
                <h4 className="hd-trend-title">Blood Pressure</h4>
                <p className="hd-trend-val">Within optimal range</p>
                <div className="hd-trend-mini-chart">
                  <ResponsiveContainer width="100%" height={70}>
                    <BarChart data={chartData}>
                      <Tooltip content={<CustomTooltip unit="mmHg" />} cursor={{ fill: 'rgba(127, 86, 217, 0.1)' }} />
                      <Bar dataKey="bp" radius={[3, 3, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#7f56d9' : '#7f56d944'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="hd-chart-days">
                    {chartData.map(d => <span key={d.date}>{d.name}</span>)}
                  </div>
                </div>
              </div>

              <div className="hd-trend-card gl">
                <div className="hd-trend-top">
                  <div className="hd-trend-icon"><FlaskConical size={18} /></div>
                  <span className="hd-trend-status attention">Attention</span>
                </div>
                <h4 className="hd-trend-title">Glucose Levels</h4>
                <p className="hd-trend-val">+8 mg/dL vs 7-day avg</p>
                <div className="hd-trend-mini-chart">
                  <ResponsiveContainer width="100%" height={70}>
                    <BarChart data={chartData}>
                      <Tooltip content={<CustomTooltip unit="mg/dL" />} cursor={{ fill: 'rgba(6, 148, 162, 0.1)' }} />
                      <Bar dataKey="gl" radius={[3, 3, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#0694a2' : '#0694a244'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="hd-chart-days">
                    {chartData.map(d => <span key={d.date}>{d.name}</span>)}
                  </div>
                </div>
              </div>

              <div className="hd-trend-card ox">
                <div className="hd-trend-top">
                  <div className="hd-trend-icon"><Zap size={18} /></div>
                  <span className="hd-trend-status excellent">Excellent</span>
                </div>
                <h4 className="hd-trend-title">Oxygen Saturation</h4>
                <p className="hd-trend-val">98.2% weekly average</p>
                <div className="hd-trend-mini-chart">
                  <ResponsiveContainer width="100%" height={70}>
                    <BarChart data={chartData}>
                      <Tooltip content={<CustomTooltip unit="%" />} cursor={{ fill: 'rgba(46, 144, 250, 0.1)' }} />
                      <Bar dataKey="o2" radius={[3, 3, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#2e90fa' : '#2e90fa44'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="hd-chart-days">
                    {chartData.map(d => <span key={d.date}>{d.name}</span>)}
                  </div>
                </div>
              </div>
            </div>

            <div className="hd-insights-secondary">
              <div className="hd-tips-col">
                <div className="hd-tips-head">
                  <div className="hd-tips-icon"><Bot size={20} /></div>
                  <div>
                    <h3 className="hd-tips-title">AI Health Tips</h3>
                    <p className="hd-tips-sub">Personalized for your data — updated daily</p>
                  </div>
                </div>

                <div className="hd-tip-item">
                  <div className="hd-tip-icon-box nutrition"><Scale size={18} /></div>
                  <div className="hd-tip-content">
                    <div className="hd-tip-top">
                      <span className="hd-tip-label">Nutrition</span>
                      <span className="hd-tip-badge warning">Action Needed</span>
                    </div>
                    <p className="hd-tip-text">Your glucose is trending slightly high. Try reducing simple carbs at breakfast — swap white bread for whole grain or oats.</p>
                  </div>
                </div>

                <div className="hd-tip-item">
                  <div className="hd-tip-icon-box activity"><Activity size={18} /></div>
                  <div className="hd-tip-content">
                    <div className="hd-tip-top">
                      <span className="hd-tip-label">Activity</span>
                      <span className="hd-tip-badge success">Great</span>
                    </div>
                    <p className="hd-tip-text">Your heart rate improved by 4 bpm this week. Continue your current workout routine — it's working.</p>
                  </div>
                </div>

                <div className="hd-tip-item">
                  <div className="hd-tip-icon-box hydration"><Droplets size={18} /></div>
                  <div className="hd-tip-content">
                    <div className="hd-tip-top">
                      <span className="hd-tip-label">Hydration</span>
                      <span className="hd-tip-badge info">Note</span>
                    </div>
                    <p className="hd-tip-text">Your body temperature has been slightly elevated on 2 days this week. Ensure adequate water intake — aim for 2.5L/day.</p>
                  </div>
                </div>

                <div className="hd-tip-item">
                  <div className="hd-tip-icon-box sleep"><Clock size={18} /></div>
                  <div className="hd-tip-content">
                    <div className="hd-tip-top">
                      <span className="hd-tip-label">Sleep</span>
                      <span className="hd-tip-badge success">Great</span>
                    </div>
                    <p className="hd-tip-text">Evening vitals are stronger than morning — this suggests good sleep recovery. Maintain your current sleep schedule.</p>
                  </div>
                </div>
              </div>

              <div className="hd-anomalies-col">
                <div className="hd-anomalies-card">
                  <div className="hd-anomaly-head">
                    <div className="hd-anomaly-icon"><AlertTriangle size={20} /></div>
                    <div>
                      <h3 className="hd-anomaly-title">Anomalies Detected</h3>
                      <p className="hd-anomaly-sub">Past 7 days</p>
                    </div>
                  </div>

                  <div className="hd-anomaly-list">
                    <div className="hd-anomaly-item critical">
                      <div className="hd-anomaly-top">
                        <span className="hd-anomaly-label">Blood Pressure</span>
                        <span className="hd-anomaly-badge critical">High</span>
                      </div>
                      <div className="hd-anomaly-val">140/92 <span className="hd-anomaly-sep">·</span> Normal: &lt; 130/80</div>
                      <p className="hd-anomaly-desc">Significantly elevated. Logged high stress and fatigue.</p>
                      <span className="hd-anomaly-date">Mar 27</span>
                    </div>

                    <div className="hd-anomaly-item warning">
                      <div className="hd-anomaly-top">
                        <span className="hd-anomaly-label">Heart Rate</span>
                        <span className="hd-anomaly-badge warning">Moderate</span>
                      </div>
                      <div className="hd-anomaly-val">88 bpm <span className="hd-anomaly-sep">·</span> Normal: 60-80 bpm</div>
                      <p className="hd-anomaly-desc">Above resting target. Activity before measurement likely cause.</p>
                      <span className="hd-anomaly-date">Mar 23</span>
                    </div>
                  </div>
                </div>

                <div className="hd-wellness-card">
                   <div className="hd-wellness-head">
                      <Sparkles size={18} className="hd-wellness-spark" />
                      <h3 className="hd-wellness-title">Today's Wellness</h3>
                   </div>
                   <div className="hd-goal-list">
                      <motion.div 
                        className="hd-goal-item done"
                        whileHover={{ x: 5 }}
                      >
                        <div className="hd-goal-check"><CheckCircle2 size={16} /></div>
                        <span className="hd-goal-text">30 min brisk walk</span>
                      </motion.div>
                      <motion.div 
                        className="hd-goal-item"
                        whileHover={{ x: 5 }}
                      >
                        <div className="hd-goal-check"></div>
                        <span className="hd-goal-text">Drink 2.5L water</span>
                      </motion.div>
                      <motion.div 
                        className="hd-goal-item"
                        whileHover={{ x: 5 }}
                      >
                        <div className="hd-goal-check"></div>
                        <span className="hd-goal-text">Reduce sugar intake</span>
                      </motion.div>
                      <motion.div 
                        className="hd-goal-item"
                        whileHover={{ x: 5 }}
                      >
                        <div className="hd-goal-check"></div>
                        <span className="hd-goal-text">7-8 hrs sleep tonight</span>
                      </motion.div>
                   </div>
                   <div className="hd-wellness-footer">
                      <span>25% Completed</span>
                      <div className="hd-wellness-progress">
                        <div className="hd-wellness-fill" style={{ width: '25%' }} />
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
