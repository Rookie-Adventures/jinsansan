import React from 'react';
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
import { Menu as MenuIcon } from '@mui/icons-material';

const Navbar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
        <Toolbar sx={{ px: { xs: 0.5, sm: 1 } }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 'bold',
              color: 'white',
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
            }}
          >
            HuggingFace
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
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button color="inherit">首页</Button>
              <Button color="inherit">文档</Button>
              <Button color="inherit">API</Button>
              <Button color="inherit">价格</Button>
              <Button 
                variant="contained" 
                color="secondary"
                sx={{ 
                  borderRadius: 1,
                  textTransform: 'none',
                  px: 3,
                }}
              >
                登录
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 