import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Verifying session credentials...</p>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page but save the current location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // User is logged in but doesn't have permissions for this page
    return (
      <div className="error-container">
        <h2 className="error-title">Access Denied</h2>
        <p className="error-message">You do not have the required permissions to view this section.</p>
        <button onClick={() => window.history.back()} className="btn btn-secondary">
          Go Back
        </button>
      </div>
    );
  }

  return children;
};
