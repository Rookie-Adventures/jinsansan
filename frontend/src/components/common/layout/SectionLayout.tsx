import { Box, Container, Typography } from '@mui/material';

import type { FC, ReactNode } from 'react';

interface SectionLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
}

export const SectionLayout: FC<SectionLayoutProps> = ({
  title,
  subtitle,
  children,
  maxWidth = 'lg',
}) => (
  <Container maxWidth={maxWidth}>
    <Box
      role="main"
      aria-label={title}
      sx={{
        py: { xs: 4, md: 8 },
        px: { xs: 2, sm: 3 },
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
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
      {children}
    </Box>
  </Container>
); 