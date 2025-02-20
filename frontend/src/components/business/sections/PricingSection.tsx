// 第三方库导入
import { Check } from '@mui/icons-material';
import {
  Box,
  Button,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  Typography,
} from '@mui/material';

import type { FC } from 'react';

// 内部组件导入
import { AnimatedCard } from '@/components/common/cards/AnimatedCard';
import { SectionLayout } from '@/components/common/layout/SectionLayout';

// 配置导入
import { pricingTiers } from './config/pricing';

// 提取价格显示组件
const PriceDisplay: FC<{ price: string | number }> = ({ price }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'baseline',
      mb: 1.5,
    }}
  >
    <Typography
      component="h2"
      variant="h3"
      color="text.primary"
      sx={{ fontWeight: 'bold' }}
    >
      {typeof price === 'string' ? '' : '¥'}
      {price}
    </Typography>
    {typeof price === 'number' && (
      <Typography variant="h6" color="text.secondary">
        /月
      </Typography>
    )}
  </Box>
);

// 提取特性列表组件
const FeatureList: FC<{ features: string[] }> = ({ features }) => (
  <Box>
    {features.map(feature => (
      <Box
        key={feature}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 1,
        }}
      >
        <Check sx={{ color: 'primary.main' }} />
        <Typography variant="subtitle1" align="left">
          {feature}
        </Typography>
      </Box>
    ))}
  </Box>
);

const PricingSection: FC = () => (
  <SectionLayout
    title="价格方案"
    subtitle="选择最适合您的方案，开启 AI 之旅"
  >
    <Box sx={{ maxWidth: '1200px', width: '100%' }}>
      <Grid container spacing={2} alignItems="flex-end" justifyContent="center">
        {pricingTiers.map((tier, index) => (
          <Grid
            item
            key={tier.title}
            xs={11}
            sm={tier.title === '专业版' ? 11 : 6}
            md={4}
            sx={{
              maxWidth: '360px',
            }}
          >
            <AnimatedCard
              delay={index * 0.1}
              isHighlighted={tier.title === '专业版'}
              ariaLabel={`${tier.title}价格方案`}
            >
              <CardHeader
                title={
                  <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold' }}>
                    {tier.title}
                  </Typography>
                }
                subheader={tier.subheader}
                titleTypographyProps={{ align: 'center' }}
                subheaderTypographyProps={{
                  align: 'center',
                  sx: { color: 'primary.main', fontWeight: 'bold' },
                }}
                sx={{
                  backgroundColor: theme =>
                    theme.palette.mode === 'light'
                      ? 'rgba(255,255,255,0.9)'
                      : 'rgba(0,0,0,0.1)',
                  p: 1.5,
                }}
              />
              <CardContent sx={{ p: 1.5 }}>
                <PriceDisplay price={tier.price} />
                <FeatureList features={tier.description} />
              </CardContent>
              <CardActions sx={{ mt: 'auto', justifyContent: 'center', p: 1.5 }}>
                <Button
                  fullWidth
                  variant={tier.buttonVariant}
                  color={tier.title === '专业版' ? 'secondary' : 'primary'}
                  size="large"
                  sx={{
                    width: '80%',
                    py: 1.5,
                    fontSize: '1.1rem',
                    borderRadius: 1,
                  }}
                >
                  {tier.buttonText}
                </Button>
              </CardActions>
            </AnimatedCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  </SectionLayout>
);

export default PricingSection;
