import { retry } from '../retry';
import { HttpError, HttpErrorType } from './types';

interface RecoveryStrategy {
  shouldAttemptRecovery: (error: HttpError) => boolean;
  recover: (error: HttpError) => Promise<void>;
  maxAttempts?: number;
}

const defaultStrategies: Record<HttpErrorType, RecoveryStrategy> = {
  [HttpErrorType.NETWORK]: {
    shouldAttemptRecovery: (error) => error.recoverable !== false && (error.retryCount || 0) < 3,
    recover: async (error) => {
      // 网络错误恢复策略：重试请求
      await new Promise(resolve => setTimeout(resolve, 1000 * (error.retryCount || 1)));
      return Promise.resolve();
    },
    maxAttempts: 3
  },
  [HttpErrorType.TIMEOUT]: {
    shouldAttemptRecovery: (error) => error.recoverable !== false && (error.retryCount || 0) < 2,
    recover: async (error) => {
      // 超时错误恢复策略：增加超时时间重试
      await new Promise(resolve => setTimeout(resolve, 2000));
      return Promise.resolve();
    },
    maxAttempts: 2
  },
  [HttpErrorType.AUTH]: {
    shouldAttemptRecovery: (error) => error.status === 401 && error.recoverable !== false,
    recover: async () => {
      // 认证错误恢复策略：刷新 token
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      try {
        // 实现 token 刷新逻辑
        // await refreshTokenApi(refreshToken);
        // 如果刷新成功，不需要做任何事情
      } catch (error) {
        // 如果刷新失败，清除认证信息并跳转到登录页
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        throw error; // 重新抛出错误，让上层知道恢复失败
      }
    },
    maxAttempts: 1
  },
  [HttpErrorType.SERVER]: {
    shouldAttemptRecovery: (error) => error.status !== 500 && error.recoverable !== false && (error.retryCount || 0) < 2,
    recover: async (error) => {
      // 服务器错误恢复策略：对于非 500 错误尝试重试
      await new Promise(resolve => setTimeout(resolve, 1500));
      throw error;
    },
    maxAttempts: 2
  },
  [HttpErrorType.CLIENT]: {
    shouldAttemptRecovery: () => false, // 客户端错误通常不需要恢复
    recover: async () => {
      // 不执行恢复
    }
  },
  [HttpErrorType.CANCEL]: {
    shouldAttemptRecovery: () => false, // 取消的请求不需要恢复
    recover: async () => {
      // 不执行恢复
    }
  },
  [HttpErrorType.UNKNOWN]: {
    shouldAttemptRecovery: () => false,
    recover: async () => {
      // 未知错误不尝试恢复
    }
  },
  [HttpErrorType.REACT_ERROR]: {
    shouldAttemptRecovery: () => false,
    recover: async () => {
      // React 错误通常需要用户刷新页面
    }
  },
  [HttpErrorType.VALIDATION]: {
    shouldAttemptRecovery: () => false,
    recover: async () => {
      // 验证错误需要用户修正输入
    }
  },
  [HttpErrorType.BUSINESS]: {
    shouldAttemptRecovery: () => false,
    recover: async () => {
      // 业务错误通常需要用户采取特定操作
    }
  }
};

export class ErrorRecoveryManager {
  private static instance: ErrorRecoveryManager;
  private strategies: Record<HttpErrorType, RecoveryStrategy>;

  private constructor() {
    this.strategies = defaultStrategies;
  }

  static getInstance(): ErrorRecoveryManager {
    if (!ErrorRecoveryManager.instance) {
      ErrorRecoveryManager.instance = new ErrorRecoveryManager();
    }
    return ErrorRecoveryManager.instance;
  }

  registerStrategy(type: HttpErrorType, strategy: RecoveryStrategy): void {
    this.strategies[type] = strategy;
  }

  async attemptRecovery(error: HttpError): Promise<boolean> {
    const strategy = this.strategies[error.type];
    
    if (!strategy || !strategy.shouldAttemptRecovery(error)) {
      return false;
    }

    try {
      await retry(
        () => strategy.recover(error),
        {
          times: strategy.maxAttempts || 1,
          delay: 1000,
          shouldRetry: () => {
            error.retryCount = (error.retryCount || 0) + 1;
            return error.retryCount < (strategy.maxAttempts || 1);
          }
        }
      );
      return true;
    } catch {
      return false;
    }
  }
}

export const errorRecoveryManager = ErrorRecoveryManager.getInstance(); 