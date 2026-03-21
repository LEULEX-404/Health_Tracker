import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowRight, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/Imasha/AuthContext';
import AuthLayout from './AuthLayout';
import '../../styles/Imasha/AuthCommon.css';

/**
 * ProtectedRoute component that checks if a user is authenticated.
 * If authenticated, it renders the children.
 * If not, it shows a premium "Access Denied" view.
 */
export default function ProtectedRoute({ children }) {
    const { token, loading } = useAuth();

    if (loading) {
        // You could return a spinner here if the app doesn't already have a global loader
        return null;
    }

    if (!token) {
        return (
            <AuthLayout>
                <div className="Imasha-form-card" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                    <div className="Imasha-mascot-wrap" style={{ marginBottom: '1.5rem' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: 'rgba(255, 71, 87, 0.1)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto',
                            border: '1px solid rgba(255, 71, 87, 0.2)'
                        }}>
                            <ShieldAlert size={40} color="#ff4757" />
                        </div>
                    </div>

                    <div className="Imasha-form-header">
                        <h1 className="Imasha-form-title">Access Restricted</h1>
                        <p className="Imasha-form-subtitle">
                            Please sign in to access this premium feature and track your health journey.
                        </p>
                    </div>

                    <div className="Imasha-field-group" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                        <Link to="/login" className="Imasha-btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <LogIn size={18} />
                            Sign In
                        </Link>

                        <Link to="/register" className="Imasha-btn-secondary" style={{
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '0.75rem',
                            borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: 'var(--text-secondary)',
                            fontWeight: '600',
                            transition: 'all 0.3s ease'
                        }}>
                            <UserPlus size={18} />
                            Create Account
                        </Link>
                    </div>

                    <p className="Imasha-auth-link-text" style={{ marginTop: '2rem' }}>
                        <Link to="/" className="Imasha-auth-link" style={{ fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            Return to Home <ArrowRight size={14} />
                        </Link>
                    </p>
                </div>
            </AuthLayout>
        );
    }

    return children;
}
