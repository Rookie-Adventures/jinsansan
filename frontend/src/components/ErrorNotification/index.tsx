import { Alert, Snackbar, AlertTitle } from '@mui/material';
import React from 'react';

import type { HttpError, HttpErrorType } from '@/utils/http/error/types';

interface ErrorNotificationProps {
  error: HttpError | null;
  onClose: () => void;
}

const errorMessages: Record<HttpErrorType, { title: string; severity: 'error' | 'warning' | 'info' }> = {
  NETWORK: {
    title: '网络错误',
    severity: 'error'
  },
  TIMEOUT: {
    title: '请求超时',
    severity: 'warning'
  },
  AUTH: {
    title: '认证错误',
    severity: 'error'
  },
  SERVER: {
    title: '服务器错误',
    severity: 'error'
  },
  CLIENT: {
    title: '客户端错误',
    severity: 'warning'
  },
  CANCEL: {
    title: '请求已取消',
    severity: 'info'
  },
  UNKNOWN: {
    title: '未知错误',
    severity: 'error'
  },
  REACT_ERROR: {
    title: '组件错误',
    severity: 'error'
  }
};

export const ErrorNotification: React.FC<ErrorNotificationProps> = ({ error, onClose }) => {
  if (!error) return null;

  const { title, severity } = errorMessages[error.type] || errorMessages.UNKNOWN;

  return (
    <Snackbar
      open={!!error}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        <AlertTitle>{title}</AlertTitle>
        {error.message}
      </Alert>
    </Snackbar>
  );
}; 