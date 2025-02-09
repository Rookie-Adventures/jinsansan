import { errorLogger } from '@/utils/error/errorLogger';
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
  private _config: EncryptionConfig;

  private constructor() {
    // 初始化配置
    this._config = Object.freeze({
      algorithm: 'AES',
      keySize: 256,
      iterations: 1000
    });

    // 设置只读的公开配置
    Object.defineProperty(this, 'config', {
      get: () => this._config,
      configurable: false,
      enumerable: true
    });
    
    // 使方法不可配置
    const prototype = Object.getPrototypeOf(this);
    const descriptors = Object.getOwnPropertyDescriptors(prototype);
    
    Object.defineProperties(prototype, {
      updateConfig: { ...descriptors.updateConfig, configurable: false },
      encrypt: { ...descriptors.encrypt, configurable: false },
      decrypt: { ...descriptors.decrypt, configurable: false },
      hash: { ...descriptors.hash, configurable: false },
      generateRandomString: { ...descriptors.generateRandomString, configurable: false },
      verifyHash: { ...descriptors.verifyHash, configurable: false }
    });
  }

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
      keySize: this._config.keySize / 32,
      iterations: this._config.iterations
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
      this.handleCryptoError(error, 'encrypt');
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
      this.handleCryptoError(error, 'decrypt');
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
  updateConfig(newConfig: Partial<EncryptionConfig>): void {
    // 更新私有配置
    this._config = Object.freeze({
      ...this._config,
      ...newConfig
    });
  }

  /**
   * 处理加密/解密错误
   */
  private handleCryptoError(error: unknown, operation: string): void {
    errorLogger.log(
      error instanceof Error ? error : new Error(`Crypto error in ${operation}`),
      {
        level: 'error',
        context: {
          operation,
          timestamp: Date.now(),
          source: 'EncryptionManager'
        }
      }
    );
  }
}

// 导出单例实例
export const encryptionManager = EncryptionManager.getInstance(); 