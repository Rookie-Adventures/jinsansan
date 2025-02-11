import { AxiosError } from 'axios';
import { HttpError, HttpErrorType } from '@/utils/http/error/types';
import { HttpErrorFactory } from '@/utils/http/error/factory';

export const testHttpErrorCreation = (
  axiosError: AxiosError,
  expectedMessage: string,
  expectedCode?: string
) => {
  const result = HttpErrorFactory.create(axiosError as AxiosError);

  expect(result).toBeInstanceOf(HttpError);
  expect(result.type).toBe(HttpErrorType.HTTP_ERROR);
  expect(result.message).toBe(expectedMessage);
  
  if (expectedCode) {
    expect(result.code).toBe(expectedCode);
  } else {
    expect(result.code).toBeUndefined();
  }
  
  expect(result.status).toBeUndefined();
  
  return result;
};

export const createMockAxiosError = (message: string, code?: string) => {
  return {
    message,
    code,
    isAxiosError: true,
    name: 'AxiosError',
    config: {},
    toJSON: () => ({}),
  } as AxiosError;
}; 