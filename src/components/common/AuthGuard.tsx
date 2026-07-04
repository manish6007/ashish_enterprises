import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { Box, CircularProgress } from '@mui/material';
import type { UserRole } from '../../types';

interface GuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export const AuthGuard: React.FC<GuardProps> = ({
  children,
  allowedRoles,
  redirectTo = '/login',
}) => {
  const { user, appUser, loading } = useAuthStore();
  const location = useLocation();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #0066CC 0%, #004a99 100%)',
        }}
      >
        <CircularProgress sx={{ color: '#fff' }} size={48} />
      </Box>
    );
  }

  if (!user || (allowedRoles && !appUser)) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (allowedRoles && appUser && !allowedRoles.includes(appUser.role)) {
    // Redirect based on role
    if (appUser.role === 'admin') return <Navigate to="/admin" replace />;
    if (appUser.role === 'staff') return <Navigate to="/staff" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const GuestGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, appUser, loading } = useAuthStore();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #0066CC 0%, #E63946 100%)',
        }}
      >
        <CircularProgress sx={{ color: '#fff' }} size={48} />
      </Box>
    );
  }

  if (user && appUser) {
    if (appUser.role === 'admin') return <Navigate to="/admin" replace />;
    if (appUser.role === 'staff') return <Navigate to="/staff" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
