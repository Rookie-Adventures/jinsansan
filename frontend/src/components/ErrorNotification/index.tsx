import { Alert, AlertTitle, Button, Snackbar, Stack } from '@mui/material';
import React from 'react';

import { errorRecoveryManager } from '@/utils/http/error/recovery';
import type { HttpError, HttpErrorType } from '@/utils/http/error/types';

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
}

const errorMessages: Record<HttpErrorType, ErrorConfig> = {
  NETWORK: {
    title: '网络错误',
    severity: 'error',
    description: '请检查您的网络连接',
    action: '重试',
    recoverable: true
  },
  TIMEOUT: {
    title: '请求超时',
    severity: 'warning',
    description: '服务器响应时间过长',
    action: '重试',
    recoverable: true
  },
  AUTH: {
    title: '认证错误',
    severity: 'error',
    description: '您的登录状态已过期',
    action: '重新登录',
    recoverable: true
  },
  SERVER: {
    title: '服务器错误',
    severity: 'error',
    description: '服务器处理请求时出错',
    action: '重试',
    recoverable: true
  },
  CLIENT: {
    title: '客户端错误',
    severity: 'warning',
    description: '请求参数有误',
    recoverable: false
  },
  CANCEL: {
    title: '请求已取消',
    severity: 'info',
    description: '操作已被取消',
    recoverable: false
  },
  UNKNOWN: {
    title: '未知错误',
    severity: 'error',
    description: '发生未知错误',
    action: '刷新页面',
    recoverable: false
  },
  REACT_ERROR: {
    title: '组件错误',
    severity: 'error',
    description: '页面渲染出错',
    action: '刷新页面',
    recoverable: false
  },
  VALIDATION: {
    title: '验证错误',
    severity: 'warning',
    description: '请检查输入内容',
    recoverable: false
  },
  BUSINESS: {
    title: '业务错误',
    severity: 'warning',
    description: '操作无法完成',
    recoverable: false
  },
  INFO: {
    title: '提示信息',
    severity: 'info',
    description: '操作提示',
    recoverable: false
  },
  WARNING: {
    title: '警告信息',
    severity: 'warning',
    description: '操作警告',
    recoverable: false
  },
  ERROR: {
    title: '错误信息',
    severity: 'error',
    description: '操作错误',
    recoverable: false
  }
};

export const ErrorNotification: React.FC<ErrorNotificationProps> = ({ error, onClose }) => {
  const [isRecovering, setIsRecovering] = React.useState(false);

  if (!error) return null;

  const config = errorMessages[error.type] || errorMessages.UNKNOWN;

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
      autoHideDuration={config.severity === 'error' ? null : 6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
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