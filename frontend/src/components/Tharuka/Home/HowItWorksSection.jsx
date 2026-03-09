import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { UserPlus, Activity, TrendingUp } from 'lucide-react';
import './HowItWorksSection.css';

const STEPS = [
  { icon: UserPlus, key: 'step1', color: '#00C897' },
  { icon: Activity,  key: 'step2', color: '#00B4D8' },
  { icon: TrendingUp,key: 'step3', color: '#39FF14' },
];

export default function HowItWorksSection() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="pn-how section-pad" ref={ref}>
      <div className="container">
        <div className="section-header">
          <span className="section-label">Process</span>
          <h2 className="section-title">{t('how_title')}</h2>
          <p className="section-subtitle">{t('how_subtitle')}</p>
        </div>
        <div className="pn-how__steps">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.key}
                className="pn-how__step"
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.2 }}
              >
                <div className="pn-how__step-num">{String(i + 1).padStart(2, '0')}</div>
                <div className="pn-how__step-icon" style={{ borderColor: step.color }}>
                  <Icon size={28} style={{ color: step.color }} />
                </div>
                {i < STEPS.length - 1 && <div className="pn-how__connector" />}
                <h4 className="pn-how__step-title">{t(`how_${step.key}_title`)}</h4>
                <p className="pn-how__step-desc">{t(`how_${step.key}_desc`)}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
