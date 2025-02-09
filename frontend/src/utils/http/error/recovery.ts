import { HttpError } from './types';

export class ErrorRecoveryManager {
  private static instance: ErrorRecoveryManager;

  private constructor() {}

  public static getInstance(): ErrorRecoveryManager {
    if (!ErrorRecoveryManager.instance) {
      ErrorRecoveryManager.instance = new ErrorRecoveryManager();
    }
    return ErrorRecoveryManager.instance;
  }

  public async attemptRecovery(error: HttpError): Promise<boolean> {
    try {
      // 根据错误类型尝试恢复
      switch (error.type) {
        case 'NETWORK_ERROR':
          return await this.handleNetworkError(error);
        case 'AUTH_ERROR':
          return await this.handleAuthError(error);
        default:
          return false;
      }
    } catch (e) {
      return false;
    }
  }

  private async handleNetworkError(error: HttpError): Promise<boolean> {
    // 网络错误恢复逻辑
    return true;
  }

  private async handleAuthError(error: HttpError): Promise<boolean> {
    // 认证错误恢复逻辑
    return false;
  }
}

export const errorRecoveryManager = ErrorRecoveryManager.getInstance(); 