import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import {
  AutoMode as StreamIcon,
  Psychology as ContextIcon,
  Apps as ModelsIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import BusinessSection from './BusinessSection';
import AnimatedCard from './AnimatedCard';

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
  return (
    <BusinessSection
      title="核心功能"
      subtitle="我们提供全面的 AI 模型服务，让您的应用更智能"
    >
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
            <AnimatedCard delay={feature.delay} testId={`feature-card-${index}`}>
              <Box
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
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
              </Box>
            </AnimatedCard>
          </Grid>
        ))}
      </Grid>
    </BusinessSection>
  );
};

export default FeatureSection;
