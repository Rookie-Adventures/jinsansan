import { useEffect, useState } from 'react';
import { LinearProgress, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledProgressBar = styled(LinearProgress)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: theme.zIndex.tooltip + 1,
  height: 2,
  '& .MuiLinearProgress-bar': {
    backgroundColor: theme.palette.primary.main,
  }
}));

interface TopProgressBarProps {
  loading?: boolean;
  progress?: number;
}

export const TopProgressBar = ({ loading = false, progress }: TopProgressBarProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (loading) {
      setVisible(true);
    } else {
      const timer = setTimeout(() => setVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (!visible) return null;

  return (
    <Box sx={{ width: '100%' }}>
      <StyledProgressBar
        variant={progress ? 'determinate' : 'indeterminate'}
        value={progress}
      />
    </Box>
  );
}; 