import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

import AuthLayout from '../../components/Imasha/AuthLayout';
import DoctorCat from '../../components/Imasha/DoctorCat';
import PasswordInput from '../../components/Imasha/PasswordInput';
import AuthFormInput from '../../components/Imasha/AuthFormInput';
import { useAuth } from '../../context/Imasha/AuthContext';

import '../../styles/Imasha/AuthCommon.css';

export default function LoginPage() {
    const { login } = useAuth();

    const [form, setForm] = useState({ email: '', password: '' });
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [isHappy, setIsHappy] = useState(false);
    const [loading, setLoading] = useState(false);

    function handleChange(e) {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setIsTyping(true);
        clearTimeout(window._imashaTypingTimer);
        window._imashaTypingTimer = setTimeout(() => setIsTyping(false), 800);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.email || !form.password) {
            toast.error('Please fill in all fields.');
            return;
        }
        setLoading(true);
        try {
            await login({ email: form.email, password: form.password });
            // toast.success removed per user request "toast when logging why?"
            setIsHappy(true);
        } catch (err) {
            toast.error(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthLayout>
            <div className="Imasha-form-card">
                {/* Mascot */}
                <div className="Imasha-mascot-wrap">
                    <DoctorCat
                        isHiding={isPasswordFocused}
                        isWatching={!isPasswordFocused && form.email.length > 0}
                        isHappy={isHappy}
                    />
                </div>

                {/* Header */}
                <div className="Imasha-form-header">
                    <h1 className="Imasha-form-title">Welcome back</h1>
                    <p className="Imasha-form-subtitle">Sign in to your PulseNova account</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} noValidate>
                    <div className="Imasha-field-group">
                        <AuthFormInput
                            label="Email Address"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="your@email.com"
                            required
                            autoComplete="email"
                            icon={<Mail size={16} />}
                        />

                        <PasswordInput
                            label="Password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            onPasswordFocusChange={setIsPasswordFocused}
                        />
                    </div>

                    <div style={{ textAlign: 'right', marginBottom: '1.25rem', marginTop: '-0.5rem' }}>
                        <Link to="/forgot-password" className="Imasha-auth-link" style={{ fontSize: '0.8rem' }}>
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        className="Imasha-btn-primary"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="Imasha-btn-loading">
                                <span className="Imasha-spinner" /> Signing in…
                            </span>
                        ) : 'Sign In'}
                    </button>
                </form>

                <p className="Imasha-auth-link-text">
                    Don&apos;t have an account?{' '}
                    <Link to="/register" className="Imasha-auth-link">Create account</Link>
                </p>

                <div className="Imasha-divider">For doctors &amp; admins, use your provided credentials</div>
            </div>
        </AuthLayout>
    );
}
