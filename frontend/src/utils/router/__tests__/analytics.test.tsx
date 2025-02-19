import { renderHook } from '@testing-library/react';
import { type FC, type ReactNode } from 'react';
import { useLocation, useNavigationType, MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import type { NavigationType } from 'react-router-dom';

import { errorLogger } from '../../error/errorLogger';
import { routerAnalytics, useRouteAnalytics } from '../analytics';

// Mock hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: vi.fn(),
    useNavigationType: vi.fn(),
  };
});

// Mock error logger
vi.mock('../../error/errorLogger', () => ({
  errorLogger: {
    log: vi.fn(),
  },
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('RouterAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true });
    vi.mocked(useLocation).mockReturnValue({
      pathname: '/test',
      search: '',
      hash: '',
      state: null,
      key: 'default',
    });
    vi.mocked(useNavigationType).mockReturnValue('PUSH' as NavigationType);
    routerAnalytics.clearAnalytics(); // 确保每个测试前清空状态
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('基础功能', () => {
    it('应该是单例模式', () => {
      const analytics1 = routerAnalytics;
      const analytics2 = routerAnalytics;
      expect(analytics1).toBe(analytics2);
    });

    it('应该正确跟踪路由变化', () => {
      routerAnalytics.trackRoute('/home', 'PUSH' as NavigationType);
      const analytics = routerAnalytics.getAnalytics();

      expect(analytics).toHaveLength(1);
      expect(analytics[0]).toMatchObject({
        path: '/home',
        navigationType: 'PUSH',
      });
    });

    it('应该记录路由停留时间', () => {
      const now = Date.now();
      vi.useFakeTimers();
      vi.setSystemTime(now);

      routerAnalytics.trackRoute('/page1', 'PUSH' as NavigationType);
      vi.advanceTimersByTime(1000); // 前进1000ms
      routerAnalytics.trackRoute('/page2', 'PUSH' as NavigationType);

      const analytics = routerAnalytics.getAnalytics();
      expect(analytics[1].duration).toBe(1000);

      vi.useRealTimers();
    });

    it('应该记录前一个路由', () => {
      routerAnalytics.trackRoute('/first', 'PUSH' as NavigationType);
      routerAnalytics.trackRoute('/second', 'PUSH' as NavigationType);

      const analytics = routerAnalytics.getAnalytics();
      expect(analytics[1].previousPath).toBe('/first');
    });
  });

  describe('数据上报', () => {
    it('应该成功上报分析数据', async () => {
      const now = Date.now();
      vi.useFakeTimers();
      vi.setSystemTime(now);

      await routerAnalytics.trackRoute('/test', 'PUSH' as NavigationType);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/analytics\/route$/),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: '/test',
            timestamp: now,
            navigationType: 'PUSH',
          }),
        })
      );

      vi.useRealTimers();
    });

    it('应该处理上报失败的情况', async () => {
      // Mock fetch to reject
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      // 直接调用 trackRoute，不需要 try-catch
      await routerAnalytics.trackRoute('/test', 'PUSH' as NavigationType).catch(() => {
        /* 忽略预期的错误 */
      });

      // 验证错误日志
      expect(errorLogger.log).toHaveBeenCalledWith(expect.any(Error), {
        level: 'error',
        context: {
          route: '/test',
          timestamp: expect.any(Number),
        },
      });
    });
  });

  describe('Hook 使用', () => {
    const Wrapper: FC<{ children: ReactNode }> = ({ children }) => (
      <MemoryRouter>{children}</MemoryRouter>
    );

    it('应该在路由变化时跟踪', () => {
      const { rerender } = renderHook(() => useRouteAnalytics(), { wrapper: Wrapper });

      vi.mocked(useLocation).mockReturnValue({
        pathname: '/new-path',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      });

      rerender();

      const analytics = routerAnalytics.getAnalytics();
      expect(analytics[analytics.length - 1].path).toBe('/new-path');
    });

    it('应该在导航类型变化时跟踪', () => {
      const { rerender } = renderHook(() => useRouteAnalytics(), { wrapper: Wrapper });

      vi.mocked(useNavigationType).mockReturnValue('REPLACE' as NavigationType);

      rerender();

      const analytics = routerAnalytics.getAnalytics();
      expect(analytics[analytics.length - 1].navigationType).toBe('REPLACE');
    });
  });
});
