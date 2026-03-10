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

const AuthContext = createContext(null);

const ROLE_REDIRECTS = {
    patient: '/',
    doctor: '/doctor-dashboard',
    caregiver: '/caregiver-dashboard',
    admin: '/admin',
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('pn_token'));
    const [loading, setLoading] = useState(!!localStorage.getItem('pn_token'));
    const navigate = useNavigate();

    // Compatibility flag for existing Tharuka UI components
    const isLoggedIn = !!user;

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

    return (
        <AuthContext.Provider value={{
            user, token, loading, login, register, logout,
            requestPasswordReset, completePasswordReset, confirmEmail,
            isLoggedIn // Exported for compatibility with Tharuka Header
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
