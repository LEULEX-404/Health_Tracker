import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { PlayCircle, ArrowRight, Activity, Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/opacity.css';
import MagneticWrapper from '../Common/MagneticWrapper';
import './HeroSection.css';

const poseImages = [
  '/images/Tharuka/pose_1.png',
  '/images/Tharuka/pose_2.png',
  '/images/Tharuka/pose_3.png'
];
const docPoseImages = [
  '/images/Tharuka/doc_pose_1.png',
  '/images/Tharuka/doc_pose_2.png',
  '/images/Tharuka/doc_pose_3.png'
];

function TypedText({ texts }) {
  const ref = useRef(null);
  useEffect(() => {
    let i = 0, charIdx = 0, deleting = false, timer;
    const tick = () => {
      const current = texts[i];
      if (ref.current) {
        ref.current.textContent = deleting ? current.slice(0, charIdx--) : current.slice(0, charIdx++);
      }
      if (!deleting && charIdx > current.length) { deleting = true; timer = setTimeout(tick, 1800); return; }
      if (deleting && charIdx < 0) { deleting = false; i = (i + 1) % texts.length; }
      timer = setTimeout(tick, deleting ? 60 : 90);
    };
    tick();
    return () => clearTimeout(timer);
  }, [texts]);
  return <span ref={ref} />;
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
});

