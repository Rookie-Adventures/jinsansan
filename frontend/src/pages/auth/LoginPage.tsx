import AuthPage from '@/components/auth/AuthPage';
import LoginForm from '@/components/auth/LoginForm';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <AuthPage
      type="login"
      initialData={{ username: '', password: '' }}
    >
      <LoginForm />
    </AuthPage>
  );
};

export default LoginPage; 