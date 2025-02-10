import { LinearProgress, styled } from '@mui/material';
import { useEffect, useState } from 'react';

import { useAppSelector } from '@/hooks';

const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: theme.zIndex.appBar + 1,
  height: 2,
  '& .MuiLinearProgress-bar': {
    backgroundColor: theme.palette.primary.main,
  },
}));

export const LoadingBar = () => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const isLoading = useAppSelector(state => state.app.loading);

  useEffect(() => {
    let timer: number | undefined;

    if (isLoading) {
      setVisible(true);
      timer = window.setInterval(() => {
        setProgress(oldProgress => {
          const diff = Math.random() * 10;
          return Math.min(oldProgress + diff, 90);
        });
      }, 500);
    } else if (visible) {
      setProgress(100);
      timer = window.setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 300);
    }

    return () => {
      if (timer !== undefined) {
        if (isLoading) {
          window.clearInterval(timer);
        } else {
          window.clearTimeout(timer);
        }
      }
    };
  }, [isLoading, visible]);

  if (!visible) return null;

  return <StyledLinearProgress variant="determinate" value={progress} />;
};
