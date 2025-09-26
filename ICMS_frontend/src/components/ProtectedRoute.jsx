import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#2a9dab]"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If the user is a client, they should only access /front-reservation,
  // which will be protected by ClientRoute. So, if a client tries to
  // access any other protected route, redirect them.
  if (user?.role === 'client') {
    return <Navigate to="/front-reservation" replace />;
  }

  return children;
};

export default ProtectedRoute; 