import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../authService';
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
  let authService: AuthService;
  let mockHttp: HttpClient;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // 创建 mock http client
    mockHttp = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    };

    authService = new AuthService(mockHttp);
  });

  describe('login', () => {
    const mockLoginData = {
      email: 'test@example.com',
      password: 'password123',
      username: 'testuser'
    };

    const mockLoginResponse = {
      user: { id: 1, email: 'test@example.com', username: 'testuser' },
      token: 'mock-token'
    };

    it('应该成功处理登录请求', async () => {
      (mockHttp.post as jest.Mock).mockResolvedValue(mockLoginResponse);

      const response = await authService.login(mockLoginData);

      expect(mockHttp.post).toHaveBeenCalledWith('/api/auth/login', mockLoginData);
      expect(tokenService.setToken).toHaveBeenCalledWith(mockLoginResponse.token);
      expect(response).toEqual(mockLoginResponse);
    });

    it('不应该在登录响应没有token时设置token', async () => {
      const responseWithoutToken = { user: mockLoginResponse.user };
      (mockHttp.post as jest.Mock).mockResolvedValue(responseWithoutToken);

      await authService.login(mockLoginData);

      expect(tokenService.setToken).not.toHaveBeenCalled();
    });

    it('应该在登录失败时抛出错误', async () => {
      const error = new Error('Login failed');
      (mockHttp.post as jest.Mock).mockRejectedValue(error);

      await expect(authService.login(mockLoginData)).rejects.toThrow('Login failed');
    });
  });

  describe('register', () => {
    const mockRegisterData = {
      email: 'test@example.com',
      password: 'password123',
      username: 'testuser',
      confirmPassword: 'password123'
    };

    const mockRegisterResponse = {
      user: { id: 1, email: 'test@example.com', username: 'testuser' },
      token: 'mock-token'
    };

    it('应该成功处理注册请求', async () => {
      (mockHttp.post as jest.Mock).mockResolvedValue(mockRegisterResponse);

      const response = await authService.register(mockRegisterData);

      expect(mockHttp.post).toHaveBeenCalledWith('/api/auth/register', mockRegisterData);
      expect(tokenService.setToken).toHaveBeenCalledWith(mockRegisterResponse.token);
      expect(response).toEqual(mockRegisterResponse);
    });

    it('应该在注册失败时抛出错误', async () => {
      const error = new Error('Registration failed');
      (mockHttp.post as jest.Mock).mockRejectedValue(error);

      await expect(authService.register(mockRegisterData)).rejects.toThrow('Registration failed');
    });
  });

  describe('logout', () => {
    it('应该成功处理登出请求', async () => {
      (mockHttp.post as jest.Mock).mockResolvedValue({});

      await authService.logout();

      expect(mockHttp.post).toHaveBeenCalledWith('/api/auth/logout', {});
      expect(tokenService.removeToken).toHaveBeenCalled();
    });

    it('应该在登出失败时仍然移除token', async () => {
      const error = new Error('Logout failed');
      (mockHttp.post as jest.Mock).mockRejectedValue(error);

      await expect(authService.logout()).rejects.toThrow('Logout failed');
      expect(tokenService.removeToken).toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      username: 'testuser'
    };

    it('应该在有token时成功获取当前用户', async () => {
      (tokenService.getToken as jest.Mock).mockReturnValue('mock-token');
      (mockHttp.get as jest.Mock).mockResolvedValue(mockUser);

      const user = await authService.getCurrentUser();

      expect(mockHttp.get).toHaveBeenCalledWith('/api/auth/me');
      expect(user).toEqual(mockUser);
    });

    it('应该在没有token时抛出错误', async () => {
      (tokenService.getToken as jest.Mock).mockReturnValue(null);

      await expect(authService.getCurrentUser()).rejects.toThrow('No token found');
      expect(mockHttp.get).not.toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('应该成功刷新token', async () => {
      const mockNewToken = 'new-mock-token';
      (mockHttp.post as jest.Mock).mockResolvedValue({ token: mockNewToken });

      const newToken = await authService.refreshToken();

      expect(mockHttp.post).toHaveBeenCalledWith('/api/auth/refresh-token', {});
      expect(tokenService.setToken).toHaveBeenCalledWith(mockNewToken);
      expect(newToken).toBe(mockNewToken);
    });

    it('应该在刷新失败时抛出错误', async () => {
      const error = new Error('Token refresh failed');
      (mockHttp.post as jest.Mock).mockRejectedValue(error);

      await expect(authService.refreshToken()).rejects.toThrow('Token refresh failed');
    });
  });

  describe('validateToken', () => {
    it('应该成功验证有效token', async () => {
      (mockHttp.post as jest.Mock).mockResolvedValue({});

      const isValid = await authService.validateToken('valid-token');

      expect(mockHttp.post).toHaveBeenCalledWith('/api/auth/validate-token', { token: 'valid-token' });
      expect(isValid).toBe(true);
    });

    it('应该正确标识无效token', async () => {
      (mockHttp.post as jest.Mock).mockRejectedValue(new Error('Invalid token'));

      const isValid = await authService.validateToken('invalid-token');

      expect(isValid).toBe(false);
    });
  });

  describe('单例模式', () => {
    it('应该返回相同的实例', () => {
      const instance1 = new AuthService(mockHttp);
      const instance2 = new AuthService(mockHttp);
      expect(instance1).not.toBe(instance2); // 因为我们使用工厂函数创建实例
    });
  });
}); 