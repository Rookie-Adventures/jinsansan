import { AutoAwesome, Speed, CloudDone } from '@mui/icons-material';
import { Box, Typography, Button, Grid, useTheme, useMediaQuery, Container } from '@mui/material';
import { motion } from 'framer-motion';
import React from 'react';

const HeroSection: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          width: '100%',
          py: { xs: 4, md: 8 },
          px: { xs: 2, sm: 3 },
        }}
      >
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box
              component={motion.div}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Typography
                variant={isMobile ? 'h3' : 'h2'}
                component="h1"
                gutterBottom
                sx={{ fontWeight: 'bold' }}
              >
                优质的 Jinsansan 模型调用体验
              </Typography>
              <Typography variant="h5" color="inherit" paragraph sx={{ opacity: 0.9, mb: 4 }}>
                为中国用户提供稳定、快速的 AI 模型服务，支持流式响应，智能上下文管理
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Speed />
                  <Typography>快速响应</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CloudDone />
                  <Typography>稳定可靠</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AutoAwesome />
                  <Typography>智能管理</Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                }}
              >
                立即体验
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              component={motion.div}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
              }}
            >
              <Box
                component="img"
                src="/ai-chat.svg"
                alt="AI Chat Illustration"
                sx={{
                  width: '100%',
                  maxWidth: 500,
                  height: 'auto',
                  filter: 'drop-shadow(0px 4px 20px rgba(0, 0, 0, 0.1))',
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default HeroSection;
