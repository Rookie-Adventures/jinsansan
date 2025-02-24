import { describe, it, expect, vi } from 'vitest';
import { roleMiddleware } from '../role.middleware';

describe('roleMiddleware', () => {
  it('should allow access if user has required role', () => {
    const req = {
      user: { role: 'admin' }
    };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    const next = vi.fn();

    const middleware = roleMiddleware(['admin']);
    middleware(req as any, res as any, next);

    expect(next).toHaveBeenCalled();
  });

  it('should deny access if user does not have required role', () => {
    const req = {
      user: { role: 'user' }
    };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    const next = vi.fn();

    const middleware = roleMiddleware(['admin']);
    middleware(req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });
}); 