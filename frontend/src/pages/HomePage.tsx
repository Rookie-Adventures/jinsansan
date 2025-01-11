import React from 'react';
import { Box } from '@mui/material';
import Navbar from '../components/layout/Navbar';
import HeroSection from '../components/sections/HeroSection';
import FeatureSection from '../components/sections/FeatureSection';
import PricingSection from '../components/sections/PricingSection';

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
        <HeroSection />
      </Box>

      {/* Feature Section */}
      <Box>
        <FeatureSection />
      </Box>

      {/* Pricing Section */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf3 100%)',
      }}>
        <PricingSection />
      </Box>
    </Box>
  );
};

export default HomePage; 