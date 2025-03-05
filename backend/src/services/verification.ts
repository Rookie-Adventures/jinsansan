import { RedisClientType, RedisModules, RedisFunctions, RedisScripts } from '@redis/client';
import { VerificationType, VerificationPurpose } from '@jinshanshan/shared';

export class VerificationService {
  private redisClient: RedisClientType<RedisModules, RedisFunctions, RedisScripts>;
  private readonly CODE_EXPIRE_TIME = 300; // 验证码有效期：5分钟
  private readonly COOLDOWN_TIME = 60; // 重发冷却时间：1分钟

  constructor(redisClient: RedisClientType<RedisModules, RedisFunctions, RedisScripts>) {
    this.redisClient = redisClient;
  }

  /**
   * 生成6位数字验证码
   */
  private generateCode(): string {
    return Math.random().toString().slice(-6);
  }

  /**
   * 获取验证码的 Redis key
   */
  private getCodeKey(type: VerificationType, target: string, purpose: VerificationPurpose): string {
    return `verification:${type}:${target}:${purpose}`;
  }

  /**
   * 获取冷却时间的 Redis key
   */
  private getCooldownKey(type: VerificationType, target: string): string {
    return `verification:cooldown:${type}:${target}`;
  }

  /**
   * 发送验证码
   */
  async sendCode(
    type: VerificationType,
    target: string,
    purpose: VerificationPurpose
  ): Promise<{ success: boolean; message: string; cooldown?: number }> {
    try {
      // 检查是否在冷却时间内
      const cooldownKey = this.getCooldownKey(type, target);
      const cooldown = await this.redisClient.get(cooldownKey);
      
      if (cooldown) {
        return {
          success: false,
          message: '请稍后再试',
          cooldown: parseInt(cooldown)
        };
      }

      // 生成验证码
      const code = this.generateCode();
      const codeKey = this.getCodeKey(type, target, purpose);

      // 存储验证码和冷却时间
      await Promise.all([
        this.redisClient.set(codeKey, code, { EX: this.CODE_EXPIRE_TIME }),
        this.redisClient.set(cooldownKey, this.COOLDOWN_TIME.toString(), { EX: this.COOLDOWN_TIME })
      ]);

      // TODO: 根据类型发送验证码（短信或邮件）
      console.log(`[${type}] 向 ${target} 发送验证码: ${code}`);

      return {
        success: true,
        message: '验证码已发送',
        cooldown: this.COOLDOWN_TIME
      };
    } catch (error) {
      console.error('发送验证码失败:', error);
      return {
        success: false,
        message: '发送验证码失败，请重试'
      };
    }
  }

  /**
   * 验证验证码
   */
  async verifyCode(
    type: VerificationType,
    target: string,
    code: string,
    purpose: VerificationPurpose
  ): Promise<{ success: boolean; message: string }> {
    try {
      const codeKey = this.getCodeKey(type, target, purpose);
      const storedCode = await this.redisClient.get(codeKey);

      if (!storedCode) {
        return {
          success: false,
          message: '验证码已过期，请重新获取'
        };
      }

      if (storedCode !== code) {
        return {
          success: false,
          message: '验证码错误'
        };
      }

      // 验证成功后删除验证码
      await this.redisClient.del(codeKey);

      return {
        success: true,
        message: '验证成功'
      };
    } catch (error) {
      console.error('验证验证码失败:', error);
      return {
        success: false,
        message: '验证失败，请重试'
      };
    }
  }
} 