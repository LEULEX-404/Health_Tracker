import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Mail, User, Phone, MapPin, Calendar,
    ChevronRight, ChevronLeft, Check,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import AuthLayout from '../../components/Imasha/AuthLayout';
import DoctorCat from '../../components/Imasha/DoctorCat';
import PasswordInput from '../../components/Imasha/PasswordInput';
import AuthFormInput from '../../components/Imasha/AuthFormInput';
import { useAuth } from '../../context/Imasha/AuthContext';

import '../../styles/Imasha/AuthCommon.css';
import '../../styles/Imasha/RegisterPage.css';

const HEALTH_CONDITIONS = [
    'diabetes', 'hypertension', 'obesity', 'heart_disease',
    'kidney_disease', 'celiac', 'lactose_intolerant',
    'high_cholesterol', 'anemia', 'osteoporosis', 'other',
];

const GENDERS = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
];

const INITIAL_FORM = {
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
    phone: '', gender: '', dateOfBirth: '', address: '', healthConditions: [],
};

export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [form, setForm] = useState(INITIAL_FORM);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [isHappy, setIsHappy] = useState(false);
    const [loading, setLoading] = useState(false);

    function handleChange(e) {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    function handleConditionToggle(cond) {
        setForm((prev) => ({
            ...prev,
            healthConditions: prev.healthConditions.includes(cond)
                ? prev.healthConditions.filter((c) => c !== cond)
                : [...prev.healthConditions, cond],
        }));
    }

    function validateStep1() {
        if (!form.firstName.trim()) return 'First name is required.';
        if (!form.lastName.trim()) return 'Last name is required.';
        if (!form.email.trim()) return 'Email is required.';
        if (!/\S+@\S+\.\S+/.test(form.email)) return 'Enter a valid email address.';
        if (!form.password) return 'Password is required.';
        if (form.password.length < 6) return 'Password must be at least 6 characters.';
        if (form.password !== form.confirmPassword) return 'Passwords do not match.';
        return null;
    }

    function handleNext() {
        const err = validateStep1();
        if (err) {
            toast.error(err);
            return;
        }
        setStep(2);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        try {
            const { confirmPassword, ...payload } = form;
            await register({ ...payload, role: 'patient' });
            toast.success('Account created! Please verify your email before logging in.', {
                duration: 5000,
            });
            setIsHappy(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            toast.error(err.message || 'Registration failed. Please try again.');
            setIsHappy(false);
        } finally {
            setLoading(false);
        }
    }

    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:5000/api/auth/google';
    };

    const progress = step === 1 ? 50 : 100;

    return (
        <AuthLayout>
            <div className="Imasha-form-card">
                {/* Mascot */}
                <div className="Imasha-mascot-wrap">
                    <DoctorCat
                        isHiding={isPasswordFocused}
                        isWatching={!isPasswordFocused}
                        isHappy={isHappy}
                    />
                </div>

                {/* Progress bar */}
                <div className="Imasha-register-progress">
                    <div className="Imasha-register-progress-bar">
                        <div
                            className="Imasha-register-progress-fill"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="Imasha-register-steps">
                        <span className={`Imasha-step-dot ${step >= 1 ? 'active' : ''}`}>1</span>
                        <span className="Imasha-step-line" />
                        <span className={`Imasha-step-dot ${step >= 2 ? 'active' : ''}`}>2</span>
                    </div>
                </div>

                {/* Header */}
                <div className="Imasha-form-header">
                    <h1 className="Imasha-form-title">
                        {step === 1 ? 'Create account' : 'Health profile'}
                    </h1>
                    <p className="Imasha-form-subtitle">
                        {step === 1
                            ? 'Step 1 of 2 — Personal information'
                            : 'Step 2 of 2 — Optional health details'}
                    </p>
                </div>

                {/* ── STEP 1 ── */}
                {step === 1 && (
                    <div className="Imasha-field-group">
                        <div className="Imasha-field-row">
                            <AuthFormInput
                                label="First Name" name="firstName" value={form.firstName}
                                onChange={handleChange} placeholder="John" required
                                icon={<User size={16} />}
                            />
                            <AuthFormInput
                                label="Last Name" name="lastName" value={form.lastName}
                                onChange={handleChange} placeholder="Doe" required
                                icon={<User size={16} />}
                            />
                        </div>

                        <AuthFormInput
                            label="Email Address" name="email" type="email" value={form.email}
                            onChange={handleChange} placeholder="your@email.com" required
                            autoComplete="email" icon={<Mail size={16} />}
                        />

                        <PasswordInput
                            label="Password" name="password" value={form.password}
                            onChange={handleChange} placeholder="At least 6 characters"
                            autoComplete="new-password"
                            onPasswordFocusChange={setIsPasswordFocused}
                        />

                        <PasswordInput
                            label="Confirm Password" name="confirmPassword" value={form.confirmPassword}
                            onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                            placeholder="Repeat your password"
                            autoComplete="new-password"
                            onPasswordFocusChange={setIsPasswordFocused}
                        />

                        <button type="button" className="Imasha-btn-primary" style={{ marginTop: '1rem' }} onClick={handleNext}>
                            <span className="Imasha-btn-loading">
                                Next Step <ChevronRight size={17} />
                            </span>
                        </button>

                        <div className="Imasha-divider"><span>OR</span></div>

                        <button 
                            type="button" 
                            onClick={handleGoogleLogin} 
                            className="Imasha-google-btn"
                        >
                            <div className="Imasha-google-icon">
                                <svg viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                            </div>
                            Sign up with Google
                        </button>
                    </div>
                )}

                {/* ── STEP 2 ── */}
                {step === 2 && (
                    <form onSubmit={handleSubmit} noValidate className="Imasha-field-group">
                        <div className="Imasha-field-row">
                            <AuthFormInput
                                label="Phone" name="phone" type="tel" value={form.phone}
                                onChange={handleChange} placeholder="+94 7XX XXX XXX"
                                icon={<Phone size={16} />}
                            />
                            <AuthFormInput
                                label="Date of Birth" name="dateOfBirth" type="date" value={form.dateOfBirth}
                                onChange={handleChange}
                                icon={<Calendar size={16} />}
                            />
                        </div>

                        {/* Gender Pills */}
                        <div className="Imasha-field">
                            <span className="Imasha-label">Gender</span>
                            <div className="Imasha-selection-group">
                                {GENDERS.map((g) => (
                                    <button
                                        key={g.value}
                                        type="button"
                                        className={`Imasha-gender-pill ${form.gender === g.value ? 'active' : ''}`}
                                        onClick={() => setForm(p => ({ ...p, gender: g.value }))}
                                    >
                                        {form.gender === g.value && <Check size={14} />}
                                        {g.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <AuthFormInput
                            label="Address (optional)" name="address" value={form.address}
                            onChange={handleChange} placeholder="Your address"
                            icon={<MapPin size={16} />}
                        />

                        {/* Health chips */}
                        <div className="Imasha-field">
                            <span className="Imasha-label">Health Conditions (select all that apply)</span>
                            <div className="Imasha-health-chips">
                                {HEALTH_CONDITIONS.map((cond) => (
                                    <div
                                        key={cond}
                                        className={`Imasha-health-chip ${form.healthConditions.includes(cond) ? 'active' : ''}`}
                                        onClick={() => handleConditionToggle(cond)}
                                    >
                                        {cond.replace(/_/g, ' ')}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="Imasha-register-nav" style={{ marginTop: '1.5rem' }}>
                            <button
                                type="button"
                                className="Imasha-btn-back"
                                onClick={() => setStep(1)}
                            >
                                <ChevronLeft size={17} /> Back
                            </button>
                            <button type="submit" className="Imasha-btn-primary Imasha-btn-flex" disabled={loading}>
                                {loading ? (
                                    <span className="Imasha-btn-loading">
                                        <span className="Imasha-spinner" /> Creating…
                                    </span>
                                ) : 'Create Account'}
                            </button>
                        </div>
                    </form>
                )}

                <p className="Imasha-auth-link-text">
                    Already have an account?{' '}
                    <Link to="/login" className="Imasha-auth-link">Sign in</Link>
                </p>
            </div>
        </AuthLayout>
    );
}
