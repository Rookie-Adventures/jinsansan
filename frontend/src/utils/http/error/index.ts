import { ErrorLogger } from './logger';
import { ErrorRecoveryManager } from './recovery';
import type { HttpError } from './types';

export interface ErrorHandler {
  handle(error: HttpError): Promise<void>;
}

class DefaultErrorHandler implements ErrorHandler {
  private static instance: DefaultErrorHandler;
  private recoveryManager: ErrorRecoveryManager;
  private logger: ErrorLogger;

  private constructor() {
    this.recoveryManager = ErrorRecoveryManager.getInstance();
    this.logger = ErrorLogger.getInstance();
  }

  static getInstance(): DefaultErrorHandler {
    if (!DefaultErrorHandler.instance) {
      DefaultErrorHandler.instance = new DefaultErrorHandler();
    }
    return DefaultErrorHandler.instance;
  }

  async handle(error: HttpError): Promise<void> {
    try {
      await this.recoveryManager.attemptRecovery(error);
    } catch (e) {
      this.logger.log({
        name: 'RecoveryError',
        type: error.type,
        message: '错误恢复失败',
        severity: 'critical',
        data: e
      });
      throw error;
    }
  }
}

export * from './factory';
export * from './prevention';
export * from './recovery';
export * from './types';

export const defaultErrorHandler = DefaultErrorHandler.getInstance(); 