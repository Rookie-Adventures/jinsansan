import { ErrorRecoveryManager } from '../recovery';
import { HttpError } from '../error';
import { HttpErrorType } from '../types';
import { vi, describe, test, expect, beforeEach } from 'vitest';

describe('ErrorRecoveryManager', () => {
  let manager: ErrorRecoveryManager;

  beforeEach(() => {
    // 清除单例实例
    vi.restoreAllMocks();
    // 获取新实例
    manager = ErrorRecoveryManager.getInstance();
  });

  describe('getInstance', () => {
    test('should return singleton instance', () => {
      const instance1 = ErrorRecoveryManager.getInstance();
      const instance2 = ErrorRecoveryManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('attemptRecovery', () => {
    test('should recover from network error within retry limit', async () => {
      const networkError = new HttpError({
        type: HttpErrorType.NETWORK,
        message: 'Network error',
        recoverable: true,
        retryCount: 1
      });

      const result = await manager.attemptRecovery(networkError);
      expect(result).toBe(true);
    });

    test('should not recover from network error beyond retry limit', async () => {
      const networkError = new HttpError({
        type: HttpErrorType.NETWORK,
        message: 'Network error',
        recoverable: true,
        retryCount: 4
      });

      const result = await manager.attemptRecovery(networkError);
      expect(result).toBe(false);
    });

    test('should recover from timeout error within retry limit', async () => {
      const timeoutError = new HttpError({
        type: HttpErrorType.TIMEOUT,
        message: 'Request timeout',
        recoverable: true,
        retryCount: 1
      });

      const result = await manager.attemptRecovery(timeoutError);
      expect(result).toBe(true);
    });

    test('should not recover from unrecoverable error', async () => {
      const unrecoverableError = new HttpError({
        type: HttpErrorType.CLIENT,
        message: 'Client error',
        recoverable: false
      });

      const result = await manager.attemptRecovery(unrecoverableError);
      expect(result).toBe(false);
    });

    test('should handle auth error with refresh token', async () => {
      // Mock localStorage
      const mockLocalStorage = {
        getItem: vi.fn().mockReturnValue('fake-refresh-token'),
        removeItem: vi.fn()
      };
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage
      });

      const authError = new HttpError({
        type: HttpErrorType.AUTH,
        message: 'Unauthorized',
        status: 401,
        recoverable: true
      });

      const result = await manager.attemptRecovery(authError);
      expect(result).toBe(true);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('refreshToken');
    });

    test('should handle auth error without refresh token', async () => {
      // Mock localStorage
      const mockLocalStorage = {
        getItem: vi.fn().mockReturnValue(null),
        removeItem: vi.fn()
      };
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage
      });

      const authError = new HttpError({
        type: HttpErrorType.AUTH,
        message: 'Unauthorized',
        status: 401,
        recoverable: true
      });

      const result = await manager.attemptRecovery(authError);
      expect(result).toBe(false);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('refreshToken');
    });
  });

  describe('registerStrategy', () => {
    test('should register custom recovery strategy', async () => {
      const customStrategy = {
        shouldAttemptRecovery: vi.fn().mockReturnValue(true),
        recover: vi.fn().mockResolvedValue(undefined),
        maxAttempts: 1
      };

      manager.registerStrategy(HttpErrorType.BUSINESS, customStrategy);

      const businessError = new HttpError({
        type: HttpErrorType.BUSINESS,
        message: 'Business error',
        recoverable: true
      });

      await manager.attemptRecovery(businessError);
      expect(customStrategy.shouldAttemptRecovery).toHaveBeenCalled();
      expect(customStrategy.recover).toHaveBeenCalled();
    });
  });
}); 