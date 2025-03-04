import { Box, Container, Grid, Typography, Link } from '@mui/material';
import { type FC } from 'react';
import { Link as RouterLink } from 'react-router-dom';

const Footer: FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        py: 6,
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              关于我们
            </Typography>
            <Typography variant="body2" color="text.secondary">
              我们致力于为用户提供最优质的服务和解决方案。
              通过不断创新和技术进步，为客户创造更大的价值。
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              快速链接
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link
                component={RouterLink}
                to="/"
                color="text.secondary"
                sx={{ textDecoration: 'none' }}
              >
                首页
              </Link>
              <Link
                component={RouterLink}
                to="/features"
                color="text.secondary"
                sx={{ textDecoration: 'none' }}
              >
                功能特性
              </Link>
              <Link
                component={RouterLink}
                to="/pricing"
                color="text.secondary"
                sx={{ textDecoration: 'none' }}
              >
                价格方案
              </Link>
              <Link
                component={RouterLink}
                to="/contact"
                color="text.secondary"
                sx={{ textDecoration: 'none' }}
              >
                联系我们
              </Link>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              联系方式
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              地址：北京市朝阳区xxx街道xxx号
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              电话：010-xxxxxxxx
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              邮箱：contact@example.com
            </Typography>
          </Grid>
        </Grid>
        <Box
          sx={{
            mt: 4,
            pt: 2,
            borderTop: 1,
            borderColor: 'divider',
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} ShineGold. 保留所有权利.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 