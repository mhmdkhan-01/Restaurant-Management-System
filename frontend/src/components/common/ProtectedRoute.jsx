// frontend/src/components/common/ProtectedRoute.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-canvas)' }}>
                <p className="text-xs font-bold animate-pulse" style={{ color: 'var(--text-muted)' }}>Verifying credentials...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // Redirect to their own role dashboard if trying to access unauthorized route
        const roleRoutes = {
            Admin: '/admin',
            Manager: '/manager',
            Waiter: '/waiter',
            Kitchen: '/kitchen',
        };
        return <Navigate to={roleRoutes[user.role] || '/login'} replace />;
    }

    return children;
};

export default ProtectedRoute;