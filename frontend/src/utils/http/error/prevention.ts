import { AxiosRequestConfig } from 'axios';
import { HttpErrorType } from './types';

interface PreventionRule {
  check: () => boolean | Promise<boolean>;
  errorType: HttpErrorType;
  message: string;
}

export class ErrorPreventionManager {
  private static instance: ErrorPreventionManager;
  private rules: PreventionRule[] = [];

  private constructor() {
    // 添加默认预防规则
    this.addRule({
      check: () => navigator.onLine,
      errorType: HttpErrorType.NETWORK,
      message: '当前处于离线状态，请检查网络连接'
    });

    this.addRule({
      check: () => {
        const token = localStorage.getItem('token');
        return !!token;
      },
      errorType: HttpErrorType.AUTH,
      message: '未登录或登录已过期'
    });
  }

  static getInstance(): ErrorPreventionManager {
    if (!ErrorPreventionManager.instance) {
      ErrorPreventionManager.instance = new ErrorPreventionManager();
    }
    return ErrorPreventionManager.instance;
  }

  addRule(rule: PreventionRule): void {
    this.rules.push(rule);
  }

  async checkRules(config?: AxiosRequestConfig): Promise<void> {
    for (const rule of this.rules) {
      const result = await Promise.resolve(rule.check());
      if (!result) {
        const error = new Error(rule.message);
        error.name = rule.errorType;
        throw error;
      }
    }
  }
}

// 请求验证器
export class RequestValidator {
  static validateRequest(config: AxiosRequestConfig): void {
    // 验证请求 URL
    if (!config.url) {
      throw new Error('请求 URL 不能为空');
    }

    // 验证请求方法
    if (!config.method) {
      throw new Error('请求方法不能为空');
    }

    // 验证请求数据
    if (config.method.toLowerCase() !== 'get' && config.data) {
      this.validateRequestData(config.data);
    }
  }

  private static validateRequestData(data: unknown): void {
    // 检查数据大小
    const dataSize = new Blob([JSON.stringify(data)]).size;
    if (dataSize > 5 * 1024 * 1024) { // 5MB
      throw new Error('请求数据过大');
    }

    // 检查数据类型
    if (typeof data === 'object' && data !== null) {
      this.validateObjectData(data as Record<string, unknown>);
    }
  }

  private static validateObjectData(data: Record<string, unknown>): void {
    // 检查敏感字段
    const sensitiveFields = ['password', 'token', 'secret'];
    for (const field of sensitiveFields) {
      if (field in data) {
        // 确保敏感数据不会以明文形式发送
        if (typeof data[field] === 'string' && !this.isHashed(data[field] as string)) {
          throw new Error(`敏感字段 ${field} 必须加密后传输`);
        }
      }
    }
  }

  private static isHashed(value: string): boolean {
    // 简单的哈希检查（可以根据实际需求调整）
    return /^[a-f0-9]{32,}$/i.test(value);
  }
}

// 缓存管理器
export class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private readonly maxAge: number = 5 * 60 * 1000; // 5分钟

  private constructor() {}

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  set(key: string, data: unknown): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get(key: string): unknown | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear(): void {
    this.cache.clear();
  }

  getCacheKey(config: AxiosRequestConfig): string {
    return `${config.method}-${config.url}-${JSON.stringify(config.params)}`;
  }
}

export const errorPreventionManager = ErrorPreventionManager.getInstance();
export const cacheManager = CacheManager.getInstance(); 