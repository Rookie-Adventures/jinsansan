import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import type { LoginFormData, RegisterFormData } from '@/types/auth';
import type { User } from '@/types/user';
import type { AxiosError } from 'axios';

import { useAppDispatch, useAppSelector } from '@/store';
import { clearAuth, getCurrentUser, login, logout, register } from '@/store/slices/authSlice';
import { errorLogger } from '@/utils/errorLogger';
import { HttpErrorFactory } from '@/utils/http/error/factory';
import { HttpError, HttpErrorType } from '@/utils/http/error/types';

interface UseAuth {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
}

export const useAuth = (): UseAuth => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, token, loading, error } = useAppSelector(state => state.auth);

  const handleAuthError = useCallback((err: unknown): HttpError => {
    if (err instanceof Error || (err as AxiosError).isAxiosError) {
      return HttpErrorFactory.create(err as Error | AxiosError);
    }
    return HttpErrorFactory.create(new Error('Unknown error occurred'));
  }, []);

  const handleLogin = useCallback(
    async (data: LoginFormData) => {
      try {
        await dispatch(login(data)).unwrap();
        navigate('/');
      } catch (err) {
        const httpError = handleAuthError(err);
        if (httpError.type === HttpErrorType.AUTH) {
          navigate('/login');
        }
        throw httpError;
      }
    },
    [dispatch, navigate, handleAuthError]
  );

  const handleRegister = useCallback(
    async (data: RegisterFormData) => {
      try {
        await dispatch(register(data)).unwrap();
        navigate('/');
      } catch (err) {
        const httpError = handleAuthError(err);
        if (httpError.type === HttpErrorType.AUTH) {
          navigate('/register');
        }
        throw httpError;
      }
    },
    [dispatch, navigate, handleAuthError]
  );

  const handleLogout = useCallback(async () => {
    try {
      navigate('/');
      await dispatch(logout()).unwrap();
      dispatch(clearAuth());
      localStorage.removeItem('persist:root');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Logout failed');
      errorLogger.log(error);
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
      const httpError = handleAuthError(err);
      if (httpError.type === HttpErrorType.AUTH) {
        navigate('/login');
      }
      throw httpError;
    }
  }, [dispatch, navigate, token, handleAuthError]);

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
