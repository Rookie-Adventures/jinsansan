import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '@/store';
import { login, logout, getCurrentUser } from '@/store/slices/authSlice';
import type { LoginFormData } from '@/types/auth';
import { isAuthError } from '@/utils/errorHandler';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, token, loading, error } = useAppSelector((state) => state.auth);

  const handleLogin = useCallback(async (data: LoginFormData) => {
    try {
      await dispatch(login(data)).unwrap();
      navigate('/');
    } catch (err) {
      if (isAuthError(err)) {
        navigate('/login');
      }
      throw err;
    }
  }, [dispatch, navigate]);

  const handleLogout = useCallback(async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate('/login');
    } catch (err) {
      throw err;
    }
  }, [dispatch, navigate]);

  const fetchCurrentUser = useCallback(async () => {
    if (!token) return;
    try {
      await dispatch(getCurrentUser()).unwrap();
    } catch (err) {
      if (isAuthError(err)) {
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
    logout: handleLogout,
    getCurrentUser: fetchCurrentUser,
  };
}; 