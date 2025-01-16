import type { AxiosError } from 'axios';
import { HttpError, HttpErrorType } from './types';

export class HttpErrorFactory {
  static create(error: unknown): HttpError {
    if (this.isAxiosError(error)) {
      return this.createFromAxiosError(error);
    }
    return this.createUnknownError(error);
  }

  private static isAxiosError(error: unknown): error is AxiosError {
    return (error as AxiosError).isAxiosError === true;
  }

  private static createFromAxiosError(error: AxiosError): HttpError {
    const httpError = new Error(error.message) as HttpError;

    if (error.response) {
      const status = error.response.status;
      httpError.status = status;
      httpError.data = error.response.data;

      if (status === 401 || status === 403) {
        httpError.type = HttpErrorType.AUTH;
      } else if (status >= 500) {
        httpError.type = HttpErrorType.SERVER;
      } else if (status >= 400) {
        httpError.type = HttpErrorType.CLIENT;
      } else {
        httpError.type = HttpErrorType.UNKNOWN;
      }
    } else if (error.code === 'ECONNABORTED') {
      httpError.type = HttpErrorType.TIMEOUT;
    } else if (error.message === 'Network Error') {
      httpError.type = HttpErrorType.NETWORK;
    } else if (error.message?.includes('canceled')) {
      httpError.type = HttpErrorType.CANCEL;
    } else {
      httpError.type = HttpErrorType.UNKNOWN;
    }

    return httpError;
  }

  private static createUnknownError(error: unknown): HttpError {
    const httpError = new Error(
      error instanceof Error ? error.message : 'Unknown error'
    ) as HttpError;
    httpError.type = HttpErrorType.UNKNOWN;
    return httpError;
  }
} 