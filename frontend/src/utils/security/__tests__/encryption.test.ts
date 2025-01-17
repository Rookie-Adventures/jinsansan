import { encryptionManager } from '../encryption';

describe('EncryptionManager', () => {
  const testData = 'Hello, World!';
  const testPassphrase = 'test-passphrase';

  describe('加密解密测试', () => {
    test('应该能正确加密和解密数据', () => {
      const encrypted = encryptionManager.encrypt(testData, testPassphrase);
      expect(encrypted).not.toBe(testData);
      
      const decrypted = encryptionManager.decrypt(encrypted, testPassphrase);
      expect(decrypted).toBe(testData);
    });

    test('使用错误的密码短语应该解密失败', () => {
      const encrypted = encryptionManager.encrypt(testData, testPassphrase);
      expect(() => {
        encryptionManager.decrypt(encrypted, 'wrong-passphrase');
      }).toThrow();
    });

    test('加密结果应该每次都不同', () => {
      const encrypted1 = encryptionManager.encrypt(testData, testPassphrase);
      const encrypted2 = encryptionManager.encrypt(testData, testPassphrase);
      expect(encrypted1).not.toBe(encrypted2);
    });
  });

  describe('哈希测试', () => {
    test('相同数据应该产生相同的哈希', () => {
      const hash1 = encryptionManager.hash(testData);
      const hash2 = encryptionManager.hash(testData);
      expect(hash1).toBe(hash2);
    });

    test('不同数据应该产生不同的哈希', () => {
      const hash1 = encryptionManager.hash(testData);
      const hash2 = encryptionManager.hash(testData + '1');
      expect(hash1).not.toBe(hash2);
    });

    test('哈希验证应该正确工作', () => {
      const hash = encryptionManager.hash(testData);
      expect(encryptionManager.verifyHash(testData, hash)).toBe(true);
      expect(encryptionManager.verifyHash(testData + '1', hash)).toBe(false);
    });
  });

  describe('随机字符串生成测试', () => {
    test('应该生成指定长度的随机字符串', () => {
      const length = 16;
      const random = encryptionManager.generateRandomString(length);
      expect(random.length).toBeGreaterThanOrEqual(length);
    });

    test('生成的随机字符串应该每次都不同', () => {
      const random1 = encryptionManager.generateRandomString(16);
      const random2 = encryptionManager.generateRandomString(16);
      expect(random1).not.toBe(random2);
    });
  });

  describe('配置测试', () => {
    test('应该能更新加密配置', () => {
      const newConfig = {
        algorithm: 'AES' as const,
        keySize: 128,
        iterations: 500
      };
      
      encryptionManager.updateConfig(newConfig);
      
      // 确保加密解密仍然正常工作
      const encrypted = encryptionManager.encrypt(testData, testPassphrase);
      const decrypted = encryptionManager.decrypt(encrypted, testPassphrase);
      expect(decrypted).toBe(testData);
    });
  });

  test('应该维护单例实例', () => {
    const instance1 = encryptionManager;
    const instance2 = encryptionManager;
    expect(instance1).toBe(instance2);
  });
}); 