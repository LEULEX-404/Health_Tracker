import { useRef, memo } from 'react';
import { motion, useInView, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Salad, Dumbbell, BarChart3, Bell, Stethoscope, HeartHandshake } from 'lucide-react';
import MagneticWrapper from '../Common/MagneticWrapper';
import './FeaturesSection.css';

const ICONS = [Salad, Dumbbell, BarChart3, Bell, Stethoscope, HeartHandshake];
const KEYS = ['nutrition','exercise','reports','reminders','specialist','caregiver'];

/**
 * A sophisticated 3D Tilt card that follows the mouse.
 * Optimized with performance bounds caching.
 */
const TiltCard = memo(({ keyStr, i, t, inView, Icon }) => {
  const ref = useRef(null);
  const bounds = useRef(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-0.5, 0.5], [12, -12]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-12, 12]);
  
  const springX = useSpring(rotateX, { damping: 25, stiffness: 150 });
  const springY = useSpring(rotateY, { damping: 25, stiffness: 150 });

  const handleMouseEnter = () => {
    if (ref.current) bounds.current = ref.current.getBoundingClientRect();
  };

  const handleMouseMove = (e) => {
    if (!bounds.current) return;
    const { left, top, width, height } = bounds.current;
    const xVal = (e.clientX - left) / width - 0.5;
    const yVal = (e.clientY - top) / height - 0.5;
    x.set(xVal);
    y.set(yVal);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    bounds.current = null;
  };

  return (
    <motion.div
      ref={ref}
      className="pn-feat-card"
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: i * 0.12 }}
      style={{
        rotateX: springX,
        rotateY: springY,
        transformStyle: 'preserve-3d',
      }}
    >
      <div className="pn-feat-card__inner">
        <div className="pn-feat-card__icon">
          <Icon size={26} />
        </div>
        <h4 className="pn-feat-card__title">{t(`feat_${keyStr}`)}</h4>
        <p className="pn-feat-card__desc">{t(`feat_${keyStr}_desc`)}</p>
        
        {/* Interactive glow tied to mouse coordinates */}
        <motion.div 
          className="pn-feat-card__glow" 
          style={{ 
            left: useTransform(x, [-0.5, 0.5], ['-10%', '110%']),
            top: useTransform(y, [-0.5, 0.5], ['-10%', '110%']),
          }} 
        />
      </div>
    </motion.div>
  );
});

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
          {KEYS.map((keyStr, i) => (
            <TiltCard 
              key={keyStr} 
              keyStr={keyStr} 
              i={i} 
              t={t} 
              inView={inView} 
              Icon={ICONS[i]} 
            />
          ))}
        </div>
      </div>
    </section>
  );
}
