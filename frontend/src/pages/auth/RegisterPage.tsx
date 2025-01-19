import { Alert, Box, CircularProgress, Snackbar } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import AuthCard from '@/components/auth/AuthCard';
import RegisterForm from '@/components/auth/RegisterForm';
import { useAuth, useAuthForm } from '@/hooks/auth';
import type { RegisterFormData } from '@/types/auth';
import Logger from '@/utils/logger';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const { formData, showPassword, handleFormChange, togglePasswordVisibility } = useAuthForm<RegisterFormData>({
    initialData: { 
      username: '', 
      password: '', 
      email: '', 
      confirmPassword: '' 
    }
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
    
    if (!formData.email.trim()) {
      setErrorMessage('请输入邮箱');
      setShowError(true);
      return;
    }
    
    if (!formData.password) {
      setErrorMessage('请输入密码');
      setShowError(true);
      return;
    }
    
    if (!formData.confirmPassword) {
      setErrorMessage('请确认密码');
      setShowError(true);
      return;
    }

    // 验证密码确认
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('两次输入的密码不一致');
      setShowError(true);
      return;
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage('请输入有效的邮箱地址');
      setShowError(true);
      return;
    }
    
    try {
      await register(formData);
      // 注册成功后的导航由 useAuth 中处理
    } catch (error) {
      Logger.error(error, { 
        context: 'RegisterPage', 
        data: { 
          username: formData.username,
          email: formData.email 
        } 
      });
      setErrorMessage(error instanceof Error ? error.message : '注册失败，请重试');
      setShowError(true);
    }
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  return (
    <>
      <AuthCard onToLogin={() => navigate('/login')}>
        <Box position="relative">
          <RegisterForm
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

export default RegisterPage; 