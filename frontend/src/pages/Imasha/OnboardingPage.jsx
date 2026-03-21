import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    CheckCircle2,
    Sparkles,
    Stethoscope,
    Activity
} from 'lucide-react';
import { useAuth } from '../../context/Imasha/AuthContext';
import Logo from '../../components/Tharuka/Common/Logo';

// Import images
import welcomeImg from '../../assets/Imasha/onboarding/welcome.png';
import trackingImg from '../../assets/Imasha/onboarding/tracking.png';
import specialistImg from '../../assets/Imasha/onboarding/specialist.png';

const STEPS = [
    {
        id: 1,
        title: "Welcome to PulseNova",
        subtitle: "Your AI-Powered Health Companion",
        description: "Join thousands of users who have transformed their lives through data-driven health insights and personalized care.",
        image: welcomeImg,
        icon: <Sparkles size={24} />,
        features: ["Personalized Dashboard", "Smart Health Alerts", "Secure Data Storage"]
    },
    {
        id: 2,
        title: "Track Your Vitals",
        subtitle: "Real-Time Health Monitoring",
        description: "From nutrition tracking to heart rate analysis, stay on top of your health goals with our advanced AI metrics.",
        image: trackingImg,
        icon: <Activity size={24} />,
        features: ["Macro Tracking", "Workout Analysis", "Trend Visualization"]
    },
    {
        id: 3,
        title: "Expert Consultations",
        subtitle: "Verified Specialist Access",
        description: "Connect instantly with certified medical professionals. Securely share your reports and get expert advice anywhere.",
        image: specialistImg,
        icon: <Stethoscope size={24} />,
        features: ["Instant Appointments", "Secure Report Sharing", "Verified Specialists"]
    }
];

