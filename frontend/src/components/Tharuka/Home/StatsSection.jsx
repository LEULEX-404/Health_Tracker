import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Users, Utensils, Dumbbell, Stethoscope } from 'lucide-react';
import './StatsSection.css';

const STATS = [
  { icon: Users, valueKey: '50K+', labelKey: 'stats_users', raw: 50000 },
  { icon: Utensils, valueKey: '1M+', labelKey: 'stats_meals', raw: 1000000 },
  { icon: Dumbbell, valueKey: '500K+', labelKey: 'stats_workouts', raw: 500000 },
  { icon: Stethoscope, valueKey: '200+', labelKey: 'stats_specialists', raw: 200 },
];

function Counter({ target, suffix }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const displayTarget = target > 1000 ? target / 1000 : target;
    const step = displayTarget / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= displayTarget) { setCount(displayTarget); clearInterval(timer); return; }
      setCount(Math.floor(start));
    }, 24);
    return () => clearInterval(timer);
  }, [inView, target]);
  const display = target > 1000000 ? `${count}M` : target > 1000 ? `${count}K` : count;
  return <span ref={ref}>{display}{suffix}</span>;
}

export default function StatsSection() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="pn-stats section-pad" ref={ref}>
      <div className="pn-stats__bg" />
      <div className="container">
        <div className="section-header">
          <h2 className="section-title" style={{color:'#fff'}}>{t('stats_title')}</h2>
        </div>
        <div className="pn-stats__grid">
          {STATS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.labelKey}
                className="pn-stat-card"
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.12 }}
              >
                <div className="pn-stat-card__icon"><Icon size={28} /></div>
                <div className="pn-stat-card__value">
                  <Counter target={s.raw} suffix="+" />
                </div>
                <div className="pn-stat-card__label">{t(s.labelKey)}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
