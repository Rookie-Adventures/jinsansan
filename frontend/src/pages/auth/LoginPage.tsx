import React from 'react';
import { useNavigate } from 'react-router-dom';

import AuthCard from '@/components/auth/AuthCard';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth, useAuthForm } from '@/hooks/auth';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { formData, showPassword, handleFormChange, togglePasswordVisibility } = useAuthForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <AuthCard onRegister={() => navigate('/register')}>
      <LoginForm
        formData={formData}
        showPassword={showPassword}
        onSubmit={handleSubmit}
        onFormChange={handleFormChange}
        onTogglePassword={togglePasswordVisibility}
      />
    </AuthCard>
  );
};

export default LoginPage; 