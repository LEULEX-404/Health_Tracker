import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Salad, Dumbbell, BarChart3, Bell, Stethoscope, HeartHandshake } from 'lucide-react';
import './FeaturesSection.css';

const ICONS = [Salad, Dumbbell, BarChart3, Bell, Stethoscope, HeartHandshake];
const KEYS = ['nutrition','exercise','reports','reminders','specialist','caregiver'];

export default function FeaturesSection() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="pn-features section-pad" id="features" ref={ref}>
      <div className="container">
        <div className="section-header">
          <span className="section-label">Features</span>
          <h2 className="section-title">{t('feat_title')}</h2>
          <p className="section-subtitle">{t('feat_subtitle')}</p>
        </div>
        <div className="pn-features__grid">
          {KEYS.map((key, i) => {
            const Icon = ICONS[i];
            return (
              <motion.div
                key={key}
                className="pn-feat-card"
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <div className="pn-feat-card__icon">
                  <Icon size={26} />
                </div>
                <h4 className="pn-feat-card__title">{t(`feat_${key}`)}</h4>
                <p className="pn-feat-card__desc">{t(`feat_${key}_desc`)}</p>
                <div className="pn-feat-card__glow" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
