import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Salad,
  Dumbbell,
  BarChart3,
  Bell,
  CalendarCheck,
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
  ChevronDown,
  HeartPulse,
  Activity,
  Globe2,
  Star,
  Sparkles,
  Headset,
  BookOpenText,
  ShieldCheck,
  Cpu,
  UserCog,
  Gauge,
  CircleDot
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../../components/Tharuka/Header/Header';
import Footer from '../../components/Tharuka/Footer/Footer';
import ScrollToTop from '../../components/Tharuka/Common/ScrollToTop';
import BackgroundEffect from '../../components/Tharuka/Common/BackgroundEffect';
import './ServicesPage.css';

const SERVICES = [
  {
    id: 'nutrition',
    icon: Salad,
    title: 'Nutrition Tracking',
    image: '/images/Tharuka/services/service_1.png',
    tagline: 'AI-powered food logging and analysis',
    desc: 'AI-powered food logging with verified item data, macro insights, and personalized coaching tailored to your health goals.',
    features: [
      'Barcode scan and photo recognition',
      'AI macro and micronutrient optimizer',
      'Custom meal plan generation',
      'Weekly nutrition summary reports'
    ],
    stats: ['500K+ Foods', 'AI Powered'],
    endpoint: 'POST /api/v2/nutrition/log',
    cta: 'Start Tracking',
    badge: 'Most Popular',
  },
  {
    id: 'health',
    icon: BarChart3,
    title: 'Health Data Monitoring',
    image: '/images/Tharuka/services/service_2.png',
    tagline: 'Realtime biomarker intelligence',
    desc: 'Continuous real-time tracking with anomaly detection, wearable integration, and smart alerts for chronic care monitoring.',
    features: [
      'Heart rate, SpO2, and sleep tracking',
      '30+ biomarker dashboards',
      'Anomaly detection and smart alerts',
      'Wearable and IoT device sync'
    ],
    stats: ['30+ Biomarkers', 'Multi-device'],
    endpoint: 'WS /api/v2/vitals/stream',
    cta: 'Monitor Now'
  },
  {
    id: 'mealplan',
    icon: CalendarCheck,
    title: 'Meal Planning',
    image: '/images/Tharuka/services/service_3.png',
    tagline: 'Weekly adaptive planning',
    desc: 'Intelligent weekly meal planning tailored by calories, dietary restrictions, family size, and shopping budget.',
    features: [
      'AI-generated weekly meal plans',
      'Auto-generated grocery shopping lists',
      'Allergy and dietary preference filters',
      'Family-size portion adjustments'
    ],
    stats: ['Weekly Plans', 'Diet-aware'],
    endpoint: 'GET /api/v2/meals/plan/generate',
    cta: 'Plan Meals',
    badge: 'New',
  },
  {
    id: 'reminders',
    icon: Bell,
    title: 'Meal Reminders',
    image: '/images/Tharuka/services/service_4.png',
    tagline: 'Context-aware smart reminders',
    desc: 'Adaptive reminder automation across meals, medication, and hydration with behavior-aware scheduling and caregiver controls.',
    features: [
      'Adaptive smart timing engine',
      'Location-based trigger reminders',
      'Hydration and supplement alerts',
      'Medication schedule management'
    ],
    stats: ['Smart Timing', 'Cross-device'],
    endpoint: 'POST /api/v2/reminders/schedule',
    cta: 'Set Reminders'
  },
  {
    id: 'exercise',
    icon: Dumbbell,
    title: 'Exercise Tracking',
    image: '/images/Tharuka/services/service_5.png',
    tagline: 'Workout intelligence system',
    desc: 'Track every rep, set, and mile with precision biomechanical analytics and adaptive coaching progression.',
    features: [
      '200+ workout templates and guides',
      'Real-time VO2 max and heart zones',
      'Progressive overload tracking',
      'AI form coaching and injury prevention'
    ],
    stats: ['200+ Workouts', 'HR Zones'],
    endpoint: 'POST /api/v2/workouts/session',
    cta: 'Track Exercise'
  },
  {
    id: 'reports',
    icon: BarChart3,
    image: '/images/Tharuka/services/service_6.png',
    title: 'Health Reports',
    tagline: 'Clinical reporting and insights',
    desc: 'Clinician-ready exports powered by AI trend analysis with secure sharing and long-range biomarker intelligence.',
    features: [
      'Comprehensive monthly health summaries',
      'Doctor-ready shareable PDF export',
      'Trend analysis across all biomarkers',
      'HIPAA-compliant data sharing'
    ],
    stats: ['PDF Export', 'HIPAA Safe'],
    endpoint: 'GET /api/v2/reports/generate',
    cta: 'View Reports'
  },
];

