import { Menu as MenuIcon } from '@mui/icons-material';
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const NavigationMenu: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Button color="inherit" onClick={() => navigate('/')}>首页</Button>
      <Button color="inherit" onClick={() => navigate('/docs')}>文档</Button>
      <Button color="inherit" onClick={() => navigate('/api')}>API</Button>
      <Button color="inherit" onClick={() => navigate('/pricing')}>价格</Button>
      <Button 
        variant="contained" 
        color="secondary"
        onClick={() => navigate('/login')}
        sx={{ 
          borderRadius: 1,
          textTransform: 'none',
          px: 3,
        }}
      >
        登录
      </Button>
    </Box>
  );
};

const Navbar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{ 
        background: 'transparent',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
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
              color: 'white',
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
          >
            Jinsansan
          </Typography>
          
          {isMobile ? (
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              aria-label="menu"
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <NavigationMenu />
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 