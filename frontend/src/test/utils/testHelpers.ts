import { vi } from 'vitest';
import { retry } from '../../utils/http/retry';

export interface LogValidationConfig {
  action: string;
  level: string;
  resource: string;
  source: string;
  context?: Record<string, unknown>;
}

export const validateLogCall = (
  mockLogger: { log: ReturnType<typeof vi.fn> },
  config: LogValidationConfig
) => {
  expect(mockLogger.log).toHaveBeenCalledWith(
    expect.any(Error),
    expect.objectContaining({
      context: expect.objectContaining({
        action: config.action,
        level: config.level,
        resource: config.resource,
        source: config.source,
        ...config.context,
      }),
      level: config.level,
    })
  );
};

export const waitForAsyncOperations = async () => {
  await vi.runAllTimersAsync();
};

export const createMockRetryFunction = (successValue = 'success') => {
  return vi
    .fn()
    .mockRejectedValueOnce(new Error('fail'))
    .mockRejectedValueOnce(new Error('fail'))
    .mockResolvedValue(successValue);
};

export interface RetryOptions {
  times?: number;
  delay?: number;
  onRetry?: () => void;
}

export const runRetryTest = async <T>(fn: () => Promise<T>, options: RetryOptions): Promise<T> => {
  const promise = retry(fn, options);
  await waitForAsyncOperations();
  return await promise;
}; 