import { describe, it, expect, vi } from 'vitest';
import { authMiddleware } from '../auth.middleware';
import jwt from 'jsonwebtoken';

describe('authMiddleware', () => {
  it('should return 401 if no token provided', () => {
    const req = {
      headers: {}
    };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    const next = vi.fn();

    authMiddleware(req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: '未授权' });
  });

  it('should call next() if token is valid', () => {
    const user = { id: '1', name: 'test', email: 'test@test.com', role: 'user' };
    const token = jwt.sign(user, process.env.JWT_SECRET || 'your_jwt_secret');
    
    const req = {
      headers: {
        authorization: `Bearer ${token}`
      }
    };
    const res = {};
    const next = vi.fn();

    authMiddleware(req as any, res as any, next);

    expect(next).toHaveBeenCalled();
  });
}); 