import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';

import AuthLayout from '../../components/Imasha/AuthLayout';
import DoctorCat from '../../components/Imasha/DoctorCat';
import PasswordInput from '../../components/Imasha/PasswordInput';
import AuthFormInput from '../../components/Imasha/AuthFormInput';
import { useAuth } from '../../context/Imasha/AuthContext';

import '../../styles/Imasha/AuthCommon.css';

/* ── Validators ── */
function validateEmail(v) {
    if (!v.trim()) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address.';
    return '';
}
function validatePassword(v) {
    if (!v) return 'Password is required.';
    if (v.length < 6) return 'Must be at least 6 characters.';
    return '';
}

export default function LoginPage() {
    const { login, oauthLogin } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({ email: '', password: '' });
    const [touched, setTouched] = useState({ email: false, password: false });
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [isHappy, setIsHappy] = useState(false);
    const [loading, setLoading] = useState(false);

    /* Google OAuth callback */
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const userDataStr = params.get('user');
        if (token && userDataStr) {
            try {
                const userData = JSON.parse(decodeURIComponent(userDataStr));
                oauthLogin({ token, user: userData });
                toast.success('Google login successful!');
                if (userData.role === 'patient' && !userData.hasCompletedOnboarding) {
                    navigate('/onboarding');
                } else {
                    navigate('/');
                }
            } catch {
                toast.error('Google login failed. Please try again.');
            }
        }
    }, [navigate, oauthLogin]);

    /* Real-time validation on change */
    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (touched[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: name === 'email' ? validateEmail(value) : validatePassword(value),
            }));
        }
    }

    function handleBlur(e) {
        const { name, value } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
        setErrors((prev) => ({
            ...prev,
            [name]: name === 'email' ? validateEmail(value) : validatePassword(value),
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const emailErr = validateEmail(form.email);
        const passErr = validatePassword(form.password);
        setTouched({ email: true, password: true });
        setErrors({ email: emailErr, password: passErr });
        if (emailErr || passErr) return;

        setLoading(true);
        try {
            await login({ email: form.email, password: form.password });
            setIsHappy(true);
        } catch (err) {
            toast.error(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:5000/api/auth/google';
    };

    return (
        <AuthLayout>
            <div className="Imasha-auth-toggle">
                <Link to="/login" className="Imasha-auth-toggle-btn active">Sign In</Link>
                <Link to="/register" className="Imasha-auth-toggle-btn">Sign Up</Link>
            </div>

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
                            onBlur={handleBlur}
                            placeholder="your@email.com"
                            required
                            autoComplete="email"
                            icon={<Mail size={16} />}
                            error={touched.email ? errors.email : ''}
                        />

                        <PasswordInput
                            label="Password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            required
                            onPasswordFocusChange={setIsPasswordFocused}
                            error={touched.password ? errors.password : ''}
                        />
                    </div>

                    <div className="Imasha-forgot-row">
                        <Link to="/forgot-password" className="Imasha-auth-link">
                            Forgot password?
                        </Link>
                    </div>

                    <button type="submit" className="Imasha-btn-primary" disabled={loading}>
                        {loading ? (
                            <span className="Imasha-btn-loading">
                                <span className="Imasha-spinner" /> Signing in…
                            </span>
                        ) : 'Sign In →'}
                    </button>

                    <div className="Imasha-divider"><span>or continue with</span></div>

                    <button type="button" onClick={handleGoogleLogin} className="Imasha-google-btn">
                        <div className="Imasha-google-icon">
                            <svg viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        </div>
                        Continue with Google
                    </button>
                </form>

                <p className="Imasha-auth-link-text">
                    Don&apos;t have an account?{' '}
                    <Link to="/register" className="Imasha-auth-link">Create account</Link>
                </p>
            </div>
        </AuthLayout>
    );
}
