import { describe, it, expect } from 'vitest';
import { EncryptionUtil } from '../encryption.util';

describe('EncryptionUtil', () => {
  it('should hash password correctly', async () => {
    const password = 'testPassword123';
    const hashedPassword = await EncryptionUtil.hashPassword(password);

    expect(hashedPassword).toBeDefined();
    expect(hashedPassword).not.toBe(password);
  });

  it('should verify password correctly', async () => {
    const password = 'testPassword123';
    const hashedPassword = await EncryptionUtil.hashPassword(password);

    const isValid = await EncryptionUtil.comparePassword(password, hashedPassword);
    expect(isValid).toBe(true);
  });

  it('should reject incorrect password', async () => {
    const password = 'testPassword123';
    const wrongPassword = 'wrongPassword123';
    const hashedPassword = await EncryptionUtil.hashPassword(password);

    const isValid = await EncryptionUtil.comparePassword(wrongPassword, hashedPassword);
    expect(isValid).toBe(false);
  });
}); 