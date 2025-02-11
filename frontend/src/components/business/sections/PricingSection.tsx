import React from 'react';
import {
  Box,
  Button,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Check } from '@mui/icons-material';
import BusinessSection from './BusinessSection';
import AnimatedCard from './AnimatedCard';

const tiers = [
  {
    title: '免费版',
    price: '0',
    description: ['每日固定调用次数', '基础模型支持', '标准响应速度', '社区支持'],
    buttonText: '立即使用',
    buttonVariant: 'outlined',
  },
  {
    title: '专业版',
    subheader: '最受欢迎',
    price: '99',
    description: ['无限制调用次数', '所有模型支持', '优先响应速度', '专属客服支持'],
    buttonText: '立即订阅',
    buttonVariant: 'contained',
  },
  {
    title: '企业版',
    price: '联系我们',
    description: ['定制化解决方案', 'API 独享配置', '企业级 SLA 保障', '7×24小时技术支持'],
    buttonText: '联系销售',
    buttonVariant: 'outlined',
  },
];

const PricingSection: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <BusinessSection
      title="价格方案"
      subtitle="选择最适合您的方案，开启 AI 之旅"
      maxContentWidth="1200px"
      role="main"
      ariaLabel="价格方案"
    >
      <Grid container spacing={2} alignItems="flex-end" justifyContent="center">
        {tiers.map((tier, index) => (
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
              testId={tier.subheader ? 'popular-card' : `${tier.title}-card`}
            >
              <CardHeader
                data-testid={tier.subheader ? 'popular-card-header' : `${tier.title}-card-header`}
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
                  backgroundColor: theme.palette.mode === 'light'
                    ? 'rgba(255,255,255,0.9)'
                    : 'rgba(0,0,0,0.1)',
                  p: 1.5,
                }}
              />
              <CardContent sx={{ p: 1.5 }}>
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
                    variant={isMobile ? 'h4' : 'h3'}
                    color="text.primary"
                    sx={{ fontWeight: 'bold' }}
                  >
                    {typeof tier.price === 'string' ? '' : '¥'}
                    {tier.price}
                  </Typography>
                  {typeof tier.price === 'number' && (
                    <Typography variant="h6" color="text.secondary">
                      /月
                    </Typography>
                  )}
                </Box>
                <Box>
                  {tier.description.map(line => (
                    <Box
                      key={line}
                      data-testid={`feature-${line}`}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <Check data-testid={`feature-${line}-icon`} sx={{ color: 'primary.main' }} />
                      <Typography variant="subtitle1" align="left">
                        {line}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
              <CardActions sx={{ mt: 'auto', justifyContent: 'center', p: 1.5 }}>
                <Button
                  fullWidth
                  variant={tier.buttonVariant as 'outlined' | 'contained'}
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
    </BusinessSection>
  );
};

export default PricingSection;
