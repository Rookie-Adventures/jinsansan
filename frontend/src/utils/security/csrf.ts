import { v4 as uuidv4 } from 'uuid';

/**
 * CSRF Token管理器
 */
export class CSRFTokenManager {
  private static instance: CSRFTokenManager;
  private tokenKey = 'XSRF-TOKEN';
  private headerKey = 'X-XSRF-TOKEN';
  private currentToken: string | null = null;

  private constructor() {
    // 从localStorage恢复token
    this.currentToken = localStorage.getItem(this.tokenKey);
  }

  static getInstance(): CSRFTokenManager {
    if (!CSRFTokenManager.instance) {
      CSRFTokenManager.instance = new CSRFTokenManager();
    }
    return CSRFTokenManager.instance;
  }

  /**
   * 生成新的CSRF Token
   */
  generateToken(): string {
    const token = uuidv4();
    this.setToken(token);
    return token;
  }

  /**
   * 获取当前CSRF Token
   */
  getToken(): string | null {
    return this.currentToken;
  }

  /**
   * 设置CSRF Token
   */
  private setToken(token: string): void {
    this.currentToken = token;
    localStorage.setItem(this.tokenKey, token);
  }

  /**
   * 验证CSRF Token
   */
  validateToken(token: string): boolean {
    return this.currentToken === token;
  }

  /**
   * 获取CSRF Header名称
   */
  getHeaderKey(): string {
    return this.headerKey;
  }

  /**
   * 清除CSRF Token
   */
  clearToken(): void {
    this.currentToken = null;
    localStorage.removeItem(this.tokenKey);
  }
}

// 导出单例实例
export const csrfTokenManager = CSRFTokenManager.getInstance();
