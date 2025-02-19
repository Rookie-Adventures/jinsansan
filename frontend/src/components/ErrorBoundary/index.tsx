import { Button, Container, Typography, Box } from '@mui/material';
import React from 'react';

import type { HttpError } from '@/utils/http/error/types';

import { errorLogger } from '@/utils/http/error/logger';
import { HttpErrorType } from '@/utils/http/error/types';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

const ErrorFallback: React.FC<{ error: Error | null; onReset: () => void }> = ({
  error,
  onReset,
}) => (
  <Container maxWidth="sm">
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 2,
      }}
    >
      <Typography variant="h5" component="h1" gutterBottom>
        出错了
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center" gutterBottom>
        {error?.message || '发生了一些错误，请稍后重试'}
      </Typography>
      <Button variant="contained" onClick={onReset} sx={{ mt: 2 }}>
        重试
      </Button>
    </Box>
  </Container>
);

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // 记录错误日志
    errorLogger.log({
      type: HttpErrorType.REACT_ERROR,
      message: error.message,
      stack: error.stack,
      data: {
        componentStack: errorInfo.componentStack,
        ...error,
      },
    } as HttpError);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null }, () => {
      this.props.onReset?.();
    });
  };

  render(): React.ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      return fallback || <ErrorFallback error={error} onReset={this.handleReset} />;
    }

    return children;
  }
}

export default ErrorBoundary;
