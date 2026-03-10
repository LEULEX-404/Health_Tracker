import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AlertCircle, CheckCircle2, ArrowLeft, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';

import AuthLayout from '../../components/Imasha/AuthLayout';
import DoctorCat from '../../components/Imasha/DoctorCat';
import AuthFormInput from '../../components/Imasha/AuthFormInput';
import { useAuth } from '../../context/Imasha/AuthContext';

import '../../styles/Imasha/AuthCommon.css';

export default function ForgotPasswordPage() {
    const { requestPasswordReset } = useAuth();

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isHappy, setIsHappy] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!email) {
            toast.error('Please enter your email address.');
            return;
        }

        setLoading(true);
        try {
            await requestPasswordReset(email);
            toast.success('Reset link sent successfully!');
            setIsSubmitted(true);
            setIsHappy(true);
        } catch (err) {
            toast.error(err.message || 'Failed to send reset email. Please try again.');
            setIsHappy(false);
        } finally {
            setLoading(false);
        }
    }

    if (isSubmitted) {
        return (
            <AuthLayout>
                <div className="Imasha-form-card Imasha-confirmation-card">
                    <div className="Imasha-mascot-wrap">
                        <DoctorCat isHappy={true} />
                    </div>
                    <div className="Imasha-icon-circle-success">
                        <Send size={32} />
                    </div>
                    <h1 className="Imasha-form-title">Check your email</h1>
                    <p className="Imasha-form-subtitle">
                        We've sent a password reset link to <br />
                        <strong>{email}</strong>
                    </p>
                    <div className="Imasha-info-box">
                        Did not receive the email? Check your spam folder or try again.
                    </div>
                    <button
                        onClick={() => setIsSubmitted(false)}
                        className="Imasha-btn-secondary"
                        style={{ marginTop: '1rem', width: '100%' }}
                    >
                        Try another email
                    </button>
                    <p className="Imasha-auth-link-text">
                        <Link to="/login" className="Imasha-auth-link">
                            <ArrowLeft size={14} /> Back to Sign In
                        </Link>
                    </p>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            <div className="Imasha-form-card">
                <div className="Imasha-mascot-wrap">
                    <DoctorCat
                        isHiding={false}
                        isWatching={email.length > 0}
                        isHappy={isHappy}
                    />
                </div>

                <div className="Imasha-form-header">
                    <h1 className="Imasha-form-title">Forgot Password?</h1>
                    <p className="Imasha-form-subtitle">Enter your email and we'll send you a link to reset your password.</p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="Imasha-field-group">
                        <AuthFormInput
                            label="Email Address"
                            name="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                            autoComplete="email"
                            icon={<Mail size={16} />}
                        />
                    </div>

                    <button
                        type="submit"
                        className="Imasha-btn-primary"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="Imasha-btn-loading">
                                <span className="Imasha-spinner" /> Sending link…
                            </span>
                        ) : 'Send Reset Link'}
                    </button>
                </form>

                <p className="Imasha-auth-link-text">
                    <Link to="/login" className="Imasha-auth-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <ArrowLeft size={14} /> Back to Sign In
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
