import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

export const appConfig = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  apiPrefix: '/api',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: '24h',
  corsOptions: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  }
}; 