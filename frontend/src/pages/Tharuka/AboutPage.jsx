import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Target, Eye, Zap, Shield, Users, Award } from 'lucide-react';
import Header from '../../components/Tharuka/Header/Header';
import Footer from '../../components/Tharuka/Footer/Footer';
import ScrollToTop from '../../components/Tharuka/Common/ScrollToTop';
import BackgroundEffect from '../../components/Tharuka/Common/BackgroundEffect';
import './AboutPage.css';

const TEAM = [
  { name: 'Dr. Ashan Perera', role: 'Chief Medical Officer', initial: 'A' },
  { name: 'Tharuka Silva', role: 'Lead Backend Engineer', initial: 'T' },
  { name: 'Priya Rajan', role: 'Frontend Developer', initial: 'P' },
  { name: 'Kavitha Murugan', role: 'UX/UI Designer', initial: 'K' },
];

const VALUES = [
  { icon: Zap,    title: 'Innovation', desc: 'Continuously pushing boundaries with AI-powered health insights.' },
  { icon: Shield, title: 'Privacy',    desc: 'Your health data is sacred. We protect it with enterprise-grade security.' },
  { icon: Users,  title: 'Inclusivity', desc: 'Multilingual support ensuring health tools are accessible to everyone.' },
  { icon: Award,  title: 'Excellence', desc: 'Delivering the highest quality health tracking experience at every touchpoint.' },
];

export default function AboutPage() {
  const { t } = useTranslation();
  return (
    <>
      <BackgroundEffect />
      <Header />
      <main className="page-wrapper pn-about">
        {/* Hero */}
        <section className="pn-about__hero section-pad">
          <div className="container">
            <motion.div className="section-header" initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7 }}>
              <span className="section-label">About Us</span>
              <h1 className="section-title">{t('about_title')}</h1>
              <p className="section-subtitle">
                PulseNova was founded with a simple but powerful vision: make world-class health tracking accessible to everyone regardless of language, age, or technical skill.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="section-pad" style={{ background: 'var(--bg-secondary)' }}>
          <div className="container pn-about__mv">
            <motion.div className="pn-about__mv-card" initial={{ opacity:0, x:-40 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.6 }}>
              <Target size={32} className="pn-about__mv-icon" />
              <h3>{t('about_mission_title')}</h3>
              <p>{t('about_mission')}</p>
            </motion.div>
            <motion.div className="pn-about__mv-card" initial={{ opacity:0, x:40 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.6, delay:0.15 }}>
              <Eye size={32} className="pn-about__mv-icon" />
              <h3>{t('about_vision_title')}</h3>
              <p>{t('about_vision')}</p>
            </motion.div>
          </div>
        </section>

        {/* Values */}
        <section className="section-pad">
          <div className="container">
            <div className="section-header">
              <span className="section-label">Our Values</span>
              <h2 className="section-title">What We Stand For</h2>
            </div>
            <div className="pn-about__values">
              {VALUES.map((v, i) => {
                const Icon = v.icon;
                return (
                  <motion.div key={v.title} className="pn-about__value-card" initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.5, delay: i*0.1 }}>
                    <div className="pn-about__value-icon"><Icon size={22} /></div>
                    <h4>{v.title}</h4>
                    <p>{v.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="section-pad" style={{ background: 'var(--bg-secondary)' }}>
          <div className="container">
            <div className="section-header">
              <span className="section-label">Team</span>
              <h2 className="section-title">{t('about_team_title')}</h2>
            </div>
            <div className="pn-about__team-img">
              <img src="/images/Tharuka/about_team.png" alt="PulseNova Team" />
            </div>
            <div className="pn-about__team-grid">
              {TEAM.map((m, i) => (
                <motion.div key={m.name} className="pn-about__member" initial={{ opacity:0, scale:0.9 }} whileInView={{ opacity:1, scale:1 }} viewport={{ once:true }} transition={{ duration:0.4, delay: i*0.1 }}>
                  <div className="pn-about__member-avatar">{m.initial}</div>
                  <strong>{m.name}</strong>
                  <span>{m.role}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
