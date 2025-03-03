import mongoose from 'mongoose';
import { createClient } from 'redis';
import { appConfig } from './app.config';

export const dbConfig = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/jinshanshan',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    options: {
      password: process.env.REDIS_PASSWORD,
    }
  }
};

// MongoDB 连接函数
export const connectMongoDB = async () => {
  try {
    await mongoose.connect(dbConfig.mongodb.uri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Redis 连接函数
export const connectRedis = async () => {
  // 开发环境下，如果 Redis 未配置则跳过
  if (appConfig.env === 'development' && !process.env.REDIS_URL) {
    console.log('Redis connection skipped in development environment');
    return null;
  }

  const client = createClient({
    url: dbConfig.redis.url,
    password: dbConfig.redis.options.password
  });

  client.on('error', (err) => {
    if (appConfig.env === 'development') {
      console.warn('Redis connection error (non-critical in development):', err);
    } else {
      console.error('Redis Client Error:', err);
    }
  });
  client.on('connect', () => console.log('Redis connected successfully'));

  try {
    await client.connect();
    return client;
  } catch (error) {
    if (appConfig.env === 'development') {
      console.warn('Redis connection failed (non-critical in development)');
      return null;
    }
    throw error;
  }
}; 