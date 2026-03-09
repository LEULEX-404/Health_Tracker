import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import './NavMenu.css';

const NAV_LINKS = [
  { key: 'nav_home', to: '/' },
  { key: 'nav_nutrition', to: '/nutrition' },
  { key: 'nav_exercise', to: '/exercise' },
  { key: 'nav_services', to: '/services' },
  { key: 'nav_specialist', to: '/find-specialist' },
  { key: 'nav_about', to: '/about' },
  { key: 'nav_contact', to: '/contact' },
];

export default function NavMenu({ isOpen, onClose }) {
  const { t } = useTranslation();

  const handleLinkClick = (to) => {
    onClose();
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
        {NAV_LINKS.map(link => (
          link.to.includes('#')
            ? <button key={link.key} className="pn-nav__link pn-nav__link--btn" onClick={() => handleLinkClick(link.to)}>
                {t(link.key)}
              </button>
            : <NavLink key={link.key} to={link.to} className={({ isActive }) => `pn-nav__link ${isActive ? 'active' : ''}`} end={link.to === '/'}>
                {t(link.key)}
              </NavLink>
        ))}
      </nav>

      {/* Mobile Drawer */}
      {isOpen && <div className="pn-nav__backdrop" onClick={onClose} />}
      <div className={`pn-nav pn-nav--mobile ${isOpen ? 'open' : ''}`}>
        <button className="pn-nav__close" onClick={onClose}><X size={22} /></button>
        <nav className="pn-nav__mobile-links">
          {NAV_LINKS.map(link => (
            link.to.includes('#')
              ? <button key={link.key} className="pn-nav__link pn-nav__link--btn" onClick={() => handleLinkClick(link.to)}>
                  {t(link.key)}
                </button>
              : <NavLink key={link.key} to={link.to} className={({ isActive }) => `pn-nav__link ${isActive ? 'active' : ''}`} onClick={onClose} end={link.to === '/'}>
                  {t(link.key)}
                </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
}
