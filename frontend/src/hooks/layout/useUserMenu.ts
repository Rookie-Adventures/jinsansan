import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { HttpError, HttpErrorType, ErrorData } from '@/utils/http/error/types';
import { errorLogger } from '@/utils/http/error/logger';

interface ErrorDataObject {
  [key: string]: ErrorData;
}

export const useUserMenu = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      handleClose();
      navigate('/');
      await logout();
    } catch (error) {
      const errorData: ErrorDataObject = error instanceof Error 
        ? { 
            message: error.message,
            name: error.name,
            stack: error.stack || null
          }
        : { message: String(error) };

      errorLogger.log(
        new HttpError({
          type: HttpErrorType.AUTH,
          message: '退出登录失败',
          data: errorData,
        })
      );
    }
  };

  return {
    anchorEl,
    username: user?.username || '用户',
    isMenuOpen: Boolean(anchorEl),
    handleMenu,
    handleClose,
    handleLogout,
  };
}; 