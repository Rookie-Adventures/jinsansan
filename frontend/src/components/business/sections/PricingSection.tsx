import { Check } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  useTheme,
  useMediaQuery,
  Container,
} from '@mui/material';
import { motion } from 'framer-motion';

import type { FC } from 'react';

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

const PricingSection: FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          py: { xs: 4, md: 6 },
          px: { xs: 2, sm: 3 },
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
        role="main"
        aria-label="价格方案"
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
          价格方案
        </Typography>
        <Typography
          variant="h6"
          align="center"
          color="text.secondary"
          component="p"
          sx={{ mb: { xs: 3, md: 4 } }}
        >
          选择最适合您的方案，开启 AI 之旅
        </Typography>
        <Box sx={{ maxWidth: '1200px', width: '100%' }}>
          <Grid container spacing={2} alignItems="flex-end" justifyContent="center">
            {tiers.map((tier, index) => (
              <Grid
                item
                key={tier.title}
                xs={11}
                sm={tier.title === '专业版' ? 11 : 6}
                md={tier.title === '专业版' ? 4 : 4}
                sx={{
                  maxWidth: '360px',
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  style={{ height: '100%' }}
                >
                  <Card
                    role="article"
                    aria-label={`${tier.title}价格方案`}
                    elevation={tier.title === '专业版' ? 8 : 0}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s ease-in-out',
                      background:
                        tier.title === '专业版'
                          ? 'linear-gradient(135deg, rgba(36,36,62,0.03) 0%, rgba(48,43,99,0.03) 100%)'
                          : 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: 1,
                      ...(tier.title === '专业版' && {
                        transform: 'scale(1.05)',
                      }),
                      '&:hover': {
                        transform: tier.title === '专业版' ? 'scale(1.08)' : 'scale(1.03)',
                        boxShadow: theme.shadows[8],
                      },
                    }}
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
                        backgroundColor:
                          theme.palette.mode === 'light'
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
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              mb: 1,
                            }}
                          >
                            <Check sx={{ color: 'primary.main' }} />
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
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default PricingSection;
