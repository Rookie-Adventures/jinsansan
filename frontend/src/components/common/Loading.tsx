import { Box, CircularProgress } from '@mui/material';
import { type FC } from 'react';

const Loading: FC = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
    }}
  >
    <CircularProgress />
  </Box>
);

export default Loading;