const PRICING = [
  {
    name: 'Free',
    price: '$0',
    period: '/mo',
    desc: 'For individuals getting started',
    features: [
      'Basic nutrition logging (up to 5/day)',
      'Manual exercise tracking',
      'Monthly health summary',
      'Basic meal reminders (3/day)',
      '30-day data history'
    ],
    disabledFeatures: [
      'AI-powered recommendations',
      'Advanced analytics and reports',
      'Wearable device sync',
      'Caregiver profiles',
      'Priority support'
    ],
    cta: 'Start for Free',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/mo',
    desc: 'For health-focused individuals',
    features: [
      'Unlimited nutrition logging and barcode scan',
      'Full AI macro and meal recommendations',
      'Advanced analytics and weekly insights',
      'AI-generated weekly meal plans',
      'Wearable and IoT device sync',
      'Real-time biomarker monitoring',
      'Shareable PDF health reports',
      'Smart reminders (unlimited)',
      'End-to-end encryption and HIPAA',
      'Priority 24/7 support'
    ],
    cta: 'Start Pro Trial',
    highlight: true,
  },
  {
    name: 'Caregiver',
    price: '$39',
    period: '/mo',
    desc: 'For families and professionals',
    features: [
      'Up to 6 family member profiles',
      'Family health command center',
      'Emergency alerts and medication reminders',
      'Location and vitals monitoring',
      'One-tap care team communication',
      'Multi-member health reports',
      'Unlimited data history',
      'Full HIPAA and data security suite',
      'Dedicated account manager',
      'Clinician data export formats'
    ],
    cta: 'Start Caregiver Plan',
    highlight: false,
  },
];

