import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Salad, Dumbbell, BarChart3, Bell, Stethoscope, HeartHandshake,
  LayoutGrid, CircleDot, Zap, ShieldCheck, ArrowRight,
  Activity, Database, Clock, Monitor, Award, Users
} from 'lucide-react';
import './FeaturesSection.css';

const FEATURES = [
  {
    key: 'nutrition',
    Icon: Salad,
    badge: 'AI INSIGHTS',
    color: { from: '#00c897', to: '#00a876' },   /* green */
    stats: [
      { Icon: Database, label: '500K+ Foods' },
      { Icon: Zap, label: 'AI-Powered' },
    ],
  },
  {
    key: 'exercise',
    Icon: Dumbbell,
    badge: 'SMART TRACKING',
    color: { from: '#00b4d8', to: '#0077b6' },   /* ocean blue */
    stats: [
      { Icon: Activity, label: 'Real-time' },
      { Icon: LayoutGrid, label: '200+ Workouts' },
    ],
  },
  {
    key: 'reports',
    Icon: BarChart3,
    badge: 'REAL-TIME',
    color: { from: '#10b981', to: '#059669' },   /* emerald */
    stats: [
      { Icon: CircleDot, label: 'Trend Analysis' },
      { Icon: Monitor, label: 'PDF Export' },
    ],
  },
  {
    key: 'reminders',
    Icon: Bell,
    badge: 'DAILY ALERTS',
    color: { from: '#06b6d4', to: '#0891b2' },   /* cyan */
    stats: [
      { Icon: Clock, label: 'Smart Timing' },
      { Icon: Monitor, label: 'Cross-device' },
    ],
  },
  {
    key: 'specialist',
    Icon: Stethoscope,
    badge: 'VERIFIED DOCTORS',
    color: { from: '#6366f1', to: '#4f46e5' },   /* indigo */
    stats: [
      { Icon: Award, label: '100+ Specialists' },
      { Icon: Zap, label: 'Instant' },
    ],
  },
  {
    key: 'caregiver',
    Icon: HeartHandshake,
    badge: '24/7 SUPPORT',
    color: { from: '#14b8a6', to: '#0d9488' },   /* teal */
    stats: [
      { Icon: ShieldCheck, label: 'Care Plans' },
      { Icon: Users, label: 'Family Alerts' },
    ],
  },
];

function FeatureCard({ feature, index, inView }) {
  const { t } = useTranslation();
  const { key, Icon, badge, stats, color } = feature;

  return (
    <motion.article
      className="pnf-card"
      style={{
        '--feat-color-from': color.from,
        '--feat-color-to': color.to
      }}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Top accent line */}
      <div className="pnf-card__top-bar" />

      {/* Badge top-right */}
      <span className="pnf-card__badge">{badge}</span>

      {/* Icon */}
      <div className="pnf-card__icon">
        <Icon size={24} />
      </div>

      {/* Content */}
      <h3 className="pnf-card__title">{t(`feat_${key}`)}</h3>
      <p className="pnf-card__desc">{t(`feat_${key}_desc`)}</p>

      {/* Footer: stats + arrow */}
      <div className="pnf-card__footer">
        <div className="pnf-card__stats">
          {stats.map(({ Icon: SIcon, label }) => (
            <span key={label} className="pnf-card__stat">
              <SIcon size={13} />
              {label}
            </span>
          ))}
        </div>
        <button className="pnf-card__arrow" aria-label={`Learn more about ${t(`feat_${key}`)}`}>
          <ArrowRight size={16} />
        </button>
      </div>
    </motion.article>
  );
}

export default function FeaturesSection() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="pnf-section section-pad" id="features" ref={ref}>
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <span className="section-label">
            <CircleDot size={8} />
            CORE FEATURES
            <CircleDot size={8} />
          </span>
          <h2 className="pnf-section__title">
            {t('feat_title_line1', 'Everything You Need,')}
            <br />
            <span className="pnf-section__title--accent">
              {t('feat_title_line2', 'All In One Place')}
            </span>
          </h2>
          <p className="section-subtitle">{t('feat_subtitle')}</p>
        </div>

        {/* 2 × 3 Grid */}
        <div className="pnf-grid">
          {FEATURES.map((feature, i) => (
            <FeatureCard
              key={feature.key}
              feature={feature}
              index={i}
              inView={inView}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
