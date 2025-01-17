import { HttpErrorFactory } from '../factory';
import { HttpErrorType } from '../types';

describe('HttpErrorFactory', () => {
  describe('create', () => {
    test('should create network error', () => {
      const networkError = new Error('Network Error');
      const httpError = HttpErrorFactory.create(networkError);
      
      expect(httpError.type).toBe(HttpErrorType.NETWORK);
      expect(httpError.message).toBe('Network Error');
      expect(httpError.recoverable).toBe(true);
    });

    test('should create timeout error', () => {
      const timeoutError = new Error('timeout of 5000ms exceeded');
      const httpError = HttpErrorFactory.create(timeoutError);
      
      expect(httpError.type).toBe(HttpErrorType.TIMEOUT);
      expect(httpError.message).toBe('请求超时，请稍后重试');
      expect(httpError.recoverable).toBe(true);
    });

    test('should create auth error from 401 status', () => {
      const authError = {
        response: { status: 401, data: { message: 'Unauthorized' } }
      };
      const httpError = HttpErrorFactory.create(authError);
      
      expect(httpError.type).toBe(HttpErrorType.AUTH);
      expect(httpError.status).toBe(401);
      expect(httpError.recoverable).toBe(true);
    });

    test('should create server error from 500 status', () => {
      const serverError = {
        response: { status: 500, data: { message: 'Internal Server Error' } }
      };
      const httpError = HttpErrorFactory.create(serverError);
      
      expect(httpError.type).toBe(HttpErrorType.SERVER);
      expect(httpError.status).toBe(500);
      expect(httpError.recoverable).toBe(true);
    });

    test('should create validation error from 422 status', () => {
      const validationError = {
        response: {
          status: 422,
          data: {
            message: 'Validation failed',
            errors: [{ field: 'email', message: 'Invalid email' }]
          }
        }
      };
      const httpError = HttpErrorFactory.create(validationError);
      
      expect(httpError.type).toBe(HttpErrorType.VALIDATION);
      expect(httpError.status).toBe(422);
      expect(httpError.data).toEqual([{ field: 'email', message: 'Invalid email' }]);
      expect(httpError.recoverable).toBe(false);
    });

    test('should create cancel error', () => {
      const cancelError = { __CANCEL__: true, message: 'Request cancelled' };
      const httpError = HttpErrorFactory.create(cancelError);
      
      expect(httpError.type).toBe(HttpErrorType.CANCEL);
      expect(httpError.message).toBe('Request cancelled');
      expect(httpError.recoverable).toBe(false);
    });

    test('should create unknown error for unhandled cases', () => {
      const unknownError = new Error('Something went wrong');
      const httpError = HttpErrorFactory.create(unknownError);
      
      expect(httpError.type).toBe(HttpErrorType.UNKNOWN);
      expect(httpError.message).toBe('Something went wrong');
      expect(httpError.recoverable).toBe(false);
    });

    test('should preserve error stack trace', () => {
      const originalError = new Error('Original error');
      const httpError = HttpErrorFactory.create(originalError);
      
      expect(httpError.stack).toBeDefined();
      expect(httpError.stack).toContain('Original error');
    });

    test('should handle null or undefined error', () => {
      const httpError = HttpErrorFactory.create(null);
      
      expect(httpError.type).toBe(HttpErrorType.UNKNOWN);
      expect(httpError.message).toBe('An unknown error occurred');
      expect(httpError.recoverable).toBe(false);
    });
  });
}); 