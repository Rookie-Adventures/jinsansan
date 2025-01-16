import { ErrorRecoveryManager } from './recovery';
import { HttpErrorFactory } from './factory';
import type { HttpError } from './types';

export interface ErrorHandler {
  handle(error: HttpError): Promise<void>;
}

class DefaultErrorHandler implements ErrorHandler {
  private static instance: DefaultErrorHandler;
  private recoveryManager: ErrorRecoveryManager;

  private constructor() {
    this.recoveryManager = ErrorRecoveryManager.getInstance();
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
      console.error('Error recovery failed:', e);
      throw error;
    }
  }
}

export * from './factory';
export * from './types';
export * from './recovery';
export * from './prevention';

export const defaultErrorHandler = DefaultErrorHandler.getInstance(); 