import { type FC } from 'react';

import AuthPage from '@/components/auth/AuthPage';
import LoginForm from '@/components/auth/LoginForm';

import { withAuthRedirect } from './withAuthRedirect';

const LoginPage: FC = () => {
  return (
    <AuthPage type="login" initialData={{ username: '', password: '' }}>
      <LoginForm />
    </AuthPage>
  );
};

export default withAuthRedirect(LoginPage);
