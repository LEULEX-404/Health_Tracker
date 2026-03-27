import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  CircleDot, ArrowRight,
  ScanLine, Settings2, Leaf, Clock,
  HeartPulse, Dumbbell, TrendingUp, Smartphone,
  BarChart2, FileText, Share2, Bell,
  Users, MapPin, AlertCircle, Phone,
  ShieldCheck, Lock, Star, Headphones,
  Zap, Database, ShieldOff, Droplets,
  CheckCircle2, Activity
} from 'lucide-react';
import './ServicesSection.css';

const SERVICES = [
  {
    key: 'nutrition',
    img: '/images/Tharuka/service-1.png',
    imgSide: 'right',
    color: { from: '#10b981', to: '#059669', shadow: 'rgba(16, 185, 129, 0.35)' }, // Emerald Green
    badge: 'SMART NUTRITION',
    step: 'STEP 01',
    titleLine1: 'Fuel Your Body with',
    titleLine2: 'Intelligent Nutrition',
    desc: 'AI-powered meal intelligence that learns your metabolic profile, dietary preferences, and health goals — delivering personalized nutrition guidance that actually works.',
    bullets: [
      { Icon: ScanLine,  text: 'Scan & log from 500K+ verified foods' },
      { Icon: Settings2, text: 'AI macro & micronutrient optimization' },
      { Icon: Leaf,      text: 'Personalized dietary recommendations' },
      { Icon: Clock,     text: 'Visual calorie & nutrient breakdown' },
    ],
    tags: [
      { Icon: Zap,         label: 'AI Powered' },
      { Icon: Database,    label: '500K+ Foods' },
      { Icon: ShieldCheck, label: 'Secure Data' },
    ],
    floats: [
      {
        id: 'kcal',
        pos: 'top-left',
        delay: 0.55,
        content: (
          <div className="pns-float pns-float--kcal">
            <span className="pns-float__icon"><Droplets size={16} /></span>
            <div>
              <strong>1,840 kcal</strong>
              <span>Daily Target</span>
            </div>
          </div>
        ),
      },
      {
        id: 'meal',
        pos: 'bottom-right',
        delay: 0.75,
        content: (
          <div className="pns-float pns-float--meal">
            <div className="pns-float__meal-header">
              <span className="pns-float__meal-icon"><Activity size={12} /></span>
              <strong>Meal Score</strong>
            </div>
            <div className="pns-float__bars">
              {[1,1,1,1,0.5].map((h, i) => (
                <span key={i} className="pns-float__bar" style={{ opacity: h }} />
              ))}
            </div>
            <span className="pns-float__sub">Last 5 meals</span>
          </div>
        ),
      },
    ],
  },
  {
    key: 'exercise',
    img: '/images/Tharuka/service-2.png',
    imgSide: 'left',
    color: { from: '#0ea5e9', to: '#0284c7', shadow: 'rgba(14, 165, 233, 0.35)' }, // Sky Blue
    badge: 'FITNESS TRACKING',
    step: 'STEP 02',
    titleLine1: 'Every Rep, Every Step —',
    titleLine2: 'Tracked Precisely',
    desc: 'From HIIT to yoga, track every workout with real-time metrics, adaptive coaching, and performance trends that evolve with your fitness journey.',
    bullets: [
      { Icon: HeartPulse, text: 'Real-time heart rate & VO2 max tracking' },
      { Icon: Dumbbell,   text: '200+ workout templates & plans' },
      { Icon: TrendingUp, text: 'Weekly performance trend analysis' },
      { Icon: Smartphone, text: 'Multi-device & wearable sync' },
    ],
    tags: [
      { Icon: HeartPulse,  label: 'Real-time' },
      { Icon: ShieldCheck, label: 'Smart Tracking' },
      { Icon: Smartphone,  label: 'Auto-Sync' },
    ],
    floats: [
      {
        id: 'bpm',
        pos: 'top-right',
        delay: 0.55,
        content: (
          <div className="pns-float pns-float--bpm">
            <span className="pns-float__icon pns-float__icon--red"><HeartPulse size={16} /></span>
            <div>
              <strong>142 bpm</strong>
              <span>Peak Zone</span>
            </div>
          </div>
        ),
      },
      {
        id: 'progress',
        pos: 'bottom-left',
        delay: 0.75,
        content: (
          <div className="pns-float pns-float--progress">
            <strong>Weekly Progress</strong>
            <div className="pns-float__chart">
              {[40,55,45,70,60,80,65].map((h, i) => (
                <span key={i} className="pns-float__bar-v" style={{ height: `${h}%` }} />
              ))}
            </div>
            <span className="pns-float__sub">Mon — Sun</span>
          </div>
        ),
      },
    ],
  },
  {
    key: 'health',
    img: '/images/Tharuka/service-3.png',
    imgSide: 'right',
    color: { from: '#00c897', to: '#00a876', shadow: 'rgba(0, 200, 151, 0.35)' }, // Classic Teal/Green
    badge: 'HEALTH ANALYTICS',
    step: 'STEP 03',
    titleLine1: 'Turn Your Health Data into',
    titleLine2: 'Clear Insights',
    desc: 'Clinically-informed dashboards and intelligent reports transform complex health data into actionable insights, helping you and your care team make better decisions.',
    bullets: [
      { Icon: BarChart2, text: 'Trend analysis across 30+ biomarkers' },
      { Icon: FileText,  text: 'Shareable PDF health reports' },
      { Icon: Share2,    text: 'Clinician-compatible export formats' },
      { Icon: Bell,      text: 'Anomaly detection & smart alerts' },
    ],
    tags: [
      { Icon: Zap,        label: 'AI Insights' },
      { Icon: Clock,      label: 'Real-time' },
      { Icon: ShieldOff,  label: 'HIPAA Safe' },
    ],
    floats: [
      {
        id: 'score',
        pos: 'top-left',
        delay: 0.55,
        content: (
          <div className="pns-float pns-float--score">
            <span className="pns-float__icon"><ShieldCheck size={16} /></span>
            <div>
              <span className="pns-float__score-label">Health Score</span>
              <strong className="pns-float__score-value">92<small>/100</small></strong>
              <div className="pns-float__score-bar"><div /></div>
            </div>
          </div>
        ),
      },
      {
        id: 'report',
        pos: 'bottom-right',
        delay: 0.75,
        content: (
          <div className="pns-float pns-float--report">
            <span className="pns-float__report-icon"><FileText size={18} /></span>
            <div>
              <strong>Report Ready</strong>
              <span>AI Generated</span>
            </div>
          </div>
        ),
      },
    ],
  },
  {
    key: 'caregiver',
    img: '/images/Tharuka/service-4.png',
    imgSide: 'left',
    color: { from: '#f43f5e', to: '#be123c', shadow: 'rgba(244, 63, 94, 0.35)' }, // Rose / Coral
    badge: 'CAREGIVER SUPPORT',
    step: 'STEP 04',
    titleLine1: 'Connected Care for the',
    titleLine2: 'Whole Family',
    desc: 'Empower families and professional caregivers with real-time health monitoring, shared dashboards, and alert systems that ensure your loved ones are always in safe hands.',
    bullets: [
      { Icon: Users,       text: 'Multi-member family health profiles' },
      { Icon: AlertCircle, text: 'Emergency alerts & medication reminders' },
      { Icon: MapPin,      text: 'Location & vitals monitoring' },
      { Icon: Phone,       text: 'One-tap care team communication' },
    ],
    tags: [
      { Icon: Bell,        label: 'Smart Alerts' },
      { Icon: Users,       label: 'Family Care' },
      { Icon: ShieldCheck, label: 'Secure' },
    ],
    floats: [
      {
        id: 'allclear',
        pos: 'top-right',
        delay: 0.55,
        content: (
          <div className="pns-float pns-float--allclear">
            <span className="pns-float__icon"><ShieldCheck size={16} /></span>
            <div>
              <strong>All Clear</strong>
              <span>2 members safe</span>
            </div>
          </div>
        ),
      },
      {
        id: 'checkins',
        pos: 'bottom-left',
        delay: 0.75,
        content: (
          <div className="pns-float pns-float--checkins">
            <strong>Daily Check-ins</strong>
            <div className="pns-float__checks">
              {[1,1,1,1,1,0].map((done, i) => (
                <span key={i} className={`pns-float__check ${done ? 'done' : ''}`}>
                  {done ? <CheckCircle2 size={14} /> : <span className="pns-float__check-empty" />}
                </span>
              ))}
            </div>
            <span className="pns-float__sub">6/7 days</span>
          </div>
        ),
      },
    ],
  },
];

