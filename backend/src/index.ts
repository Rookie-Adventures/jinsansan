import express, { Request, Response } from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Redis from 'redis';  // 取消注释 Redis

// 加载环境变量
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// 中间件
app.use(helmet());
app.use(express.json());

// 连接 MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jinshanshan')
  .then(() => console.log('Connected to MongoDB at:', process.env.MONGODB_URI))
  .catch(err => console.error('MongoDB connection error:', err));

// 连接 Redis
const redisClient = Redis.createClient({
  url: process.env.REDIS_URI || 'redis://localhost:6379'
});

redisClient.connect()
  .then(() => console.log('Connected to Redis at:', process.env.REDIS_URI))
  .catch(err => console.error('Redis connection error:', err));

// 路由
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Welcome to Jinshanshan API' });
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 