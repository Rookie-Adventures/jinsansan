import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loggerMiddleware } from '../logger.middleware';

describe('loggerMiddleware', () => {
  let consoleLogSpy: any;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('should log request method and URL', () => {
    const req = {
      method: 'GET',
      url: '/api/test'
    } as any;
    const res = {} as any;
    const next = vi.fn();

    loggerMiddleware(req, res, next);

    expect(consoleLogSpy).toHaveBeenCalledWith('GET /api/test');
    expect(next).toHaveBeenCalled();
  });

  it('should call next middleware', () => {
    const req = {
      method: 'POST',
      url: '/api/users'
    } as any;
    const res = {} as any;
    const next = vi.fn();

    loggerMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });
}); 