export default function OnboardingPage() {
    const [currentStep, setCurrentStep] = useState(0);
    const { markOnboardingComplete } = useAuth();
    const navigate = useNavigate();
    const [isFinishing, setIsFinishing] = useState(false);

    const handleNext = async () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            setIsFinishing(true);
            try {
                await markOnboardingComplete();
                navigate('/');
            } catch (err) {
                console.error("Failed to mark onboarding complete", err);
                navigate('/');
            }
        }
    };

    const step = STEPS[currentStep];

    return (
        <div style={{
            height: '100vh',
            background: '#ffffff',
            color: '#0d2019',
            fontFamily: "'Inter', sans-serif",
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            {/* Top Navigation / Progress */}
            <div style={{
                padding: '1rem 2rem',
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                maxWidth: '1200px',
                margin: '0 auto',
                width: '100%',
                height: '100px'
            }}>
                <div style={{ transform: 'scale(1.35)', transformOrigin: 'left center' }}>
                    <Logo />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    {STEPS.map((_, i) => (
                        <div 
                            key={i} 
                            style={{ 
                                height: '5px', 
                                width: i === currentStep ? '36px' : '10px', 
                                background: i <= currentStep ? '#00c897' : '#e6f4ef',
                                borderRadius: '3px',
                                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                            }} 
                        />
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ 
                flex: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: '0 2rem',
                maxWidth: '1200px',
                margin: '0 auto',
                width: '100%',
                overflow: 'hidden'
            }}>
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 0.9fr)', 
                    gap: '4rem',
                    alignItems: 'center',
                    width: '100%',
                    maxHeight: 'calc(100vh - 180px)'
                }}>
                    {/* Visual Section */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`img-${currentStep}`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <div style={{ 
                                position: 'relative',
                                borderRadius: '32px',
                                overflow: 'hidden',
                                boxShadow: '0 25px 50px -12px rgba(0, 200, 151, 0.12)',
                                aspectRatio: '16/10',
                                background: '#f0fff9',
                                maxWidth: '100%',
                                border: '1px solid rgba(0, 200, 151, 0.1)'
                            }}>
                                <img 
                                    src={step.image} 
                                    alt={step.title}
                                    style={{ 
                                        width: '100%', 
                                        height: '100%', 
                                        objectFit: 'cover'
                                    }}
                                />
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Text Section */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`text-${currentStep}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                            <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ 
                                    width: '44px', 
                                    height: '44px', 
                                    background: 'rgba(0, 200, 151, 0.1)', 
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#00c897'
                                }}>
                                    {step.icon}
                                </div>
                                <span style={{ 
                                    fontSize: '0.85rem', 
                                    fontWeight: '800', 
                                    color: '#00c897', 
                                    textTransform: 'uppercase',
                                    letterSpacing: '1.5px'
                                }}>
                                    Feature {step.id} / 3
                                </span>
                            </div>

                            <h1 style={{ 
                                fontSize: '2.75rem', 
                                fontWeight: '900', 
                                lineHeight: '1.2', 
                                marginBottom: '0.75rem',
                                letterSpacing: '-1.2px',
                                color: '#0d2019'
                            }}>
                                {step.title}
                            </h1>
                            <h2 style={{ 
                                fontSize: '1.25rem', 
                                color: '#1d4d36', 
                                fontWeight: '600', 
                                marginBottom: '1.25rem' 
                            }}>
                                {step.subtitle}
                            </h2>
                            <p style={{ 
                                fontSize: '1.05rem', 
                                lineHeight: '1.7', 
                                color: '#5a8870', 
                                marginBottom: '2.5rem',
                                maxWidth: '420px',
                                fontWeight: '450'
                            }}>
                                {step.description}
                            </p>

                            <div style={{ display: 'grid', gap: '0.85rem', marginBottom: '2.75rem' }}>
                                {step.features.map((feat, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ color: '#00c897' }}>
                                            <CheckCircle2 size={20} />
                                        </div>
                                        <span style={{ fontSize: '1rem', fontWeight: '600', color: '#0d2019' }}>{feat}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <button
                                    onClick={handleNext}
                                    disabled={isFinishing}
                                    style={{ 
                                        background: '#00c897',
                                        color: '#ffffff',
                                        border: 'none',
                                        padding: '1.1rem 2.5rem',
                                        borderRadius: '16px',
                                        fontSize: '1.05rem',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        boxShadow: '0 20px 35px -8px rgba(0, 200, 151, 0.35)',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-3px)';
                                        e.currentTarget.style.boxShadow = '0 25px 40px -8px rgba(0, 200, 151, 0.45)';
                                        e.currentTarget.style.background = '#00e6ad';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 20px 35px -8px rgba(0, 200, 151, 0.35)';
                                        e.currentTarget.style.background = '#00c897';
                                    }}
                                >
                                    {isFinishing ? (
                                        <>Initializing...</>
                                    ) : (
                                        <>
                                            {currentStep === STEPS.length - 1 ? "Start Journey" : "Continue"}
                                            <ArrowRight size={20} />
                                        </>
                                    )}
                                </button>
                                
                                <button
                                    onClick={async () => {
                                        setIsFinishing(true);
                                        try {
                                            await markOnboardingComplete();
                                            navigate('/');
                                        } catch (e) {
                                            navigate('/');
                                        }
                                    }}
                                    disabled={isFinishing}
                                    style={{
                                        background: 'transparent',
                                        color: '#5a8870',
                                        border: 'none',
                                        padding: '1.1rem 1.5rem',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'color 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#1d4d36'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = '#5a8870'}
                                >
                                    Skip for now
                                </button>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Bottom Footer */}
            <div style={{ 
                height: '70px', 
                background: '#f0fff9', 
                borderTop: '1px solid rgba(0, 200, 151, 0.15)',
                padding: '0 2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                color: '#5a8870',
                fontWeight: '500'
            }}>
                Powered by PulseNova AI • Precision Healthcare for You • © 2026 PulseNova Inc.
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@700&display=swap');
                body { margin: 0; overflow: hidden; }
            `}</style>
        </div>
    );
}
