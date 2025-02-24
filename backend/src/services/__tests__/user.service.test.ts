import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { UserService } from '../user.service';
import User from '../../models/user.model';

describe('UserService', () => {
  beforeEach(async () => {
    // 清理测试数据
    await User.deleteMany({});
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