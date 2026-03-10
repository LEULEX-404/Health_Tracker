import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Salad, Dumbbell, BarChart3, Bell, CalendarCheck,
  ArrowRight, CheckCircle2, Zap, Shield, Clock,
  ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../../components/Tharuka/Header/Header';
import Footer from '../../components/Tharuka/Footer/Footer';
import ScrollToTop from '../../components/Tharuka/Common/ScrollToTop';
import BackgroundEffect from '../../components/Tharuka/Common/BackgroundEffect';
import './ServicesPage.css';

/* Based on Backend routes/Tharuka/:
   - nutritionRoutes  → /api/nutrition
   - healthDataRoutes → /api/health-data
   - mealPlanRoutes   → /api/meal-plan
   - mealReminderRoutes → /api/meal-reminders
   - reportRoutes     → /api/reports
*/
const SERVICES = [
  {
    id: 'nutrition',
    icon: Salad,
    color: '#00C897',
    title: 'Nutrition Tracking',
    tagline: 'Smart Meal Logging & AI Dietary Insights',
    desc: 'Our AI-powered nutrition engine lets you log every meal, scan barcodes, and get real-time macro breakdowns. Backed by the backend /api/nutrition endpoint, every meal you add is instantly analysed for calories, carbs, protein, and fat against your personal health goals.',
    features: [
      'Log meals by name, barcode scan, or custom entry',
      'Real-time macro & calorie calculations',
      'Doctor recommendation notes per meal',
      'Full meal history with edit & delete',
      'Nutritional gap analysis via /api/nutrition/analysis',
    ],
    apiEndpoint: 'GET /api/nutrition/:userId',
    badge: 'Most Popular',
  },
  {
    id: 'health',
    icon: BarChart3,
    color: '#00B4D8',
    title: 'Health Data Monitoring',
    tagline: 'Track Vitals & Body Metrics Over Time',
    desc: 'Connect your body metrics — weight, BMI, blood pressure, glucose, sleep — to PulseNova\'s health data system. The /api/health-data endpoint stores each log with timestamps so you and your care team can visualise long-term trends.',
    features: [
      'Log weight, BMI, blood pressure & glucose',
      'Sleep duration & quality tracking',
      'Timestamped health data timeline',
      'Trend graphs and progress indicators',
      'Access-controlled for caregivers and doctors',
    ],
    apiEndpoint: 'GET /api/health-data/:userId',
    badge: null,
  },
  {
    id: 'mealplan',
    icon: CalendarCheck,
    color: '#39FF14',
    title: 'Meal Planning',
    tagline: 'AI-Generated Weekly Meal Plans',
    desc: 'PulseNova generates personalised weekly meal plans tailored to your caloric target, dietary restrictions, and nutritional goals. Each plan is stored at /api/meal-plan and can be regenerated, customised, and shared with a nutritionist.',
    features: [
      'Auto-generate 7-day meal plans',
      'Customise meals within the plan',
      'Align plans with nutrition goals',
      'Share plans with doctor/nutritionist',
      'Integrated with meal reminders',
    ],
    apiEndpoint: 'GET /api/meal-plan/:userId',
    badge: 'New',
  },
  {
    id: 'reminders',
    icon: Bell,
    color: '#F59E0B',
    title: 'Meal Reminders',
    tagline: 'Never Miss a Meal or Medication',
    desc: 'Smart, context-aware reminders keep your nutrition on track. Our /api/meal-reminders system schedules reminders based on your meal plan timing, sends email and SMS alerts, and supports snooze and reschedule options.',
    features: [
      'Schedule reminders for each meal slot',
      'Email & SMS notification support',
      'Snooze and reschedule with one tap',
      'Caregiver can set reminders for patients',
      'Simulator mode for testing reminders',
    ],
    apiEndpoint: 'POST /api/meal-reminders',
    badge: null,
  },
  {
    id: 'exercise',
    icon: Dumbbell,
    color: '#A78BFA',
    title: 'Exercise Tracking',
    tagline: 'Log Workouts & Monitor Performance',
    desc: 'Track every workout session — from cardio to strength training. Log duration, sets, reps, and calories burned. Performance data is stored securely and visualised in progress charts accessible via your dashboard.',
    features: [
      'Log cardio, strength, yoga, and custom workouts',
      'Track sets, reps, duration & calories',
      'Weekly and monthly progress charts',
      'Personal record (PR) tracking',
      'Export workout history as PDF',
    ],
    apiEndpoint: 'GET /api/exercise/:userId',
    badge: null,
  },
  {
    id: 'reports',
    icon: BarChart3,
    color: '#EC4899',
    title: 'Health Reports',
    tagline: 'Comprehensive PDF & Data Reports',
    desc: 'Generate professional health reports combining nutrition, exercise, and health metrics into a single downloadable document. Reports from /api/reports can be shared directly with your doctor or specialist for informed consultations.',
    features: [
      'Combine nutrition + exercise + vitals',
      'Export as PDF for doctor visits',
      'Date-range filtering',
      'Custom report templates',
      'Audit trail for medical compliance',
    ],
    apiEndpoint: 'GET /api/reports/:userId',
    badge: null,
  },
];

