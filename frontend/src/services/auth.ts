import type { LoginFormData, RegisterFormData, User } from '@/types/auth';
import request from '@/utils/request';
import { AxiosHeaders } from 'axios';

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ApiError {
  code: number;
  message: string;
}

const defaultHeaders = new AxiosHeaders({
  'Content-Type': 'application/json'
});

export const authApi = {
  login: async (data: LoginFormData) => {
    try {
      const response = await request<LoginResponse>({
        method: 'POST',
        url: '/auth/login',
        data,
        headers: defaultHeaders
      });
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || '登录失败，请重试');
    }
  },

  register: async (data: RegisterFormData) => {
    try {
      const response = await request<LoginResponse>({
        method: 'POST',
        url: '/auth/register',
        data,
        headers: defaultHeaders
      });
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || '注册失败，请重试');
    }
  },

  logout: async () => {
    try {
      await request({
        method: 'POST',
        url: '/auth/logout',
        headers: defaultHeaders
      });
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || '退出登录失败，请重试');
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await request<User>({
        method: 'GET',
        url: '/auth/me',
        headers: defaultHeaders
      });
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || '获取用户信息失败，请重试');
    }
  },
}; 