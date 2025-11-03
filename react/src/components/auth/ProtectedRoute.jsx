import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  if (!token) {
    return (
      <div data-easytag="id1-react/src/components/auth/ProtectedRoute.jsx">
        <Navigate to="/login" state={{ from: location }} replace />
      </div>
    );
  }

  return <div data-easytag="id2-react/src/components/auth/ProtectedRoute.jsx">{children}</div>;
};

export default ProtectedRoute;
