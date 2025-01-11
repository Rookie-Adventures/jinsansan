import {
  Box,
  Button,
  Card,
  Container,
} from '@mui/material';
import React from 'react';

interface AuthCardProps {
  children: React.ReactNode;
  onRegister: () => void;
}

const AuthCard: React.FC<AuthCardProps> = ({ children, onRegister }) => (
  <Container maxWidth="sm">
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Card
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
        }}
      >
        {children}
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button
            color="primary"
            onClick={onRegister}
            sx={{ textTransform: 'none' }}
          >
            还没有账号？立即注册
          </Button>
        </Box>
      </Card>
    </Box>
  </Container>
);

export default AuthCard; 