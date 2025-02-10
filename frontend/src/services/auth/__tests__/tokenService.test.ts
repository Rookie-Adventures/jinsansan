import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tokenService } from '../tokenService';

describe('TokenService', () => {
  // Mock localStorage
  const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
    });
  });

  describe('Token 管理', () => {
    it('应该正确设置 token', () => {
      const token = 'test-token';
      tokenService.setToken(token);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_token', token);
    });

    it('应该正确获取 token', () => {
      const token = 'test-token';
      mockLocalStorage.getItem.mockReturnValue(token);

      expect(tokenService.getToken()).toBe(token);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('auth_token');
    });

    it('应该正确移除 token', () => {
      tokenService.removeToken();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_token');
    });

    it('应该正确检查 token 存在性', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      expect(tokenService.hasToken()).toBeFalsy();

      mockLocalStorage.getItem.mockReturnValue('test-token');
      expect(tokenService.hasToken()).toBeTruthy();
    });
  });

  describe('Token 解析', () => {
    const validToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZXhwIjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    const invalidToken = 'invalid-token';

    it('应该正确解析有效的 token', () => {
      const decoded = tokenService.parseToken(validToken);

      expect(decoded).toEqual({
        sub: '1234567890',
        name: 'John Doe',
        exp: 1516239022,
      });
    });

    it('解析无效 token 时应该抛出错误', () => {
      expect(() => tokenService.parseToken(invalidToken)).toThrow('Invalid token format');
    });
  });

  describe('Token 过期检查', () => {
    it('应该正确检查未过期的 token', () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1小时后过期
      const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ exp: futureExp }))}.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`;

      expect(tokenService.isTokenExpired(token)).toBeFalsy();
    });

    it('应该正确检查已过期的 token', () => {
      const pastExp = Math.floor(Date.now() / 1000) - 3600; // 1小时前过期
      const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ exp: pastExp }))}.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`;

      expect(tokenService.isTokenExpired(token)).toBeTruthy();
    });

    it('检查无效 token 时应该返回 true', () => {
      expect(tokenService.isTokenExpired('invalid-token')).toBeTruthy();
    });
  });

  describe('Token 安全性', () => {
    it('应该安全地处理空token', () => {
      expect(tokenService.isTokenExpired('')).toBeTruthy();
      expect(() => tokenService.parseToken('')).toThrow('Invalid token format');
    });

    it('应该安全地处理null/undefined token', () => {
      expect(tokenService.isTokenExpired(null as any)).toBeTruthy();
      expect(tokenService.isTokenExpired(undefined as any)).toBeTruthy();
      expect(() => tokenService.parseToken(null as any)).toThrow('Invalid token format');
      expect(() => tokenService.parseToken(undefined as any)).toThrow('Invalid token format');
    });

    it('应该安全地处理非字符串token', () => {
      expect(tokenService.isTokenExpired(123 as any)).toBeTruthy();
      expect(tokenService.isTokenExpired({} as any)).toBeTruthy();
      expect(() => tokenService.parseToken(123 as any)).toThrow('Invalid token format');
      expect(() => tokenService.parseToken({} as any)).toThrow('Invalid token format');
    });
  });

  describe('Token 格式验证', () => {
    it('应该验证token格式', () => {
      const invalidFormats = [
        'not.a.jwt',
        'not.jwt',
        'notjwt',
        'eyJ.eyJ.eyJ',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0',
      ];

      invalidFormats.forEach(token => {
        expect(() => tokenService.parseToken(token)).toThrow('Invalid token format');
      });
    });

    it('应该处理畸形的Base64编码', () => {
      const malformedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.!@#$%^&*.signature';
      expect(() => tokenService.parseToken(malformedToken)).toThrow('Invalid token format');
    });
  });

  describe('localStorage 错误处理', () => {
    it('应该处理localStorage不可用的情况', () => {
      // 模拟localStorage抛出错误
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage is not available');
      });

      expect(() => tokenService.setToken('test-token')).toThrow('localStorage is not available');
    });

    it('应该处理localStorage配额超限的情况', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      expect(() => tokenService.setToken('test-token')).toThrow('QuotaExceededError');
    });
  });

  describe('Token 状态管理', () => {
    beforeEach(() => {
      // 重置所有 mock 实现
      mockLocalStorage.getItem.mockReset();
      mockLocalStorage.setItem.mockReset();
      mockLocalStorage.removeItem.mockReset();
    });

    it('应该正确处理token状态变化', () => {
      // 初始状态：无token
      mockLocalStorage.getItem.mockReturnValue(null);
      expect(tokenService.hasToken()).toBeFalsy();

      // 设置token
      mockLocalStorage.setItem.mockImplementation(() => {});
      mockLocalStorage.getItem.mockReturnValue('test-token');
      tokenService.setToken('test-token');
      expect(tokenService.hasToken()).toBeTruthy();

      // 移除token
      mockLocalStorage.removeItem.mockImplementation(() => {});
      mockLocalStorage.getItem.mockReturnValue(null);
      tokenService.removeToken();
      expect(tokenService.hasToken()).toBeFalsy();
    });

    it('应该正确处理token覆盖', () => {
      mockLocalStorage.setItem.mockImplementation(() => {});

      // 设置初始token
      tokenService.setToken('initial-token');
      expect(mockLocalStorage.setItem).toHaveBeenLastCalledWith('auth_token', 'initial-token');

      // 覆盖token
      tokenService.setToken('new-token');
      expect(mockLocalStorage.setItem).toHaveBeenLastCalledWith('auth_token', 'new-token');
    });
  });
});
