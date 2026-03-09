import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

import AuthLayout from '../../components/Imasha/AuthLayout';
import DoctorCat from '../../components/Imasha/DoctorCat';
import { useAuth } from '../../context/Imasha/AuthContext';

import '../../styles/Imasha/AuthCommon.css';

export default function VerifyEmailPage() {
    const { confirmEmail } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
    const [message, setMessage] = useState('Please wait while we verify your email address.');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Verification token is missing. Please check your email link or register again.');
            return;
        }

        const doVerify = async () => {
            try {
                await confirmEmail(token);
                setStatus('success');
                setMessage('Your email has been successfully verified! You can now sign in to your account.');
                toast.success('Email verified successfully!');
            } catch (err) {
                setStatus('error');
                setMessage(err.message || 'Verification failed. The link may be expired or invalid.');
                toast.error('Verification failed');
            }
        };

        doVerify();
    }, [token, confirmEmail]);

    return (
        <AuthLayout>
            <div className="Imasha-form-card Imasha-confirmation-card">
                {/* Mascot */}
                <div className="Imasha-mascot-wrap">
                    <DoctorCat
                        isHappy={status === 'success'}
                        isWatching={status === 'verifying'}
                        isHiding={status === 'error'}
                    />
                </div>

                {status === 'verifying' && (
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                        <div className="Imasha-icon-circle" style={{ background: 'rgba(0, 200, 151, 0.1)', color: '#00c897' }}>
                            <Loader2 size={32} className="Imasha-spinner" />
                        </div>
                        <h1 className="Imasha-form-title">Verifying Email...</h1>
                        <p className="Imasha-form-subtitle">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div style={{ textAlign: 'center' }}>
                        <div className="Imasha-icon-circle-success">
                            <CheckCircle2 size={32} />
                        </div>
                        <h1 className="Imasha-form-title">Email Verified!</h1>
                        <p className="Imasha-form-subtitle">{message}</p>

                        <Link to="/login" className="Imasha-btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', textDecoration: 'none', marginTop: '1.5rem' }}>
                            Go to Login <ArrowRight size={18} />
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div style={{ textAlign: 'center' }}>
                        <div className="Imasha-icon-circle" style={{ background: 'rgba(255, 77, 77, 0.1)', color: '#ff4d4d' }}>
                            <XCircle size={32} />
                        </div>
                        <h1 className="Imasha-form-title">Verification Failed</h1>
                        <p className="Imasha-form-subtitle">{message}</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                            <Link to="/register" className="Imasha-btn-primary" style={{ textDecoration: 'none' }}>
                                Back to Registration
                            </Link>
                            <Link to="/login" className="Imasha-btn-secondary" style={{ textDecoration: 'none' }}>
                                Back to Login
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </AuthLayout>
    );
}
