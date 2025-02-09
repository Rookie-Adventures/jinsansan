/**
 * @jest-environment jsdom
 */
import { errorLogger } from '@/utils/error/errorLogger';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { AuditLogLevel, auditLogManager, AuditLogType } from '../audit';

// Mock errorLogger
vi.mock('@/utils/error/errorLogger', () => ({
  errorLogger: {
    log: vi.fn()
  }
}));

describe('AuditLogManager', () => {
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
    
    // 清理日志
    auditLogManager['logs'] = [];
    
    // Mock fetch 成功响应
    global.fetch = mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    } as Response);
    
    // 清理 errorLogger 的 mock
    mockErrorLogger.log.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
    // 不要恢复所有 mock，只恢复 localStorage
    global.localStorage = originalLocalStorage;
  });

  describe('日志记录测试', () => {
    test('应该正确记录审计日志', async () => {
      const testLog = {
        type: AuditLogType.AUTH,
        level: AuditLogLevel.INFO,
        action: 'test-action',
        resource: 'test-resource',
        details: { key: 'value' }
      };

      await auditLogManager.log(
        testLog.type,
        testLog.level,
        testLog.action,
        testLog.resource,
        testLog.details
      );

      // 验证内存中的日志
      const logs = auditLogManager.getLogs(0, Date.now());
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        type: testLog.type,
        level: testLog.level,
        action: testLog.action,
        resource: testLog.resource,
        details: testLog.details,
        timestamp: baseTime,
        status: 'success'
      });

      // 验证API调用
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/audit-logs',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });

    test('应该限制内存中的日志数量', async () => {
      const maxLogs = 1000;
      const totalLogs = maxLogs + 100;

      // 添加超过限制的日志
      for (let i = 0; i < totalLogs; i++) {
        vi.setSystemTime(baseTime + i * 1000); // 每条日志间隔1秒
        await auditLogManager.log(
          AuditLogType.SYSTEM,
          AuditLogLevel.INFO,
          'action',
          'resource',
          {}
        );
      }

      const logs = auditLogManager.getLogs(0, Date.now());
      expect(logs).toHaveLength(maxLogs);
      
      // 验证保留的是最新的日志
      const timestamps = logs.map(log => log.timestamp);
      expect(Math.min(...timestamps)).toBeGreaterThan(baseTime + (totalLogs - maxLogs - 1) * 1000);
    });
  });

  describe('日志查询测试', () => {
    beforeEach(async () => {
      // 添加测试日志
      const testLogs = [
        {
          type: AuditLogType.AUTH,
          level: AuditLogLevel.INFO,
          action: 'login',
          resource: 'user',
          details: {},
          timestamp: baseTime
        },
        {
          type: AuditLogType.SECURITY,
          level: AuditLogLevel.WARN,
          action: 'failed-login',
          resource: 'user',
          details: {},
          timestamp: baseTime + 1000
        },
        {
          type: AuditLogType.SYSTEM,
          level: AuditLogLevel.ERROR,
          action: 'system-error',
          resource: 'server',
          details: {},
          timestamp: baseTime + 2000
        }
      ];

      for (const log of testLogs) {
        vi.setSystemTime(log.timestamp);
        await auditLogManager.log(
          log.type,
          log.level,
          log.action,
          log.resource,
          log.details
        );
      }
    });

    test('应该按类型筛选日志', () => {
      const authLogs = auditLogManager.getLogsByType(AuditLogType.AUTH);
      expect(authLogs).toHaveLength(1);
      expect(authLogs[0]).toMatchObject({
        type: AuditLogType.AUTH,
        action: 'login'
      });
    });

    test('应该按级别筛选日志', () => {
      const errorLogs = auditLogManager.getLogsByLevel(AuditLogLevel.ERROR);
      expect(errorLogs).toHaveLength(1);
      expect(errorLogs[0]).toMatchObject({
        level: AuditLogLevel.ERROR,
        action: 'system-error'
      });
    });

    test('应该按时间范围筛选日志', () => {
      const startTime = baseTime + 500;  // 第一条之后，第二条之前
      const endTime = baseTime + 1500;   // 第二条之后，第三条之前
      
      const logs = auditLogManager.getLogs(startTime, endTime);
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        action: 'failed-login',
        timestamp: baseTime + 1000
      });
    });
  });

  describe('错误处理测试', () => {
    it('应该处理API调用失败', async () => {
      // 模拟网络错误
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      const testLog = {
        type: AuditLogType.SYSTEM,
        level: AuditLogLevel.ERROR,
        action: 'test-error',
        resource: 'test-resource',
        details: {},
        status: 'failure'
      };

      // 执行测试
      await auditLogManager.log(
        testLog.type,
        testLog.level,
        testLog.action,
        testLog.resource,
        testLog.details
      );

      // 等待异步操作完成
      await vi.runAllTimersAsync();

      // 验证错误被正确记录
      expect(mockErrorLogger.log).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          context: expect.objectContaining({
            action: 'test-error',
            level: 'error',
            resource: 'test-resource',
            source: 'AuditLogger'
          }),
          level: 'error',
        })
      );
    });

    it('应该触发严重级别的告警', async () => {
      const criticalLog = {
        type: AuditLogType.SECURITY,
        level: AuditLogLevel.CRITICAL,
        action: 'security-breach',
        resource: 'system',
        details: { severity: 'high' }
      };

      await auditLogManager.log(
        criticalLog.type,
        criticalLog.level,
        criticalLog.action,
        criticalLog.resource,
        criticalLog.details
      );

      // 等待异步操作完成
      await vi.runAllTimersAsync();

      // 验证严重告警被正确记录
      expect(mockErrorLogger.log).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          context: expect.objectContaining({
            action: 'security-breach',
            details: { severity: 'high' },
            level: 'critical',
            resource: 'system',
            type: 'security',
            status: 'success',
            timestamp: expect.any(String)
          }),
          level: 'error'
        })
      );
    });

    it('应该处理localStorage存储失败', async () => {
      // 模拟 localStorage.setItem 抛出错误
      const mockSetItem = vi.fn().mockImplementation(() => {
        throw new Error('Storage error');
      });
      (global.localStorage as any).setItem = mockSetItem;

      // 模拟 API 调用失败
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const testLog = {
        type: AuditLogType.SYSTEM,
        level: AuditLogLevel.ERROR,
        action: 'test-error',
        resource: 'test-resource',
        details: {}
      };

      await auditLogManager.log(
        testLog.type,
        testLog.level,
        testLog.action,
        testLog.resource,
        testLog.details
      );

      // 等待异步操作完成
      await vi.runAllTimersAsync();

      // 验证错误被正确记录
      expect(mockErrorLogger.log).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          context: expect.objectContaining({
            action: 'test-error',
            level: 'error',
            resource: 'test-resource',
            source: 'AuditLogger'
          }),
          level: 'error',
        })
      );
    });
  });

  test('应该维护单例实例', () => {
    const instance1 = auditLogManager;
    const instance2 = auditLogManager;
    expect(instance1).toBe(instance2);
  });
}); 