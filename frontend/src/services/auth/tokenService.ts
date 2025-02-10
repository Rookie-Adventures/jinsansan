export interface TokenPayload {
  exp: number;
  iat: number;
  sub: string;
  username: string;
  roles: string[];
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
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
    } catch (error) {
      throw error;
    }
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
      const payload = JSON.parse(atob(parts[1]));
      if (!this.isValidTokenPayload(payload)) {
        throw new Error('Invalid token payload');
      }
      return payload;
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

  /**
   * 验证 token payload 是否有效
   * @param payload token payload
   */
  private isValidTokenPayload(payload: unknown): payload is TokenPayload {
    if (!payload || typeof payload !== 'object') return false;
    
    const p = payload as Partial<TokenPayload>;
    return (
      typeof p.exp === 'number' &&
      typeof p.iat === 'number' &&
      typeof p.sub === 'string' &&
      typeof p.username === 'string' &&
      Array.isArray(p.roles)
    );
  }
}

export const tokenService = new TokenService();
