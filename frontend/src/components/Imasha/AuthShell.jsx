import { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
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
    return (
        <div className="Iauth-visual-inner">
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
                <div className="Iauth-visual-logo"><Logo /></div>

                <h2 className="Iauth-visual-title">
                    Your Health, <span className="Iauth-visual-accent">Intelligently</span> Connected
                </h2>
                <p className="Iauth-visual-sub">
                    AI-powered health tracking, real-time wellness monitoring<br />
                    and personalized remote care — all unified.
                </p>

                <div className="Iauth-composition">
                    <div className="Iauth-composition-aura" />
                    
                    <div className="Iauth-img-wrapper" style={{ position: 'relative', display: 'inline-flex' }}>
                        <motion.img 
                            src={healthGroupImg} 
                            alt="Health Community" 
                            className="Iauth-hgroup" 
                            animate={reduceMotion ? undefined : ({ y: [0, -12, 0], scale: [1, 1.02, 1] })} 
                            transition={reduceMotion ? undefined : ({ duration: 6, repeat: Infinity, ease: 'easeInOut' })}
                        />

                        {/* Floating Glass Cards tightly bound to the image */}
                        <motion.div 
                            className="Iauth-glass-card Iauth-card-tr"
                            animate={reduceMotion ? undefined : ({ y: [0, 10, 0] })}
                            transition={reduceMotion ? undefined : ({ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 })}
                        >
                            <div className="Iauth-glass-icon"><Activity size={18} /></div>
                            <div>
                                <h4>98%</h4>
                                <p>Health Score</p>
                            </div>
                        </motion.div>
                        
                        <motion.div 
                            className="Iauth-glass-card Iauth-card-bl"
                            animate={reduceMotion ? undefined : ({ y: [0, -10, 0] })}
                            transition={reduceMotion ? undefined : ({ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 2.5 })}
                        >
                            <div className="Iauth-glass-icon"><Zap size={18} /></div>
                            <div>
                                <h4>Active</h4>
                                <p>AI Insights</p>
                            </div>
                        </motion.div>

                        <motion.div 
                            className="Iauth-glass-card Iauth-card-br"
                            animate={reduceMotion ? undefined : ({ y: [0, 8, 0] })}
                            transition={reduceMotion ? undefined : ({ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 })}
                        >
                            <div className="Iauth-glass-icon"><TrendingUp size={18} /></div>
                            <div>
                                <h4>24/7</h4>
                                <p>Monitoring</p>
                            </div>
                        </motion.div>
                    </div>
                </div>

                <div className="Iauth-badges">
                    <span className="Iauth-badge"><Shield size={11} /> HIPAA</span>
                    <span className="Iauth-badge"><Shield size={11} /> SOC 2</span>
                    <span className="Iauth-badge"><Shield size={11} /> ISO 27001</span>
                </div>
            </div>
        </div>
    );
}

/* ─── Smooth easing ─── */
const SLIDE = {
    duration: 0.62,
    ease: [0.43, 0.13, 0.23, 0.96],
};

const FORM_SWAP = {
    enter: (direction) => ({
        opacity: 0,
        x: direction * 42,
        scale: 0.985,
    }),
    center: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
    },
    exit: (direction) => ({
        opacity: 0,
        x: direction * -42,
        scale: 0.985,
        transition: { duration: 0.24, ease: [0.4, 0, 0.2, 1] },
    }),
};

export default function AuthShell() {
    const location = useLocation();
    const reduceMotion = useReducedMotion();

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
                transition={reduceMotion ? { duration: 0.01 } : SLIDE}
                style={{ willChange: 'transform' }}
            >
                <VisualContent reduceMotion={reduceMotion} />
            </motion.div>

            {/* ═══ FORM PANEL ═══
                isLogin  → RIGHT ( x: 0    — starts at left:50% )
                !isLogin → LEFT  ( x:-100% — slides to left half ) */}
            <motion.div
                className="Iauth-form-panel"
                initial={false}
                animate={{ x: isMobile ? '0%' : (isLogin ? '0%' : '-100%') }}
                transition={reduceMotion ? { duration: 0.01 } : SLIDE}
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
                <div className="Iauth-form-scroll">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            custom={swapDir}
                            variants={FORM_SWAP}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="Iauth-form-content"
                            style={{ willChange: 'transform, opacity' }}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
