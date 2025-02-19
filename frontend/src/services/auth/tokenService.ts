export interface TokenPayload {
  exp: number;
  sub: string;
  [key: string]: unknown;
}

export class TokenService {
  private readonly TOKEN_KEY = 'auth_token';

  /**
   * 获取 token
   */
  public getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * 设置 token
   * @param token JWT token
   */
  public setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * 移除 token
   */
  public removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * 检查是否有 token
   */
  public hasToken(): boolean {
    return !!this.getToken();
  }

  /**
   * 解析 token
   * @param token JWT token
   * @returns TokenPayload 解析后的 token 载荷
   */
  public parseToken(token: string): TokenPayload {
    if (!token || typeof token !== 'string') {
      throw new Error('Invalid token format');
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    try {
      return JSON.parse(atob(parts[1]));
    } catch {
      throw new Error('Invalid token format');
    }
  }

  /**
   * 检查 token 是否过期
   * @param token JWT token
   */
  public isTokenExpired(token: string | null): boolean {
    if (!token) return true;

    try {
      const decoded = this.parseToken(token);
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}

export const tokenService = new TokenService();
