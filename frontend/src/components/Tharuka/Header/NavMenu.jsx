import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, ChevronDown, DatabaseZap, Activity, ClipboardList, LogIn } from 'lucide-react';
import { useAuth } from '../../../context/Imasha/AuthContext';
import { useFontSize } from '../../../context/Tharuka/FontSizeContext';
import { triggerPageWave } from '../Common/PageTransitionWave';
import './NavMenu.css';

const LANGS = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'si', label: 'සිංහල', short: 'සිං' },
  { code: 'ta', label: 'தமிழ்', short: 'தமி' },
];

const FONT_SIZES = [
  { key: 'small',  label: 'A-' },
  { key: 'medium', label: 'A'  },
  { key: 'large',  label: 'A+' },
];

const NAV_LINKS = [
  { key: 'nav_home', to: '/' },
  { key: 'nav_exercise', to: '/exercise' },
  { key: 'nav_services', to: '/services' },
  { key: 'nav_specialist', to: '/find-specialist' }, // Handled conditionally in render
  { key: 'nav_about', to: '/about' },
  { key: 'nav_contact', to: '/contact' },
];

// Shown only inside the Health Hub dropdown when logged in
const NUTRITION_LINKS = [
  { key: 'nav_nutrition',   to: '/nutrition',   icon: Activity },
  { key: 'nav_health_data', to: '/health-data', icon: DatabaseZap },
];

const APPOINTMENT_LINKS = [
  { key: 'nav_doctor_appointment',    to: '/find-specialist' },
  { key: 'nav_caregiver_appointment', to: '/caregiver-appointment' },
];