export default function HeroSection() {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();
  const [activePose, setActivePose] = useState(0);

  // Preload images and handle pose transitions
  useEffect(() => {
    poseImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });

    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      setActivePose((prev) => (prev + 1) % poseImages.length);
    }, 6000); // Transition every 6s

    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  return (
    <section className="pn-hero" id="hero">
      <div className="container pn-hero__inner">
        
        {/* LEFT SIDE CONTENT */}
        <div className="pn-hero__content">
          <motion.div className="section-label" {...fadeUp(0.1)}>
            <span className="pn-hero__dot" />
            Because Every Pulse Matters
          </motion.div>

          <motion.h1 className="pn-hero__title text-shiny" {...fadeUp(0.2)}>
            {t('hero_title') || 'Your Fitness'}<br />
            <span className="text-gradient">
              <TypedText texts={['Reimagined.', 'Personalized.', 'Empowering.', 'Intelligent.']} />
            </span>
            <span className="pn-hero__cursor">|</span>
          </motion.h1>

          <motion.p className="pn-hero__desc" {...fadeUp(0.3)}>
            {t('hero_desc') || 'Transform the way you track, plan, and achieve your health goals with intelligent insights and professional collaboration.'}
          </motion.p>

          <motion.div className="pn-hero__ctas" {...fadeUp(0.4)}>
            <MagneticWrapper strength={0.4} range={100} display="inline-block">
              <Link to="/register" className="btn-primary pn-hero__cta-main btn-shine-effect">
                {t('hero_cta_start') || 'Start Journey'} <ArrowRight size={16} />
              </Link>
            </MagneticWrapper>
            <MagneticWrapper strength={0.3} range={80} display="inline-block">
              <Link to="/about" className="btn-outline">
                <PlayCircle size={16} />
                {t('hero_cta_learn') || 'Learn More'}
              </Link>
            </MagneticWrapper>
          </motion.div>

          <motion.div className="pn-hero__stats-row" {...fadeUp(0.5)}>
            <div className="pn-hero__stat-card">
              <div className="pn-hero__stat-icon" style={{color: 'var(--color-primary)'}}>
                <Activity size={22} />
              </div>
              <div className="pn-hero__stat-info">
                <strong>50K+</strong>
                <span>Active Users</span>
              </div>
            </div>
            
            <div className="pn-hero__stat-card">
              <div className="pn-hero__stat-icon" style={{color: '#39FF14'}}>
                <Utensils size={22} />
              </div>
              <div className="pn-hero__stat-info">
                <strong>1M+</strong>
                <span>Meals Tracked</span>
              </div>
            </div>
            
            <div className="pn-hero__trust">
              <div className="pn-hero__avatars">
                <LazyLoadImage src="/images/Tharuka/caregiver_real.png" alt="User" effect="opacity" onError={(e) => { e.target.src = '/images/Tharuka/fitness_tracking.png'; }} />
                <LazyLoadImage src="/images/Tharuka/fitness_tracking.png" alt="User 2" effect="opacity" />
                <div className="pn-hero__avatar-more">200+</div>
              </div>
              <span>Trust built with Specialists</span>
            </div>
          </motion.div>
        </div>

        {/* RIGHT SIDE VISUAL (POSE TRANSITIONS) */}
        <motion.div
          className="pn-hero__visual"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Depth / Glow / Orbits behind person */}
          <div className="pn-hero__visual-bg">
            <div className="pn-hero__glow-halo" />
            <div className="pn-hero__orbit pn-hero__orbit--1" />
            <div className="pn-hero__orbit pn-hero__orbit--2" />
            <div className="pn-hero__orbit pn-hero__orbit--3" />
          </div>

          {/* Pose Transition Container */}
          <div className="pn-hero__pose-container">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activePose} 
                className="pn-hero__pose-group"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1, 
                  y: prefersReducedMotion ? 0 : [0, -6, 0] // Subtle breathing
                }}
                exit={{ opacity: 0 }}
                transition={{ 
                  opacity: { duration: 1.2, ease: "easeInOut" },
                  y: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
                }}
              >
                <img src={docPoseImages[activePose]} alt="Doctor" className="pn-hero__pose-img pn-hero__pose-img--doctor" fetchPriority="high" />
                <img src={poseImages[activePose]} alt="Health Professional" className="pn-hero__pose-img pn-hero__pose-img--main" fetchPriority="high" />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Floating Premium Elements */}
          <motion.div className="pn-hero__status-chip pn-hero__status-chip--1"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }}>
            <span className="pn-status-dot" /> Live health insights
          </motion.div>

          <motion.div className="pn-hero__status-chip pn-hero__status-chip--2"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.9 }}>
            <span className="pn-status-dot" style={{background: '#00B4D8', boxShadow: '0 0 8px #00B4D8'}} /> AI-driven goals
          </motion.div>

          <motion.div className="pn-hero__status-chip pn-hero__status-chip--3"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.0 }}>
            <span className="pn-status-dot" style={{background: '#FFD700', boxShadow: '0 0 8px #FFD700'}} /> Real-time sync
          </motion.div>

          <motion.div className="pn-hero__premium-metric"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
          >
            <div className="pn-metric-ring">
              <svg viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" strokeDasharray="100, 100" />
                <path className="pn-metric-progress" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" strokeDasharray="75, 100" />
              </svg>
              <Activity size={14} className="pn-metric-icon" />
            </div>
            <div className="pn-metric-info">
              <strong>Heart Rate</strong>
              <span>72 bpm</span>
            </div>
          </motion.div>

        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div className="pn-hero__scroll"
        animate={{ y: [0,8,0] }} transition={{ duration: 1.5, repeat: Infinity }}>
        <div className="pn-hero__scroll-wheel" />
      </motion.div>

      {/* Dynamic Background Waves */}
      <div className="pn-hero__waves-container">
        <svg className="pn-hero__waves" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
          <defs>
            <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
          </defs>
          <g className="pn-hero__parallax">
            <use xlinkHref="#gentle-wave" x="48" y="0" fill="#00c897" opacity="0.08" />
            <use xlinkHref="#gentle-wave" x="48" y="3" fill="#00c897" opacity="0.15" />
            <use xlinkHref="#gentle-wave" x="48" y="5" fill="#00c897" opacity="0.28" />
            <use xlinkHref="#gentle-wave" x="48" y="7" fill="#00c897" opacity="0.5" />
          </g>
        </svg>
      </div>
    </section>
  );
}
