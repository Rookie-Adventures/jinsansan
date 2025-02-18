import {
  AutoMode as StreamIcon,
  Psychology as ContextIcon,
  Apps as ModelsIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { Box, Container, Grid, Typography, Card, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
import React from 'react';

const features = [
  {
    title: '流式响应',
    description: '支持流式输出，实时响应，提供更自然的对话体验',
    icon: StreamIcon,
    delay: 0,
  },
  {
    title: '智能上下文',
    description: '智能管理对话上下文，实现连贯的多轮对话',
    icon: ContextIcon,
    delay: 0.1,
  },
  {
    title: '多模型支持',
    description: '支持多种主流模型，满足不同场景需求',
    icon: ModelsIcon,
    delay: 0.2,
  },
  {
    title: '安全可控',
    description: '数据安全有保障，支持自定义敏感词过滤',
    icon: SecurityIcon,
    delay: 0.3,
  },
];

const FeatureSection: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
          核心功能
        </Typography>
        <Typography
          variant="h6"
          align="center"
          color="text.secondary"
          sx={{ mb: { xs: 4, md: 6 }, maxWidth: '800px' }}
        >
          我们提供全面的 AI 模型服务，让您的应用更智能
        </Typography>

        <Grid container spacing={3} justifyContent="center">
          {features.map((feature, index) => (
            <Grid
              item
              key={feature.title}
              xs={12}
              sm={6}
              md={3}
              sx={{
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: feature.delay }}
                style={{ width: '100%' }}
              >
                <Card
                  role="article"
                  elevation={0}
                  sx={{
                    height: '100%',
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: 2,
                    transition: 'transform 0.3s ease-in-out',
                    margin: isMobile ? '0 auto' : 'inherit',
                    maxWidth: isMobile ? '350px' : 'none',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.shadows[4],
                    },
                  }}
                >
                  <Box
                    sx={{
                      mb: 2,
                      p: 1.5,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #24243e 0%, #302b63 100%)',
                      color: 'white',
                    }}
                  >
                    <feature.icon data-testid={`feature-icon-${index}`} sx={{ fontSize: 40 }} />
                  </Box>
                  <Typography
                    variant="h5"
                    component="h3"
                    gutterBottom
                    sx={{ fontWeight: 'bold', mb: 1 }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ flexGrow: 1 }}>
                    {feature.description}
                  </Typography>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default FeatureSection;
