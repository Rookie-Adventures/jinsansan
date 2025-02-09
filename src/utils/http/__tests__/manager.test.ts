import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestManager } from '../manager';
import type { HttpRequestConfig } from '../types';

describe('缓存管理', () => {
  it('应该生成正确的缓存键', () => {
    const config: HttpRequestConfig = {
      url: '/test',
      method: 'GET',
      params: { id: 1 },
      cache: { enable: true, ttl: 1000 }
    };

    const key = requestManager.generateCacheKey(config);
    expect(key).toBe(`GET-/test-${JSON.stringify(config.params)}-undefined`);
  });
});

describe('队列管理', () => {
  beforeEach(() => {
    requestManager.setMaxConcurrentRequests(2);
  });

  it('应该正确添加请求到队列', async () => {
    const config: HttpRequestConfig = {
      url: '/test',
      method: 'GET',
      queue: { enable: true, priority: 1 }
    };

    const result = await new Promise((resolve) => {
      requestManager.addToQueue(config, () => resolve({ success: true }));
    });

    expect(result).toEqual({ success: true });
  });

  it('应该按优先级处理队列请求', async () => {
    const results: number[] = [];
    const configs = [
      { url: '/test1', queue: { enable: true, priority: 2 } },
      { url: '/test2', queue: { enable: true, priority: 1 } },
      { url: '/test3', queue: { enable: true, priority: 3 } }
    ] as HttpRequestConfig[];

    await Promise.all(configs.map((config, index) => 
      new Promise<void>((resolve) => {
        requestManager.addToQueue(
          config,
          () => {
            results.push(index);
            resolve();
          }
        );
      })
    ));

    expect(results).toEqual([2, 0, 1]);
  });
}); 