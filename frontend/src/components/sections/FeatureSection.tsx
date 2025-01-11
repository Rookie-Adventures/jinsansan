import React from 'react';
import { Grid, Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import { 
  Speed, 
  Security, 
  CloudSync,
  Psychology,
  Token,
  Autorenew,
  DataObject,
  Settings
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const features = [
  {
    icon: <Speed />,
    title: '流式响应体验',
    description: '支持流式输出，实现即时响应，提供流畅的对话体验',
  },
  {
    icon: <CloudSync />,
    title: '智能代理访问',
    description: '自动判断用户地区，智能使用代理，确保服务稳定可用',
  },
  {
    icon: <Psychology />,
    title: '智能上下文',
    description: '先进的上下文管理，支持多轮对话，提供连贯的交互体验',
  },
  {
    icon: <Token />,
    title: 'Token 优化',
    description: '智能的 Token 使用优化，平衡体验与成本',
  },
  {
    icon: <Security />,
    title: '安全可靠',
    description: '完善的安全机制，保护用户数据和API密钥安全',
  },
  {
    icon: <Autorenew />,
    title: '自动重试',
    description: '智能错误处理，自动重试机制，确保服务稳定性',
  },
  {
    icon: <DataObject />,
    title: '统一API',
    description: '提供统一的API接口，支持多种模型调用',
  },
  {
    icon: <Settings />,
    title: '高度定制',
    description: '支持个性化配置，满足不同场景需求',
  },
];

const FeatureSection: React.FC = () => {
  const theme = useTheme();

  return (
    <Box sx={{ 
      py: { xs: 4, md: 6 },
      px: { xs: 0.5, sm: 1 },
      background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(245,247,250,0.5) 100%)',
      width: '100%'
    }}>
      <Typography
        variant="h3"
        component="h2"
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
        核心特性
      </Typography>
      <Typography
        variant="h6"
        component="p"
        align="center"
        color="text.secondary"
        sx={{ mb: { xs: 3, md: 4 } }}
      >
        为您提供最优质的 HuggingFace 模型调用服务
      </Typography>
      <Grid container spacing={0.5}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index} sx={{ pl: { xs: 0.5, sm: 1 } }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              style={{ height: '100%' }}
            >
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease-in-out',
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: 1,
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: theme.shadows[8],
                    background: 'rgba(255, 255, 255, 0.95)',
                  },
                }}
              >
                <CardContent sx={{ p: 1.5 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      mb: 1,
                      color: 'primary.main',
                      '& > svg': { 
                        fontSize: { xs: 32, md: 40 },
                        filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))',
                      },
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    gutterBottom
                    variant="h6"
                    component="h3"
                    align="center"
                    sx={{ 
                      fontWeight: 'bold',
                      fontSize: { xs: '1rem', md: '1.15rem' },
                      mb: 0.5,
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                    sx={{
                      fontSize: { xs: '0.875rem', md: '0.9rem' },
                      lineHeight: 1.5,
                    }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FeatureSection; 