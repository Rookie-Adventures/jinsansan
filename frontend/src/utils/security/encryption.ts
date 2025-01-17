import CryptoJS from 'crypto-js';

/**
 * 加密配置接口
 */
interface EncryptionConfig {
  algorithm: 'AES' | 'DES' | 'TripleDES';
  keySize: number;
  iterations: number;
}

/**
 * 加密管理器
 */
export class EncryptionManager {
  private static instance: EncryptionManager;
  private config: EncryptionConfig = {
    algorithm: 'AES',
    keySize: 256,
    iterations: 1000
  };

  private constructor() {}

  static getInstance(): EncryptionManager {
    if (!EncryptionManager.instance) {
      EncryptionManager.instance = new EncryptionManager();
    }
    return EncryptionManager.instance;
  }

  /**
   * 生成密钥
   */
  private generateKey(salt: string, passphrase: string): string {
    return CryptoJS.PBKDF2(passphrase, salt, {
      keySize: this.config.keySize / 32,
      iterations: this.config.iterations
    }).toString();
  }

  /**
   * 加密数据
   */
  encrypt(data: string, passphrase: string): string {
    try {
      const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
      const key = this.generateKey(salt, passphrase);
      const encrypted = CryptoJS.AES.encrypt(data, key);
      return salt + encrypted.toString();
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('加密失败');
    }
  }

  /**
   * 解密数据
   */
  decrypt(encryptedData: string, passphrase: string): string {
    try {
      const salt = encryptedData.slice(0, 32);
      const encrypted = encryptedData.slice(32);
      const key = this.generateKey(salt, passphrase);
      const decrypted = CryptoJS.AES.decrypt(encrypted, key);
      const result = decrypted.toString(CryptoJS.enc.Utf8);
      if (!result) {
        throw new Error('解密失败：无效的密码');
      }
      return result;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('解密失败：' + (error instanceof Error ? error.message : '未知错误'));
    }
  }

  /**
   * 哈希数据
   */
  hash(data: string): string {
    return CryptoJS.SHA256(data).toString();
  }

  /**
   * 生成安全的随机字符串
   */
  generateRandomString(length: number): string {
    const wordArray = CryptoJS.lib.WordArray.random(length);
    return wordArray.toString();
  }

  /**
   * 验证哈希
   */
  verifyHash(data: string, hash: string): boolean {
    return this.hash(data) === hash;
  }

  /**
   * 更新加密配置
   */
  updateConfig(config: Partial<EncryptionConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// 导出单例实例
export const encryptionManager = EncryptionManager.getInstance(); 