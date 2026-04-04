import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../Tharuka/Common/Logo';
import healthGroupImg from '../../assets/Imasha/health_group.png';
import { Activity, Shield, Zap, TrendingUp, Sun, Moon } from 'lucide-react';

/* ─── Floating particles (visual panel only) ─── */
function Particles() {
    const particles = useMemo(
        () => Array.from({ length: 18 }, (_, i) => ({
            id: i,
            size: 2 + Math.random() * 5,
            left: `${Math.random() * 100}%`,
            delay: `${Math.random() * 12}s`,
            duration: `${9 + Math.random() * 12}s`,
        })),
        []
    );
    return (
        <div className="Iauth-particles">
            {particles.map(p => (
                <span key={p.id} className="Iauth-particle" style={{
                    width: p.size, height: p.size, left: p.left,
                    bottom: '-10px', animationDelay: p.delay, animationDuration: p.duration,
                }} />
            ))}
        </div>
    );
}

function FloatingOrbs() {
    return (
        <div className="Iauth-orbs" aria-hidden="true">
            <span className="Iauth-orb Iauth-orb--1" />
            <span className="Iauth-orb Iauth-orb--2" />
            <span className="Iauth-orb Iauth-orb--3" />
        </div>
    );
}

function MeshGrid() {
    return <div className="Iauth-mesh" aria-hidden="true" />;
}

function EcgLine() {
    return (
        <div className="Iauth-ecg" aria-hidden="true">
            <svg viewBox="0 0 640 60" preserveAspectRatio="none" className="Iauth-ecg-svg">
                <defs>
                    <linearGradient id="iEcgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00c897" />
                        <stop offset="50%" stopColor="#39ff14" />
                        <stop offset="100%" stopColor="#00e6ad" />
                    </linearGradient>
                </defs>
                <polyline stroke="url(#iEcgGrad)" className="Iauth-ecg-path"
                    points="0,30 40,30 55,30 65,5 75,55 85,30 100,30 130,15 140,45 150,30 200,30 225,8 235,52 245,30 320,30" />
                <polyline stroke="url(#iEcgGrad)" className="Iauth-ecg-path"
                    points="320,30 360,30 385,5 395,55 405,30 435,30 450,15 460,45 470,30 520,30 545,8 555,52 565,30 640,30" />
            </svg>
        </div>
    );
}

function PulseRings() {
    return (
        <div className="Iauth-pulse-rings" aria-hidden="true">
            {[0, 1, 2, 3].map(i => (
                <span key={i} className="Iauth-ring" style={{ animationDelay: `${i * 1.8}s` }} />
            ))}
        </div>
    );
}

/* ─── Visual Panel Content (branding + health_group.png only) ─── */
function VisualContent() {
    return (
        <div className="Iauth-visual-inner">
            <FloatingOrbs />
            <MeshGrid />
            <Particles />
            <PulseRings />
            <EcgLine />

            <div className="Iauth-visual-content">
                {/* Logo */}
                <div className="Iauth-visual-logo">
                    <Logo />
                </div>

                {/* Headline */}
                <h2 className="Iauth-visual-title">
                    Your Health,<br />
                    <span className="Iauth-visual-accent">Intelligently</span><br />
                    Connected
                </h2>
                <p className="Iauth-visual-sub">
                    AI-powered health tracking, real-time wellness monitoring and personalized remote care — all unified.
                </p>

                {/* Image composition: health_group.png + floating markers */}
                <div className="Iauth-composition">
                    <div className="Iauth-composition-aura" />
                    <img src={healthGroupImg} alt="Health Community" className="Iauth-hgroup" />

                    {/* Floating stat cards */}
                    <div className="Iauth-stat Iauth-stat--hr">
                        <div className="Iauth-stat-icon"><Activity size={13} /></div>
                        <div className="Iauth-stat-body">
                            <span className="Iauth-stat-label">Heart Rate</span>
                            <span className="Iauth-stat-val">72 BPM</span>
                        </div>
                    </div>

                    <div className="Iauth-stat Iauth-stat--hyd">
                        <div className="Iauth-stat-icon"><Zap size={13} /></div>
                        <div className="Iauth-stat-body">
                            <span className="Iauth-stat-label">Hydration</span>
                            <span className="Iauth-stat-val">89%</span>
                        </div>
                    </div>

                    <div className="Iauth-stat Iauth-stat--wl">
                        <TrendingUp size={13} />
                        <span>Wellness: Optimal</span>
                    </div>
                </div>

                {/* Trust badges */}
                <div className="Iauth-badges">
                    <span className="Iauth-badge"><Shield size={11} /> HIPAA</span>
                    <span className="Iauth-badge"><Shield size={11} /> SOC 2</span>
                    <span className="Iauth-badge"><Shield size={11} /> ISO 27001</span>
                </div>
            </div>
        </div>
    );
}

/* ─── Panel slide transition ─── */
const SLIDE = {
    duration: 0.68,
    ease: [0.43, 0.13, 0.23, 0.96],
};

/* ─── Content fade when switching pages ─── */
const FADE = {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, delay: 0.28 } },
    exit:    { opacity: 0, y: -10, transition: { duration: 0.22 } },
};

export default function AuthLayout({ children }) {
    const location = useLocation();
    // Sign In = visual LEFT (x:0), form RIGHT (x:0)
    // Sign Up  = visual RIGHT (x:100%), form LEFT (x:-100%)
    const isLogin = location.pathname !== '/register';

    const [isDark, setIsDark] = useState(() => {
        const s = localStorage.getItem('auth_theme');
        return s ? s === 'dark' : false;
    });

    useEffect(() => {
        localStorage.setItem('auth_theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    return (
        <div className={`Iauth-root${isDark ? ' Iauth-dark' : ''}`}>

            {/* ═══ VISUAL PANEL (green branding) ═══
                Login  → LEFT  (x: 0)
                Register → RIGHT (x: 100% of panel width = 50vw)          */}
            <motion.div
                className="Iauth-visual-panel"
                initial={false}
                animate={{ x: isLogin ? '0%' : '100%' }}
                transition={SLIDE}
            >
                <VisualContent />
            </motion.div>

            {/* ═══ FORM PANEL (white / dark) ═══
                Login  → RIGHT (x: 0  — starts at left:50%)
                Register → LEFT  (x: -100% = slides 50vw to the left)     */}
            <motion.div
                className="Iauth-form-panel"
                initial={false}
                animate={{ x: isLogin ? '0%' : '-100%' }}
                transition={SLIDE}
            >
                {/* Mobile logo */}
                <div className="Iauth-mobile-logo"><Logo /></div>

                {/* Theme toggle */}
                <button
                    className="Iauth-theme-btn"
                    onClick={() => setIsDark(d => !d)}
                    aria-label="Toggle theme"
                >
                    {isDark ? <Sun size={17} /> : <Moon size={17} />}
                </button>

                {/* Page content with fade on route change */}
                <div className="Iauth-form-scroll">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            variants={FADE}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="Iauth-form-content"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
