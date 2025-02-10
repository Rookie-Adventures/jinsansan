import { AxiosError } from 'axios';
import { HttpError, HttpErrorType } from './types';

export const HttpErrorFactory = {
  create: (error: AxiosError | Error): HttpError => {
    if (error instanceof HttpError) {
      return error;
    }

    if ((error as AxiosError).isAxiosError) {
      const axiosError = error as AxiosError;
      return new HttpError({
        type: HttpErrorType.HTTP_ERROR,
        message: axiosError.message,
        code: axiosError.code || 'UNKNOWN_ERROR',
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        isAxiosError: true,
      });
    }

    return new HttpError({
      type: HttpErrorType.UNKNOWN_ERROR,
      message: error.message,
      code: 'UNKNOWN_ERROR',
    });
  },
};
