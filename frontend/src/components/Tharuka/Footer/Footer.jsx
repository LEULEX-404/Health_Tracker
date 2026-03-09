import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Github, Twitter, Linkedin, Instagram, Heart } from 'lucide-react';
import Logo from '../Common/Logo';
import './Footer.css';

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  const quickLinks = [
    { label: t('nav_home'), to: '/' },
    { label: t('nav_about'), to: '/about' },
    { label: t('nav_services'), to: '/#services' },
    { label: t('nav_specialist'), to: '/find-specialist' },
    { label: 'FAQ', to: '/faq' },
  ];

  const services = [
    { label: t('feat_nutrition'), to: '/nutrition' },
    { label: t('feat_exercise'), to: '/exercise' },
    { label: t('feat_reports'), to: '/dashboard' },
    { label: t('feat_reminders'), to: '/dashboard' },
    { label: t('feat_caregiver'), to: '/dashboard' },
  ];

  const legal = [
    { label: t('terms_title'), to: '/terms' },
    { label: t('privacy_title'), to: '/privacy' },
    { label: t('nav_contact'), to: '/contact' },
    { label: 'FAQ', to: '/faq' },
  ];

  return (
    <footer className="pn-footer">
      <div className="pn-footer__glow" />
      <div className="container pn-footer__inner">
        <div className="pn-footer__grid">

          {/* Brand Column */}
          <div className="pn-footer__col pn-footer__col--brand">
            <Logo />
            <p className="pn-footer__tagline">{t('footer_tagline')}</p>
            <p className="pn-footer__desc">
              Your intelligent health companion for tracking nutrition, exercise, and wellness — all in one place.
            </p>
            <div className="pn-footer__socials">
              {[
                { icon: <Twitter size={16} />, href: '#', label: 'Twitter' },
                { icon: <Linkedin size={16} />, href: '#', label: 'LinkedIn' },
                { icon: <Instagram size={16} />, href: '#', label: 'Instagram' },
                { icon: <Github size={16} />, href: '#', label: 'GitHub' },
              ].map(s => (
                <a key={s.label} href={s.href} className="pn-footer__social" aria-label={s.label}>{s.icon}</a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="pn-footer__col">
            <h5 className="pn-footer__col-title">{t('footer_quicklinks')}</h5>
            <ul className="pn-footer__links">
              {quickLinks.map(l => (
                <li key={l.to}><Link to={l.to} className="pn-footer__link">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="pn-footer__col">
            <h5 className="pn-footer__col-title">{t('footer_services')}</h5>
            <ul className="pn-footer__links">
              {services.map(l => (
                <li key={l.label}><Link to={l.to} className="pn-footer__link">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="pn-footer__col">
            <h5 className="pn-footer__col-title">{t('footer_legal')}</h5>
            <ul className="pn-footer__links">
              {legal.map(l => (
                <li key={l.label}><Link to={l.to} className="pn-footer__link">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="pn-footer__col">
            <h5 className="pn-footer__col-title">{t('footer_contact_title')}</h5>
            <ul className="pn-footer__contact-list">
              <li><Mail size={14} /><a href={`mailto:${t('footer_email')}`}>{t('footer_email')}</a></li>
              <li><Phone size={14} /><a href={`tel:${t('footer_phone')}`}>{t('footer_phone')}</a></li>
              <li><MapPin size={14} /><span>{t('footer_address')}</span></li>
            </ul>
          </div>
        </div>

        <div className="pn-footer__bottom">
          <p className="pn-footer__copy">{t('footer_copyright')}</p>
          <p className="pn-footer__made">
            Made with <Heart size={13} className="pn-footer__heart" /> for better health
          </p>
        </div>
      </div>
    </footer>
  );
}
