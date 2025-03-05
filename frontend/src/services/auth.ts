import { AxiosHeaders } from 'axios';

import type { LoginFormData, RegisterFormData } from '@/types/auth';
import type { User } from '@/types/user';

import request from '@/utils/request';

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ApiError {
  code: number;
  message: string;
}

export interface SendVerificationCodeRequest {
  type: 'phone' | 'email';
  target: string;
}

export interface SendVerificationCodeResponse {
  success: boolean;
  message: string;
}

const defaultHeaders = new AxiosHeaders({
  'Content-Type': 'application/json',
});

export const authApi = {
  login: async (data: LoginFormData): Promise<LoginResponse> => {
    try {
      const response = await request<LoginResponse>({
        method: 'POST',
        url: '/auth/login',
        data,
        headers: defaultHeaders,
      });
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || '登录失败，请重试');
    }
  },

  register: async (data: RegisterFormData): Promise<LoginResponse> => {
    try {
      const response = await request<LoginResponse>({
        method: 'POST',
        url: '/auth/register',
        data,
        headers: defaultHeaders,
      });
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || '注册失败，请重试');
    }
  },

  logout: async (): Promise<void> => {
    try {
      await request({
        method: 'POST',
        url: '/auth/logout',
        headers: defaultHeaders,
      });
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || '退出登录失败，请重试');
    }
  },

  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await request<User>({
        method: 'GET',
        url: '/auth/me',
        headers: defaultHeaders,
      });
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || '获取用户信息失败，请重试');
    }
  },

  sendVerificationCode: async (data: SendVerificationCodeRequest): Promise<SendVerificationCodeResponse> => {
    try {
      const response = await request<SendVerificationCodeResponse>({
        method: 'POST',
        url: '/auth/send-verification-code',
        data,
        headers: defaultHeaders,
      });
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || '发送验证码失败，请重试');
    }
  },
};
