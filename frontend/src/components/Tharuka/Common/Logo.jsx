import { Link } from 'react-router-dom';
import { useId } from 'react';
import './Logo.css';

export default function Logo() {
  const uniq = useId().replace(/:/g, ''); // safe ID string
  return (
    <Link to="/" className="pn-logo" aria-label="PulseNova Home">
      <div className="pn-logo__icon">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="17" stroke={`url(#logoGrad-${uniq})`} strokeWidth="2"/>
          <path d="M4 18 L10 18 L13 11 L16 25 L19 14 L22 20 L25 18 L32 18"
            stroke={`url(#pulseGrad-${uniq})`} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <defs>
            <linearGradient id={`logoGrad-${uniq}`} x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00C897"/>
              <stop offset="1" stopColor="#00E6AD"/>
            </linearGradient>
            <linearGradient id={`pulseGrad-${uniq}`} x1="4" y1="18" x2="32" y2="18" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00C897"/>
              <stop offset="0.5" stopColor="#39FF14"/>
              <stop offset="1" stopColor="#00E6AD"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="pn-logo__text">
        <span className="pn-logo__name">Pulse<span className="pn-logo__accent">Nova</span></span>
        <span className="pn-logo__tagline">Every Pulse Matters</span>
      </div>
    </Link>
  );
}
