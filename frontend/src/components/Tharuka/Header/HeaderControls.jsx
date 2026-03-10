import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Globe, User, LogIn, ChevronDown, Bell } from 'lucide-react';
import { useTheme } from '../../../context/Tharuka/ThemeContext';
import { useFontSize } from '../../../context/Tharuka/FontSizeContext';
import { useAuth } from '../../../context/Imasha/AuthContext';
import { triggerPageWave } from '../Common/PageTransitionWave';
import './HeaderControls.css';

const LANGS = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'si', label: 'සිංහල', short: 'සිං' },
  { code: 'ta', label: 'தமிழ்', short: 'தமி' },
];

export default function HeaderControls() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { fontSize, changeSize } = useFontSize();
  const { user, logout } = useAuth();
  const isLoggedIn = !!user;
  
  const [fontOpen, setFontOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  
  const fontRef = useRef(null);
  const langRef = useRef(null);

  // Sync language with document attribute for CSS targeting
  useEffect(() => {
    document.documentElement.setAttribute('data-lang', i18n.language);
  }, [i18n.language]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fontRef.current && !fontRef.current.contains(event.target)) setFontOpen(false);
      if (langRef.current && !langRef.current.contains(event.target)) setLangOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLang = (code) => {
    triggerPageWave(() => {
      i18n.changeLanguage(code);
      localStorage.setItem('pulsanova-lang', code);
    });
    setLangOpen(false);
  };

  const handleFontChange = (size) => {
    triggerPageWave(() => {
      changeSize(size);
    });
    setFontOpen(false);
  };

  const currentLang = LANGS.find(l => l.code === i18n.language) || LANGS[0];
  const fontLabels = { small: 'A-', medium: 'A', large: 'A+' };

  return (
    <div className="pn-hctrl">
      {/* Font Size Dropdown */}
      <div className="pn-hctrl__dropdown-wrap" ref={fontRef}>
        <button 
          className={`pn-hctrl__trigger ${fontOpen ? 'active' : ''}`}
          onClick={() => { setFontOpen(!fontOpen); setLangOpen(false); }}
          title="Change font size"
        >
          <span className="pn-hctrl__trigger-text">{fontLabels[fontSize]}</span>
          <ChevronDown size={14} className={`pn-hctrl__chevron ${fontOpen ? 'open' : ''}`} />
        </button>
        
        {fontOpen && (
          <div className="pn-hctrl__menu glass">
            {['small', 'medium', 'large'].map((s) => (
              <button
                key={s}
                className={`pn-hctrl__menu-item ${fontSize === s ? 'active' : ''}`}
                onClick={() => handleFontChange(s)}
              >
                <span className={`pn-hctrl__font-preview--${s}`}>{fontLabels[s]}</span>
                <span>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Language Dropdown */}
      <div className="pn-hctrl__dropdown-wrap" ref={langRef}>
        <button 
          className={`pn-hctrl__trigger ${langOpen ? 'active' : ''}`}
          onClick={() => { setLangOpen(!langOpen); setFontOpen(false); }}
          title="Change language"
        >
          <Globe size={18} className="pn-hctrl__trigger-icon" />
          <span className="pn-hctrl__trigger-text">{currentLang.short}</span>
          <ChevronDown size={14} className={`pn-hctrl__chevron ${langOpen ? 'open' : ''}`} />
        </button>
        
        {langOpen && (
          <div className="pn-hctrl__menu glass">
            {LANGS.map(l => (
              <button
                key={l.code}
                className={`pn-hctrl__menu-item ${i18n.language === l.code ? 'active' : ''}`}
                onClick={() => changeLang(l.code)}
              >
                <span className="pn-hctrl__lang-label">{l.label}</span>
                {i18n.language === l.code && <div className="pn-hctrl__active-dot" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Dark Mode */}
      <button className="pn-hctrl__theme" onClick={toggleTheme} aria-label="Toggle dark mode" title={isDark ? t('ctrl_light_mode') : t('ctrl_dark_mode')}>
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Auth-dependent Controls */}
      {isLoggedIn ? (
        <div className="pn-hctrl__logged-in">
          <button className="pn-hctrl__icon-btn" aria-label="Notifications">
            <Bell size={20} />
            <span className="pn-hctrl__badge" />
          </button>
          
          <div className="pn-hctrl__profile-wrap">
            <button className="pn-hctrl__profile" aria-label="Profile">
              <User size={20} />
            </button>
          </div>
        </div>
      ) : (
        <div className="pn-hctrl__auth">
          <button 
            className="btn-outline pn-hctrl__login"
            onClick={() => navigate('/login')}
          >
            <LogIn size={16} />
            {t('btn_login')}
          </button>
          <button 
            className="btn-primary pn-hctrl__signup"
            onClick={() => navigate('/register')}
          >
            {t('btn_signup')}
          </button>
        </div>
      )}
    </div>
  );
}
