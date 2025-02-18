import Logger from '@/utils/logger';

import { HttpError } from './types';

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
