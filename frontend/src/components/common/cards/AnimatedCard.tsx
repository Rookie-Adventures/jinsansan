import { Card, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';

import type { FC, ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  delay?: number;
  elevation?: number;
  isHighlighted?: boolean;
  ariaLabel?: string;
}

export const AnimatedCard: FC<AnimatedCardProps> = ({
  children,
  delay = 0,
  elevation = 0,
  isHighlighted = false,
  ariaLabel,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      style={{ width: '100%', height: '100%' }}
    >
      <Card
        role="article"
        aria-label={ariaLabel}
        elevation={isHighlighted ? 8 : elevation}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: isHighlighted
            ? 'linear-gradient(135deg, rgba(36,36,62,0.03) 0%, rgba(48,43,99,0.03) 100%)'
            : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: 2,
          transition: 'transform 0.3s ease-in-out',
          margin: isMobile ? '0 auto' : 'inherit',
          maxWidth: isMobile ? '350px' : 'none',
          transform: isHighlighted ? 'scale(1.05)' : 'none',
          '&:hover': {
            transform: isHighlighted ? 'scale(1.08)' : 'scale(1.03)',
            boxShadow: theme.shadows[4],
          },
        }}
      >
        {children}
      </Card>
    </motion.div>
  );
}; 