const PRICING = [
  {
    name: 'Free',
    price: 'LKR 0',
    period: '/month',
    desc: 'Perfect for individuals getting started with health tracking.',
    features: ['Nutrition logging (50 meals/month)', 'Basic health data tracking', '3 meal reminders/day', 'Weekly summary report', '1 meal plan/month'],
    cta: 'Get Started Free',
    highlight: false,
  },
  {
    name: 'Pro',
    price: 'LKR 990',
    period: '/month',
    desc: 'For health-conscious individuals who want full tracking power.',
    features: ['Unlimited nutrition logging', 'Full health data history', 'Unlimited meal reminders', 'Weekly & monthly reports', 'AI meal plan generation', 'Find Specialist access', 'Priority support'],
    cta: 'Start Pro Trial',
    highlight: true,
  },
  {
    name: 'Caregiver',
    price: 'LKR 1,490',
    period: '/month',
    desc: 'For caregivers managing one or more patients.',
    features: ['All Pro features', 'Up to 5 patient profiles', 'Caregiver appointment scheduler', 'Real-time patient monitoring', 'Medication reminder setup', 'Audit logs for compliance', 'Dedicated support'],
    cta: 'Start Caregiver Plan',
    highlight: false,
  },
];

export default function ServicesPage() {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    { q: 'Is there a free trial for Pro?', a: 'Yes! The Pro plan includes a 14-day free trial. No credit card required.' },
    { q: 'Can I switch plans at any time?', a: 'Absolutely. You can upgrade or downgrade your plan from Account Settings at any time. Changes take effect immediately.' },
    { q: 'How does the backend API work for nutrition?', a: 'The nutrition endpoint accepts meal entries via POST /api/nutrition. Each meal is validated, stored, and instantly analysed. You can fetch all meals with GET /api/nutrition/:userId.' },
    { q: 'Are reports available for free users?', a: 'Free users get weekly summary reports. Full PDF reports with custom date ranges require the Pro or Caregiver plan.' },
  ];

  return (
    <>
      <BackgroundEffect />
      <Header />
      <main className="page-wrapper pn-svc-page">

        {/* Hero */}
        <section className="pn-svc-page__hero section-pad">
          <div className="container">
            <motion.div className="section-header" initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7 }}>
              <span className="section-label">Services</span>
              <h1 className="section-title">{t('serv_title')}</h1>
              <p className="section-subtitle">
                PulseNova's full suite of health services — each powered by a robust backend API designed for accuracy, security, and scale.
              </p>
            </motion.div>
            <div className="pn-svc-page__badges">
              {[
                { icon: Zap,    text: 'AI-Powered' },
                { icon: Shield, text: 'GDPR Compliant' },
                { icon: Clock,  text: '99.9% Uptime' },
              ].map(b => {
                const Icon = b.icon;
                return (
                  <div key={b.text} className="pn-svc-page__badge">
                    <Icon size={15} />
                    {b.text}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Service Cards */}
        <section className="section-pad" style={{ background:'var(--bg-secondary)' }}>
          <div className="container">
            <div className="pn-svc-page__grid">
              {SERVICES.map((svc, i) => {
                const Icon = svc.icon;
                return (
                  <motion.div
                    key={svc.id}
                    className="pn-svc-card"
                    initial={{ opacity:0, y:40 }}
                    whileInView={{ opacity:1, y:0 }}
                    viewport={{ once:true }}
                    transition={{ duration:0.5, delay: (i % 3) * 0.12 }}
                  >
                    {svc.badge && <div className="pn-svc-card__badge">{svc.badge}</div>}
                    <div className="pn-svc-card__icon" style={{ background: `${svc.color}18`, borderColor: `${svc.color}30` }}>
                      <Icon size={26} style={{ color: svc.color }} />
                    </div>
                    <h3 className="pn-svc-card__title">{svc.title}</h3>
                    <p className="pn-svc-card__tagline" style={{ color: svc.color }}>{svc.tagline}</p>
                    <p className="pn-svc-card__desc">{svc.desc}</p>
                    <ul className="pn-svc-card__features">
                      {svc.features.map(f => (
                        <li key={f}><CheckCircle2 size={14} style={{ color: svc.color }} />{f}</li>
                      ))}
                    </ul>
                    <code className="pn-svc-card__api">{svc.apiEndpoint}</code>
                    <Link to="/dashboard" className="pn-svc-card__cta" style={{ background: svc.color }}>
                      Get Started <ArrowRight size={14} />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="section-pad">
          <div className="container">
            <div className="section-header">
              <span className="section-label">Pricing</span>
              <h2 className="section-title">Simple, Transparent Pricing</h2>
              <p className="section-subtitle">Start free. Upgrade when you're ready. Cancel anytime.</p>
            </div>
            <div className="pn-svc-page__pricing">
              {PRICING.map((plan, i) => (
                <motion.div
                  key={plan.name}
                  className={`pn-price-card ${plan.highlight ? 'pn-price-card--highlight' : ''}`}
                  initial={{ opacity:0, y:40 }}
                  whileInView={{ opacity:1, y:0 }}
                  viewport={{ once:true }}
                  transition={{ duration:0.5, delay: i * 0.12 }}
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
                  </ul>
                  <Link to="/signup" className={plan.highlight ? 'btn-primary' : 'btn-outline'} style={{ width:'100%', justifyContent:'center', marginTop:'auto' }}>
                    {plan.cta}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mini FAQ */}
        <section className="section-pad" style={{ background:'var(--bg-secondary)' }}>
          <div className="container" style={{ maxWidth:760 }}>
            <div className="section-header">
              <span className="section-label">FAQ</span>
              <h2 className="section-title">Services FAQ</h2>
            </div>
            <div className="pn-svc-page__faq">
              {faqs.map((f, i) => (
                <div key={i} className={`pn-svc-page__faq-item ${openFaq === i ? 'open' : ''}`}>
                  <button className="pn-svc-page__faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span>{f.q}</span>
                    <ChevronDown size={18} style={{ flexShrink:0, transition:'transform 0.25s', transform: openFaq===i ? 'rotate(180deg)' : 'none' }} />
                  </button>
                  {openFaq === i && <p className="pn-svc-page__faq-a">{f.a}</p>}
                </div>
              ))}
            </div>
            <div style={{ textAlign:'center', marginTop:32 }}>
              <Link to="/faq" className="btn-outline">View All FAQs <ArrowRight size={14} /></Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
