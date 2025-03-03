import { Box } from '@mui/material';
import { type FC } from 'react';

import FeatureSection from '../components/business/sections/FeatureSection';
import HeroSection from '../components/business/sections/HeroSection';
import PricingSection from '../components/business/sections/PricingSection';
import Navbar from '../components/common/layout/Navbar';

const HomePage: FC = () => {
  return (
    <Box
      sx={{
        width: '100vw',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        position: 'relative',
        left: '50%',
        right: '50%',
        marginLeft: '-50vw',
        marginRight: '-50vw',
        backgroundColor: '#f0f0f0', // 添加背景色
      }}
    >
      <Navbar />
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #24243e 0%, #302b63 50%, #0f0c29 100%)',
          color: 'white',
          position: 'relative',
          pt: '64px', // 为导航栏留出空间
          pb: '64px', // 为底部留出空间
          textAlign: 'center', // 中心对齐
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0) 70%)',
            pointerEvents: 'none',
          },
        }}
      >
        <HeroSection />
        <h1 style={{ fontSize: '2.5rem', margin: '20px 0' }}>欢迎来到我们的主页</h1> {/* 添加欢迎标题 */}
        <p style={{ fontSize: '1.2rem', margin: '10px 0' }}>探索我们的特色和服务</p> {/* 添加描述 */}
      </Box>

      {/* Feature Section */}
      <Box sx={{ padding: '40px 20px', textAlign: 'center' }}>
        <FeatureSection />
      </Box>

      {/* Pricing Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf3 100%)',
          padding: '40px 20px',
          textAlign: 'center',
        }}
      >
        <PricingSection />
      </Box>
    </Box>
  );
};

export default HomePage;
