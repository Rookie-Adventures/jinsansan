/**
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { AuditLogManager, AuditLogType, AuditLogLevels } from '../audit';

import { errorLogger } from '@/utils/error/errorLogger';

// Mock errorLogger
vi.mock('@/utils/error/errorLogger');

describe('AuditLogManager', () => {
  let auditLogManager: AuditLogManager;
  const mockFetch = vi.fn();
  const mockErrorLogger = vi.mocked(errorLogger);
  const baseTime = new Date('2024-01-01T00:00:00Z').getTime();

  // 保存原始的 localStorage
  const originalLocalStorage = global.localStorage;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(baseTime);

    // 重置 localStorage
    const store = new Map<string, string>();
    const localStorageMock = {
      getItem: vi.fn((key: string) => store.get(key) || null),
      setItem: vi.fn((key: string, value: string) => store.set(key, value)),
      removeItem: vi.fn((key: string) => store.delete(key)),
      clear: vi.fn(() => store.clear()),
      length: 0,
      key: vi.fn((_: number) => null),
    } as Storage;

    global.localStorage = localStorageMock;

    // Mock fetch 成功响应
    global.fetch = mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    } as Response);

    // 清理 errorLogger 的 mock
    mockErrorLogger.log.mockClear();

    // 重置单例实例
    (AuditLogManager as any).instance = null;
    auditLogManager = AuditLogManager.getInstance();
  });

  afterEach(() => {
    vi.useRealTimers();
    // 不要恢复所有 mock，只恢复 localStorage
    global.localStorage = originalLocalStorage;
  });

  describe('日志记录测试', () => {
    it('应该正确记录审计日志', async () => {
      const testLog = {
        type: AuditLogType.SECURITY,
        level: AuditLogLevels.INFO,
        action: 'test-action',
        resource: 'test-resource',
        details: { test: 'data' },
      };

      await auditLogManager.log(
        testLog.type,
        testLog.level,
        testLog.action,
        testLog.resource,
        testLog.details
      );

      const logs = auditLogManager.getLogs(0, Date.now());
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        type: testLog.type,
        level: testLog.level,
        action: testLog.action,
        resource: testLog.resource,
        details: testLog.details,
      });
    });

    it('应该限制内存中的日志数量', async () => {
      // 添加超过最大限制的日志
      for (let i = 0; i < 1100; i++) {
        await auditLogManager.log(
          AuditLogType.SYSTEM,
          AuditLogLevels.INFO,
          'action',
          'resource',
          { index: i }
        );
      }

      const logs = auditLogManager.getLogs(0, Date.now());
      expect(logs.length).toBeLessThanOrEqual(1000);
    });
  });

  describe('日志查询测试', () => {
    beforeEach(async () => {
      // 添加测试日志
      const testLogs = [
        {
          type: AuditLogType.SECURITY,
          level: AuditLogLevels.INFO,
          action: 'login',
          resource: 'user',
          details: { userId: '1' },
        },
        {
          type: AuditLogType.SECURITY,
          level: AuditLogLevels.WARNING,
          action: 'access',
          resource: 'file',
          details: { fileId: '2' },
        },
        {
          type: AuditLogType.SYSTEM,
          level: AuditLogLevels.ERROR,
          action: 'error',
          resource: 'service',
          details: { error: 'test' },
        },
      ];

      for (const log of testLogs) {
        await auditLogManager.log(
          log.type,
          log.level,
          log.action,
          log.resource,
          log.details
        );
      }
    });

    it('应该按类型筛选日志', () => {
      const logs = auditLogManager.getLogsByType(AuditLogType.SECURITY);
      expect(logs).toHaveLength(2); // 现在应该有两条 SECURITY 类型的日志
      expect(logs[0].action).toBe('login');
      expect(logs[1].action).toBe('access');
    });

    it('应该按级别筛选日志', () => {
      const logs = auditLogManager.getLogsByLevel(AuditLogLevels.ERROR);
      expect(logs).toHaveLength(1);
      expect(logs[0].action).toBe('error');
    });

    it('应该按时间范围筛选日志', () => {
      const now = Date.now();
      const logs = auditLogManager.getLogs(now - 1000, now + 1000);
      expect(logs).toHaveLength(3);
    });
  });

  describe('错误处理测试', () => {
    it('应该处理API调用失败', async () => {
      // Mock fetch to simulate API failure
      global.fetch = vi.fn().mockRejectedValue(new Error('API Error'));

      const testLog = {
        type: AuditLogType.SYSTEM,
        level: AuditLogLevels.ERROR,
        action: 'test-error',
        resource: 'test-resource',
        details: { test: 'data' },
      };

      await auditLogManager.log(
        testLog.type,
        testLog.level,
        testLog.action,
        testLog.resource,
        testLog.details
      );

      // 验证日志是否被保存到本地存储
      const storedLogs = localStorage.getItem('failedAuditLogs');
      expect(storedLogs).toBeTruthy();
      const parsedLogs = JSON.parse(storedLogs || '[]');
      expect(parsedLogs).toHaveLength(1);
    });

    it('应该触发严重级别的告警', async () => {
      const criticalLog = {
        type: AuditLogType.SECURITY,
        level: AuditLogLevels.CRITICAL,
        action: 'security-breach',
        resource: 'system',
        details: { severity: 'high' },
      };

      await auditLogManager.log(
        criticalLog.type,
        criticalLog.level,
        criticalLog.action,
        criticalLog.resource,
        criticalLog.details
      );

      // 验证是否触发了告警
      expect(mockErrorLogger.log).toHaveBeenCalled();
    });

    it('应该处理localStorage存储失败', async () => {
      // Mock localStorage.setItem to throw error
      const mockSetItem = vi.spyOn(Storage.prototype, 'setItem');
      mockSetItem.mockImplementation(() => {
        throw new Error('Storage Error');
      });

      const testLog = {
        type: AuditLogType.SYSTEM,
        level: AuditLogLevels.ERROR,
        action: 'test-error',
        resource: 'test-resource',
        details: { test: 'data' },
      };

      await auditLogManager.log(
        testLog.type,
        testLog.level,
        testLog.action,
        testLog.resource,
        testLog.details
      );

      // 验证错误是否被正确处理
      expect(mockErrorLogger.log).toHaveBeenCalled();

      // 清理 mock
      mockSetItem.mockRestore();
    });
  });

  test('应该维护单例实例', () => {
    const instance1 = AuditLogManager.getInstance();
    const instance2 = AuditLogManager.getInstance();
    expect(instance1).toBe(instance2);
  });
});
