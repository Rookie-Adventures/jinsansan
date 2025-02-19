import { Box } from '@mui/material';
import { type FC } from 'react';
import { Outlet } from 'react-router-dom';

import Navbar from './Navbar';

const MainLayout: FC = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <Navbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          position: 'relative',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
