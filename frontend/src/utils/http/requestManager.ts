class RequestManager {
  private static instance: RequestManager;
  public cache: Map<string, { data: any; expiry: number }>;

  private constructor() {
    this.cache = new Map();
  }

  public static getInstance(): RequestManager {
    if (!RequestManager.instance) {
      RequestManager.instance = new RequestManager();
    }
    return RequestManager.instance;
  }

  public getCacheData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }
    return cached.data;
  }

  public setCacheData<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl,
    });
  }

  public generateCacheKey(config: Record<string, unknown>): string {
    return JSON.stringify(config);
  }
}

export const requestManager = RequestManager.getInstance();