// Desktop dropdown spring animation
const dropdownVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.96 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.2, ease: [0.34, 1.56, 0.64, 1] },
  },
  exit: {
    opacity: 0, y: -6, scale: 0.97,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

export default function NavMenu({ isOpen, onClose }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fontSize, changeSize } = useFontSize();
  const isLoggedIn = !!user;
  const prefersReducedMotion = useReducedMotion();

  const changeLang = (code) => {
    triggerPageWave(() => {
      i18n.changeLanguage(code);
      localStorage.setItem('pulsanova-lang', code);
    });
  };

  const changeFontSize = (size) => {
    triggerPageWave(() => changeSize(size));
  };

  const [nutritionOpen, setNutritionOpen] = useState(false);
  const [appointmentsOpen, setAppointmentsOpen] = useState(false);
  const [mobileNutritionOpen, setMobileNutritionOpen] = useState(false);
  const [mobileAppointmentsOpen, setMobileAppointmentsOpen] = useState(false);
  const nutritionRef = useRef(null);
  const appointmentsRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleOutside = (e) => {
      if (nutritionRef.current && !nutritionRef.current.contains(e.target)) {
        setNutritionOpen(false);
      }
      if (appointmentsRef.current && !appointmentsRef.current.contains(e.target)) {
        setAppointmentsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Close mobile sub-menus when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setMobileNutritionOpen(false);
      setMobileAppointmentsOpen(false);
    }
  }, [isOpen]);

  const handleLinkClick = (to) => {
    onClose();
    setNutritionOpen(false);
    setAppointmentsOpen(false);
    setMobileNutritionOpen(false);
    setMobileAppointmentsOpen(false);
    if (to.includes('#')) {
      const hash = to.split('#')[1];
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  // Visible mobile links (already filtered)
  const mobileLinks = NAV_LINKS.filter(l => !(isLoggedIn && l.key === 'nav_specialist'));

  return (
    <>
      {/* ===== Desktop Nav ===== */}
      <nav className="pn-nav pn-nav--desktop" aria-label="Main navigation">
        {NAV_LINKS.map(link => {
          if (isLoggedIn && link.key === 'nav_specialist') return null;
          return link.to.includes('#')
            ? <button key={link.key} className="pn-nav__link pn-nav__link--btn" onClick={() => handleLinkClick(link.to)}>
                {t(link.key)}
              </button>
            : <NavLink key={link.key} to={link.to} className={({ isActive }) => `pn-nav__link ${isActive ? 'active' : ''}`} end={link.to === '/'}>
                {t(link.key)}
              </NavLink>;
        })}

        {isLoggedIn && (
          <>
            {/* Appointments Dropdown */}
            <div className="pn-nav__dropdown-wrap" ref={appointmentsRef}>
              <button
                className={`pn-nav__link pn-nav__link--btn pn-nav__dropdown-trigger ${appointmentsOpen ? 'active' : ''}`}
                onClick={() => { setAppointmentsOpen(p => !p); setNutritionOpen(false); }}
                aria-expanded={appointmentsOpen}
                aria-haspopup="true"
              >
                {t('nav_appointments')}
                <ChevronDown size={14} className={`pn-nav__dd-chevron ${appointmentsOpen ? 'open' : ''}`} />
              </button>
              <AnimatePresence>
                {appointmentsOpen && (
                  <motion.div
                    className="pn-nav__dropdown-menu glass"
                    variants={prefersReducedMotion ? {} : dropdownVariants}
                    initial="hidden" animate="visible" exit="exit"
                  >
                    {APPOINTMENT_LINKS.map(link => {
                      const Icon = link.icon || ClipboardList;
                      return (
                        <NavLink key={link.key} to={link.to}
                          className={({ isActive }) => `pn-nav__dropdown-item ${isActive ? 'active' : ''}`}
                          onClick={() => handleLinkClick(link.to)}
                        >
                          <span className="pn-nav__dd-icon"><Icon size={15} /></span>
                          <span>{link.label || t(link.key)}</span>
                        </NavLink>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Health Hub Dropdown */}
            <div className="pn-nav__dropdown-wrap" ref={nutritionRef}>
              <button
                className={`pn-nav__link pn-nav__link--btn pn-nav__dropdown-trigger ${nutritionOpen ? 'active' : ''}`}
                onClick={() => { setNutritionOpen(p => !p); setAppointmentsOpen(false); }}
                aria-expanded={nutritionOpen}
                aria-haspopup="true"
              >
                {t('nav_health_hub')}
                <ChevronDown size={14} className={`pn-nav__dd-chevron ${nutritionOpen ? 'open' : ''}`} />
              </button>
              <AnimatePresence>
                {nutritionOpen && (
                  <motion.div
                    className="pn-nav__dropdown-menu glass"
                    variants={prefersReducedMotion ? {} : dropdownVariants}
                    initial="hidden" animate="visible" exit="exit"
                  >
                    {NUTRITION_LINKS.map(link => {
                      const Icon = link.icon;
                      return (
                        <NavLink key={link.key} to={link.to}
                          className={({ isActive }) => `pn-nav__dropdown-item ${isActive ? 'active' : ''}`}
                          onClick={() => handleLinkClick(link.to)}
                        >
                          <span className="pn-nav__dd-icon"><Icon size={15} /></span>
                          <span>{t(link.key)}</span>
                        </NavLink>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </nav>

      {/* ===== Mobile Drawer ===== */}
      {isOpen && <div className="pn-nav__backdrop" onClick={onClose} />}
      <div className={`pn-nav pn-nav--mobile ${isOpen ? 'open' : ''}`} aria-hidden={!isOpen}>
        <button className="pn-nav__close" onClick={onClose} aria-label="Close menu">
          <X size={20} />
        </button>

        <nav className="pn-nav__mobile-links" aria-label="Mobile navigation">
          {/* Plain nav links — no Framer animation on mobile to keep things stable */}
          {mobileLinks.map(link =>
            link.to.includes('#')
              ? <button key={link.key} className="pn-nav__link pn-nav__link--btn" onClick={() => handleLinkClick(link.to)}>
                  {t(link.key)}
                </button>
              : <NavLink key={link.key} to={link.to}
                  className={({ isActive }) => `pn-nav__link ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                  end={link.to === '/'}
                >
                  {t(link.key)}
                </NavLink>
          )}

          {/* Logged-in accordions */}
          {isLoggedIn && (
            <>
              <hr className="pn-nav__mobile-divider" />

              {/* Appointments accordion */}
              <div className="pn-nav__mobile-accordion">
                <button
                  className={`pn-nav__link pn-nav__link--btn pn-nav__mobile-acc-trigger ${mobileAppointmentsOpen ? 'active' : ''}`}
                  onClick={() => setMobileAppointmentsOpen(p => !p)}
                  aria-expanded={mobileAppointmentsOpen}
                >
                  {t('nav_appointments')}
                  <ChevronDown size={14} className={`pn-nav__dd-chevron ${mobileAppointmentsOpen ? 'open' : ''}`} />
                </button>
                <div className={`pn-nav__mobile-acc-content ${mobileAppointmentsOpen ? 'open' : ''}`}>
                  {APPOINTMENT_LINKS.map(link => {
                    const Icon = link.icon || ClipboardList;
                    return (
                      <NavLink key={link.key} to={link.to}
                        className={({ isActive }) => `pn-nav__mobile-sub-link ${isActive ? 'active' : ''}`}
                        onClick={() => handleLinkClick(link.to)}
                      >
                        <span className="pn-nav__dd-icon"><Icon size={14} /></span>
                        {link.label || t(link.key)}
                      </NavLink>
                    );
                  })}
                </div>
              </div>

              {/* Health Hub accordion */}
              <div className="pn-nav__mobile-accordion">
                <button
                  className={`pn-nav__link pn-nav__link--btn pn-nav__mobile-acc-trigger ${mobileNutritionOpen ? 'active' : ''}`}
                  onClick={() => setMobileNutritionOpen(p => !p)}
                  aria-expanded={mobileNutritionOpen}
                >
                  {t('nav_health_hub')}
                  <ChevronDown size={14} className={`pn-nav__dd-chevron ${mobileNutritionOpen ? 'open' : ''}`} />
                </button>
                <div className={`pn-nav__mobile-acc-content ${mobileNutritionOpen ? 'open' : ''}`}>
                  {NUTRITION_LINKS.map(link => {
                    const Icon = link.icon;
                    return (
                      <NavLink key={link.key} to={link.to}
                        className={({ isActive }) => `pn-nav__mobile-sub-link ${isActive ? 'active' : ''}`}
                        onClick={() => handleLinkClick(link.to)}
                      >
                        <span className="pn-nav__dd-icon"><Icon size={14} /></span>
                        {t(link.key)}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Guest CTA — Login + Signup stacked inside drawer */}
          {!isLoggedIn && (
            <>
              <hr className="pn-nav__mobile-divider" />
              <div className="pn-nav__mobile-cta">
                <button className="btn-outline" onClick={() => { onClose(); navigate('/login'); }}>
                  <LogIn size={16} />
                  {t('btn_login')}
                </button>
                <button className="btn-primary" onClick={() => { onClose(); navigate('/register'); }}>
                  {t('btn_signup')}
                </button>
              </div>
            </>
          )}

          {/* ---- Settings: Language + Font Size ---- */}
          <hr className="pn-nav__mobile-divider" />
          <div className="pn-nav__mobile-settings">
            <span className="pn-nav__mobile-settings-label">Settings</span>

            {/* Language */}
            <div className="pn-nav__mobile-setting-row">
              <span className="pn-nav__mobile-setting-title">Lang</span>
              <div className="pn-nav__mobile-chip-group">
                {LANGS.map(l => (
                  <button
                    key={l.code}
                    className={`pn-nav__mobile-chip ${i18n.language === l.code ? 'active' : ''}`}
                    onClick={() => changeLang(l.code)}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div className="pn-nav__mobile-setting-row">
              <span className="pn-nav__mobile-setting-title">Size</span>
              <div className="pn-nav__mobile-chip-group">
                {FONT_SIZES.map(f => (
                  <button
                    key={f.key}
                    className={`pn-nav__mobile-chip ${fontSize === f.key ? 'active' : ''}`}
                    onClick={() => changeFontSize(f.key)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
