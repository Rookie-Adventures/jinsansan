import { Alert, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';

interface NotificationState {
  open: boolean;
  message: string;
  type: 'error' | 'warning' | 'info';
  position: 'top' | 'bottom';
  duration: number;
}

interface ErrorModalState {
  open: boolean;
  title: string;
  message: string;
  error?: unknown;
}

export const ErrorNotification: React.FC = () => {
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    type: 'error',
    position: 'top',
    duration: 5000,
  });

  const [errorModal, setErrorModal] = useState<ErrorModalState>({
    open: false,
    title: '',
    message: '',
  });

  useEffect(() => {
    const handleNotification = (event: CustomEvent<NotificationState>) => {
      setNotification({
        ...event.detail,
        open: true,
      });
    };

    const handleErrorModal = (event: CustomEvent<ErrorModalState>) => {
      setErrorModal({
        ...event.detail,
        open: true,
      });
    };

    window.addEventListener('show-notification', handleNotification as EventListener);
    window.addEventListener('show-error-modal', handleErrorModal as EventListener);

    return () => {
      window.removeEventListener('show-notification', handleNotification as EventListener);
      window.removeEventListener('show-error-modal', handleErrorModal as EventListener);
    };
  }, []);

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const handleCloseErrorModal = () => {
    setErrorModal((prev) => ({ ...prev, open: false }));
  };

  return (
    <>
      <Snackbar
        open={notification.open}
        autoHideDuration={notification.duration}
        onClose={handleCloseNotification}
        anchorOrigin={{
          vertical: notification.position,
          horizontal: 'center',
        }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.type}
          variant="filled"
          elevation={6}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={errorModal.open}
        onClose={handleCloseErrorModal}
        aria-labelledby="error-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="error-dialog-title" color="error">
          {errorModal.title}
        </DialogTitle>
        <DialogContent>
          <Typography>{errorModal.message}</Typography>
          {process.env.NODE_ENV === 'development' && (
            <>
              {(() => {
                if (!errorModal.error) return null;
                return (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 2, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}
                  >
                    {errorModal.error instanceof Error
                      ? errorModal.error.message
                      : typeof errorModal.error === 'string'
                      ? errorModal.error
                      : JSON.stringify(errorModal.error, null, 2)}
                  </Typography>
                );
              })()}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseErrorModal} color="primary">
            关闭
          </Button>
          <Button
            onClick={() => window.location.reload()}
            color="primary"
            variant="contained"
          >
            刷新页面
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ErrorNotification; 