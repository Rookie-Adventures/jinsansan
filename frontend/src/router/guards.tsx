import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAppSelector } from '@/store';
import type { RootState } from '@/store/types';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { token } = useAppSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

interface GuestGuardProps {
  children: React.ReactNode;
}

export const GuestGuard: React.FC<GuestGuardProps> = ({ children }) => {
  const { token } = useAppSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (token) {
    return <Navigate to={location.state?.from?.pathname || '/'} replace />;
  }

  return <>{children}</>;
};