const TRUST_BADGES = [
  { Icon: ShieldCheck, label: 'HIPAA Compliant', color: '#10b981' }, // Emerald
  { Icon: Lock,        label: 'End-to-End Encrypted', color: '#6366f1' }, // Indigo
  { Icon: Zap,         label: 'Clinically Validated', color: '#f59e0b' }, // Amber
  { Icon: Star,        label: '4.9/5 Rating', color: '#f43f5e' }, // Rose
  { Icon: Headphones,  label: '24/7 Support', color: '#0ea5e9' }, // Sky
];

function FloatCard({ float, inView }) {
  const posClass = `pns-float-wrap--${float.pos}`;
  return (
    <motion.div
      className={`pns-float-wrap ${posClass}`}
      initial={{ opacity: 0, scale: 0.75, y: 16 }}
      animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: float.delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.25 } }}
    >
      {float.content}
    </motion.div>
  );
}

function ServiceRow({ svc, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const imgLeft = svc.imgSide === 'left';

  const bulletVariants = {
    hidden: { opacity: 0, x: -14 },
    visible: i => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.38, delay: 0.3 + i * 0.09, ease: 'easeOut' },
    }),
  };

  return (
    <div
      ref={ref}
      className={`pns-row ${imgLeft ? 'pns-row--img-left' : 'pns-row--img-right'}`}
      style={{
        '--svc-color-from': svc.color.from,
        '--svc-color-to': svc.color.to,
        '--svc-shadow': svc.color.shadow,
      }}
    >

      {/* ── Content card ── */}
      <motion.div
        className="pns-card"
        initial={{ opacity: 0, y: 44 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div className="pns-card__meta"
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <span className="pns-card__badge">
            <CircleDot size={8} />
            {svc.badge}
          </span>
          <span className="pns-card__step">— {svc.step}</span>
        </motion.div>

        <motion.h3 className="pns-card__title"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {svc.titleLine1}
          <br />
          <span className="pns-card__title--accent">{svc.titleLine2}</span>
        </motion.h3>

        <motion.p className="pns-card__desc"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.45, delay: 0.28 }}
        >
          {svc.desc}
        </motion.p>

        <ul className="pns-card__bullets">
          {svc.bullets.map(({ Icon, text }, i) => (
            <motion.li key={text}
              custom={i}
              variants={bulletVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
            >
              <span className="pns-bullet-icon"><Icon size={14} /></span>
              {text}
            </motion.li>
          ))}
        </ul>

        <motion.div className="pns-card__tags"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.62 }}
        >
          {svc.tags.map(({ Icon, label }) => (
            <span key={label} className="pns-tag">
              <Icon size={13} /> {label}
            </span>
          ))}
        </motion.div>

        <motion.button className="pns-card__cta"
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.7 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          Learn More <ArrowRight size={15} />
        </motion.button>
      </motion.div>

      {/* ── Image panel ── */}
      <motion.div
        className="pns-img-panel"
        initial={{ opacity: 0, x: imgLeft ? -60 : 60, scale: 0.93 }}
        animate={inView ? { opacity: 1, x: 0, scale: 1 } : {}}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="pns-img-panel__step-mark">0{index + 1}</span>

        <img
          src={svc.img}
          alt={svc.titleLine1}
          className="pns-img-panel__img"
          loading="lazy"
          decoding="async"
        />

        {svc.floats.map(f => (
          <FloatCard key={f.id} float={f} inView={inView} />
        ))}
      </motion.div>
    </div>
  );
}

