import AuthPage from '@/components/auth/AuthPage';
import RegisterForm from '@/components/auth/RegisterForm';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <AuthPage
      type="register"
      initialData={{ 
        username: '', 
        password: '', 
        email: '', 
        confirmPassword: '' 
      }}
    >
      <RegisterForm />
    </AuthPage>
  );
};

export default RegisterPage; 