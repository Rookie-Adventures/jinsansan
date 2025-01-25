import { beforeEach, describe, expect, test, vi } from 'vitest';
import { HttpErrorType } from '../error/types';
import { HttpRequestManager } from '../manager';

describe('HttpRequestManager Tests', () => {
  let manager: HttpRequestManager;

  beforeEach(() => {
    vi.useFakeTimers();
    const manager1 = HttpRequestManager.getInstance();
    Object.defineProperty(manager1, 'maxConcurrentRequests', {
      writable: true,
      value: 3
    });
    manager = manager1;
    manager.clearPendingRequests();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('请求管理', () => {
    test('应该添加和移除待处理请求', () => {
      const requestId = '123';
      const config = {
        method: 'GET',
        url: '/test'
      };

      manager.addPendingRequest(requestId, config);
      expect(manager.hasPendingRequest(requestId)).toBe(true);

      manager.removePendingRequest(requestId);
      expect(manager.hasPendingRequest(requestId)).toBe(false);
    });

    test('应该取消重复请求', () => {
      const requestId = '123';
      const config = {
        method: 'GET',
        url: '/test'
      };

      const cancelFn = vi.fn();
      manager.addPendingRequest(requestId, config, cancelFn);

      manager.cancelDuplicateRequest(requestId);
      expect(cancelFn).toHaveBeenCalled();
      expect(manager.hasPendingRequest(requestId)).toBe(false);
    });
  });

  describe('请求限流', () => {
    beforeEach(() => {
      manager.setMaxConcurrentRequests(2);
      (manager as any).currentRequests.clear();
    });

    test('应该限制并发请求数', async () => {
      const requestId1 = 'req1';
      const requestId2 = 'req2';
      const requestId3 = 'req3';

      // 使用 Promise.all 确保并发执行
      const [slot1, slot2] = await Promise.all([
        manager.acquireRequestSlot(requestId1, {}),
        manager.acquireRequestSlot(requestId2, {})
      ]);

      // 尝试获取第三个槽位，应该被拒绝
      const slot3 = await manager.acquireRequestSlot(requestId3, {});

      expect(slot1).toBe(true);
      expect(slot2).toBe(true);
      expect(slot3).toBe(false);

      // 清理
      manager.releaseRequestSlot(requestId1);
      manager.releaseRequestSlot(requestId2);
    }, 5000); // 设置更合理的超时时间

    test('应该在请求完成后释放槽位', async () => {
      const requestId1 = 'req1';
      const requestId2 = 'req2';
      
      // 获取第一个槽位
      const slot1 = await manager.acquireRequestSlot(requestId1, {});
      expect(slot1).toBe(true);
      
      // 释放第一个槽位
      manager.releaseRequestSlot(requestId1);
      
      // 尝试获取新的槽位
      const slot2 = await manager.acquireRequestSlot(requestId2, {});
      expect(slot2).toBe(true);

      // 清理
      manager.releaseRequestSlot(requestId2);
    });
  });

  describe('错误处理', () => {
    test('应该记录请求错误', () => {
      const error = {
        type: HttpErrorType.NETWORK,
        message: 'Network error',
        status: 0
      };

      manager.recordError(error);
      const errorStats = manager.getErrorStats();

      expect(errorStats[HttpErrorType.NETWORK]).toBe(1);
    });

    test('应该重置错误统计', () => {
      const error = {
        type: HttpErrorType.NETWORK,
        message: 'Network error',
        status: 0
      };

      manager.recordError(error);
      manager.resetErrorStats();

      const errorStats = manager.getErrorStats();
      expect(errorStats[HttpErrorType.NETWORK]).toBe(0);
    });
  });

  describe('性能监控', () => {
    beforeEach(() => {
      manager.resetPerformanceStats();
    });

    test('应该记录请求时间', async () => {
      const requestId = '123';
      
      manager.recordRequestStart(requestId);
      
      // 使用真实的定时器来等待
      vi.useRealTimers();
      await new Promise(resolve => setTimeout(resolve, 150));
      
      manager.recordRequestEnd(requestId);
      manager.recordRequestComplete(true);
      
      const stats = manager.getPerformanceStats();
      expect(stats.averageResponseTime).toBeGreaterThanOrEqual(100);
      expect(stats.totalRequests).toBe(1);
      expect(stats.successfulRequests).toBe(1);
      
      // 恢复使用假定时器
      vi.useFakeTimers();
    });

    test('应该计算成功率', () => {
      manager.recordRequestComplete(true);  // 成功
      manager.recordRequestComplete(true);  // 成功
      manager.recordRequestComplete(false); // 失败

      const stats = manager.getPerformanceStats();
      expect(stats.successRate).toBeCloseTo(2/3);
      expect(stats.totalRequests).toBe(3);
      expect(stats.successfulRequests).toBe(2);
      expect(stats.failedRequests).toBe(1);
    });
  });
}); 