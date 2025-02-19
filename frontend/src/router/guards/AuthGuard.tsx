import { FC, ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Loading from '@/components/common/Loading';
import { useAuth } from '@/hooks/auth';
import Logger from '@/utils/logger';

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard: FC<AuthGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const { isAuthenticated, token, getCurrentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        if (token) {
          await getCurrentUser();
        }
      } catch (error) {
        Logger.error('Failed to verify auth:', { context: 'AuthGuard', data: error });
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

  return children;
};
