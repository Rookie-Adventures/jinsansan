import { Alert, Box, CircularProgress, Snackbar } from '@mui/material';
import { useState, type FC, type ReactElement, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import type { LoginFormData, RegisterFormData, UsernameLoginFormData } from '@/types/auth';

import { useAuth, useAuthForm } from '@/hooks/auth';
import { validateLoginForm, validateRegisterForm } from '@/utils/auth/validation';
import Logger from '@/utils/logger';

import AuthCard from './AuthCard';

type AuthType = 'login' | 'register';
type FormData = LoginFormData | RegisterFormData;

// 定义表单组件的通用属性
interface AuthFormComponentProps {
  formData: FormData;
  showPassword: boolean;
  disabled?: boolean;
  onSubmit: (e: FormEvent) => void;
  onFormChange: (data: Partial<FormData>) => void;
  onTogglePassword: () => void;
  onCancel?: () => void;
}

interface AuthPageProps {
  type: AuthType;
  children: ReactElement<AuthFormComponentProps>;
  initialData: FormData;
}

const AuthPage: FC<AuthPageProps> = ({ type, children, initialData }) => {
  const navigate = useNavigate();
  const { login, register, loading } = useAuth();
  const { formData, showPassword, handleFormChange, togglePasswordVisibility } = useAuthForm({
    initialData,
  });

  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setShowError(false);

    // 表单验证
    const validationResult =
      type === 'login'
        ? validateLoginForm(formData as LoginFormData)
        : validateRegisterForm(formData as RegisterFormData);

    if (!validationResult.isValid) {
      setErrorMessage(validationResult.errorMessage || '验证失败');
      setShowError(true);
      return;
    }

    try {
      if (type === 'login') {
        await login(formData as LoginFormData);
      } else {
        await register(formData as RegisterFormData);
      }
      // 成功后的导航由 useAuth 中处理
    } catch (error) {
      Logger.error(error, {
        context: type === 'login' ? 'LoginPage' : 'RegisterPage',
        data: {
          username: (formData as UsernameLoginFormData).username,
          ...(type === 'register' && { email: (formData as RegisterFormData).email }),
        },
      });
      setErrorMessage(
        error instanceof Error ? error.message : `${type === 'login' ? '登录' : '注册'}失败，请重试`
      );
      setShowError(true);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  const childrenWithProps = children && {
    ...children,
    props: {
      ...children.props,
      formData,
      showPassword,
      onSubmit: handleSubmit,
      onFormChange: handleFormChange,
      onTogglePassword: togglePasswordVisibility,
      onCancel: handleCancel,
      disabled: loading,
    },
  } as ReactElement<AuthFormComponentProps>;

  return (
    <>
      <AuthCard
        onToLogin={type === 'register' ? () => navigate('/login') : undefined}
        onToRegister={type === 'login' ? () => navigate('/register') : undefined}
      >
        <Box position="relative">
          {childrenWithProps}
          {loading && (
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              display="flex"
              alignItems="center"
              justifyContent="center"
              bgcolor="rgba(255, 255, 255, 0.7)"
            >
              <CircularProgress />
            </Box>
          )}
        </Box>
      </AuthCard>

      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" variant="filled">
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AuthPage;
