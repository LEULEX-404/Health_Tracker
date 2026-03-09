import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowRight, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import './HeroSection.css';

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

  return (
    <section className="pn-hero" id="hero">
      <div className="container pn-hero__inner">
        <div className="pn-hero__content">
          <motion.div {...fadeUp(0.1)}>
            <span className="section-label">
              <span className="pn-hero__dot" />
              Because Every Pulse Matters
            </span>
          </motion.div>

          <motion.h1 className="pn-hero__title" {...fadeUp(0.2)}>
            {t('hero_title')}<br />
            <span className="text-gradient"><TypedText texts={['Reimagined.', 'Personalized.', 'Empowering.', 'Intelligent.']} /></span>
            <span className="pn-hero__cursor">|</span>
          </motion.h1>

          <motion.p className="pn-hero__desc" {...fadeUp(0.35)}>
            {t('hero_desc')}
          </motion.p>

          <motion.div className="pn-hero__ctas" {...fadeUp(0.5)}>
            <Link to="/signup" className="btn-primary pn-hero__cta-main">
              {t('hero_cta_start')} <ArrowRight size={16} />
            </Link>
            <Link to="/about" className="btn-outline">
              <PlayCircle size={16} />
              {t('hero_cta_learn')}
            </Link>
          </motion.div>

          <motion.div className="pn-hero__stats" {...fadeUp(0.65)}>
            {[['50K+', 'Active Users'], ['1M+', 'Meals Tracked'], ['200+', 'Specialists']].map(([n, l]) => (
              <div key={l} className="pn-hero__stat">
                <strong>{n}</strong>
                <span>{l}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          className="pn-hero__visual"
          initial={{ opacity: 0, x: 60, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="pn-hero__img-wrap">
            <img src="/images/Tharuka/hero_dashboard.png" alt="PulseNova Dashboard" className="pn-hero__img" />
            {/* Floating cards */}
            <motion.div className="pn-hero__float-card pn-hero__float-card--1"
              animate={{ y: [0,-10,0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
              <div className="pn-hero__fc-dot" style={{background:'#00C897'}} />
              <div><strong>Heart Rate</strong><span>72 bpm ↑</span></div>
            </motion.div>
            <motion.div className="pn-hero__float-card pn-hero__float-card--2"
              animate={{ y: [0,10,0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}>
              <div className="pn-hero__fc-dot" style={{background:'#39FF14'}} />
              <div><strong>Calories</strong><span>1,840 kcal</span></div>
            </motion.div>
            <motion.div className="pn-hero__float-card pn-hero__float-card--3"
              animate={{ y: [0,-8,0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}>
              <div className="pn-hero__fc-dot" style={{background:'#00B4D8'}} />
              <div><strong>Steps</strong><span>8,420 / 10K</span></div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div className="pn-hero__scroll"
        animate={{ y: [0,8,0] }} transition={{ duration: 1.5, repeat: Infinity }}>
        <div className="pn-hero__scroll-wheel" />
      </motion.div>
    </section>
  );
}
