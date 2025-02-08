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
  const isLoading = useAppSelector((state) => state.app.loading);

  useEffect(() => {
    if (isLoading) {
      setVisible(true);
      const timer = setInterval(() => {
        setProgress((oldProgress) => {
          const diff = Math.random() * 10;
          return Math.min(oldProgress + diff, 90);
        });
      }, 500);

      return () => {
        clearInterval(timer);
      };
    } else if (visible) {
      setProgress(100);
      const timer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 300);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [isLoading, visible]);

  if (!visible) return null;

  return <StyledLinearProgress variant="determinate" value={progress} />;
}; 