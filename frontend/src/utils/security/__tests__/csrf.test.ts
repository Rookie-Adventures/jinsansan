/**
 * @jest-environment jsdom
 */
import { describe, expect, test } from 'vitest';
import { csrfTokenManager } from '../csrf';

describe('CSRFTokenManager', () => {
  beforeEach(() => {
    // 清理localStorage
    localStorage.clear();
    // 清理CSRF Token
    csrfTokenManager.clearToken();
  });

  test('应该生成有效的CSRF Token', () => {
    const token = csrfTokenManager.generateToken();
    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  test('应该正确存储和获取Token', () => {
    const token = csrfTokenManager.generateToken();
    const storedToken = csrfTokenManager.getToken();
    expect(storedToken).toBe(token);
  });

  test('应该正确验证Token', () => {
    const token = csrfTokenManager.generateToken();
    expect(csrfTokenManager.validateToken(token)).toBe(true);
    expect(csrfTokenManager.validateToken('invalid-token')).toBe(false);
  });

  test('应该正确清除Token', () => {
    csrfTokenManager.generateToken();
    csrfTokenManager.clearToken();
    expect(csrfTokenManager.getToken()).toBeNull();
  });

  test('应该返回正确的Header Key', () => {
    expect(csrfTokenManager.getHeaderKey()).toBe('X-XSRF-TOKEN');
  });

  test('应该维护单例实例', () => {
    const instance1 = csrfTokenManager;
    const instance2 = csrfTokenManager;
    expect(instance1).toBe(instance2);
  });
}); 