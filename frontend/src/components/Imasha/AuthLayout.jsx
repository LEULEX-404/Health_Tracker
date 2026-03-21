import { useMemo, useState, useEffect } from 'react';
import Logo from '../Tharuka/Common/Logo';
import {
    Activity, Shield, Heart, TrendingUp,
    Sun, Moon, Zap, Award
} from 'lucide-react';

const FEATURES = [
    { icon: <Activity size={20} />, title: 'Real-time Monitoring', desc: 'Track vitals and health metrics 24/7' },
    { icon: <Heart size={20} />, title: 'AI Health Insights', desc: 'Personalised tips powered by your data' },
    { icon: <TrendingUp size={20} />, title: 'Progress Analytics', desc: 'Visualise trends and health history' },
    { icon: <Shield size={20} />, title: 'Secure & Private', desc: 'End-to-end encrypted health records' },
    { icon: <Zap size={20} />, title: 'Instant Alerts', desc: 'Real-time notifications for critical changes' },
    { icon: <Award size={20} />, title: 'Smart Reminders', desc: 'Medication, hydration & activity nudges' },
];

const STATS = [
    { value: '50K+', label: 'Users' },
    { value: '99.9%', label: 'Uptime' },
    { value: '4.9★', label: 'Rating' },
];

/* ── Floating particles ── */
function Particles() {
    const particles = useMemo(
        () =>
            Array.from({ length: 25 }, (_, i) => ({
                id: i,
                size: 2 + Math.random() * 6,
                left: `${Math.random() * 100}%`,
                delay: `${Math.random() * 14}s`,
                duration: `${10 + Math.random() * 14}s`,
                opacity: 0.3 + Math.random() * 0.5,
            })),
        []
    );
    return (
        <div className="Imasha-particles">
            {particles.map((p) => (
                <span
                    key={p.id}
                    className="Imasha-particle"
                    style={{
                        width: p.size,
                        height: p.size,
                        left: p.left,
                        bottom: '-20px',
                        animationDelay: p.delay,
                        animationDuration: p.duration,
                        opacity: 0,
                    }}
                />
            ))}
        </div>
    );
}

/* ── Animated pulse rings from bottom-left ── */
function PulseRings() {
    return (
        <div className="Imasha-pulse-rings">
            {[0, 1, 2, 3].map((i) => (
                <span key={i} className="Imasha-ring" style={{ animationDelay: `${i * 1.8}s` }} />
            ))}
        </div>
    );
}

/* ── Animated floating orbs (large blurred blobs) ── */
function FloatingOrbs() {
    return (
        <div className="Imasha-orbs">
            <span className="Imasha-orb Imasha-orb--1" />
            <span className="Imasha-orb Imasha-orb--2" />
            <span className="Imasha-orb Imasha-orb--3" />
        </div>
    );
}

/* ── Animated mesh grid ── */
function MeshGrid() {
    return <div className="Imasha-mesh-grid" aria-hidden="true" />;
}

/* ECG / Heartbeat line */
function EcgLine() {
    return (
        <div className="Imasha-ecg-wrap" aria-hidden="true">
            <svg className="Imasha-ecg-svg" viewBox="0 0 640 60" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="ecgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00c897" />
                        <stop offset="50%" stopColor="#39ff14" />
                        <stop offset="100%" stopColor="#00e6ad" />
                    </linearGradient>
                </defs>
                {/* Two copies of the same path side by side so the scroll loop is seamless */}
                <polyline
                    className="Imasha-ecg-path"
                    stroke="url(#ecgGrad)"
                    points="0,30 40,30 55,30 65,5 75,55 85,30 100,30 115,30 130,15 140,45 150,30 200,30 215,30 225,8 235,52 245,30 260,30 320,30"
                />
                <polyline
                    className="Imasha-ecg-path"
                    stroke="url(#ecgGrad)"
                    points="320,30 360,30 375,30 385,5 395,55 405,30 420,30 435,30 450,15 460,45 470,30 520,30 535,30 545,8 555,52 565,30 580,30 640,30"
                />
            </svg>
        </div>
    );
}

export default function AuthLayout({ children }) {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('auth_theme');
        return saved ? saved === 'dark' : true;
    });

    useEffect(() => {
        localStorage.setItem('auth_theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    return (
        <div className={`Imasha-auth-page${!isDarkMode ? ' light-theme' : ''}`}>

            {/* ── LEFT PANEL ── */}
            <div className="Imasha-auth-left">
                {/* Layered animated bg */}
                <FloatingOrbs />
                <MeshGrid />
                <Particles />
                <PulseRings />
                <EcgLine />

                <div className="Imasha-auth-left-content">

                    {/* Logo */}
                    <div className="Imasha-auth-top-logo">
                        <Logo />
                    </div>

                    {/* Title */}
                    <h2 className="Imasha-auth-left-title">
                        Your Health,<br />Anywhere You Are
                    </h2>
                    <p className="Imasha-auth-left-subtitle">
                        Track, monitor and improve your wellbeing remotely with AI-powered insights
                    </p>

                    {/* Stats row */}
                    <div className="Imasha-auth-stats-grid">
                        {STATS.map((s) => (
                            <div className="Imasha-stat-card" key={s.label}>
                                <span className="Imasha-stat-value">{s.value}</span>
                                <span className="Imasha-stat-label">{s.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Features */}
                    <div className="Imasha-auth-features-list">
                        {FEATURES.map((f) => (
                            <div key={f.title} className="Imasha-auth-feature-card">
                                <div className="Imasha-feature-card-icon">{f.icon}</div>
                                <div className="Imasha-feature-card-text">
                                    <strong>{f.title}</strong>
                                    <span>{f.desc}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Trust badge */}
                    <div className="Imasha-auth-trust-badge">
                        <Shield size={14} />
                        <span>Protected by enterprise-grade encryption</span>
                    </div>
                </div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="Imasha-auth-right">
                {/* Subtle right panel bg glow orbs */}
                <div className="Imasha-right-glow Imasha-right-glow--1" />
                <div className="Imasha-right-glow Imasha-right-glow--2" />

                {/* Theme toggle */}
                <div className="Imasha-theme-toggle-wrap">
                    <button
                        className="Imasha-theme-btn"
                        onClick={toggleTheme}
                        title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}
                        aria-label="Toggle theme"
                    >
                        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </div>

                {children}
            </div>
        </div>
    );
}
