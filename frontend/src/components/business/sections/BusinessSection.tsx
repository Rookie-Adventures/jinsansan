import React from 'react';
import { Box, Container, Typography } from '@mui/material';

interface BusinessSectionProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  maxContentWidth?: string | number;
  role?: string;
  ariaLabel?: string;
}

const BusinessSection: React.FC<BusinessSectionProps> = ({
  title,
  subtitle,
  children,
  maxContentWidth = 'lg',
  role = 'region',
  ariaLabel,
}) => {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          py: { xs: 4, md: 8 },
          px: { xs: 2, sm: 3 },
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
        role={role}
        aria-label={ariaLabel}
      >
        <Typography
          component="h2"
          variant="h3"
          align="center"
          gutterBottom
          sx={{
            mb: 2,
            fontSize: { xs: '2rem', md: '3rem' },
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #24243e 0%, #302b63 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="h6"
          align="center"
          color="text.secondary"
          sx={{ mb: { xs: 4, md: 6 }, maxWidth: '800px' }}
        >
          {subtitle}
        </Typography>
        <Box sx={{ maxWidth: maxContentWidth, width: '100%' }}>
          {children}
        </Box>
      </Box>
    </Container>
  );
};

export default BusinessSection; 