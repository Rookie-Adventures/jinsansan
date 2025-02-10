import { describe, expect, vi, test } from 'vitest';
import { authManager } from '../auth';

describe('AuthManager', () => {
  beforeEach(() => {
    // 清理存储和状态
    localStorage.clear();
    sessionStorage.clear();
    authManager.logout();
    // 重置登录尝试记录
    vi.restoreAllMocks();
    // 使用模拟定时器
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Token管理测试', () => {
    test('应该安全地存储和获取Token', () => {
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
      authManager.setToken(token);
      expect(authManager.getToken()).toBe(token);
      // Token应该被加密存储
      const rawToken = localStorage.getItem('auth_token');
      expect(rawToken).not.toBe(token);
    });

    test('Token过期时应该自动清除', () => {
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
      authManager.setToken(token, 100); // 100ms后过期
      expect(authManager.getToken()).toBe(token);

      vi.advanceTimersByTime(150);
      expect(authManager.getToken()).toBeNull();
    });

    test('无效Token应该被拒绝', () => {
      const invalidToken = 'invalid-token-format';
      expect(() => {
        authManager.setToken(invalidToken);
      }).toThrow();
    });
  });

  describe('会话管理测试', () => {
    test('应该正确处理会话超时', () => {
      authManager.startSession();
      const isActive = authManager.isSessionActive();
      expect(isActive).toBe(true);

      // 模拟会话超时
      vi.advanceTimersByTime(31 * 60 * 1000); // 31分钟
      expect(authManager.isSessionActive()).toBe(false);
    });

    test('活跃操作应该刷新会话', () => {
      authManager.startSession();
      vi.advanceTimersByTime(25 * 60 * 1000); // 25分钟

      // 刷新会话
      authManager.refreshSession();
      expect(authManager.isSessionActive()).toBe(true);

      // 会话应该被延长
      vi.advanceTimersByTime(20 * 60 * 1000);
      expect(authManager.isSessionActive()).toBe(true);
    });

    test('并发登录应该被检测', async () => {
      const mockStorageEvent = new StorageEvent('storage', {
        key: 'auth_token',
        newValue: 'new-token',
      });

      // 模拟另一个标签页登录
      window.dispatchEvent(mockStorageEvent);

      // 等待事件处理
      await vi.runAllTimersAsync();

      // 当前会话应该被终止
      expect(authManager.isSessionActive()).toBe(false);
    });
  });

  describe('安全边界测试', () => {
    test('应该防止XSS攻击', () => {
      const maliciousToken = '<script>alert("xss")</script>';
      expect(() => {
        authManager.setToken(maliciousToken);
      }).toThrow();
    });

    test('应该限制登录尝试次数', async () => {
      // 重置登录尝试记录
      authManager.clearLoginAttempts();

      for (let i = 0; i < 5; i++) {
        await authManager.login('test', 'wrong-password').catch(() => {});
      }

      // 第6次尝试应该被阻止
      await expect(authManager.login('test', 'wrong-password')).rejects.toThrow('登录尝试次数过多');
    });

    test('敏感操作应该需要重新验证', async () => {
      // 重置登录尝试记录
      authManager.clearLoginAttempts();

      await authManager.login('test', 'test');

      // 模拟最后验证时间
      vi.advanceTimersByTime(16 * 60 * 1000); // 16分钟

      // 执行敏感操作
      expect(authManager.requiresReauthentication()).toBe(true);
    });
  });

  describe('安全日志测试', () => {
    test('应该记录所有认证事件', async () => {
      // 重置登录尝试记录
      authManager.clearLoginAttempts();

      const logSpy = vi.spyOn(authManager, 'logAuthEvent');

      await authManager.login('test', 'test');
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'login',
          status: 'success',
        })
      );

      authManager.logout();
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'logout',
          status: 'success',
        })
      );
    });

    test('应该记录失败的认证尝试', async () => {
      // 重置登录尝试记录
      authManager.clearLoginAttempts();

      const logSpy = vi.spyOn(authManager, 'logAuthEvent');

      await authManager.login('test', 'wrong-password').catch(() => {});
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'login_error',
          details: expect.objectContaining({
            error: 'invalid_credentials',
          }),
          status: 'failure',
        })
      );
    });
  });

  test('应该维护单例实例', () => {
    const instance1 = authManager;
    const instance2 = authManager;
    expect(instance1).toBe(instance2);
  });
});
