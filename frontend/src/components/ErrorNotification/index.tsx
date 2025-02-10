import { Alert, AlertTitle, Button, Snackbar, Stack } from '@mui/material';
import React from 'react';

import { errorRecoveryManager } from '@/utils/http/error/recovery';
import type { HttpError } from '@/utils/http/error/types';
import { HttpErrorType } from '@/utils/http/error/types';

interface ErrorNotificationProps {
  error: HttpError | null;
  onClose: () => void;
}

interface ErrorConfig {
  title: string;
  severity: 'error' | 'warning' | 'info';
  action?: string;
  description?: string;
  recoverable?: boolean;
  autoHideDuration: number | null;
}

// 使用枚举值作为键的类型
type ErrorMessageKey = `${HttpErrorType}`;
const errorMessages: Record<ErrorMessageKey, ErrorConfig> = {
  NETWORK_ERROR: {
    title: '网络错误',
    severity: 'error',
    description: '请检查您的网络连接',
    action: '重试',
    recoverable: true,
    autoHideDuration: null,
  },
  HTTP_ERROR: {
    title: '服务器错误',
    severity: 'error',
    description: '服务器处理请求时出错',
    action: '重试',
    recoverable: true,
    autoHideDuration: null,
  },
  AUTH_ERROR: {
    title: '认证错误',
    severity: 'error',
    description: '您的登录状态已过期',
    action: '重新登录',
    recoverable: false,
    autoHideDuration: null,
  },
  REACT_ERROR: {
    title: '组件错误',
    severity: 'error',
    description: '页面渲染出错',
    action: '刷新页面',
    recoverable: false,
    autoHideDuration: null,
  },
  UNKNOWN_ERROR: {
    title: '未知错误',
    severity: 'warning',
    description: '发生未知错误',
    action: '刷新页面',
    recoverable: false,
    autoHideDuration: 6000,
  },
};

export const ErrorNotification: React.FC<ErrorNotificationProps> = ({ error, onClose }) => {
  const [isRecovering, setIsRecovering] = React.useState(false);

  if (!error) return null;

  const config = errorMessages[error.type as ErrorMessageKey] || errorMessages.UNKNOWN_ERROR;

  const handleAction = async () => {
    if (config.recoverable) {
      setIsRecovering(true);
      try {
        const recovered = await errorRecoveryManager.attemptRecovery(error);
        if (recovered) {
          onClose();
        }
      } finally {
        setIsRecovering(false);
      }
    } else if (config.action === '刷新页面') {
      window.location.reload();
    } else if (config.action === '重新登录') {
      window.location.href = '/login';
    }
  };

  return (
    <Snackbar
      open={!!error}
      autoHideDuration={config.autoHideDuration === null ? undefined : config.autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      data-auto-hide-duration={
        config.autoHideDuration === null ? 'false' : config.autoHideDuration.toString()
      }
    >
      <Alert
        onClose={onClose}
        severity={config.severity}
        variant="filled"
        sx={{ width: '100%', maxWidth: 400 }}
      >
        <AlertTitle>{config.title}</AlertTitle>
        <Stack spacing={1}>
          <div>{error.message || config.description}</div>
          {config.action && (
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              onClick={handleAction}
              disabled={isRecovering}
            >
              {isRecovering ? '处理中...' : config.action}
            </Button>
          )}
        </Stack>
      </Alert>
    </Snackbar>
  );
};
