import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CashierRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#2a9dab]"></div>
      </div>
    );
  }

  if (!isAuthenticated || (user?.role !== 'cashier' && user?.role !== 'admin')) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default CashierRoute; 