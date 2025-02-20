// 第三方库导入
import { AccountCircle, Menu as MenuIcon } from '@mui/icons-material';
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { type FC, type MouseEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 内部模块导入
import { useAuth } from '@/hooks/auth';
import { errorLogger } from '@/utils/http/error/logger';
import { HttpError, HttpErrorType } from '@/utils/http/error/types';

// 相对路径导入
import { ThemeToggle } from '../ThemeToggle';

// 抽取导航菜单组件
const NavigationMenu: FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const { isAuthenticated, user, logout } = useAuth();

  const handleMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleClose();
      navigate('/');
    } catch (error) {
      errorLogger.log(
        new HttpError({
          type: HttpErrorType.AUTH,
          message: '退出登录失败',
          data: error,
        })
      );
      handleClose();
      navigate('/');
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      <Button
        color="inherit"
        onClick={() => navigate('/')}
        sx={{ color: theme.palette.text.primary }}
      >
        首页
      </Button>
      <Button
        color="inherit"
        onClick={() => navigate('/docs')}
        sx={{ color: theme.palette.text.primary }}
      >
        文档
      </Button>
      <Button
        color="inherit"
        onClick={() => navigate('/api')}
        sx={{ color: theme.palette.text.primary }}
      >
        API
      </Button>
      <Button
        color="inherit"
        onClick={() => navigate('/pricing')}
        sx={{ color: theme.palette.text.primary }}
      >
        价格
      </Button>

      {isAuthenticated ? (
        <>
          <IconButton
            size="large"
            aria-label="用户菜单"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
            sx={{ color: theme.palette.text.primary }}
          >
            <AccountCircle />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted={false}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            TransitionProps={{
              timeout: 0,
              appear: false,
              enter: false,
              exit: false
            }}
            disablePortal
            slotProps={{
              paper: {
                sx: { minWidth: 120 }
              }
            }}
          >
            <MenuItem onClick={handleClose}>{user?.username || '用户'}</MenuItem>
            <MenuItem onClick={handleLogout}>退出登录</MenuItem>
          </Menu>
        </>
      ) : (
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/login')}
          sx={{
            borderRadius: 1,
            textTransform: 'none',
            px: 3,
          }}
        >
          登录
        </Button>
      )}
      <ThemeToggle />
    </Box>
  );
};

const Navbar: FC = () => {
  const [mobileAnchorEl, setMobileAnchorEl] = useState<null | HTMLElement>(null);
  const [userAnchorEl, setUserAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleMobileMenu = (event: MouseEvent<HTMLElement>) => {
    setMobileAnchorEl(event.currentTarget);
  };

  const handleUserMenu = (event: MouseEvent<HTMLElement>) => {
    setUserAnchorEl(event.currentTarget);
  };

  const handleMobileClose = () => {
    setMobileAnchorEl(null);
  };

  const handleUserClose = () => {
    setUserAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleUserClose();
      navigate('/');
    } catch (error) {
      errorLogger.log(
        new HttpError({
          type: HttpErrorType.AUTH,
          message: '退出登录失败',
          data: error,
        })
      );
      handleUserClose();
      navigate('/');
    }
  };

  const handleMobileNavigation = (path: string) => {
    handleMobileClose();
    navigate(path);
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: 'rgba(255, 255, 255, 0.01)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: theme =>
          `0 4px 30px ${theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
      }}
    >
      <Container maxWidth={false}>
        <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 'bold',
              color: theme.palette.text.primary,
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
          >
            Jinsansan
          </Typography>

          {isMobile ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ThemeToggle />
              {isAuthenticated ? (
                <>
                  <IconButton
                    size="large"
                    aria-label="用户菜单"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleUserMenu}
                    color="inherit"
                    sx={{ color: theme.palette.text.primary }}
                  >
                    <AccountCircle />
                  </IconButton>
                  <Menu
                    id="menu-appbar"
                    anchorEl={userAnchorEl}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    keepMounted={false}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(userAnchorEl)}
                    onClose={handleUserClose}
                    TransitionProps={{
                      timeout: 0,
                      appear: false,
                      enter: false,
                      exit: false
                    }}
                    disablePortal
                    slotProps={{
                      paper: {
                        sx: { minWidth: 120 }
                      }
                    }}
                  >
                    <MenuItem onClick={handleUserClose}>{user?.username || '用户'}</MenuItem>
                    <MenuItem onClick={handleLogout}>退出登录</MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <IconButton 
                    size="large" 
                    edge="end" 
                    color="inherit" 
                    aria-label="menu"
                    onClick={handleMobileMenu}
                    sx={{ color: theme.palette.text.primary }}
                  >
                    <MenuIcon />
                  </IconButton>
                  <Menu
                    id="mobile-menu"
                    anchorEl={mobileAnchorEl}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    keepMounted={false}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(mobileAnchorEl)}
                    onClose={handleMobileClose}
                    TransitionProps={{
                      timeout: 0,
                      appear: false,
                      enter: false,
                      exit: false
                    }}
                    disablePortal
                    slotProps={{
                      paper: {
                        sx: { minWidth: 120 }
                      }
                    }}
                  >
                    <MenuItem onClick={() => handleMobileNavigation('/')}>首页</MenuItem>
                    <MenuItem onClick={() => handleMobileNavigation('/docs')}>文档</MenuItem>
                    <MenuItem onClick={() => handleMobileNavigation('/api')}>API</MenuItem>
                    <MenuItem onClick={() => handleMobileNavigation('/pricing')}>价格</MenuItem>
                    <MenuItem onClick={() => handleMobileNavigation('/login')}>登录</MenuItem>
                  </Menu>
                </>
              )}
            </Box>
          ) : (
            <NavigationMenu />
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 