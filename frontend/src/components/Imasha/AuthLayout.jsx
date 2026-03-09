import { useMemo } from 'react';
import Logo from '../Tharuka/Common/Logo';
import { Activity, Shield, Heart, TrendingUp } from 'lucide-react';

const FEATURES = [
    { icon: <Activity size={24} />, title: 'Real-time Monitoring', desc: 'Track vitals 24/7' },
    { icon: <Shield size={24} />, title: 'Secure & Private', desc: 'HIPAA-grade encryption' },
    { icon: <Heart size={24} />, title: 'AI Health Insights', desc: 'Personalised tips' },
    { icon: <TrendingUp size={24} />, title: 'Progress Reports', desc: 'Detailed analytics' },
];

function Particles() {
    const particles = useMemo(
        () =>
            Array.from({ length: 20 }, (_, i) => ({
                id: i,
                size: 3 + Math.random() * 8,
                left: `${Math.random() * 100}%`,
                delay: `${Math.random() * 9}s`,
                duration: `${9 + Math.random() * 10}s`,
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
                        animationDelay: p.delay,
                        animationDuration: p.duration,
                    }}
                />
            ))}
        </div>
    );
}

/**
 * Centered glass card layout with branding and feature cards.
 */
export default function AuthLayout({ children }) {
    return (
        <div className="Imasha-auth-page">
            <div className="Imasha-auth-bg" />
            <div className="Imasha-auth-bg-overlay" />
            <Particles />

            <div className="Imasha-auth-center-container">
                {/* Logo and App Name at the top for both Desktop and Mobile */}
                <div className="Imasha-auth-top-logo">
                    <Logo />
                </div>

                <div className="Imasha-auth-main-content">
                    {/* Left features side - Hidden on Mobile */}
                    <div className="Imasha-auth-side-panel">
                        {/* New Enhanced Stats Cards */}
                        <div className="Imasha-auth-stats-grid">
                            <div className="Imasha-stat-card Imasha-pulse-card">
                                <Activity className="Imasha-pulse-icon" size={20} />
                                <div className="Imasha-stat-info">
                                    <span className="Imasha-stat-label">Heart Rate</span>
                                    <span className="Imasha-stat-value">72 <small>BPM</small></span>
                                </div>
                                <div className="Imasha-pulse-wave">
                                    <span></span><span></span><span></span><span></span>
                                </div>
                            </div>
                            <div className="Imasha-stat-card Imasha-steps-card">
                                <TrendingUp size={20} />
                                <div className="Imasha-stat-info">
                                    <span className="Imasha-stat-label">Daily Steps</span>
                                    <span className="Imasha-stat-value">8,432</span>
                                </div>
                                <div className="Imasha-progress-bar">
                                    <div className="Imasha-progress-fill" style={{ width: '70%' }}></div>
                                </div>
                            </div>
                        </div>

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

                        {/* Trust Badge */}
                        <div className="Imasha-auth-trust-badge">
                            <Shield size={14} />
                            <span>Trusted by 50,000+ health enthusiasts</span>
                        </div>
                    </div>

                    {/* Right card side (the form) */}
                    <div className="Imasha-auth-card">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
