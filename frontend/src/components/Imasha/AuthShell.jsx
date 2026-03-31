import { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, Outlet, Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import Logo from '../Tharuka/Common/Logo';
import healthGroupImg from '../../assets/Imasha/health_group.png';
import { Activity, Shield, Zap, TrendingUp, Sun, Moon } from 'lucide-react';



function PulseRings() {
    return (
        <div className="Iauth-pulse-rings" aria-hidden="true">
            {[0, 1, 2, 3].map(i => (
                <span key={i} className="Iauth-ring" style={{ animationDelay: `${i * 1.8}s` }} />
            ))}
        </div>
    );
}

/* ─── Visual Panel — health_group.png ─── */
function VisualContent({ reduceMotion }) {
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
        <div className={`Iauth-visual-inner ${!imageLoaded ? 'Iauth-visual-loading' : ''}`}>
            {/* Background Effects */}
            <div className="Iauth-sonar-container">
                <div className="Iauth-sonar-ring" />
                <div className="Iauth-sonar-ring" />
                <div className="Iauth-sonar-ring" />
                <div className="Iauth-sonar-ring" />
                <div className="Iauth-sonar-ring" />
            </div>

            <PulseRings />

            <div className="Iauth-visual-content">
                <motion.div layout transition={MORPH_TRANSITION} className="Iauth-visual-logo"><Logo /></motion.div>

                <motion.h2 layout transition={MORPH_TRANSITION} className="Iauth-visual-title">
                    Your Health, <span className="Iauth-visual-accent">Intelligently</span> Connected
                </motion.h2>
                <motion.p layout transition={MORPH_TRANSITION} className="Iauth-visual-sub">
                    AI-powered health tracking, real-time wellness monitoring<br />
                    and personalized remote care — all unified.
                </motion.p>

                <motion.div layout transition={MORPH_TRANSITION} className="Iauth-composition">
                    <div className="Iauth-composition-aura" />

                    <div className="Iauth-img-wrapper" style={{ position: 'relative', display: 'inline-flex' }}>
                        <motion.img
                            layout
                            transition={{ ...MORPH_TRANSITION, opacity: { duration: 0.8 } }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: imageLoaded ? 1 : 0 }}
                            onLoad={() => setImageLoaded(true)}
                            src={healthGroupImg}
                            srcSet={`${healthGroupImg} 1200w`}
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            fetchPriority="high"
                            loading="eager"
                            alt="Health Community"
                            className="Iauth-hgroup"
                        />

                        {/* Floating Glass Cards tightly bound to the image */}
                        <motion.div
                            layout
                            transition={MORPH_TRANSITION}
                            className="Iauth-glass-card Iauth-card-tr"
                        >
                            <div className="Iauth-glass-icon"><Activity size={18} /></div>
                            <div>
                                <h4>98%</h4>
                                <p>Health Score</p>
                            </div>
                        </motion.div>

                        <motion.div
                            layout
                            transition={MORPH_TRANSITION}
                            className="Iauth-glass-card Iauth-card-bl"
                        >
                            <div className="Iauth-glass-icon"><Zap size={18} /></div>
                            <div>
                                <h4>Active</h4>
                                <p>AI Insights</p>
                            </div>
                        </motion.div>

                        <motion.div
                            layout
                            transition={MORPH_TRANSITION}
                            className="Iauth-glass-card Iauth-card-br"
                        >
                            <div className="Iauth-glass-icon"><TrendingUp size={18} /></div>
                            <div>
                                <h4>24/7</h4>
                                <p>Monitoring</p>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                <motion.div layout transition={MORPH_TRANSITION} className="Iauth-badges">
                    <span className="Iauth-badge"><Shield size={11} /> HIPAA</span>
                    <span className="Iauth-badge"><Shield size={11} /> SOC 2</span>
                    <span className="Iauth-badge"><Shield size={11} /> ISO 27001</span>
                </motion.div>
            </div>
        </div>
    );
}

/* ─── Smooth Morph Animation (High Performance) ─── */
const MORPH_TRANSITION = {
    duration: 0.6,
    ease: [0.25, 1, 0.5, 1], // Smooth, premium decipher-style cubic-bezier
};

const FORM_SWAP = {
    enter: ({ direction, isMobile }) => ({
        opacity: isMobile ? 1 : 0,
        x: isMobile ? `${direction * 100}%` : direction * 40,
        scale: isMobile ? 1 : 0.98,
    }),
    center: ({ isMobile }) => ({
        opacity: 1,
        x: 0,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: [0.25, 1, 0.5, 1],
            delay: isMobile ? 0 : 0.05
        },
    }),
    exit: ({ direction, isMobile }) => ({
        opacity: isMobile ? 1 : 0,
        x: isMobile ? `${direction * -100}%` : direction * -40,
        scale: isMobile ? 1 : 0.98,
        transition: {
            duration: isMobile ? 0.5 : 0.3,
            ease: isMobile ? [0.25, 1, 0.5, 1] : [0.4, 0, 0.2, 1]
        },
    }),
};

