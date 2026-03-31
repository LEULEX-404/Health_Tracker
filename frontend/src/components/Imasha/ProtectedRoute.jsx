import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/Imasha/AuthContext';

/**
 * ProtectedRoute component that checks if a user is authenticated.
 * If authenticated, it renders the children.
 * If not authenticated, it redirects to login.
 * If authenticated but role is not allowed, it redirects to restricted.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
    const { token, loading, user } = useAuth();
    const location = useLocation();

    if (loading) {
        return null;
    }

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/restricted" state={{ reason: 'role', userRole: user.role, from: location }} replace />;
    }

    return children;
}
