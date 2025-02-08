import { LoginFormData, RegisterFormData, User } from '@/types/auth';
import { tokenService } from './tokenService';
import type { HttpClient } from '@/types/http';

export interface LoginResponse {
  user: User;
  token: string;
}

export class AuthService {
  private baseUrl = '/api/auth';

  constructor(private http: HttpClient) {}

  /**
   * 用户登录
   * @param data 登录表单数据
   */
  public async login(data: LoginFormData): Promise<LoginResponse> {
    const response = await this.http.post<LoginResponse>(`${this.baseUrl}/login`, data);
    tokenService.setToken(response.token);
    return response;
  }

  /**
   * 用户注册
   * @param data 注册表单数据
   */
  public async register(data: RegisterFormData): Promise<LoginResponse> {
    const response = await this.http.post<LoginResponse>(`${this.baseUrl}/register`, data);
    tokenService.setToken(response.token);
    return response;
  }

  /**
   * 用户登出
   */
  public async logout(): Promise<void> {
    await this.http.post(`${this.baseUrl}/logout`, {});
    tokenService.removeToken();
  }

  /**
   * 获取当前用户信息
   */
  public async getCurrentUser(): Promise<User> {
    const token = tokenService.getToken();
    if (!token) {
      throw new Error('No token found');
    }
    return await this.http.get<User>(`${this.baseUrl}/me`);
  }

  /**
   * 刷新 token
   */
  public async refreshToken(): Promise<string> {
    const response = await this.http.post<{ token: string }>(`${this.baseUrl}/refresh-token`, {});
    tokenService.setToken(response.token);
    return response.token;
  }

  /**
   * 验证 token 是否有效
   */
  public async validateToken(token: string): Promise<boolean> {
    try {
      await this.http.post(`${this.baseUrl}/validate-token`, { token });
      return true;
    } catch (error) {
      return false;
    }
  }
}

// 创建单例实例
let authServiceInstance: AuthService | null = null;

export const getAuthService = (http: HttpClient): AuthService => {
  if (!authServiceInstance) {
    authServiceInstance = new AuthService(http);
  }
  return authServiceInstance;
}; 