import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RouterAnalytics } from '../RouterAnalytics';

describe('RouterAnalytics', () => {
  let routerAnalytics: RouterAnalytics;

  beforeEach(() => {
    vi.clearAllMocks();
    routerAnalytics = RouterAnalytics.getInstance();
    routerAnalytics.clearAnalytics();
  });

  describe('路由跟踪', () => {
    it('should track route changes', () => {
      routerAnalytics.trackRoute('/home', 'push');
      const analytics = routerAnalytics.getAnalytics();
      
      expect(analytics).toContainEqual(expect.objectContaining({
        path: '/home',
        navigationType: 'push',
        timestamp: expect.any(Number)
      }));
    });
  });

  // ... rest of the test cases ...
}); 