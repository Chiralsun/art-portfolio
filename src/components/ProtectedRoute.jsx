// frontend/src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, isAdmin }) => {
    // Check if admin is logged in (from state or localStorage)
    const isAuthenticated = isAdmin || localStorage.getItem('isAdmin') === 'true';
    
    if (!isAuthenticated) {
        // Redirect to login page
        return <Navigate to="/admin/login" replace />;
    }
    
    // Allow access to protected content
    return children;
};

export default ProtectedRoute;