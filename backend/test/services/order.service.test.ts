import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OrderService } from '../../src/services/order.service';
import Order from '../../src/models/order.model';
import mongoose from 'mongoose';

// Mock redis module
vi.mock('redis', () => ({
  createClient: () => ({
    connect: vi.fn().mockResolvedValue(undefined),
    setEx: vi.fn().mockResolvedValue('OK'),
    get: vi.fn().mockResolvedValue(null),
    on: vi.fn(),
    isOpen: true
  })
}));

// Mock redis config
vi.mock('../../src/config/redis.config', () => ({
  getRedisClient: () => ({
    connect: vi.fn().mockResolvedValue(undefined),
    setEx: vi.fn().mockResolvedValue('OK'),
    get: vi.fn().mockResolvedValue(null),
    on: vi.fn(),
    isOpen: true
  }),
  connectRedis: vi.fn().mockResolvedValue({
    connect: vi.fn().mockResolvedValue(undefined),
    setEx: vi.fn().mockResolvedValue('OK'),
    get: vi.fn().mockResolvedValue(null),
    on: vi.fn(),
    isOpen: true
  })
}));

describe('OrderService', () => {
  beforeEach(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await Order.deleteMany({});
    await mongoose.connection.close();
  });

  it('should create an order', async () => {
    const orderData = {
      userId: '123',
      items: [{ productId: '456', quantity: 2, price: 100 }],
      total: 200
    };

    const order = await OrderService.createOrder(orderData);

    expect(order).toBeDefined();
    expect(order.total).toBe(orderData.total);
    expect(order.userId).toBe(orderData.userId);
  });

  it('should find order by id', async () => {
    const orderData = {
      userId: '123',
      items: [{ productId: '456', quantity: 2, price: 100 }],
      total: 200
    };

    const createdOrder = await OrderService.createOrder(orderData);
    const foundOrder = await OrderService.findOrderById(createdOrder.id);

    expect(foundOrder).toBeDefined();
    expect(foundOrder?.id).toBe(createdOrder.id);
  });

  it('should find orders by user id', async () => {
    const orderData = {
      userId: '123',
      items: [{ productId: '456', quantity: 2, price: 100 }],
      total: 200
    };

    await OrderService.createOrder(orderData);
    const orders = await OrderService.findOrdersByUserId(orderData.userId);

    expect(orders).toBeDefined();
    expect(orders.length).toBeGreaterThan(0);
    expect(orders[0].userId).toBe(orderData.userId);
  });
}); 