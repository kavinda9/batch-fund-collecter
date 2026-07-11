// frontend/src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

/**
 * Route guard component to protect private and administrative client paths
 */
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();

  // Show nothing or a clean loading state while Firebase resolves the session token
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  // If no user session is found, redirect to the login gateway
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Optional Admin authorization layer check
  if (requireAdmin && (!user.claims || user.claims.admin !== true)) {
    console.warn(`Unauthorized access attempt blocked for user: ${user.email}`);
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;