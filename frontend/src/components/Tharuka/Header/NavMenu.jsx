import { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X, ChevronDown, DatabaseZap, UtensilsCrossed, Activity } from 'lucide-react';
import { useAuth } from '../../../context/Imasha/AuthContext';
import './NavMenu.css';

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

export default function NavMenu({ isOpen, onClose }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isLoggedIn = !!user;

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

  return (
    <>
      {/* Desktop Nav */}
      <nav className="pn-nav pn-nav--desktop" aria-label="Main navigation">
        {NAV_LINKS.map(link => {
          // Hide "Find Specialist" base link for logged in users
          if (isLoggedIn && link.key === 'nav_specialist') return null;
          
          return link.to.includes('#')
            ? <button key={link.key} className="pn-nav__link pn-nav__link--btn" onClick={() => handleLinkClick(link.to)}>
                {t(link.key)}
              </button>
            : <NavLink key={link.key} to={link.to} className={({ isActive }) => `pn-nav__link ${isActive ? 'active' : ''}`} end={link.to === '/'}>
                {t(link.key)}
              </NavLink>;
        })}

        {/* Nutrition Dropdown — only for logged-in users */}
        {isLoggedIn && (
          <>
            <div className="pn-nav__dropdown-wrap" ref={appointmentsRef}>
              <button
                className={`pn-nav__link pn-nav__link--btn pn-nav__dropdown-trigger ${appointmentsOpen ? 'active' : ''}`}
                onClick={() => {
                  setAppointmentsOpen(prev => !prev);
                  setNutritionOpen(false);
                }}
                aria-expanded={appointmentsOpen}
                aria-haspopup="true"
              >
                {t('nav_appointments')}
                <ChevronDown size={14} className={`pn-nav__dd-chevron ${appointmentsOpen ? 'open' : ''}`} />
              </button>

              {appointmentsOpen && (
                <div className="pn-nav__dropdown-menu glass">
                  {APPOINTMENT_LINKS.map(link => (
                    <NavLink
                      key={link.key}
                      to={link.to}
                      className={({ isActive }) => `pn-nav__dropdown-item ${isActive ? 'active' : ''}`}
                      onClick={() => handleLinkClick(link.to)}
                    >
                      <span>{t(link.key)}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            <div className="pn-nav__dropdown-wrap" ref={nutritionRef}>
              <button
                className={`pn-nav__link pn-nav__link--btn pn-nav__dropdown-trigger ${nutritionOpen ? 'active' : ''}`}
                onClick={() => {
                  setNutritionOpen(prev => !prev);
                  setAppointmentsOpen(false);
                }}
                aria-expanded={nutritionOpen}
                aria-haspopup="true"
              >
                {t('nav_health_hub')}
                <ChevronDown size={14} className={`pn-nav__dd-chevron ${nutritionOpen ? 'open' : ''}`} />
              </button>

              {nutritionOpen && (
                <div className="pn-nav__dropdown-menu glass">
                  {NUTRITION_LINKS.map(link => {
                    const Icon = link.icon;
                    return (
                      <NavLink
                        key={link.key}
                        to={link.to}
                        className={({ isActive }) => `pn-nav__dropdown-item ${isActive ? 'active' : ''}`}
                        onClick={() => handleLinkClick(link.to)}
                      >
                        <span className="pn-nav__dd-icon"><Icon size={15} /></span>
                        <span>{t(link.key)}</span>
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </nav>

      {/* Mobile Drawer */}
      {isOpen && <div className="pn-nav__backdrop" onClick={onClose} />}
      <div className={`pn-nav pn-nav--mobile ${isOpen ? 'open' : ''}`}>
        <button className="pn-nav__close" onClick={onClose}><X size={22} /></button>
        <nav className="pn-nav__mobile-links">
          {NAV_LINKS.map(link => {
            if (isLoggedIn && link.key === 'nav_specialist') return null;

            return link.to.includes('#')
              ? <button key={link.key} className="pn-nav__link pn-nav__link--btn" onClick={() => handleLinkClick(link.to)}>
                  {t(link.key)}
                </button>
              : <NavLink key={link.key} to={link.to} className={({ isActive }) => `pn-nav__link ${isActive ? 'active' : ''}`} onClick={onClose} end={link.to === '/'}>
                  {t(link.key)}
                </NavLink>;
          })}

          {/* Mobile Accordions — only for logged-in users */}
          {isLoggedIn && (
            <>
              <div className="pn-nav__mobile-accordion">
                <button
                  className={`pn-nav__link pn-nav__link--btn pn-nav__mobile-acc-trigger ${mobileAppointmentsOpen ? 'active' : ''}`}
                  onClick={() => setMobileAppointmentsOpen(prev => !prev)}
                >
                  {t('nav_appointments')}
                  <ChevronDown size={14} className={`pn-nav__dd-chevron ${mobileAppointmentsOpen ? 'open' : ''}`} />
                </button>
                <div className={`pn-nav__mobile-acc-content ${mobileAppointmentsOpen ? 'open' : ''}`}>
                  {APPOINTMENT_LINKS.map(link => (
                    <NavLink
                      key={link.key}
                      to={link.to}
                      className={({ isActive }) => `pn-nav__mobile-sub-link ${isActive ? 'active' : ''}`}
                      onClick={() => handleLinkClick(link.to)}
                    >
                      {t(link.key)}
                    </NavLink>
                  ))}
                </div>
              </div>

              <div className="pn-nav__mobile-accordion">
                <button
                  className={`pn-nav__link pn-nav__link--btn pn-nav__mobile-acc-trigger ${mobileNutritionOpen ? 'active' : ''}`}
                  onClick={() => setMobileNutritionOpen(prev => !prev)}
                >
                  {t('nav_health_hub')}
                  <ChevronDown size={14} className={`pn-nav__dd-chevron ${mobileNutritionOpen ? 'open' : ''}`} />
                </button>
                <div className={`pn-nav__mobile-acc-content ${mobileNutritionOpen ? 'open' : ''}`}>
                  {NUTRITION_LINKS.map(link => {
                    const Icon = link.icon;
                    return (
                      <NavLink
                        key={link.key}
                        to={link.to}
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
        </nav>
      </div>
    </>
  );
}
