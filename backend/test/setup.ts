import 'dotenv/config';
import mongoose from 'mongoose';
import { beforeAll, afterAll } from 'vitest';

// 使用内存数据库进行测试
beforeAll(async () => {
  // 设置测试环境变量
  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/test';
  process.env.JWT_SECRET = 'test_secret';

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to test database');
  } catch (error) {
    console.error('Failed to connect to test database:', error);
    throw error;
  }
});

afterAll(async () => {
  try {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    console.log('Test database connection closed');
  } catch (error) {
    console.error('Failed to close test database connection:', error);
    throw error;
  }
}); 