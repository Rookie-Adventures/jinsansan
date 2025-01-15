import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/hooks/auth';
import Loading from '@/components/common/Loading';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const { isAuthenticated, token, getCurrentUser } = useAuth();
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        if (token) {
          await getCurrentUser();
        }
      } catch (error) {
        console.error('Failed to verify auth:', error);
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [getCurrentUser, navigate, token]);

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  return <>{children}</>;
}; 