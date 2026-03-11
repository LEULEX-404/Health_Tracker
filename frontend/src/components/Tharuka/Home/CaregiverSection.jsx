import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { CalendarCheck, Activity, MessageSquare, Pill, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import MagneticWrapper from '../Common/MagneticWrapper';
import './CaregiverSection.css';

export default function CaregiverSection() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const features = [
    { icon: CalendarCheck, key: 'care_feature1' },
    { icon: Activity,      key: 'care_feature2' },
    { icon: MessageSquare, key: 'care_feature3' },
    { icon: Pill,          key: 'care_feature4' },
  ];

  return (
    <section className="pn-care section-pad" id="caregiver" ref={ref}>
      <div className="container pn-care__inner">
        <motion.div
          className="pn-care__content"
          initial={{ opacity: 0, x: -50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="section-label">Caregiver</span>
          <h2 className="pn-care__title">{t('care_title')}</h2>
          <p className="pn-care__subtitle">{t('care_subtitle')}</p>
          
          <p className="pn-care__desc">{t('care_desc')}</p>
          <ul className="pn-care__features">
            {features.map(f => {
              const Icon = f.icon;
              return (
                <li key={f.key}>
                  <div className="pn-care__feat-icon"><Icon size={16} /></div>
                  <span>{t(f.key)}</span>
                </li>
              );
            })}
          </ul>
          <MagneticWrapper strength={0.35} range={90} display="inline-block">
            <Link to="/services" className="btn-primary pn-care__cta">
              <LayoutDashboard size={16} />
              {t('care_cta')}
            </Link>
          </MagneticWrapper>
        </motion.div>

        <motion.div
          className="pn-care__visual"
          initial={{ opacity: 0, x: 50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ willChange: 'transform, opacity' }}
        >
          <div className="pn-care__card glass">
            <div className="pn-care__card-header">
              <div className="pn-care__card-dot green" /><div className="pn-care__card-dot yellow" /><div className="pn-care__card-dot red" />
              <span>Caregiver Dashboard</span>
            </div>
            {[
              { name: 'Mrs. Perera', status: 'Stable', time: '09:30 AM', color: '#00C897' },
              { name: 'Mr. Fernando', status: 'Check-up Due', time: '02:00 PM', color: '#F59E0B' },
              { name: 'Ms. Nair', status: 'Medication Pending', time: '04:15 PM', color: '#00B4D8' },
            ].map(p => (
              <div key={p.name} className="pn-care__patient">
                <div className="pn-care__patient-avatar">{p.name[0]}</div>
                <div className="pn-care__patient-info">
                  <strong>{p.name}</strong>
                  <span style={{ color: p.color }}>{p.status}</span>
                </div>
                <div className="pn-care__patient-time">{p.time}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
