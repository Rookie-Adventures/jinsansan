import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

const MainLayout: React.FC = () => {
  return (
    <Box>
      <Outlet />
    </Box>
  );
};

export default MainLayout; 