import { Button, Container, Typography, Box } from '@mui/material';
import React from 'react';

import { ErrorLogger } from '@/utils/http/error/logger';
import { HttpErrorType } from '@/utils/http/error/types';
import type { HttpError } from '@/utils/http/error/types';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  private logger: ErrorLogger;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.logger = ErrorLogger.getInstance();
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // 记录错误到日志服务
    this.logger.log({
      type: HttpErrorType.REACT_ERROR,
      message: error.message,
      stack: error.stack,
      data: errorInfo
    } as HttpError);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <Container maxWidth="sm">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
              gap: 2,
              textAlign: 'center'
            }}
          >
            <Typography variant="h4" component="h1" gutterBottom>
              出错了！
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {error?.message || '应用程序发生了意外错误'}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={this.handleReset}
              >
                重试
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => window.location.reload()}
                sx={{ ml: 2 }}
              >
                刷新页面
              </Button>
            </Box>
          </Box>
        </Container>
      );
    }

    return children;
  }
} 