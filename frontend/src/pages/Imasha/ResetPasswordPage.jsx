import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

import AuthLayout from '../../components/Imasha/AuthLayout';
import DoctorCat from '../../components/Imasha/DoctorCat';
import PasswordInput from '../../components/Imasha/PasswordInput';
import { useAuth } from '../../context/Imasha/AuthContext';

import '../../styles/Imasha/AuthCommon.css';

export default function ResetPasswordPage() {
    const { completePasswordReset } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isHappy, setIsHappy] = useState(false);
    const [isResetDone, setIsResetDone] = useState(false);

    useEffect(() => {
        if (!token) {
            toast.error('Invalid or expired reset token. Please request a new one.');
        }
    }, [token]);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!password || !confirmPassword) {
            toast.error('Please fill in all fields.');
            return;
        }
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters.');
            return;
        }
        if (password !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            await completePasswordReset({ token, password });
            toast.success('Your password has been reset successfully!');
            setIsHappy(true);
            setIsResetDone(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            toast.error(err.message || 'Failed to reset password. Please try again.');
            setIsHappy(false);
        } finally {
            setLoading(false);
        }
    }

    if (isResetDone) {
        return (
            <AuthLayout>
                <div className="Imasha-form-card Imasha-confirmation-card">
                    <div className="Imasha-mascot-wrap">
                        <DoctorCat isHappy={true} />
                    </div>
                    <div className="Imasha-icon-circle-success">
                        <CheckCircle2 size={32} />
                    </div>
                    <h1 className="Imasha-form-title">Password Reset!</h1>
                    <p className="Imasha-form-subtitle">
                        Your password has been successfully updated. <br />
                        You will be redirected to the login page shortly.
                    </p>
                    <Link to="/login" className="Imasha-btn-primary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: '1rem' }}>
                        Go to Login Now
                    </Link>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            <div className="Imasha-form-card">
                <div className="Imasha-mascot-wrap">
                    <DoctorCat
                        isHiding={isPasswordFocused}
                        isWatching={!isPasswordFocused && !isResetDone}
                        isHappy={isHappy}
                    />
                </div>

                <div className="Imasha-form-header">
                    <h1 className="Imasha-form-title">Reset Password</h1>
                    <p className="Imasha-form-subtitle">Choose a new secure password for your account.</p>
                </div>

                {!token ? (
                    <div style={{ textAlign: 'center' }}>
                        <div className="Imasha-info-box" style={{ borderLeftColor: '#ff4d4d', background: 'rgba(255, 77, 77, 0.05)', textAlign: 'left' }}>
                            The reset token is missing or invalid. Please check your email link or request a new one.
                        </div>
                        <Link to="/forgot-password" className="Imasha-btn-primary" style={{ display: 'block', textDecoration: 'none', marginTop: '1rem' }}>
                            Request New Reset Link
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} noValidate>
                        <div className="Imasha-field-group">
                            <PasswordInput
                                label="New Password"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Min 6 characters"
                                autoComplete="new-password"
                                onPasswordFocusChange={setIsPasswordFocused}
                            />

                            <PasswordInput
                                label="Confirm New Password"
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your new password"
                                autoComplete="new-password"
                                onPasswordFocusChange={setIsPasswordFocused}
                            />
                        </div>

                        <button
                            type="submit"
                            className="Imasha-btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="Imasha-btn-loading">
                                    <span className="Imasha-spinner" /> Resetting…
                                </span>
                            ) : 'Reset Password'}
                        </button>
                    </form>
                )}

                <p className="Imasha-auth-link-text">
                    <Link to="/login" className="Imasha-auth-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <ArrowLeft size={14} /> Back to Sign In
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
