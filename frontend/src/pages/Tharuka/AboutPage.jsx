/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  Award,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Globe2,
  HeartPulse,
  Languages,
  Lock,
  Shield,
  Sparkles,
  Star,
  Target,
  UserRound,
  Users,
  Eye,
} from 'lucide-react';
import Header from '../../components/Tharuka/Header/Header';
import Footer from '../../components/Tharuka/Footer/Footer';
import ScrollToTop from '../../components/Tharuka/Common/ScrollToTop';
import BackgroundEffect from '../../components/Tharuka/Common/BackgroundEffect';
import './AboutPage.css';

const BADGES = ['AI-Powered', 'HIPAA Certified', '40+ Countries', 'Clinically Validated'];

const HERO_STATS = [
  { icon: Users, value: '200K+', label: 'Users Served', tone: 'mint' },
  { icon: HeartPulse, value: '1M+', label: 'Health Records', tone: 'cyan' },
  { icon: Globe2, value: '40+', label: 'Countries', tone: 'green' },
  { icon: Star, value: '4.9', label: 'User Rating', tone: 'amber' },
];

const TIMELINE = [
  { year: '2019', title: 'Founded', desc: 'PulseNova started as a small team of doctors and engineers passionate about digital health.' },
  { year: '2021', title: 'AI Launch', desc: 'Launched our proprietary AI health engine with personalized coaching capabilities.' },
  { year: '2023', title: '100K Users', desc: 'Crossed 100,000 active users across 20+ countries with HIPAA certification secured.' },
  { year: '2025', title: 'Global Scale', desc: 'Expanding to 40+ countries with multi-language support and clinical partnerships.' },
];

const STORY_CARDS = [
  { icon: HeartPulse, title: 'Human First', desc: 'Every decision starts with the human impact.', tone: 'rose' },
  { icon: Activity, title: 'Smart Tracking', desc: 'AI-driven health intelligence at your fingertips.', tone: 'mint' },
  { icon: Globe2, title: 'Accessible Care', desc: 'Designed for everyone, everywhere, in any language.', tone: 'cyan' },
  { icon: Shield, title: 'Secure by Design', desc: 'HIPAA-compliant. Your data, your control, always.', tone: 'green' },
];

const VALUES = [
  {
    icon: Sparkles,
    tone: 'mint',
    overline: 'Pushing Healthcare Forward',
    title: 'Innovation',
    desc: 'We never stop questioning how health technology can be more intelligent, accessible, and human.',
    points: ['AI-first product development', 'Continuous clinical research', 'Open health data standards'],
  },
  {
    icon: Shield,
    tone: 'cyan',
    overline: 'Your Data, Your Control',
    title: 'Privacy',
    desc: 'Health data is deeply personal. We build with zero-compromise security and transparent governance.',
    points: ['HIPAA and GDPR compliant', 'End-to-end encryption', 'User data ownership'],
  },
  {
    icon: Users,
    tone: 'green',
    overline: 'Health Has No Borders',
    title: 'Inclusivity',
    desc: 'We design PulseNova for every person regardless of age, language, background, or ability.',
    points: ['40+ language support', 'Accessibility-first design', 'Inclusive health content'],
  },
  {
    icon: Award,
    tone: 'amber',
    overline: 'Uncompromising Quality',
    title: 'Excellence',
    desc: 'From clinical accuracy to UI polish, we hold ourselves to standards above expectations.',
    points: ['Clinically validated insights', 'Expert medical review board', 'Enterprise-grade reliability'],
  },
];

const WHY_POINTS = [
  { icon: UserRound, title: 'Personalized Care', score: '94%', note: 'personalization accuracy', desc: 'Every recommendation is built around your unique health profile, lifestyle, and clinical history.', tone: 'mint' },
  { icon: BookOpen, title: 'AI-Powered Insights', score: '10M+', note: 'AI predictions daily', desc: 'Our intelligence engine analyzes thousands of data points to surface actionable insights.', tone: 'cyan' },
  { icon: Shield, title: 'Secure Health Data', score: '100%', note: 'data encrypted', desc: 'HIPAA-certified and fully encrypted. Your records are yours - we never sell your personal data.', tone: 'green' },
  { icon: Languages, title: 'Multi-language Access', score: '40+', note: 'languages supported', desc: 'Available in 40+ languages so health intelligence reaches every corner of the world.', tone: 'teal' },
  { icon: CalendarDays, title: 'Preventive Wellness', score: '3x', note: 'fewer health incidents', desc: 'We detect risks before they become problems through proactive alerts and coaching.', tone: 'lime' },
];

