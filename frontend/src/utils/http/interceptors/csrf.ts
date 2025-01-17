import { AxiosRequestConfig } from 'axios';
import { csrfTokenManager } from '../../security/csrf';

/**
 * CSRF请求拦截器
 */
export function csrfRequestInterceptor(config: AxiosRequestConfig): AxiosRequestConfig {
  // 仅为修改数据的请求添加CSRF token
  const methods = ['post', 'put', 'delete', 'patch'];
  if (methods.includes(config.method?.toLowerCase() || '')) {
    const token = csrfTokenManager.getToken() || csrfTokenManager.generateToken();
    config.headers = {
      ...config.headers,
      [csrfTokenManager.getHeaderKey()]: token
    };
  }
  return config;
}

/**
 * CSRF响应拦截器
 * 用于处理服务端返回的新CSRF token
 */
export function csrfResponseInterceptor(response: any): any {
  const newToken = response.headers?.[csrfTokenManager.getHeaderKey().toLowerCase()];
  if (newToken) {
    csrfTokenManager.generateToken();
  }
  return response;
} 