import { Box, Grid, Typography } from '@mui/material';

import type { FC } from 'react';

import { AnimatedCard } from '@/components/common/cards/AnimatedCard';
import { SectionLayout } from '@/components/common/layout/SectionLayout';

import { features } from './config/features';

// 提取特性卡片组件
const FeatureCard: FC<{
  title: string;
  description: string;
  Icon: FC<{ sx?: object }>;
  index: number;
  delay: number;
}> = ({ title, description, Icon, index, delay }) => (
  <AnimatedCard delay={delay}>
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
        <Icon data-testid={`feature-icon-${index}`} sx={{ fontSize: 40 }} />
      </Box>
      <Typography
        variant="h5"
        component="h3"
        gutterBottom
        sx={{ fontWeight: 'bold', mb: 1 }}
      >
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ flexGrow: 1 }}>
        {description}
      </Typography>
    </Box>
  </AnimatedCard>
);

const FeatureSection: FC = () => (
  <SectionLayout
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
          <FeatureCard
            title={feature.title}
            description={feature.description}
            Icon={feature.icon}
            index={index}
            delay={feature.delay}
          />
        </Grid>
      ))}
    </Grid>
  </SectionLayout>
);

export default FeatureSection;
