import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { UserService } from '../../src/services/user.service';
import User from '../../src/models/user.model';
import mongoose from 'mongoose';

describe('UserService', () => {
  beforeEach(async () => {
    // 连接测试数据库
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
  });

  afterEach(async () => {
    // 清理测试数据
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  it('should create a user', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@test.com',
      password: 'password123'
    };

    const user = await UserService.createUser(userData);

    expect(user).toBeDefined();
    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email);
  });

  it('should find user by email', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@test.com',
      password: 'password123'
    };

    await UserService.createUser(userData);
    const foundUser = await UserService.findUserByEmail(userData.email);

    expect(foundUser).toBeDefined();
    expect(foundUser?.email).toBe(userData.email);
  });
}); 