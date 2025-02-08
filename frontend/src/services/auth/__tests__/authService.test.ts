import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAuthService } from '../authService';
import { tokenService } from '../tokenService';
import type { HttpClient } from '@/types/http';

// Mock tokenService
vi.mock('../tokenService', () => ({
  tokenService: {
    setToken: vi.fn(),
    removeToken: vi.fn(),
    getToken: vi.fn()
  }
}));

describe('AuthService', () => {
  let authService: ReturnType<typeof getAuthService>;
  const mockGet = vi.fn();
  const mockPost = vi.fn();
  const mockHttp: HttpClient = {
    get: mockGet,
    post: mockPost,
    put: vi.fn(),
    delete: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    authService = getAuthService(mockHttp);
  });

  describe('登录功能', () => {
    it('应该正确处理登录请求', async () => {
      const mockLoginData = {
        username: 'testuser',
        password: 'password123'
      };

      const mockResponse = {
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          permissions: []
        },
        token: 'test-token'
      };

      mockPost.mockResolvedValue(mockResponse);

      const response = await authService.login(mockLoginData);

      expect(mockPost).toHaveBeenCalledWith('/api/auth/login', mockLoginData);
      expect(tokenService.setToken).toHaveBeenCalledWith(mockResponse.token);
      expect(response).toEqual(mockResponse);
    });

    it('登录失败时应该抛出错误', async () => {
      const mockError = new Error('Login failed');
      mockPost.mockRejectedValue(mockError);

      await expect(authService.login({
        username: 'testuser',
        password: 'wrong-password'
      })).rejects.toThrow('Login failed');
    });
  });

  describe('注册功能', () => {
    it('应该正确处理注册请求', async () => {
      const mockRegisterData = {
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
        confirmPassword: 'password123'
      };

      const mockResponse = {
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          permissions: []
        },
        token: 'test-token'
      };

      mockPost.mockResolvedValue(mockResponse);

      const response = await authService.register(mockRegisterData);

      expect(mockPost).toHaveBeenCalledWith('/api/auth/register', mockRegisterData);
      expect(tokenService.setToken).toHaveBeenCalledWith(mockResponse.token);
      expect(response).toEqual(mockResponse);
    });

    it('注册失败时应该抛出错误', async () => {
      const mockError = new Error('Registration failed');
      mockPost.mockRejectedValue(mockError);

      await expect(authService.register({
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
        confirmPassword: 'password123'
      })).rejects.toThrow('Registration failed');
    });
  });

  describe('登出功能', () => {
    beforeEach(() => {
      // 重置 mock 状态
      mockPost.mockReset();
    });

    it('应该正确处理登出请求', async () => {
      // 设置成功响应
      mockPost.mockResolvedValueOnce({});

      await authService.logout();

      expect(mockPost).toHaveBeenCalledWith('/api/auth/logout', {});
      expect(tokenService.removeToken).toHaveBeenCalled();
    });

    it('登出失败时应该抛出错误', async () => {
      const mockError = new Error('Logout failed');
      mockPost.mockRejectedValueOnce(mockError);

      await expect(authService.logout()).rejects.toThrow('Logout failed');
    });
  });

  describe('获取当前用户', () => {
    it('应该正确获取当前用户信息', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        permissions: []
      };

      vi.mocked(tokenService.getToken).mockReturnValue('test-token');
      mockGet.mockResolvedValue(mockUser);

      const user = await authService.getCurrentUser();

      expect(mockGet).toHaveBeenCalledWith('/api/auth/me');
      expect(user).toEqual(mockUser);
    });

    it('没有 token 时应该抛出错误', async () => {
      vi.mocked(tokenService.getToken).mockReturnValue(null);

      await expect(authService.getCurrentUser()).rejects.toThrow('No token found');
    });

    it('获取用户信息失败时应该抛出错误', async () => {
      vi.mocked(tokenService.getToken).mockReturnValue('test-token');
      const mockError = new Error('Failed to get user');
      mockGet.mockRejectedValue(mockError);

      await expect(authService.getCurrentUser()).rejects.toThrow('Failed to get user');
    });
  });

  describe('Token 刷新', () => {
    it('应该正确刷新 token', async () => {
      const mockResponse = { token: 'new-token' };
      mockPost.mockResolvedValue(mockResponse);

      const newToken = await authService.refreshToken();

      expect(mockPost).toHaveBeenCalledWith('/api/auth/refresh-token', {});
      expect(tokenService.setToken).toHaveBeenCalledWith(mockResponse.token);
      expect(newToken).toBe(mockResponse.token);
    });

    it('刷新 token 失败时应该抛出错误', async () => {
      const mockError = new Error('Token refresh failed');
      mockPost.mockRejectedValue(mockError);

      await expect(authService.refreshToken()).rejects.toThrow('Token refresh failed');
    });
  });

  describe('Token 验证', () => {
    it('应该正确验证有效的 token', async () => {
      mockPost.mockResolvedValue({});

      const isValid = await authService.validateToken('test-token');

      expect(mockPost).toHaveBeenCalledWith('/api/auth/validate-token', { token: 'test-token' });
      expect(isValid).toBeTruthy();
    });

    it('应该正确识别无效的 token', async () => {
      mockPost.mockRejectedValue(new Error('Invalid token'));

      const isValid = await authService.validateToken('invalid-token');

      expect(mockPost).toHaveBeenCalledWith('/api/auth/validate-token', { token: 'invalid-token' });
      expect(isValid).toBeFalsy();
    });
  });
}); 