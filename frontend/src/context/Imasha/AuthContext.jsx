import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    loginUser,
    registerUser,
    getCurrentUser,
    logoutUser,
    forgotPassword,
    resetPassword,
    verifyEmail
} from '../../utils/Imasha/authApi';
import { completeUserOnboarding } from '../../utils/Imasha/userApi';

const AuthContext = createContext(null);

const ROLE_REDIRECTS = {
    patient: '/',
    doctor: '/doctor-dashboard',
    caregiver: '/caregiver-dashboard',
    admin: '/admin/dashboard',
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('pn_token'));
    const [loading, setLoading] = useState(!!localStorage.getItem('pn_token'));
    const navigate = useNavigate();

    // Rehydrate user from token on mount
    useEffect(() => {
        if (!token) { setLoading(false); return; }
        getCurrentUser(token)
            .then((u) => setUser(u))
            .catch(() => { localStorage.removeItem('pn_token'); setToken(null); })
            .finally(() => setLoading(false));
    }, [token]);

    const login = useCallback(async ({ email, password }) => {
        const data = await loginUser({ email, password });
        const accessToken = data.data?.accessToken || data.accessToken;
        const userData = data.data?.user || data.user;
        localStorage.setItem('pn_token', accessToken);
        setToken(accessToken);
        setUser(userData);
        const redirectTo = ROLE_REDIRECTS[userData?.role] || '/login';
        navigate(redirectTo);
        return data;
    }, [navigate]);

    const register = useCallback(async (payload) => {
        // We no longer auto-login or redirect here, handled by RegisterPage
        const data = await registerUser(payload);
        return data;
    }, []);

    const logout = useCallback(async () => {
        try { await logoutUser(token); } catch (_) { /* ignore */ }
        localStorage.removeItem('pn_token');
        setToken(null);
        setUser(null);
        navigate('/login');
    }, [token, navigate]);

    const requestPasswordReset = useCallback(async (email) => {
        return await forgotPassword(email);
    }, []);

    const completePasswordReset = useCallback(async ({ token, password }) => {
        return await resetPassword({ token, password });
    }, []);

    const confirmEmail = useCallback(async (token) => {
        return await verifyEmail(token);
    }, []);

    const markOnboardingComplete = useCallback(async () => {
        if (!user || !token) return;
        const result = await completeUserOnboarding(user._id, token);
        setUser(prev => ({ ...prev, hasCompletedOnboarding: true }));
        return result;
    }, [user, token]);

    const oauthLogin = useCallback(({ token: newToken, user: newUser }) => {
        localStorage.setItem('pn_token', newToken);
        setToken(newToken);
        setUser(newUser);
    }, []);

    return (
        <AuthContext.Provider value={{
            user, token, loading, login, register, logout,
            requestPasswordReset, completePasswordReset, confirmEmail,
            markOnboardingComplete, oauthLogin
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
