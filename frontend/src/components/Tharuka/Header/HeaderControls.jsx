import { useTranslation } from 'react-i18next';
import { Sun, Moon, Globe, User, LogIn } from 'lucide-react';
import { useTheme } from '../../../context/Tharuka/ThemeContext';
import { useFontSize } from '../../../context/Tharuka/FontSizeContext';
import './HeaderControls.css';

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'si', label: 'සිං' },
  { code: 'ta', label: 'தமி' },
];

export default function HeaderControls() {
  const { t, i18n } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  const { fontSize, changeSize } = useFontSize();

  const changeLang = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('pulsanova-lang', code);
  };

  return (
    <div className="pn-hctrl">
      {/* Font Size */}
      <div className="pn-hctrl__font" title="Change font size">
        {['small','medium','large'].map((s, idx) => (
          <button
            key={s}
            className={`pn-hctrl__font-btn pn-hctrl__font-btn--${s} ${fontSize === s ? 'active' : ''}`}
            onClick={() => changeSize(s)}
            aria-label={`Font size ${s}`}
          >
            {['A-','A','A+'][idx]}
          </button>
        ))}
      </div>

      {/* Language */}
      <div className="pn-hctrl__lang" title="Change language">
        <Globe size={14} className="pn-hctrl__lang-icon" />
        {LANGS.map(l => (
          <button
            key={l.code}
            className={`pn-hctrl__lang-btn ${i18n.language === l.code ? 'active' : ''}`}
            onClick={() => changeLang(l.code)}
            aria-label={`Language ${l.code}`}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* Dark Mode */}
      <button className="pn-hctrl__theme" onClick={toggleTheme} aria-label="Toggle dark mode" title={isDark ? t('ctrl_light_mode') : t('ctrl_dark_mode')}>
        {isDark ? <Sun size={22} /> : <Moon size={22} />}
      </button>

      {/* Auth Buttons */}
      <div className="pn-hctrl__auth">
        <button className="btn-outline pn-hctrl__login">
          <LogIn size={16} />
          {t('btn_login')}
        </button>
        <button className="btn-primary pn-hctrl__signup">
          {t('btn_signup')}
        </button>
      </div>

      {/* Profile */}
      <button className="pn-hctrl__profile" aria-label="Profile">
        <User size={22} />
      </button>
    </div>
  );
}
