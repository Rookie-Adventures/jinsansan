import { describe, it } from 'vitest';
import { testHttpErrorCreation, createMockAxiosError } from '@/test/utils/httpTestUtils';

describe('HttpErrorFactory', () => {
  it('should handle network errors', () => {
    const axiosError = createMockAxiosError('Network Error', 'ECONNABORTED');
    testHttpErrorCreation(axiosError, 'Network Error', 'ECONNABORTED');
  });

  it('should handle validation errors', () => {
    const axiosError = createMockAxiosError('Validation Error');
    testHttpErrorCreation(axiosError, 'Validation Error');
  });

  it('should handle server errors', () => {
    const axiosError = createMockAxiosError('Internal Server Error', 'INTERNAL_ERROR');
    testHttpErrorCreation(axiosError, 'Internal Server Error', 'INTERNAL_ERROR');
  });
});
