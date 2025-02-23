import Order from '../models/order.model';
import { getRedisClient, connectRedis } from '../config/redis.config';

export class OrderService {
  private static async ensureRedisConnection() {
    try {
      await connectRedis();
    } catch (error) {
      console.error('Redis connection failed:', error);
      // 如果 Redis 连接失败，我们仍然可以继续使用 MongoDB
    }
  }

  static async createOrder(data: {
    userId: string;
    items: Array<{ productId: string; quantity: number; price: number }>;
    total: number;
  }) {
    const order = new Order(data);
    const savedOrder = await order.save();
    
    try {
      await this.ensureRedisConnection();
      const redisClient = getRedisClient();
      // 将订单缓存到 Redis，设置过期时间为 1 小时
      await redisClient.setEx(`order:${savedOrder.id}`, 3600, JSON.stringify(savedOrder));
    } catch (error) {
      console.error('Redis caching failed:', error);
    }
    
    return savedOrder;
  }

  static async findOrderById(id: string) {
    try {
      await this.ensureRedisConnection();
      const redisClient = getRedisClient();
      // 先从 Redis 缓存中查找
      const cachedOrder = await redisClient.get(`order:${id}`);
      if (cachedOrder) {
        return JSON.parse(cachedOrder);
      }
    } catch (error) {
      console.error('Redis cache lookup failed:', error);
    }

    // 如果缓存中没有或发生错误，则从数据库中查找
    const order = await Order.findById(id);
    if (order) {
      try {
        const redisClient = getRedisClient();
        // 将查询结果缓存到 Redis
        await redisClient.setEx(`order:${id}`, 3600, JSON.stringify(order));
      } catch (error) {
        console.error('Redis caching failed:', error);
      }
    }
    return order;
  }

  static async findOrdersByUserId(userId: string) {
    return await Order.find({ userId }).sort({ createdAt: -1 });
  }

  static async updateOrderStatus(id: string, status: string) {
    const order = await Order.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (order) {
      try {
        await this.ensureRedisConnection();
        const redisClient = getRedisClient();
        // 更新 Redis 缓存
        await redisClient.setEx(`order:${id}`, 3600, JSON.stringify(order));
      } catch (error) {
        console.error('Redis cache update failed:', error);
      }
    }

    return order;
  }
} 