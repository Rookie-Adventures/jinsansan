import { encryptionManager } from './encryption';

import type { AuthEvent } from '@/types/security/auth';
import { errorLogger } from '@/utils/error/errorLogger';

/**
 * 身份认证管理器
 */
export class AuthManager {
  private static instance: AuthManager;
  private token: string | null = null;
  private sessionStartTime: number | null = null;
  private lastActivityTime: number | null = null;
  private loginAttempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30分钟
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly ATTEMPT_RESET_TIME = 15 * 60 * 1000; // 15分钟
  private readonly REAUTH_REQUIRED_TIME = 15 * 60 * 1000; // 15分钟

  private constructor() {
    // 监听存储事件以检测并发登录
    window.addEventListener('storage', this.handleStorageChange.bind(this));
    this.initializeFromStorage();
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  /**
   * 从存储中初始化状态
   */
  private initializeFromStorage(): void {
    const encryptedToken = localStorage.getItem('auth_token');
    if (encryptedToken) {
      try {
        this.token = encryptionManager.decrypt(encryptedToken, 'auth-secret');
        this.sessionStartTime = Number(localStorage.getItem('session_start'));
        this.lastActivityTime = Number(localStorage.getItem('last_activity'));
      } catch (error) {
        errorLogger.log(
          error instanceof Error ? error : new Error('Failed to initialize from storage'),
          {
            level: 'error',
            context: { source: 'AuthManager' },
          }
        );
        this.clearAuth();
      }
    }
  }

  /**
   * 处理存储变化事件
   */
  private handleStorageChange(event: StorageEvent): void {
    if (event.key === 'auth_token' && event.newValue !== null) {
      // 检测到其他标签页登录，终止当前会话
      this.clearAuth();
      window.dispatchEvent(new CustomEvent('concurrent-login'));
    }
  }

  /**
   * 验证Token格式
   */
  private validateTokenFormat(token: string): boolean {
    // 检查Token格式（示例：JWT格式检查）
    const jwtRegex = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/;
    return jwtRegex.test(token);
  }

  /**
   * 检查XSS攻击
   */
  private checkXSS(input: string): boolean {
    const xssRegex = /<[^>]*>|javascript:|data:|vbscript:/i;
    return !xssRegex.test(input);
  }

  /**
   * 设置Token
   */
  setToken(token: string, expiresIn?: number): void {
    if (!this.validateTokenFormat(token)) {
      throw new Error('无效的Token格式');
    }

    if (!this.checkXSS(token)) {
      throw new Error('检测到潜在的XSS攻击');
    }

    this.token = token;
    const encryptedToken = encryptionManager.encrypt(token, 'auth-secret');
    localStorage.setItem('auth_token', encryptedToken);

    if (expiresIn) {
      setTimeout(() => this.clearAuth(), expiresIn);
    }
  }

  /**
   * 获取Token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * 开始新会话
   */
  startSession(): void {
    const now = Date.now();
    this.sessionStartTime = now;
    this.lastActivityTime = now;
    localStorage.setItem('session_start', String(now));
    localStorage.setItem('last_activity', String(now));
  }

  /**
   * 刷新会话
   */
  refreshSession(): void {
    const now = Date.now();
    this.lastActivityTime = now;
    localStorage.setItem('last_activity', String(now));
  }

  /**
   * 检查会话是否活跃
   */
  isSessionActive(): boolean {
    if (!this.lastActivityTime || !this.sessionStartTime) return false;
    const now = Date.now();
    const sessionDuration = now - this.sessionStartTime;
    const inactiveTime = now - this.lastActivityTime;
    // 检查总会话时间不超过8小时且最后活动时间在30分钟内
    return sessionDuration < 8 * 60 * 60 * 1000 && inactiveTime < this.SESSION_TIMEOUT;
  }

  /**
   * 检查是否需要重新认证
   */
  requiresReauthentication(): boolean {
    if (!this.lastActivityTime) return true;
    return Date.now() - this.lastActivityTime > this.REAUTH_REQUIRED_TIME;
  }

  /**
   * 记录认证事件
   */
  logAuthEvent(event: AuthEvent): void {
    errorLogger.log(new Error(`Auth Event: ${event.action}`), {
      level: event.status === 'success' ? 'info' : 'error',
      context: {
        ...event,
        timestamp: Date.now(),
      },
    });
  }

  /**
   * 清除登录尝试记录
   */
  clearLoginAttempts(): void {
    this.loginAttempts.clear();
  }

  /**
   * 检查登录尝试次数
   */
  private checkLoginAttempts(username: string): void {
    const now = Date.now();
    const attempts = this.loginAttempts.get(username);

    if (attempts) {
      // 重置超时的尝试记录
      if (now - attempts.lastAttempt > this.ATTEMPT_RESET_TIME) {
        this.loginAttempts.set(username, { count: 1, lastAttempt: now });
        return;
      }

      // 检查是否超过最大尝试次数
      if (attempts.count >= this.MAX_LOGIN_ATTEMPTS) {
        throw new Error('登录尝试次数过多');
      }

      // 更新尝试记录
      this.loginAttempts.set(username, {
        count: attempts.count + 1,
        lastAttempt: now,
      });
    } else {
      // 创建新的尝试记录
      this.loginAttempts.set(username, { count: 1, lastAttempt: now });
    }
  }

  /**
   * 处理认证错误
   */
  private handleAuthError(error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    this.logAuthEvent({
      action: 'login_error',
      status: 'failure',
      timestamp: Date.now(),
      details: { error: errorMessage },
    });
  }

  /**
   * 登录
   */
  async login(username: string, password: string): Promise<void> {
    try {
      this.checkLoginAttempts(username);

      // TODO: 实现实际的登录逻辑
      if (username === 'test' && password === 'test') {
        this.setToken(
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U'
        );
        this.startSession();
        this.logAuthEvent({
          action: 'login',
          status: 'success',
          timestamp: Date.now(),
          details: { username },
        });
      } else {
        const error = new Error('invalid_credentials');
        this.handleAuthError(error);
        throw error;
      }
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  /**
   * 登出
   */
  logout(): void {
    this.clearAuth();
    this.logAuthEvent({
      action: 'logout',
      status: 'success',
      timestamp: Date.now(),
    });
  }

  /**
   * 清除认证状态
   */
  private clearAuth(): void {
    this.token = null;
    this.sessionStartTime = null;
    this.lastActivityTime = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('session_start');
    localStorage.removeItem('last_activity');
  }

  public getSessionDuration(): number {
    if (!this.sessionStartTime) return 0;
    return Date.now() - this.sessionStartTime;
  }
}

// 导出单例实例
export const authManager = AuthManager.getInstance();
