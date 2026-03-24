import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../Tharuka/Common/Logo';
import healthGroupImg from '../../assets/Imasha/health_group.png';
import {
    Activity, Shield, Heart, TrendingUp,
    Sun, Moon, Zap, Award
} from 'lucide-react';

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

/* ── Group Visual (3 people + floating markers) ── */
function GroupVisual({ variant = 'stable' }) {
    return (
        <div className={`Imasha-visual-box ${variant === 'swing' ? 'Imasha-visual-swing' : ''}`}>
            {/* Main Aura Glow behind people */}
            <div className="Imasha-visual-aura" />

            <div className="Imasha-visual-unit">
                {/* The 3-person group image */}
                <div className="Imasha-visual-img-wrap">
                    <img src={healthGroupImg} alt="Health Community" className="Imasha-visual-img" />
                </div>

                {/* Floating Health-Tech Markers */}
                <div className="Imasha-visual-marker marker-heart">
                    <div className="marker-icon"><Activity size={14} /></div>
                    <div className="marker-content">
                        <span className="marker-label">Heart Rate</span>
                        <span className="marker-value">72 BPM</span>
                    </div>
                </div>

                <div className="Imasha-visual-marker marker-hydration">
                    <div className="marker-icon"><Zap size={14} /></div>
                    <div className="marker-content">
                        <span className="marker-label">Hydration</span>
                        <span className="marker-value">85%</span>
                    </div>
                </div>

                <div className="Imasha-visual-marker marker-wellness">
                    <div className="marker-icon"><TrendingUp size={14} /></div>
                    <span className="marker-pill">Wellness: Optimal</span>
                </div>

                {/* Minimal Pulse ring accent */}
                <div className="Imasha-visual-pulse-ring" />
                
                {/* Subtle ECG line overlay nearby */}
                <div className="Imasha-visual-ecg-accent" />
            </div>
        </div>
    );
}

export default function AuthLayout({ children, visualVariant = 'stable' }) {
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
                {/* Organic curved separator (SVG) */}
                <div className="Imasha-organic-curve">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M100,0 L0,0 C40,20 40,80 0,100 L100,100 Z" fill="currentColor" />
                    </svg>
                </div>
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

                    {/* New Visual Group (Phase 3) */}
                    <GroupVisual variant={visualVariant} />

                    {/* Trust badge */}
                    <div className="Imasha-auth-trust-badge">
                        <Shield size={14} />
                        <span>Protected by enterprise-grade encryption</span>
                    </div>
                </div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="Imasha-auth-right">
                {/* Mobile Top Logo Header (Hidden on Desktop) */}
                <div className="Imasha-mobile-logo-wrap">
                    <Logo />
                </div>

                {/* Subtle right panel bg glow orbs - Dynamic View */}
                <div className="Imasha-aura-glow Imasha-aura-glow--1" />
                <div className="Imasha-aura-glow Imasha-aura-glow--2" />
                <div className="Imasha-aura-glow Imasha-aura-glow--3" />

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