export default function AuthShell() {
    const location = useLocation();
    const reduceMotion = useReducedMotion();

    // Bind scroll offet to top toggle layer
    const scrollRef = useRef(null);
    const { scrollY } = useScroll({ container: scrollRef });
    const topY = useTransform(scrollY, (v) => -v);

    // Sign In (/login) → visual LEFT (x:0),   form RIGHT (x:0)
    // Sign Up (/register) → visual RIGHT (x:100%), form LEFT (x:-100%)
    const isLogin = location.pathname !== '/register';
    const prevIsLoginRef = useRef(isLogin);
    const [swapDir, setSwapDir] = useState(1);

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [isDark, setIsDark] = useState(() => {
        const s = localStorage.getItem('auth_theme');
        return s === 'dark';
    });

    useEffect(() => {
        localStorage.setItem('auth_theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    useEffect(() => {
        const prev = prevIsLoginRef.current;
        if (prev !== isLogin) {
            // login -> register should feel like content moves left (toward visual panel)
            setSwapDir(isLogin ? 1 : -1);
            prevIsLoginRef.current = isLogin;
        }
    }, [isLogin]);

    return (
        <div className={`Iauth-root${isDark ? ' Iauth-dark' : ''} ${isLogin ? 'is-login' : 'is-register'}`}>

            {/* ═══ VISUAL PANEL ═══
                isLogin  → LEFT  ( x: 0   — starts at left:0  )
                !isLogin → RIGHT ( x:100% — slides to right half ) */}
            <motion.div
                className="Iauth-visual-panel"
                initial={false}
                animate={{ x: isMobile ? '0%' : (isLogin ? '0%' : '100%') }}
                transition={reduceMotion ? { duration: 0.01 } : MORPH_TRANSITION}
                style={{ willChange: 'transform' }}
            >
                <VisualContent reduceMotion={reduceMotion} />
            </motion.div>

            {/* ═══ TOP TOGGLE LAYER (Floats above visual panel on swap) ═══ */}
            <motion.div
                className="Iauth-top-layer"
                initial={false}
                animate={{ x: isMobile ? '0%' : (isLogin ? '0%' : '-100%') }}
                transition={reduceMotion ? { duration: 0.01 } : MORPH_TRANSITION}
                style={{
                    position: 'absolute',
                    top: 0, left: isMobile ? '0%' : '50%', width: isMobile ? '100%' : '50%', height: '100%',
                    zIndex: 10, pointerEvents: 'none',
                    display: 'flex', flexDirection: 'column',
                    padding: isMobile ? '6rem 1rem 0' : '4rem 2rem 0',
                    alignItems: 'center',
                    y: topY
                }}
            >
                <div style={{ width: '100%', maxWidth: '480px', pointerEvents: 'auto' }}>
                    <div className="Imasha-auth-toggle">
                        <Link to="/login" className={`Imasha-auth-toggle-btn ${isLogin ? 'active' : ''}`}>Sign In</Link>
                        <Link to="/register" className={`Imasha-auth-toggle-btn ${!isLogin ? 'active' : ''}`}>Sign Up</Link>
                    </div>
                </div>
            </motion.div>

            {/* ═══ FORM PANEL ═══
                isLogin  → RIGHT ( x: 0    — starts at left:50% )
                !isLogin → LEFT  ( x:-100% — slides to left half ) */}
            <motion.div
                className="Iauth-form-panel"
                initial={false}
                animate={{ x: isMobile ? '0%' : (isLogin ? '0%' : '-100%') }}
                transition={reduceMotion ? { duration: 0.01 } : MORPH_TRANSITION}
                style={{ willChange: 'transform' }}
            >
                {/* Mobile logo (hidden on desktop) */}
                <div className="Iauth-mobile-logo"><Logo /></div>

                {/* Theme toggle */}
                <motion.button
                    className="Iauth-theme-btn"
                    onClick={() => setIsDark(d => !d)}
                    aria-label="Toggle theme"
                    whileHover={reduceMotion ? undefined : ({ scale: 1.06, rotate: isDark ? -6 : 6 })}
                    whileTap={{ scale: 0.94 }}
                >
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                            key={isDark ? 'sun' : 'moon'}
                            initial={reduceMotion ? { opacity: 0 } : ({ opacity: 0, rotate: -90, scale: 0.75 })}
                            animate={reduceMotion ? { opacity: 1 } : ({ opacity: 1, rotate: 0, scale: 1, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } })}
                            exit={reduceMotion ? { opacity: 0 } : ({ opacity: 0, rotate: 90, scale: 0.75, transition: { duration: 0.16, ease: [0.4, 0, 0.2, 1] } })}
                            style={{ display: 'inline-flex' }}
                        >
                            {isDark ? <Sun size={17} /> : <Moon size={17} />}
                        </motion.span>
                    </AnimatePresence>
                </motion.button>

                {/* Page content — slides on route change (real swap) */}
                <div className="Iauth-form-scroll" ref={scrollRef} style={{ paddingTop: isMobile ? '12rem' : '10rem' }}>
                    <AnimatePresence mode={isMobile ? "popLayout" : "wait"}>
                        <motion.div
                            key={location.pathname}
                            custom={{ direction: swapDir, isMobile }}
                            variants={FORM_SWAP}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="Iauth-form-content"
                            style={{ willChange: 'transform, opacity' }}
                        >
                            <Outlet context={{ isMobile }} />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
