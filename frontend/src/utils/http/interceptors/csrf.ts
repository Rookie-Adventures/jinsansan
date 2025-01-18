import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { csrfTokenManager } from '../../security/csrf';

/**
 * CSRF请求拦截器
 * 用于在请求头中添加CSRF token
 */
export function csrfRequestInterceptor(config: AxiosRequestConfig): AxiosRequestConfig {
  const token = csrfTokenManager.getToken();
  if (token) {
    if (!config.headers) {
      config.headers = {};
    }
    config.headers[csrfTokenManager.getHeaderKey()] = token;
  }
  return config;
}

/**
 * CSRF响应拦截器
 * 用于处理服务端返回的新CSRF token
 */
export function csrfResponseInterceptor(response: AxiosResponse): AxiosResponse {
  const newToken = response.headers?.[csrfTokenManager.getHeaderKey().toLowerCase()];
  if (newToken) {
    csrfTokenManager.generateToken();
  }
  return response;
} 