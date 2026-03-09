import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';

const SEARCH_INDEX = [
  { title: 'Home', path: '/', desc: 'PulseNova health tracker home page' },
  { title: 'About', path: '/about', desc: 'About PulseNova health app mission vision team' },
  { title: 'Nutrition Tracking', path: '/services', desc: 'Log meals calories dietary insights nutrition' },
  { title: 'Exercise Logging', path: '/services', desc: 'Track workouts fitness exercise performance' },
  { title: 'Health Reports', path: '/services', desc: 'Analytics reports health data trends' },
  { title: 'Meal Reminders', path: '/services', desc: 'Smart reminders nutrition meals' },
  { title: 'Find Specialist', path: '/find-specialist', desc: 'Health professionals doctors specialists' },
  { title: 'Services', path: '/services', desc: 'Smart nutrition fitness analytics caregiver' },
  { title: 'FAQ', path: '/faq', desc: 'Frequently asked questions help support' },
  { title: 'Contact Us', path: '/contact', desc: 'Contact support email phone' },
  { title: 'Terms & Conditions', path: '/terms', desc: 'Legal terms user agreement' },
  { title: 'Privacy Policy', path: '/privacy', desc: 'Data privacy policy' },
];

export default function SearchBar({ onOpen }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
      onOpen?.(true);
    } else {
      onOpen?.(false);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const q = query.toLowerCase();
    setResults(SEARCH_INDEX.filter(item =>
      item.title.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q)
    ).slice(0, 6));
  }, [query]);

  const close = () => { setOpen(false); setQuery(''); setResults([]); };

  const handleSelect = (path) => {
    close();
    navigate(path);
  };

  const handleKey = (e) => {
    if (e.key === 'Escape') close();
  };

  // Inline trigger (when closed, show just the search icon button)
  if (!open) {
    return (
      <button
        className="pn-search__trigger"
        onClick={() => setOpen(true)}
        aria-label="Search"
      >
        <Search size={20} />
      </button>
    );
  }

  // Inline expanded (replaces nav inside header)
  return (
    <div className="pn-search__inline" onKeyDown={handleKey}>
      <div className="pn-search__inline-wrap">
        <Search size={18} className="pn-search__icon" />
        <input
          ref={inputRef}
          type="text"
          className="pn-search__input"
          placeholder={t('nav_search_placeholder') || 'Search pages, features…'}
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button className="pn-search__close-btn" onClick={close} aria-label="Close search">
          <X size={18} />
        </button>
      </div>

      {results.length > 0 && (
        <ul className="pn-search__results glass">
          {results.map((r, i) => (
            <li key={i} className="pn-search__result" onClick={() => handleSelect(r.path)}>
              <Search size={13} className="pn-search__result-icon" />
              <div>
                <span className="pn-search__result-title">{r.title}</span>
                <span className="pn-search__result-desc">{r.desc}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
      {query && results.length === 0 && (
        <p className="pn-search__empty glass">No results for "{query}"</p>
      )}
    </div>
  );
}
