import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '@/store';
import { clearAuth, getCurrentUser, login, logout, register } from '@/store/slices/authSlice';
import type { LoginFormData, RegisterFormData } from '@/types/auth';
import { errorLogger } from '@/utils/errorLogger';
import { HttpErrorFactory } from '@/utils/http/error/factory';
import { HttpErrorType } from '@/utils/http/error/types';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, token, loading, error } = useAppSelector((state) => state.auth);

  const handleLogin = useCallback(async (data: LoginFormData) => {
    try {
      await dispatch(login(data)).unwrap();
      navigate('/');
    } catch (err) {
      const httpError = HttpErrorFactory.create(err);
      if (httpError.type === HttpErrorType.AUTH) {
        navigate('/login');
      }
      throw err;
    }
  }, [dispatch, navigate]);

  const handleRegister = useCallback(async (data: RegisterFormData) => {
    try {
      await dispatch(register(data)).unwrap();
      navigate('/');
    } catch (err) {
      const httpError = HttpErrorFactory.create(err);
      if (httpError.type === HttpErrorType.AUTH) {
        navigate('/register');
      }
      throw err;
    }
  }, [dispatch, navigate]);

  const handleLogout = useCallback(async () => {
    try {
      navigate('/');
      await dispatch(logout()).unwrap();
      dispatch(clearAuth());
      localStorage.removeItem('persist:root');
    } catch (err) {
      errorLogger.log(err instanceof Error ? err : new Error('Logout failed'));
      navigate('/');
      dispatch(clearAuth());
      localStorage.removeItem('persist:root');
    }
  }, [dispatch, navigate]);

  const fetchCurrentUser = useCallback(async () => {
    if (!token) return;
    try {
      await dispatch(getCurrentUser()).unwrap();
    } catch (err) {
      const httpError = HttpErrorFactory.create(err);
      if (httpError.type === HttpErrorType.AUTH) {
        navigate('/login');
      }
      throw err;
    }
  }, [dispatch, navigate, token]);

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    getCurrentUser: fetchCurrentUser,
  };
}; 