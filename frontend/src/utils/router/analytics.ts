import { errorLogger } from '@/utils/error/errorLogger';
import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

// 获取基础 URL
const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'test') {
    return 'http://localhost:3000';
  }
  return process.env.VITE_API_URL || '';
};

interface RouteAnalytics {
  path: string;
  timestamp: number;
  navigationType: string;
  previousPath?: string;
  duration?: number;
}

class RouterAnalytics {
  private static instance: RouterAnalytics;
  private analytics: RouteAnalytics[] = [];
  private lastPath: string | null = null;
  private lastTimestamp: number | null = null;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = getBaseUrl();
  }

  static getInstance(): RouterAnalytics {
    if (!RouterAnalytics.instance) {
      RouterAnalytics.instance = new RouterAnalytics();
    }
    return RouterAnalytics.instance;
  }

  async trackRoute(path: string, navigationType: string): Promise<void> {
    const timestamp = Date.now();
    const analytics: RouteAnalytics = {
      path,
      timestamp,
      navigationType,
      previousPath: this.lastPath || undefined,
    };

    if (this.lastPath && this.lastTimestamp) {
      analytics.duration = timestamp - this.lastTimestamp;
    }

    this.analytics.push(analytics);
    this.lastPath = path;
    this.lastTimestamp = timestamp;

    // 可以在这里添加上报逻辑
    await this.reportAnalytics(analytics);
  }

  private async reportAnalytics(analytics: RouteAnalytics): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/analytics/route`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analytics),
      });
      
      if (!response.ok) {
        throw new Error('Failed to report analytics');
      }
    } catch (error) {
      errorLogger.log(
        error instanceof Error ? error : new Error('Failed to report analytics'),
        {
          level: 'error',
          context: {
            route: analytics.path,
            timestamp: analytics.timestamp
          }
        }
      );
      throw error; // 重新抛出错误以便测试捕获
    }
  }

  getAnalytics(): RouteAnalytics[] {
    return this.analytics;
  }

  // 添加清除方法，主要用于测试
  clearAnalytics(): void {
    this.analytics = [];
    this.lastPath = null;
    this.lastTimestamp = null;
  }
}

export const routerAnalytics = RouterAnalytics.getInstance();

export const useRouteAnalytics = (): void => {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    routerAnalytics.trackRoute(location.pathname, navigationType)
      .catch(error => {
        // 在这里我们可以选择忽略错误，因为它已经被 reportAnalytics 中的 errorLogger 记录了
        console.debug('Route analytics tracking failed:', error);
      });
  }, [location, navigationType]);
}; 