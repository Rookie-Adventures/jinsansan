import React, { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';
import Navbar from '../components/layout/Navbar';

// 使用 React.lazy 懒加载组件
const LazyHeroSection = React.lazy(() => import('../components/sections/HeroSection'));
const LazyFeatureSection = React.lazy(() => import('../components/sections/FeatureSection'));
const LazyPricingSection = React.lazy(() => import('../components/sections/PricingSection'));

// Loading 组件
const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
    <CircularProgress />
  </Box>
);

const HomePage: React.FC = () => {
  return (
    <Box sx={{ 
      width: '100vw',
      margin: '-8px',
      padding: 0,
      overflow: 'hidden',
      position: 'relative',
      left: '50%',
      right: '50%',
      marginLeft: '-50vw',
      marginRight: '-50vw',
    }}>
      <Navbar />
      {/* Hero Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #24243e 0%, #302b63 50%, #0f0c29 100%)',
          color: 'white',
          position: 'relative',
          pt: '64px', // 为导航栏留出空间
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0) 70%)',
            pointerEvents: 'none',
          }
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <LazyHeroSection />
        </Suspense>
      </Box>

      {/* Feature Section */}
      <Box>
        <Suspense fallback={<LoadingFallback />}>
          <LazyFeatureSection />
        </Suspense>
      </Box>

      {/* Pricing Section */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf3 100%)',
      }}>
        <Suspense fallback={<LoadingFallback />}>
          <LazyPricingSection />
        </Suspense>
      </Box>
    </Box>
  );
};

export default HomePage; 