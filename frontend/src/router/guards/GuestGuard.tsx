import { FC, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/hooks/auth';

interface GuestGuardProps {
  children: ReactNode;
}

export const GuestGuard: FC<GuestGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    return null;
  }

  return children;
};
