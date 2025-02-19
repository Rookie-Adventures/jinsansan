import { Card, CardContent, Link, Box } from '@mui/material';

import type { FC, ReactNode } from 'react';

interface AuthCardProps {
  children: ReactNode;
  onToLogin?: () => void;
  onToRegister?: () => void;
}

const AuthCard: FC<AuthCardProps> = ({ children, onToLogin, onToRegister }) => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="background.default"
    >
      <Card sx={{ maxWidth: 400, width: '100%', m: 2 }}>
        <CardContent>
          {children}
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            {onToLogin && (
              <Link
                component="button"
                variant="body2"
                onClick={onToLogin}
                sx={{ cursor: 'pointer' }}
                role="button"
              >
                已有账号？点击登录
              </Link>
            )}
            {onToRegister && (
              <Link
                component="button"
                variant="body2"
                onClick={onToRegister}
                sx={{ cursor: 'pointer' }}
                role="button"
              >
                没有账号？立即注册
              </Link>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AuthCard;
