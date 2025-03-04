import { LinearProgress, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';

import type { FC } from 'react';

const StyledProgressBar = styled(LinearProgress)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: theme.zIndex.tooltip + 1,
  height: 2,
  '& .MuiLinearProgress-bar': {
    backgroundColor: theme.palette.primary.main,
  },
}));

interface TopProgressBarProps {
  loading?: boolean;
  progress?: number;
}

export const TopProgressBar: FC<TopProgressBarProps> = ({ loading = false, progress }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: number | undefined;

    if (loading) {
      setVisible(true);
    } else {
      timer = window.setTimeout(() => setVisible(false), 200);
    }

    return () => {
      if (timer !== undefined) {
        window.clearTimeout(timer);
      }
    };
  }, [loading]);

  if (!visible) return null;

  return (
    <Box sx={{ width: '100%' }}>
      <StyledProgressBar variant={progress ? 'determinate' : 'indeterminate'} value={progress} />
    </Box>
  );
};
