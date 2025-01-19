import AuthPage from '@/components/auth/AuthPage';
import LoginForm from '@/components/auth/LoginForm';
import React from 'react';

const LoginPage: React.FC = () => (
  <AuthPage
    type="login"
    initialData={{ username: '', password: '' }}
  >
    <LoginForm />
  </AuthPage>
);

export default LoginPage; 