export default function ServicesPage() {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState(null);
  const [billingMode, setBillingMode] = useState('monthly');

  const faqs = [
    { color: '#0ea5e9', tag: 'General', icon: Sparkles, q: 'What is PulseNova and who is it for?', a: 'PulseNova is an intelligent health management platform for individuals, families, and healthcare professionals. Whether you are tracking daily nutrition, monitoring chronic conditions, or coordinating care, PulseNova helps make every health goal actionable.' },
    { color: '#f59e0b', tag: 'Services', icon: Zap, q: 'Can I use all six services on a single account?', a: 'Yes. A single account can access nutrition, vitals, meal planning, reminders, workouts, and reports. Feature limits depend on your subscription plan.' },
    { color: '#10b981', tag: 'Privacy & Security', icon: ShieldCheck, q: 'Is my health data safe and HIPAA compliant?', a: 'Yes. PulseNova includes encryption in transit and at rest, role-based access control, audit trails, and HIPAA-aligned workflows for secure handling of health data.' },
    { color: '#3b82f6', tag: 'Integrations', icon: Globe2, q: 'Which wearables and devices does PulseNova support?', a: 'PulseNova supports major wearable ecosystems and health devices through secure API connectors and scheduled sync pipelines.' },
    { color: '#8b5cf6', tag: 'Pricing', icon: CheckCircle2, q: 'What happens when my free trial ends?', a: 'Your account remains active on the Free plan unless you choose to upgrade. You can switch plans any time from account billing settings.' },
    { color: '#ec4899', tag: 'AI Features', icon: Cpu, q: 'How does PulseNova AI actually work?', a: 'Our AI models combine nutrition inputs, biomarker trends, and behavior patterns to deliver adaptive plans, alerts, and recommendations personalized to each user.' },
    { color: '#f43f5e', tag: 'Caregiver', icon: UserCog, q: 'How does the Caregiver plan work for families?', a: 'The Caregiver plan enables multiple dependent profiles, central monitoring, alert routing, shared schedules, and secure communication for coordinated care.' },
    { color: '#14b8a6', tag: 'Support', icon: Headset, q: 'What kind of support does PulseNova offer?', a: 'Free users get community support and docs. Paid plans include priority support, and enterprise clients receive dedicated account assistance.' }
  ];

  const pricing = useMemo(() => {
    const factor = billingMode === 'annual' ? 0.8 : 1;
    return PRICING.map((plan) => {
      if (plan.price === '$0') return plan;
      const amount = Number(plan.price.replace('$', ''));
      return { ...plan, price: `$${Math.round(amount * factor)}` };
    });
  }, [billingMode]);

  return (
    <>
      <BackgroundEffect />
      <Header />
      <main className="page-wrapper pn-svc-page">
        <div className="pn-svc-bg pn-svc-bg--one" />
        <div className="pn-svc-bg pn-svc-bg--two" />
        <div className="pn-svc-grid-overlay" />

        <section className="pn-svc-page__hero section-pad">
          <div className="container">
            <div className="pn-hero-shell">
              <motion.div
                className="pn-hero-copy"
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                <div className="pn-pill">
                  <CircleDot size={12} />
                  PULSENOVA SERVICES
                </div>
                <h1 className="pn-hero-title">
                  Your Health,
                  <span> Intelligently Managed.</span>
                </h1>
                <p className="pn-hero-subtitle">
                  Six clinically-informed services unified in one intelligent platform - from AI nutrition coaching to real-time family care coordination.
                </p>
                <div className="pn-hero-cta-row">
                  <Link to="/signup" className="btn-primary">
                    Explore Services <ArrowRight size={15} />
                  </Link>
                  <Link to="/pricing" className="btn-outline">
                    View Pricing
                  </Link>
                </div>
              </motion.div>

              <motion.div
                className="pn-hero-visual"
                initial={{ opacity: 0, x: 30, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.75, delay: 0.15 }}
              >
                <div className="pn-hero-image-wrap">
                  <img src="/images/Tharuka/services/service_main.png" alt="PulseNova services" className="pn-hero-image" fetchPriority="high" />
                  <motion.div className="pn-floating-card" animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}>
                    <HeartPulse size={18} />
                    <div>
                      <strong>Health Score</strong>
                      <span>94 / 100</span>
                    </div>
                  </motion.div>
                  <motion.div className="pn-floating-card pn-floating-card--two" animate={{ y: [0, -14, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 0.3 }}>
                    <Activity size={18} />
                    <div>
                      <strong>Daily Activity</strong>
                      <span>8,540 steps</span>
                    </div>
                  </motion.div>
                  <motion.div className="pn-floating-card pn-floating-card--three" animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1.9, ease: "easeInOut", delay: 0.15 }}>
                    <Sparkles size={18} />
                    <div>
                      <strong>AI Recommendation</strong>
                      <span>Meal plan updated</span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            <div className="pn-svc-page__badges">
              {[
                { icon: Shield, text: 'HIPAA Compliant' },
                { icon: Zap, text: 'AI-Powered' },
                { icon: ShieldCheck, text: 'End-to-End Encrypted' },
                { icon: CheckCircle2, text: 'Clinically Validated' },
                { icon: Globe2, text: '40+ Countries' },
              ].map((b) => {
                const Icon = b.icon;
                return (
                  <div key={b.text} className="pn-svc-page__badge">
                    <Icon size={15} />
                    {b.text}
                  </div>
                );
              })}
            </div>

            <div className="pn-hero-stats">
              {[
                { icon: UserCog, value: '200K+', label: 'Active Users', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
                { icon: HeartPulse, value: '1M+', label: 'Health Records', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.15)' },
                { icon: Gauge, value: '99.9%', label: 'Uptime SLA', color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.15)' },
                { icon: Star, value: '4.9', label: 'Average Rating', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    className="pn-hero-stat-card"
                    key={s.label}
                    style={{ '--stat-c': s.color, '--stat-bg': s.bg }}
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="pn-hero-stat-icon">
                      <Icon size={18} />
                    </div>
                    <div>
                      <strong>{s.value}</strong>
                      <span>{s.label}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section-pad" style={{ background:'var(--bg-secondary)' }}>
          <div className="container">
            <div className="section-header">
              <span className="section-label">Our Services</span>
              <h2 className="section-title">Six Pillars of Complete Wellness</h2>
              <p className="section-subtitle">Every service is precision-engineered, clinically informed, and seamlessly integrated.</p>
            </div>
            <div className="pn-svc-page__grid">
              {SERVICES.map((svc, i) => {
                const Icon = svc.icon;
                return (
                  <motion.div
                    key={svc.id}
                    className="pn-svc-card"
                    initial={{ opacity:0, y:20 }}
                    whileInView={{ opacity:1, y:0 }}
                    viewport={{ once:true, amount: 0.1 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    whileHover={{ y: -4 }}
                  >
                    <div className="pn-svc-card__image-wrap">
                      <img src={svc.image} alt={svc.title} className="pn-svc-card__image" loading="lazy" decoding="async" />
                      <div className="pn-svc-card__overlay" />
                    </div>
                    {svc.badge && <div className="pn-svc-card__badge">{svc.badge}</div>}
                    <div className="pn-svc-card__icon">
                      <Icon size={22} />
                    </div>
                    <h3 className="pn-svc-card__title">{svc.title}</h3>
                    <p className="pn-svc-card__tagline">{svc.tagline}</p>
                    <p className="pn-svc-card__desc">{svc.desc}</p>
                    <ul className="pn-svc-card__features">
                      {svc.features.map(f => (
                        <li key={f}><CheckCircle2 size={14} />{f}</li>
                      ))}
                    </ul>
                    <code className="pn-svc-card__api">{svc.endpoint}</code>
                    <div className="pn-svc-card__meta">
                      {svc.stats.map((s) => (
                        <span key={s}>{s}</span>
                      ))}
                    </div>
                    <Link to="/dashboard" className="pn-svc-card__cta">
                      {svc.cta} <ArrowRight size={14} />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section-pad">
          <div className="container">
            <div className="pn-enterprise-cta">
              <div className="pn-enterprise-left">
                <Cpu size={20} />
                <div>
                  <strong>Ready to transform your health?</strong>
                  <span>Join 200,000+ users already living smarter with PulseNova.</span>
                </div>
              </div>
              <div className="pn-enterprise-actions">
                <Link to="/pricing" className="btn-outline">See Pricing</Link>
                <Link to="/signup" className="btn-primary">Get Started Free <ArrowRight size={14} /></Link>
              </div>
            </div>
          </div>
        </section>

        <section className="section-pad">
          <div className="container">
            <div className="section-header">
              <span className="section-label">Simple Pricing</span>
              <h2 className="section-title">Plans That Grow With You</h2>
              <p className="section-subtitle">Transparent pricing, no hidden fees. Start free and upgrade when you are ready.</p>
            </div>

            <div className="pn-pricing-toggle">
              <button className={billingMode === 'monthly' ? 'active' : ''} onClick={() => setBillingMode('monthly')}>Monthly</button>
              <button className={billingMode === 'annual' ? 'active' : ''} onClick={() => setBillingMode('annual')}>
                Annual <em>-20%</em>
              </button>
            </div>

            <div className="pn-svc-page__pricing">
              {pricing.map((plan, i) => (
                <motion.div
                  key={plan.name}
                  className={`pn-price-card ${plan.highlight ? 'pn-price-card--highlight' : ''}`}
                  initial={{ opacity:0, y:20 }}
                  whileInView={{ opacity:1, y:0 }}
                  viewport={{ once:true, amount: 0.1 }}
                  transition={{ duration:0.4, delay: i * 0.08 }}
                  whileHover={{ y: -4 }}
                >
                  {plan.highlight && <div className="pn-price-card__top-badge">Most Popular</div>}
                  <h4 className="pn-price-card__name">{plan.name}</h4>
                  <div className="pn-price-card__price">
                    <span className="pn-price-card__amount">{plan.price}</span>
                    <span className="pn-price-card__period">{plan.period}</span>
                  </div>
                  <p className="pn-price-card__desc">{plan.desc}</p>
                  <ul className="pn-price-card__features">
                    {plan.features.map(f => (
                      <li key={f}><CheckCircle2 size={14} />{f}</li>
                    ))}
                    {plan.disabledFeatures?.map((f) => (
                      <li key={f} className="muted"><CircleDot size={14} />{f}</li>
                    ))}
                  </ul>
                  <Link to="/signup" className={plan.highlight ? 'btn-primary' : 'btn-outline'} style={{ width:'100%', justifyContent:'center', marginTop:'auto' }}>
                    {plan.cta}
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="pn-pricing-enterprise">
              <div className="pn-pricing-enterprise__left">
                <ShieldCheck size={20} />
                <div>
                  <strong>Enterprise & Clinic Solutions</strong>
                  <p>Custom EHR integrations, HIPAA BAA, SLA guarantees, and dedicated health infrastructure.</p>
                </div>
              </div>
              <Link to="/contact" className="btn-outline">Contact Sales <ArrowRight size={14} /></Link>
            </div>
          </div>
        </section>

        <section className="section-pad" style={{ background:'var(--bg-secondary)' }}>
          <div className="container" style={{ maxWidth:760 }}>
            <div className="section-header">
              <span className="section-label">FAQ</span>
              <h2 className="section-title">Frequently Asked Questions</h2>
              <p className="section-subtitle">Everything you need to know about services, pricing, privacy, and AI technology.</p>
            </div>
            <div className="pn-svc-page__faq">
              {faqs.map((f, i) => (
                <motion.div
                  key={i}
                  className={`pn-svc-page__faq-item ${openFaq === i ? 'open' : ''}`}
                  style={{ '--faq-c': f.color }}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  whileHover={{ y: -2 }}
                >
                  <button className="pn-svc-page__faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <div className="pn-svc-page__faq-q-left">
                      <span className="pn-svc-page__faq-icon"><f.icon size={14} /></span>
                      <div>
                        <em className="pn-svc-page__faq-tag">{f.tag}</em>
                        <span>{f.q}</span>
                      </div>
                    </div>
                    <span className="pn-svc-page__faq-toggle">
                      <ChevronDown size={18} style={{ flexShrink:0, transition:'transform 0.25s', transform: openFaq===i ? 'rotate(180deg)' : 'none' }} />
                    </span>
                  </button>
                  {openFaq === i && <p className="pn-svc-page__faq-a">{f.a}</p>}
                </motion.div>
              ))}
            </div>

            <div className="pn-faq-support">
              <p>Still have questions? Our team is happy to help.</p>
              <div className="pn-faq-support__buttons">
                <Link to="/contact" className="btn-primary"><Headset size={15} /> Chat with Support</Link>
                <Link to="/help" className="btn-outline"><BookOpenText size={15} /> Browse Help Center</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