export default function ServicesSection() {
  const { t } = useTranslation();

  return (
    <section className="pns-section section-pad" id="services">
      <div className="container">
        <div className="section-header">
          <span className="section-label">
            <CircleDot size={8} />
            WHAT WE OFFER
            <CircleDot size={8} />
          </span>
          <h2 className="pns-section__title">
            {t('serv_title_line1', 'Healthcare Services')}{' '}
            <span className="pns-section__title--accent">
              {t('serv_title_line2', 'Built for You')}
            </span>
          </h2>
          <p className="section-subtitle">{t('serv_subtitle')}</p>
        </div>

        <div className="pns-rows">
          {SERVICES.map((svc, i) => (
            <ServiceRow key={svc.key} svc={svc} index={i} />
          ))}
        </div>

        {/* Trust bar */}
        <motion.div
          className="pns-trust"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
          }}
        >
          <motion.p
            className="pns-trust__label"
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
          >
            TRUSTED BY 200,000+ USERS ACROSS 40 COUNTRIES
          </motion.p>
          <div className="pns-trust__badges">
            {TRUST_BADGES.map(({ Icon, label, color }) => (
              <motion.span
                key={label}
                className="pns-trust__badge"
                style={{ '--badge-c': color }}
                variants={{
                  hidden: { opacity: 0, y: 20, scale: 0.8 },
                  visible: { 
                    opacity: 1, 
                    y: 0, 
                    scale: 1, 
                    transition: { type: 'spring', stiffness: 220, damping: 18 } 
                  },
                }}
                whileHover={{ scale: 1.06, y: -4, transition: { duration: 0.2 } }}
              >
                <span className="pns-trust__badge-icon"><Icon size={16} /></span>
                {label}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
