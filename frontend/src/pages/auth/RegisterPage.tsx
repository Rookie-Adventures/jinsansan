import { type FC } from 'react';

import AuthPage from '@/components/auth/AuthPage';
import RegisterForm from '@/components/auth/RegisterForm';

import { withAuthRedirect } from './withAuthRedirect';

const RegisterPage: FC = () => {
  return (
    <AuthPage
      type="register"
      initialData={{
        username: '',
        password: '',
        email: '',
        confirmPassword: '',
      }}
    >
      <RegisterForm />
    </AuthPage>
  );
};

export default withAuthRedirect(RegisterPage);
