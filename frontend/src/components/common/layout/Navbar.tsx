import { Menu as MenuIcon, AccountCircle } from '@mui/icons-material';
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
  useTheme,
  useMediaQuery,
} from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/hooks/auth';
import { ThemeToggle } from '../ThemeToggle';

const NavigationMenu: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleClose();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
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
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
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
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>
              {user?.username || '用户'}
            </MenuItem>
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

const Navbar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleClose();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{ 
        background: 'rgba(255, 255, 255, 0.01)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: (theme) => `0 4px 30px ${theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
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
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleMenu}
                    color="inherit"
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
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                  >
                    <MenuItem onClick={handleClose}>
                      {user?.username || '用户'}
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>退出登录</MenuItem>
                  </Menu>
                </>
              ) : (
                <IconButton
                  size="large"
                  edge="end"
                  color="inherit"
                  aria-label="menu"
                >
                  <MenuIcon />
                </IconButton>
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