import { useRef, memo } from 'react';
import { motion, useInView, useScroll, useSpring } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { UserPlus, Activity, TrendingUp } from 'lucide-react';
import './HowItWorksSection.css';

const STEPS = [
  { icon: UserPlus, key: 'step1', color: '#00C897' },
  { icon: Activity,  key: 'step2', color: '#00B4D8' },
  { icon: TrendingUp,key: 'step3', color: '#39FF14' },
];

const StepCard = memo(({ step, i, inView, t }) => {
  const Icon = step.icon;
  return (
    <motion.div
      className="pn-how__step"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: i * 0.15 }}
    >
      <div className="pn-how__step-num">{String(i + 1).padStart(2, '0')}</div>
      <div className="pn-how__step-icon" style={{ borderColor: step.color }}>
        <Icon size={28} style={{ color: step.color }} />
      </div>
      <h4 className="pn-how__step-title">{t(`how_${step.key}_title`)}</h4>
      <p className="pn-how__step-desc">{t(`how_${step.key}_desc`)}</p>
    </motion.div>
  );
});

export default function HowItWorksSection() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <section className="pn-how section-pad" ref={ref}>
      <div className="container">
        <div className="section-header">
          <span className="section-label">Process</span>
          <h2 className="section-title">{t('how_title')}</h2>
          <p className="section-subtitle">{t('how_subtitle')}</p>
        </div>
        
        <div className="pn-how__steps-wrapper">
          <div className="pn-how__line-desktop">
            <svg width="100%" height="2" viewBox="0 0 100 2" preserveAspectRatio="none">
              <line x1="0" y1="1" x2="100" y2="1" className="pn-how__line-bg" />
              <motion.line 
                x1="0" y1="1" x2="100" y2="1" 
                className="pn-how__line-active" 
                style={{ pathLength: smoothProgress }} 
              />
            </svg>
          </div>

          <div className="pn-how__line-mobile">
            <svg width="2" height="100%" viewBox="0 0 2 100" preserveAspectRatio="none">
              <line x1="1" y1="0" x2="1" y2="100" className="pn-how__line-bg" />
              <motion.line 
                x1="1" y1="0" x2="1" y2="100" 
                className="pn-how__line-active" 
                style={{ pathLength: smoothProgress }} 
              />
            </svg>
          </div>

          <div className="pn-how__steps">
            {STEPS.map((step, i) => (
              <StepCard key={step.key} step={step} i={i} inView={inView} t={t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
