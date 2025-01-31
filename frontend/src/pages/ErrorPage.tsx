import { Box, Typography, Container } from '@mui/material';
import React from 'react';
import { useRouteError } from 'react-router-dom';

const ErrorPage: React.FC = () => {
  const error = useRouteError() as Error;

  return (
    <Container>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <Typography variant="h1" color="error" gutterBottom>
          Oops!
        </Typography>
        <Typography variant="h5" color="textSecondary" gutterBottom>
          Sorry, an unexpected error has occurred.
        </Typography>
        <Typography color="textSecondary">{error?.message || 'Unknown error'}</Typography>
      </Box>
    </Container>
  );
};

export default ErrorPage;
