import { HttpError } from './types';
import Logger from '@/utils/logger';

export const errorLogger = {
  log: (error: HttpError): void => {
    Logger.error('HTTP Error:', {
      context: 'HttpClient',
      data: {
        code: error.code,
        message: error.message,
        status: error.status,
        data: error.data,
        stack: error.stack,
      },
    });
  },
};
