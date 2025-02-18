import { vi, beforeEach, afterEach, describe, test, expect } from 'vitest';

import { errorLogger } from '../../../utils/error/errorLogger';
import { UserAnalytics, UserEventType } from '../UserAnalytics';

// Mock fetch
const fetchMock = vi.fn();
global.fetch = fetchMock;

// Mock errorLogger
vi.mock('../../../utils/error/errorLogger', () => ({
  errorLogger: {
    log: vi.fn(),
  },
}));

describe('UserAnalytics', () => {
  let analytics: UserAnalytics;
  let dateNowMock: ReturnType<typeof vi.fn<[], number>>;

  beforeAll(() => {
    // 模拟 Date.now
    dateNowMock = vi.fn(() => 1000);
    vi.spyOn(Date, 'now').mockImplementation(() => 1000);

    // 模拟 document 属性
    Object.defineProperty(document, 'title', {
      value: 'Test Page',
      writable: true,
    });
    Object.defineProperty(document, 'referrer', {
      value: 'http://referrer.com',
      writable: true,
    });

    // 模拟 window.location
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/test-path',
      },
      writable: true,
    });
  });

  beforeEach(() => {
    // 重置实例
    UserAnalytics.resetInstance();
    // 创建新实例
    analytics = UserAnalytics.getInstance({
      endpoint: '/test-api/analytics',
      batchSize: 2,
      flushInterval: 1000,
      sampleRate: 1.0,
    });
    // 重置所有 mock
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));
    dateNowMock.mockReset();
    dateNowMock.mockReturnValue(1000);
  });

  afterEach(() => {
    UserAnalytics.resetInstance();
    vi.clearAllMocks();
  });

  describe('实例管理', () => {
    test('应该维护单例实例', () => {
      const instance1 = UserAnalytics.getInstance();
      const instance2 = UserAnalytics.getInstance();
      expect(instance1).toBe(instance2);
    });

    test('应该能更新实例配置', () => {
      const instance = UserAnalytics.getInstance();
      instance.updateConfig({ endpoint: '/new-endpoint' });

      // 触发事件并刷新以验证新配置
      instance.trackCustomEvent('test', {});
      return instance.flush().then(() => {
        const result = expect(fetchMock).toHaveBeenCalledWith('/new-endpoint', expect.any(Object));
        return result;
      });
    });
  });

  describe('用户标识', () => {
    test('应该能设置用户ID', () => {
      analytics.setUserId('test-user');
      analytics.trackCustomEvent('test', {});

      const events = analytics.getEvents();
      expect(events[0].userId).toBe('test-user');
    });

    test('会话ID应该保持一致', () => {
      analytics.trackCustomEvent('test1', {});
      analytics.trackCustomEvent('test2', {});

      const events = analytics.getEvents();
      expect(events[0].sessionId).toBe(events[1].sessionId);
    });
  });

  describe('事件跟踪', () => {
    test('应该正确跟踪页面访问', () => {
      analytics.trackPageView('/test-page', 'Test Title');

      const events = analytics.getEvents();
      expect(events[0]).toMatchObject({
        type: UserEventType.PAGE_VIEW,
        data: {
          path: '/test-page',
          title: 'Test Title',
          referrer: 'http://referrer.com',
        },
      });
    });

    test('应该正确跟踪点击事件', () => {
      analytics.trackClick('test-button', 'button');

      const events = analytics.getEvents();
      expect(events[0]).toMatchObject({
        type: UserEventType.CLICK,
        data: {
          elementId: 'test-button',
          elementType: 'button',
          path: '/test-path',
        },
      });
    });

    test('应该正确跟踪表单提交', () => {
      analytics.trackFormSubmit('login-form', true);

      const events = analytics.getEvents();
      expect(events[0]).toMatchObject({
        type: UserEventType.FORM_SUBMIT,
        data: {
          formId: 'login-form',
          success: true,
          path: '/test-path',
        },
      });
    });

    test('应该正确跟踪错误', () => {
      const error = new Error('Test Error');
      const context = { additionalInfo: 'test' };

      analytics.trackError(error, context);

      const events = analytics.getEvents();
      expect(events[0]).toMatchObject({
        type: UserEventType.ERROR,
        data: {
          name: 'Error',
          message: 'Test Error',
          context,
        },
      });
    });

    test('应该正确跟踪自定义事件', () => {
      analytics.trackCustomEvent('test-event', { value: 123 });

      const events = analytics.getEvents();
      expect(events[0]).toMatchObject({
        type: UserEventType.CUSTOM,
        data: {
          name: 'test-event',
          value: 123,
        },
      });
    });
  });

  describe('事件处理', () => {
    test('应该根据采样率过滤事件', () => {
      analytics.updateConfig({ sampleRate: 0 });
      analytics.trackCustomEvent('test', {});

      expect(analytics.getEvents()).toHaveLength(0);
    });

    test('应该支持事件前置处理', () => {
      analytics.updateConfig({
        beforeTrack: event => {
          if (event.type === UserEventType.CUSTOM) {
            return false;
          }
          return event;
        },
      });

      analytics.trackCustomEvent('test', {});
      analytics.trackPageView('/test');

      const events = analytics.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe(UserEventType.PAGE_VIEW);
    });

    test('应该批量处理事件', async () => {
      // 第一批次测试
      analytics.trackCustomEvent('event1', {});
      analytics.trackCustomEvent('event2', {});
      
      await analytics.flush();
      
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const firstCall = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(firstCall).toHaveLength(2);
      expect(firstCall[0].data.name).toBe('event1');
      expect(firstCall[1].data.name).toBe('event2');

      // 第二批次测试
      fetchMock.mockClear();
      analytics.trackCustomEvent('event3', {});
      
      await analytics.flush();
      
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const secondCall = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(secondCall).toHaveLength(1);
      expect(secondCall[0].data.name).toBe('event3');
    });
  });

  describe('错误处理', () => {
    beforeEach(() => {
      // 重置 fetchMock 以确保每个测试用例都有干净的环境
      fetchMock.mockReset();
      vi.clearAllMocks();
    });

    it('应该在网络错误时将事件返回队列', async () => {
      // 设置 mock 在第一次调用时抛出网络错误
      fetchMock.mockRejectedValueOnce(new Error('Network error'));
      
      const analytics = UserAnalytics.getInstance();
      analytics.trackCustomEvent('test', { value: 1 });
      
      await analytics.flush();
      
      // 验证事件被返回到队列
      expect(analytics.getEvents()).toHaveLength(1);
      // 验证 fetch 只被调用一次
      expect(fetchMock).toHaveBeenCalledTimes(1);
      // 验证错误被正确记录
      expect(errorLogger.log).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          level: 'error',
          context: expect.any(Object)
        })
      );
    });

    it('应该在服务器错误响应时将事件返回队列', async () => {
      // 设置 mock 返回 500 错误响应
      fetchMock.mockResolvedValueOnce(new Response(null, { status: 500 }));
      
      const analytics = UserAnalytics.getInstance();
      analytics.trackCustomEvent('test', { value: 1 });
      
      await analytics.flush();
      
      // 验证事件被返回到队列
      expect(analytics.getEvents()).toHaveLength(1);
      // 验证 fetch 只被调用一次
      expect(fetchMock).toHaveBeenCalledTimes(1);
      // 验证错误被正确记录
      expect(errorLogger.log).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          level: 'error',
          context: expect.any(Object)
        })
      );
    });

    it('应该在批处理错误时停止处理后续批次', async () => {
      // 设置 mock 在第一次调用时返回错误
      fetchMock.mockResolvedValueOnce(new Response(null, { status: 500 }));
      
      const analytics = UserAnalytics.getInstance();
      // 添加多个事件以触发批处理
      analytics.trackCustomEvent('test1', { value: 1 });
      analytics.trackCustomEvent('test2', { value: 2 });
      analytics.trackCustomEvent('test3', { value: 3 });
      
      await analytics.flush();
      
      // 验证所有事件都在队列中
      expect(analytics.getEvents()).toHaveLength(3);
      // 验证 fetch 只被调用一次（第一个批次失败后停止）
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('队列管理', () => {
    test('应该正确清除事件', () => {
      analytics.trackCustomEvent('test1', {});
      analytics.trackCustomEvent('test2', {});
      expect(analytics.getEvents()).toHaveLength(2);

      analytics.clearEvents();
      expect(analytics.getEvents()).toHaveLength(0);
    });

    test('应该正确停止跟踪', () => {
      analytics.stopTracking();
      analytics.trackCustomEvent('test', {});

      expect(analytics.getEvents()).toHaveLength(1);
      // 验证定时器被清除
      expect((analytics as any).flushTimer).toBeNull();
    });
  });
});
