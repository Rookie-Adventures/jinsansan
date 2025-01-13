import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

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

  private constructor() {}

  static getInstance(): RouterAnalytics {
    if (!RouterAnalytics.instance) {
      RouterAnalytics.instance = new RouterAnalytics();
    }
    return RouterAnalytics.instance;
  }

  trackRoute(path: string, navigationType: string): void {
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
    this.reportAnalytics(analytics);
  }

  private async reportAnalytics(analytics: RouteAnalytics): Promise<void> {
    try {
      await fetch('/api/analytics/route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analytics),
      });
    } catch (error) {
      console.error('Failed to report route analytics:', error);
    }
  }

  getAnalytics(): RouteAnalytics[] {
    return this.analytics;
  }
}

export const routerAnalytics = RouterAnalytics.getInstance();

export const useRouteAnalytics = (): void => {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    routerAnalytics.trackRoute(location.pathname, navigationType);
  }, [location, navigationType]);
}; 