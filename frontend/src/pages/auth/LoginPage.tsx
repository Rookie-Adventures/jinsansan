import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AuthCard from '@/components/auth/AuthCard';
import LoginForm from '@/components/auth/LoginForm';
import { LoginFormData } from '@/types/auth';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 实现登录逻辑
  };

  return (
    <AuthCard onRegister={() => navigate('/register')}>
      <LoginForm
        formData={formData}
        showPassword={showPassword}
        onSubmit={handleSubmit}
        onFormChange={(data) => setFormData((prev) => ({ ...prev, ...data }))}
        onTogglePassword={() => setShowPassword(!showPassword)}
      />
    </AuthCard>
  );
};

export default LoginPage; 