import { Alert, Box, CircularProgress, Snackbar } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import AuthCard from '@/components/auth/AuthCard';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth, useAuthForm } from '@/hooks/auth';
import Logger from '@/utils/logger';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const { formData, showPassword, handleFormChange, togglePasswordVisibility } = useAuthForm({
    initialData: { username: '', password: '' }
  });
  const [showError, setShowError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowError(false);
    
    // 表单验证
    if (!formData.username.trim()) {
      setErrorMessage('请输入用户名');
      setShowError(true);
      return;
    }
    
    if (!formData.password) {
      setErrorMessage('请输入密码');
      setShowError(true);
      return;
    }
    
    try {
      await login(formData);
      // 登录成功后的导航由 useAuth 中处理
    } catch (error) {
      Logger.error(error, { context: 'LoginPage', data: { username: formData.username } });
      setErrorMessage(error instanceof Error ? error.message : '登录失败，请重试');
      setShowError(true);
    }
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  return (
    <>
      <AuthCard onToRegister={() => navigate('/register')}>
        <Box position="relative">
          <LoginForm
            formData={formData}
            showPassword={showPassword}
            onSubmit={handleSubmit}
            onFormChange={handleFormChange}
            onTogglePassword={togglePasswordVisibility}
            disabled={loading}
          />
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

export default LoginPage; 