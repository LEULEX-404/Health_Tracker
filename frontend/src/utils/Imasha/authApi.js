const BASE_URL = 'http://localhost:5000/api/auth';

/**
 * Login user (all roles)
 */
export async function loginUser({ email, password }) {
    const res = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Login failed');
    return data;
}

/**
 * Register a new patient
 */
export async function registerUser(payload) {
    const res = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Registration failed');
    return data;
}

/**
 * Get the currently logged-in user from token
 */
export async function getCurrentUser(token) {
    const res = await fetch(`${BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Unauthorized');
    return data.data;
}

/**
 * Logout
 */
export async function logoutUser(token) {
    await fetch(`${BASE_URL}/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
    });
}
/**
 * Request password reset email
 */
export async function forgotPassword(email) {
    const res = await fetch(`${BASE_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to send reset email');
    return data;
}

/**
 * Reset password with token
 */
export async function resetPassword({ token, password }) {
    const res = await fetch(`${BASE_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Password reset failed');
    return data;
}

/**
 * Verify email with token
 */
export async function verifyEmail(token) {
    const res = await fetch(`${BASE_URL}/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Email verification failed');
    return data;
}
