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
    key: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage
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
    const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZXhwIjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    const invalidToken = 'invalid-token';

    it('应该正确解析有效的 token', () => {
      const decoded = tokenService.parseToken(validToken);
      
      expect(decoded).toEqual({
        sub: '1234567890',
        name: 'John Doe',
        exp: 1516239022
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
}); 