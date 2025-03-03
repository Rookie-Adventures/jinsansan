import { describe, it, expect, vi, beforeEach } from 'vitest';

import type { ApiResponse } from '@/types/api';
import type { LoginFormData, RegisterFormData } from '@/types/auth';
import type { User } from '@/types/user';

import request from '@/utils/request';

import { authApi } from '../auth';

// Mock request module
vi.mock('@/utils/request', () => ({
  default: vi.fn(),
}));

describe('Auth Service', () => {
  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    permissions: ['read', 'write'],
  };

  const mockLoginResponse: ApiResponse<{ token: string; user: User }> = {
    code: 200,
    message: 'success',
    data: {
      token: 'mock-token',
      user: mockUser,
    },
    timestamp: Date.now(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    const loginData: LoginFormData = {
      username: 'testuser',
      password: 'password123',
    };

    it('应该成功处理登录请求', async () => {
      vi.mocked(request).mockResolvedValueOnce(mockLoginResponse);

      const response = await authApi.login(loginData);

      expect(request).toHaveBeenCalledWith({
        method: 'POST',
        url: '/auth/login',
        data: loginData,
        headers: expect.any(Object),
      });
      expect(response).toEqual(mockLoginResponse.data);
    });

    it('应该处理登录失败', async () => {
      const errorMessage = '用户名或密码错误';
      vi.mocked(request).mockRejectedValueOnce({ message: errorMessage });

      await expect(authApi.login(loginData)).rejects.toThrow(errorMessage);
    });

    it('应该在没有错误消息时使用默认错误消息', async () => {
      vi.mocked(request).mockRejectedValueOnce({});

      await expect(authApi.login(loginData)).rejects.toThrow('登录失败，请重试');
    });
  });

  describe('register', () => {
    const registerData: RegisterFormData = {
      username: 'newuser',
      email: 'new@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    };

    it('应该成功处理注册请求', async () => {
      vi.mocked(request).mockResolvedValueOnce(mockLoginResponse);

      const response = await authApi.register(registerData);

      expect(request).toHaveBeenCalledWith({
        method: 'POST',
        url: '/auth/register',
        data: registerData,
        headers: expect.any(Object),
      });
      expect(response).toEqual(mockLoginResponse.data);
    });

    it('应该处理注册失败', async () => {
      const errorMessage = '用户名已存在';
      vi.mocked(request).mockRejectedValueOnce({ message: errorMessage });

      await expect(authApi.register(registerData)).rejects.toThrow(errorMessage);
    });

    it('应该在没有错误消息时使用默认错误消息', async () => {
      vi.mocked(request).mockRejectedValueOnce({});

      await expect(authApi.register(registerData)).rejects.toThrow('注册失败，请重试');
    });
  });

  describe('logout', () => {
    it('应该成功处理登出请求', async () => {
      const mockLogoutResponse: ApiResponse<Record<string, never>> = {
        code: 200,
        message: 'success',
        data: {},
        timestamp: Date.now(),
      };
      vi.mocked(request).mockResolvedValueOnce(mockLogoutResponse);

      await authApi.logout();

      expect(request).toHaveBeenCalledWith({
        method: 'POST',
        url: '/auth/logout',
        headers: expect.any(Object),
      });
    });

    it('应该处理登出失败', async () => {
      const errorMessage = '退出登录失败';
      vi.mocked(request).mockRejectedValueOnce({ message: errorMessage });

      await expect(authApi.logout()).rejects.toThrow(errorMessage);
    });
  });

  describe('getCurrentUser', () => {
    it('应该成功获取当前用户信息', async () => {
      const mockUserResponse: ApiResponse<User> = {
        code: 200,
        message: 'success',
        data: mockUser,
        timestamp: Date.now(),
      };
      vi.mocked(request).mockResolvedValueOnce(mockUserResponse);

      const user = await authApi.getCurrentUser();

      expect(request).toHaveBeenCalledWith({
        method: 'GET',
        url: '/auth/me',
        headers: expect.any(Object),
      });
      expect(user).toEqual(mockUser);
    });

    it('应该处理获取用户信息失败', async () => {
      const errorMessage = '获取用户信息失败';
      vi.mocked(request).mockRejectedValueOnce({ message: errorMessage });

      await expect(authApi.getCurrentUser()).rejects.toThrow(errorMessage);
    });

    it('应该在没有错误消息时使用默认错误消息', async () => {
      vi.mocked(request).mockRejectedValueOnce({});

      await expect(authApi.getCurrentUser()).rejects.toThrow('获取用户信息失败，请重试');
    });
  });
}); 