import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Heart, Droplets, Thermometer, Activity, Zap,
  Plus, Upload, Clock, CheckCircle2, AlertTriangle,
  XCircle, FileText, RefreshCw, ChevronDown, ChevronUp,
  Info, TrendingUp, TrendingDown, Minus
} from 'lucide-react';
import { useAuth } from '../../context/Imasha/AuthContext';
import Header from '../../components/Tharuka/Header/Header';
import Footer from '../../components/Tharuka/Footer/Footer';
import ScrollToTop from '../../components/Tharuka/Common/ScrollToTop';
import BackgroundEffect from '../../components/Tharuka/Common/BackgroundEffect';
import HeroBanner from '../../assets/health_hero_banner.png';
import AddVitalsBG from '../../assets/health_nature_bg.jpg';
import './HealthDataPage.css';

// ─── API base ─────────────────────────────────────────────────
const API = 'http://localhost:5000/api/health-data';

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
  { key: 'heartRate',    icon: Heart,       unit: 'bpm',   labelKey: 'hd_vital_heart',   color: '#ef4444' },
  { key: 'bloodPressure', icon: Activity,    unit: 'mmHg',  labelKey: 'hd_vital_bp',      color: '#8b5cf6' },
  { key: 'oxygenLevel',  icon: Droplets,    unit: '%',     labelKey: 'hd_vital_o2',      color: '#00b4d8' },
  { key: 'temperature',  icon: Thermometer, unit: '°C',    labelKey: 'hd_vital_temp',    color: '#f59e0b' },
  { key: 'glucoseLevel', icon: Zap,         unit: 'mg/dL', labelKey: 'hd_vital_glucose', color: '#00c897' },
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
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    heartRate: '',
    systolic: '', diastolic: '',
    oxygenLevel: '',
    temperature: '',
    glucoseLevel: '',
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

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
  const visibleHistory = records.slice(0, visibleCount);
  const hasMore = visibleCount < records.length;
  const remaining = records.length - visibleCount;

  return (
    <>
      <BackgroundEffect />
      <Header />
      <main className="page-wrapper hd-page pn-page">


        {/* ── Hero Banner ─────────────────────────────────────── */}
        <div className="pn-hero-banner">
          <img
            src={HeroBanner}
            alt="Health analytics"
            className="pn-hero-img"
            loading="eager"
            decoding="async"
          />
          <div className="pn-hero-overlay" />

          <div className="pn-hero-text container">
            <div className="pn-hero-badge">
              <Activity size={13} /> {t('hd_label')}
            </div>
            <motion.h1
              className="pn-hero-title"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              {t('hd_title')}
            </motion.h1>
            <motion.p
              className="pn-hero-sub"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
            >
              {t('hd_subtitle')}
            </motion.p>
            <div className="pn-hero-stats">
              <span className="pn-hstat"><TrendingUp size={14} /> {t('hd_stats_trend')}</span>
              <span className="pn-hstat"><Heart size={14} /> {t('hd_stats_pulse')}</span>
              <span className="pn-hstat"><Zap size={14} /> {t('hd_stats_ai')}</span>
            </div>
          </div>
        </div>

        {/* ── Current Vitals ── */}
        <section className="hd-section section-pad hd-current-vitals-section">
          <div className="container">
            <div className="hd-section-head">
              <div className="hd-head-content">
                <span className="hd-badge-label">{t('hd_label_monitoring')}</span>
                <h2 className="hd-section-title">
                  <Activity size={22} /> {t('hd_current_vitals')}
                </h2>
              </div>
              <button className="hd-refresh-btn" onClick={fetchRecords} title={t('hd_refresh')}>
                <RefreshCw size={15} />
                {t('hd_refresh')}
              </button>
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
              <div className="hd-vitals-grid">
                {VITAL_CONFIG.map(({ key, icon: Icon, unit, labelKey, color }) => {
                  const rawVal = key === 'bloodPressure' ? latest.bloodPressure : latest[key];
                  const displayVal = key === 'bloodPressure' ? formatBP(latest.bloodPressure) : (rawVal ?? '—');
                  const status = getVitalStatus(key, rawVal, latest.bloodPressure);
                  const instructions = INSTRUCTIONS[key]?.[status] || [];
                  const isOpen = expandedTip === key;

                  return (
                    <motion.div
                      key={key}
                      className={`hd-vital-card hd-vital-card--${status}`}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      style={{ '--vital-color': color }}
                    >
                      <div className="hd-vital-card__header">
                        <div className="hd-vital-card__icon-wrap">
                          <Icon size={20} />
                        </div>
                        <div className={`hd-vital-card__badge hd-vital-card__badge--${status}`}>
                          <StatusIcon status={status} />
                          {t(`hd_status_${status}`)}
                        </div>
                      </div>

                      <div className="hd-vital-card__body">
                        <span className="hd-vital-card__value">
                          {displayVal}
                        </span>
                        <span className="hd-vital-card__unit">{unit}</span>
                      </div>
                      <p className="hd-vital-card__label">{t(labelKey)}</p>

                      {status !== 'no-data' && instructions.length > 0 && (
                        <button
                          className="hd-vital-card__tip-toggle"
                          onClick={() => setExpandedTip(isOpen ? null : key)}
                          aria-expanded={isOpen}
                        >
                          {t('hd_see_tips')}
                          {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>
                      )}

                      <AnimatePresence>
                        {isOpen && (
                          <motion.ul
                            className="hd-vital-card__tips"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                          >
                            {instructions.map(key2 => (
                              <li key={key2}><CheckCircle2 size={12} />{t(key2)}</li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {latest && (
              <p className="hd-last-updated">
                <Clock size={13} />
                {t('hd_last_updated')}: {formatDate(latest.recordedAt)}
                &nbsp;·&nbsp;
                <span className="hd-source-badge">{latest.source}</span>
              </p>
            )}
          </div>
        </section>

        {/* ── Add New Vitals ─────────────────────────────────── */}
        <section className="hd-add-section section-pad">
          <div className="hd-add-bg-wrap">
            <img 
              src={AddVitalsBG} 
              alt="" 
              className="hd-add-bg-img" 
              loading="lazy" 
              decoding="async" 
            />
            <div className="hd-add-bg-overlay" />
          </div>
          <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '900px' }}>
            <div className="hd-nature-card">
              <div className="hd-nature-head">
                <span className="hd-nature-badge">{t('hd_label_input')}</span>
                <h2 className="hd-nature-title">
                  <Plus size={24} style={{ marginRight: '8px' }} /> {t('hd_add_title')}
                </h2>
                <p className="hd-nature-subtitle">{t('hd_add_subtitle')}</p>
              </div>

              {/* Tab switcher */}
              <div className="hd-tabs-wrap" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <div className="hd-tabs" role="tablist" style={{ maxWidth: '400px', width: '100%', background: 'rgba(0,0,0,0.05)' }}>
                  <button
                    className={`hd-tab ${activeTab === 'manual' ? 'active' : ''}`}
                    onClick={() => setActiveTab('manual')}
                  >
                    <Activity size={16} /> {t('hd_tab_manual')}
                  </button>
                  <button
                    className={`hd-tab ${activeTab === 'pdf' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pdf')}
                  >
                    <Upload size={16} /> {t('hd_tab_pdf')}
                  </button>
                </div>
              </div>

              {/* Feedback */}
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    className={`hd-feedback hd-feedback--${feedback.type}`}
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{ marginBottom: '1.5rem' }}
                  >
                    {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                    {feedback.msg}
                  </motion.div>
                )}
              </AnimatePresence>

            {/* ── Manual Form ── */}
            {activeTab === 'manual' && (
              <motion.form
                className="hd-form glass"
                onSubmit={handleManualSubmit}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              >
                <div className="hd-form__grid">
                  {/* Heart Rate */}
                  <div className="hd-form__field">
                    <label>
                      <Heart size={14} style={{ color: '#ef4444' }} />
                      {t('hd_vital_heart')}
                    </label>
                    <div className="hd-form__input-wrap">
                      <input
                        type="number" min="20" max="250" step="1"
                        placeholder="e.g. 72"
                        value={form.heartRate}
                        onChange={e => setForm(p => ({ ...p, heartRate: e.target.value }))}
                      />
                      <span className="hd-form__unit">bpm</span>
                    </div>
                  </div>

                  {/* Blood Pressure */}
                  <div className="hd-form__field hd-form__field--double">
                    <label>
                      <Activity size={14} style={{ color: '#8b5cf6' }} />
                      {t('hd_vital_bp')}
                    </label>
                    <div className="hd-form__bp-wrap">
                      <div className="hd-form__input-wrap">
                        <input
                          type="number" min="50" max="250" step="1"
                          placeholder={t('hd_bp_sys')}
                          value={form.systolic}
                          onChange={e => setForm(p => ({ ...p, systolic: e.target.value }))}
                        />
                        <span className="hd-form__unit">sys</span>
                      </div>
                      <span className="hd-form__bp-slash">/</span>
                      <div className="hd-form__input-wrap">
                        <input
                          type="number" min="30" max="150" step="1"
                          placeholder={t('hd_bp_dia')}
                          value={form.diastolic}
                          onChange={e => setForm(p => ({ ...p, diastolic: e.target.value }))}
                        />
                        <span className="hd-form__unit">dia</span>
                      </div>
                    </div>
                    <span className="hd-form__hint">mmHg</span>
                  </div>

                  {/* Oxygen */}
                  <div className="hd-form__field">
                    <label>
                      <Droplets size={14} style={{ color: '#00b4d8' }} />
                      {t('hd_vital_o2')}
                    </label>
                    <div className="hd-form__input-wrap">
                      <input
                        type="number" min="50" max="100" step="0.1"
                        placeholder="e.g. 98"
                        value={form.oxygenLevel}
                        onChange={e => setForm(p => ({ ...p, oxygenLevel: e.target.value }))}
                      />
                      <span className="hd-form__unit">%</span>
                    </div>
                  </div>

                  {/* Temperature */}
                  <div className="hd-form__field">
                    <label>
                      <Thermometer size={14} style={{ color: '#f59e0b' }} />
                      {t('hd_vital_temp')}
                    </label>
                    <div className="hd-form__input-wrap">
                      <input
                        type="number" min="30" max="45" step="0.1"
                        placeholder="e.g. 37.0"
                        value={form.temperature}
                        onChange={e => setForm(p => ({ ...p, temperature: e.target.value }))}
                      />
                      <span className="hd-form__unit">°C</span>
                    </div>
                  </div>

                  {/* Glucose */}
                  <div className="hd-form__field">
                    <label>
                      <Zap size={14} style={{ color: '#00c897' }} />
                      {t('hd_vital_glucose')}
                    </label>
                    <div className="hd-form__input-wrap">
                      <input
                        type="number" min="20" max="600" step="1"
                        placeholder="e.g. 95"
                        value={form.glucoseLevel}
                        onChange={e => setForm(p => ({ ...p, glucoseLevel: e.target.value }))}
                      />
                      <span className="hd-form__unit">mg/dL</span>
                    </div>
                  </div>
                </div>

                <button className="btn-primary hd-form__submit" type="submit" disabled={submitting}>
                  {submitting ? <RefreshCw size={15} className="hd-spin" /> : <Plus size={15} />}
                  {submitting ? t('hd_saving') : t('hd_save_btn')}
                </button>
              </motion.form>
            )}

            {/* ── PDF Upload ── */}
            {activeTab === 'pdf' && (
              <motion.form
                className="hd-form glass"
                onSubmit={handlePdfSubmit}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              >
                <div
                  className={`hd-dropzone ${pdfDragging ? 'dragging' : ''} ${pdfFile ? 'has-file' : ''}`}
                  onDragOver={e => { e.preventDefault(); setPdfDragging(true); }}
                  onDragLeave={() => setPdfDragging(false)}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    style={{ display: 'none' }}
                    onChange={e => setPdfFile(e.target.files[0] || null)}
                  />
                  {pdfFile ? (
                    <>
                      <FileText size={40} className="hd-dropzone__icon hd-dropzone__icon--ready" />
                      <p className="hd-dropzone__filename">{pdfFile.name}</p>
                      <p className="hd-dropzone__size">{(pdfFile.size / 1024).toFixed(1)} KB</p>
                      <button
                        type="button"
                        className="hd-dropzone__remove"
                        onClick={ev => { ev.stopPropagation(); setPdfFile(null); }}
                      >
                        <XCircle size={14} /> {t('hd_remove_pdf')}
                      </button>
                    </>
                  ) : (
                    <>
                      <Upload size={40} className="hd-dropzone__icon" />
                      <p className="hd-dropzone__title">{t('hd_drop_title')}</p>
                      <p className="hd-dropzone__sub">{t('hd_drop_sub')}</p>
                    </>
                  )}
                </div>

                <div className="hd-pdf-info">
                  <Info size={14} />
                  <p>{t('hd_pdf_info')}</p>
                </div>

                <button
                  className="btn-primary hd-form__submit"
                  type="submit"
                  disabled={submitting || !pdfFile}
                >
                  {submitting ? <RefreshCw size={15} className="hd-spin" /> : <Upload size={15} />}
                  {submitting ? t('hd_processing') : t('hd_upload_btn')}
                </button>
              </motion.form>
            )}
            </div>
          </div>
        </section>

        {/* ── Recent History ── */}
        <section className="hd-section section-pad">
          <div className="container">
            <div className="n-card n-log">
              <div className="n-log-header hd-section-head" style={{ borderLeft: 'none', paddingLeft: 0, background: 'none', marginBottom: '1.5rem' }}>
                <div className="hd-head-content">
                  <span className="hd-badge-label">{t('hd_label_history')}</span>
                  <h3 className="n-log-title">
                    <Clock size={20} /> {t('hd_history')}
                  </h3>
                  <p className="n-log-sub">{t('hd_history_sub')}</p>
                </div>
                <div className="n-log-actions">
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
                          <th>{t('hd_col_date')}</th>
                          <th><Heart size={13} /> {t('hd_vital_heart')}</th>
                          <th><Activity size={13} /> {t('hd_vital_bp')}</th>
                          <th><Droplets size={13} /> {t('hd_vital_o2')}</th>
                          <th><Thermometer size={13} /> {t('hd_vital_temp')}</th>
                          <th><Zap size={13} /> {t('hd_vital_glucose')}</th>
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
                            const cls = (s) => s === 'critical' ? 'hd-val-critical' : s === 'warning' ? 'hd-val-warning' : s === 'normal' ? 'hd-val-normal' : 'hd-val-nodata';
                            return (
                          <motion.tr
                            key={rec._id}
                            variants={itemVariants}
                            className={i === 0 ? 'hd-history-table__latest' : ''}
                          >
                            <td className="hd-history-table__date">{formatDate(rec.recordedAt)}</td>
                            <td>
                              <span className={cls(hrStatus)}>{rec.heartRate ?? '—'}</span>
                              {rec.heartRate && <span className="hd-unit">bpm</span>}
                            </td>
                            <td>
                              <span className={cls(bpStatus)}>{formatBP(rec.bloodPressure)}</span>
                              {rec.bloodPressure?.systolic && <span className="hd-unit">mmHg</span>}
                            </td>
                            <td>
                              <span className={cls(o2Status)}>{rec.oxygenLevel ?? '—'}</span>
                              {rec.oxygenLevel && <span className="hd-unit">%</span>}
                            </td>
                            <td>
                              <span className={cls(tmpStatus)}>{rec.temperature ?? '—'}</span>
                              {rec.temperature && <span className="hd-unit">°C</span>}
                            </td>
                            <td>
                              <span className={cls(glcStatus)}>{rec.glucoseLevel ?? '—'}</span>
                              {rec.glucoseLevel && <span className="hd-unit">mg/dL</span>}
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
                    <div style={{ textAlign: 'center', marginTop: '1.5rem', padding: '0 1.5rem 1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                      {hasMore && (
                        <button
                          className="n-btn n-btn-outline"
                          onClick={() => setVisibleCount(c => c + 10)}
                        >
                          <ChevronDown size={15} />
                          {t('hd_show_more', { count: Math.min(10, remaining) })}
                        </button>
                      )}
                      {visibleCount > 10 && (
                        <button
                          className="n-btn n-btn-outline"
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

      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
