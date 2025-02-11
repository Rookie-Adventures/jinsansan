import React from 'react';
import { Card, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';

interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  isHighlighted?: boolean;
  testId?: string;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  delay = 0,
  isHighlighted = false,
  testId,
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
        data-testid={testId}
        elevation={isHighlighted ? 8 : 0}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s ease-in-out',
          background: isHighlighted
            ? 'linear-gradient(135deg, rgba(36,36,62,0.03) 0%, rgba(48,43,99,0.03) 100%)'
            : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: 2,
          ...(isHighlighted && {
            transform: 'scale(1.05)',
          }),
          '&:hover': {
            transform: isHighlighted ? 'scale(1.08)' : 'scale(1.03)',
            boxShadow: theme.shadows[8],
          },
          margin: isMobile ? '0 auto' : 'inherit',
          maxWidth: isMobile ? '350px' : 'none',
        }}
      >
        {children}
      </Card>
    </motion.div>
  );
};

export default AnimatedCard; 