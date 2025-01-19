import AuthPage from '@/components/auth/AuthPage';
import RegisterForm from '@/components/auth/RegisterForm';
import React from 'react';

const RegisterPage: React.FC = () => (
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

export default RegisterPage; 