import React from 'react';
import { CircularProgress, Box } from '@mui/material';

export interface LoadingProps {
  size?: number;
  color?: 'primary' | 'secondary' | 'inherit';
}

const Loading: React.FC<LoadingProps> = ({ 
  size = 40, 
  color = 'primary' 
}) => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="200px"
    >
      <CircularProgress size={size} color={color} />
    </Box>
  );
};

export default Loading; 