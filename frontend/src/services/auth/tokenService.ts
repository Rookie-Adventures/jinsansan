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
   */
  public parseToken(token: string): { exp: number; [key: string]: any } {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Invalid token format');
    }
  }

  /**
   * 检查 token 是否过期
   * @param token JWT token
   */
  public isTokenExpired(token: string): boolean {
    try {
      const decoded = this.parseToken(token);
      return decoded.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  }
}

export const tokenService = new TokenService(); 