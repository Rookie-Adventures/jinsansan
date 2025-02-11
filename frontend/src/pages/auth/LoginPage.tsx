import AuthPage from '@/components/auth/AuthPage';
import LoginForm from '@/components/auth/LoginForm';
import React from 'react';
import useRedirectIfAuthenticated from '@/hooks/auth/useRedirectIfAuthenticated';

const LoginPage: React.FC = () => {
  useRedirectIfAuthenticated();

  return (
    <AuthPage type="login" initialData={{ username: '', password: '' }}>
      <LoginForm />
    </AuthPage>
  );
};

export default LoginPage;