const TEAM = [
  {
    name: 'Dr. Tharuka Sanjeewa',
    role: 'Co-Founder & Chief Medical Officer',
    tag: 'Clinical Strategy',
    bio: 'Board-certified internal medicine physician with 15 years of clinical experience.',
    image: '/images/Tharuka/aboutus/about_team_1.png',
  },
  {
    name: 'Imasha Dulshini',
    role: 'Co-Founder & CEO',
    tag: 'Product Leadership',
    bio: 'Former product lead at Google Health and Stanford Digital Health Lab.',
    image: '/images/Tharuka/aboutus/about_team_2.png',
  },
  {
    name: 'Tharindu Nethmal',
    role: 'Head of AI & Data Science',
    tag: 'Machine Learning',
    bio: 'PhD in biomedical informatics from MIT, focused on predictive clinical models.',
    image: '/images/Tharuka/aboutus/about_team_3.png',
  },
  {
    name: 'Dhumesh Priya',
    role: 'VP of Engineering',
    tag: 'Platform Architecture',
    bio: 'Full-stack engineering leader with deep expertise in HIPAA-compliant systems.',
    image: '/images/Tharuka/aboutus/about_team_4.png',
  },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="page-wrapper pn-about">
        <div className="pn-about-bg-fx" aria-hidden="true">
          <div className="pn-about-mesh" />
          <div className="pn-about-glow-blobs">
            <div className="blob blob-1" />
            <div className="blob blob-2" />
            <div className="blob blob-3" />
          </div>
          <div className="pn-about-symbols">
            {[...Array(12)].map((_, i) => <span key={i} className={i % 2 === 0 ? 'plus' : 'circle'} />)}
          </div>
          <div className="pn-about-particles">
            {[...Array(20)].map((_, i) => <span key={i} />)}
          </div>
          <div className="pn-about-sonar">
            <span /><span /><span />
          </div>
        </div>

        <section className="pn-about__hero section-pad">
          <div className="container">
            <div className="pn-about-hero-grid">
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
                <span className="section-label">About PulseNova</span>
                <h1 className="pn-about-hero-title">
                  Health Intelligence,
                  <span> Built for Every Human.</span>
                </h1>
                <p className="pn-about-hero-sub">
                  PulseNova was founded with a single belief - everyone deserves access to intelligent, personalized healthcare.
                  We build the tools that make that possible: beautifully simple, clinically trusted, and deeply human.
                </p>
                <div className="pn-about-hero-actions">
                  <button className="btn-primary">Explore Services <ArrowRight size={15} /></button>
                  <button className="btn-outline">Meet the Team</button>
                </div>

                <div className="pn-about-badges">
                  {BADGES.map((b) => (
                    <span key={b} className="pn-about-badge">{b}</span>
                  ))}
                </div>
              </motion.div>

              <motion.div className="pn-about-hero-image-area" initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.75, delay: 0.1 }}>
                <img
                  src="/images/Tharuka/aboutus/about_main.png"
                  alt="PulseNova doctor"
                  className="pn-about-cutout pn-about-cutout--hero"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                />
                <div className="pn-about-float-card pn-about-float-card--a" style={{'--float-c': '#f43f5e'}}>
                  <HeartPulse size={16} />
                  <div><strong>Heart Rate</strong><span>72 bpm</span></div>
                </div>
                <div className="pn-about-float-card pn-about-float-card--b" style={{'--float-c': '#10b981'}}>
                  <Activity size={16} />
                  <div><strong>AI Insights</strong><span>Score improved</span></div>
                </div>
                <div className="pn-about-float-card pn-about-float-card--c" style={{'--float-c': '#f59e0b'}}>
                  <Shield size={16} />
                  <div><strong>Wellness</strong><span>All Clear</span></div>
                </div>
              </motion.div>
            </div>

            <div className="pn-about-stats-grid">
              {HERO_STATS.map((s) => {
                const Icon = s.icon;
                return (
                  <motion.div key={s.label} className={`pn-about-stat is-${s.tone}`} whileHover={{ y: -6, scale: 1.02 }}>
                    <span className="pn-about-stat__icon"><Icon size={18} /></span>
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

        <section className="section-pad">
          <div className="container">
            <div className="section-header">
              <span className="section-label">Our Story</span>
              <h2 className="section-title">Why We Built <span className="text-gradient">PulseNova</span></h2>
              <p className="section-subtitle">Born from a belief that healthcare intelligence should be available to everyone.</p>
            </div>

            <div className="pn-about-story-grid">
              <motion.div className="pn-about-story-copy" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <p>
                  In 2019, our founders noticed a painful gap: millions of people were tracking their health using disconnected apps, outdated spreadsheets, and unreliable wearables.
                </p>
                <p>
                  The insights they needed were scattered, hard to read, and impossible to act on. PulseNova was built to change that.
                </p>

                <div className="pn-about-timeline">
                  {TIMELINE.map((item) => (
                    <div key={item.year} className="pn-about-timeline-item">
                      <span>{item.year}</span>
                      <strong>{item.title}</strong>
                      <p>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div className="pn-about-story-media" initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <img
                  src="/images/Tharuka/aboutus/about_story.png"
                  alt="PulseNova story"
                  className="pn-about-cutout pn-about-cutout--story"
                  loading="lazy"
                  decoding="async"
                />
                <div className="pn-about-story-cards">
                  {STORY_CARDS.map((c) => {
                    const Icon = c.icon;
                    return (
                      <article key={c.title} className={`pn-about-mini-card is-${c.tone}`}>
                        <span className="pn-about-mini-card__icon"><Icon size={16} /></span>
                        <h4>{c.title}</h4>
                        <p>{c.desc}</p>
                      </article>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="section-pad pn-about__mission-vision">
          <div className="container">
            <div className="section-header">
              <span className="section-label">Mission & Vision</span>
              <h2 className="section-title">What We Stand For</h2>
              <p className="section-subtitle">Two pillars guide every product decision we make at PulseNova.</p>
            </div>
            <div className="pn-about-mv-grid">
              <motion.div className="pn-about-mv-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <div className="pn-about-mv-icon is-mint"><Target size={22} /></div>
                <span className="pn-about-mv-chip">Our Mission</span>
                <h3>Democratize Intelligent Healthcare</h3>
                <p>Put clinically trusted, AI-driven health insights into the hands of every person, regardless of location, income, or background.</p>
                <ul>
                  <li><CheckCircle2 size={14} /> Remove barriers to quality health intelligence</li>
                  <li><CheckCircle2 size={14} /> Make health data understandable and actionable</li>
                  <li><CheckCircle2 size={14} /> Support every stage of the wellness journey</li>
                </ul>
              </motion.div>
              <motion.div className="pn-about-mv-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }}>
                <div className="pn-about-mv-icon is-cyan"><Eye size={22} /></div>
                <span className="pn-about-mv-chip">Our Vision</span>
                <h3>A World Where Prevention Leads</h3>
                <p>Shift healthcare from reactive treatment to proactive prevention at scale powered by real clinical science.</p>
                <ul>
                  <li><CheckCircle2 size={14} /> Shift healthcare from reactive to preventive</li>
                  <li><CheckCircle2 size={14} /> Build the global health intelligence layer</li>
                  <li><CheckCircle2 size={14} /> Connect 1 billion people to personalized care</li>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="section-pad">
          <div className="container">
            <div className="section-header">
              <span className="section-label">Core Values</span>
              <h2 className="section-title">Principles That <span className="text-gradient">Guide Us</span></h2>
              <p className="section-subtitle">Four values that shape how we build, hire, and serve users around the world.</p>
            </div>
            <div className="pn-about-values-grid">
              {VALUES.map((v, i) => {
                const Icon = v.icon;
                return (
                  <motion.article
                    key={v.title}
                    className="pn-about-value-card"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ delay: i * 0.06 }}
                    whileHover={{ y: -5, scale: 1.01 }}
                  >
                    <div className={`pn-about-value-icon is-${v.tone}`}><Icon size={18} /></div>
                    <span>{v.overline}</span>
                    <h3>{v.title}</h3>
                    <p>{v.desc}</p>
                    <ul>
                      {v.points.map((p) => <li key={p}>{p}</li>)}
                    </ul>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section-pad pn-about-why">
          <div className="container">
            <div className="section-header">
              <span className="section-label">Why PulseNova</span>
              <h2 className="section-title">Built Different. <span className="text-gradient">Built Better.</span></h2>
            </div>
            <div className="pn-about-why-grid">
              <div className="pn-about-why-list">
                {WHY_POINTS.map((p) => {
                  const Icon = p.icon;
                  return (
                    <article key={p.title} className={`pn-about-why-item is-${p.tone}`}>
                      <div className={`pn-about-why-icon is-${p.tone}`}><Icon size={18} /></div>
                      <div>
                        <header>
                          <strong>{p.title}</strong>
                          <span>{p.score}<em>{p.note}</em></span>
                        </header>
                        <p>{p.desc}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
              <div className="pn-about-why-media">
                <img
                  src="/images/Tharuka/aboutus/about_why.png"
                  alt="Why PulseNova"
                  className="pn-about-cutout pn-about-cutout--why"
                  loading="lazy"
                  decoding="async"
                />
                <div className="pn-about-float-card pn-about-float-card--why-a" style={{'--float-c': '#10b981'}}>
                  <HeartPulse size={16} />
                  <div><strong>Health Score</strong><span>96 / 100</span></div>
                </div>
                <div className="pn-about-float-card pn-about-float-card--why-b" style={{'--float-c': '#0ea5e9'}}>
                  <Sparkles size={16} />
                  <div><strong>AI Active</strong><span>Live model</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-pad">
          <div className="container">
            <div className="section-header">
              <span className="section-label">The Team</span>
              <h2 className="section-title">The People Behind <span className="text-gradient">PulseNova</span></h2>
              <p className="section-subtitle">A diverse team of physicians, engineers, designers, and scientists united by one purpose.</p>
            </div>
            <div className="pn-about-team-grid">
              {TEAM.map((m, i) => (
                <motion.article
                  className={`pn-about-team-card pn-team-color-${i % 4}`}
                  key={m.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div className="pn-about-team-card-inner">
                    <div className="pn-about-team-top-cap" />
                    <div className="pn-about-team-image-area">
                      <div className="pn-about-team-avatar-container">
                        <img src={m.image} alt={m.name} className="pn-about-team-img" loading="lazy" decoding="async" />
                        <span className="pn-about-team-status-dot" />
                      </div>
                    </div>
                    <div className="pn-about-team-content">
                      <div className="pn-about-team-tag-box">
                        <span className="pn-about-team-tag">{m.tag}</span>
                      </div>
                      <h4 className="pn-about-team-name">{m.name}</h4>
                      <em className="pn-about-team-role">{m.role}</em>
                      <p className="pn-about-team-bio">{m.bio}</p>
                      <div className="pn-about-team-social">
                        <a href="#" className="social-icon">in</a>
                        <a href="#" className="social-icon">X</a>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
            <div className="pn-about-hiring">
              <div>
                <strong>We're Hiring</strong>
                <p>Join our mission-driven team of healthcare innovators. Remote-first and globally distributed.</p>
              </div>
              <button className="btn-primary"><BriefcaseBusiness size={14} /> View Open Roles</button>
            </div>
          </div>
        </section>

        <section className="section-pad pn-about-cta-wrap">
          <div className="container">
            <div className="pn-about-cta">
              <div>
                <span className="section-label">Start Your Health Journey</span>
                <h2>
                  <span className="pn-about-cta-title-top">Take Control of Your Health</span>
                  <span className="pn-about-cta-highlight">Starting Today</span>
                </h2>
                <p>Join 200,000+ people who use PulseNova to track, understand, and improve their health with AI-powered intelligence.</p>
                <div className="pn-about-cta-actions">
                  <button className="btn-outline">Get Started Free</button>
                  <button className="btn-primary">Explore Services</button>
                </div>
              </div>
              <div className="pn-about-cta-media">
                <img
                  src="/images/Tharuka/aboutus/about_cta.png"
                  alt="Join PulseNova"
                  className="pn-about-cutout pn-about-cutout--cta"
                  loading="lazy"
                  decoding="async"
                />
                <div className="pn-about-float-card pn-about-float-card--cta-a" style={{'--float-c': '#fef08a'}}>
                  <Star size={16} />
                  <div><strong>Trust Score</strong><span>9.9 / 10</span></div>
                </div>
                <div className="pn-about-float-card pn-about-float-card--cta-b" style={{'--float-c': '#10b981'}}>
                  <Shield size={16} />
                  <div><strong>Secured</strong><span>HIPAA Ready</span></div>
                </div>
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
