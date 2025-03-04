import { HttpConfig, HttpHeaders, HttpParams, HttpMethod } from '../types/http';
import { API_HEADERS, API_CONTENT_TYPES, API_METHODS } from '../constants/api';
import { createNetworkError } from './error';

export const createHttpConfig = (
  method: HttpMethod,
  url: string,
  config?: Partial<HttpConfig>
): HttpConfig => {
  return {
    method,
    url,
    headers: {
      [API_HEADERS.CONTENT_TYPE]: API_CONTENT_TYPES.JSON,
      [API_HEADERS.ACCEPT]: API_CONTENT_TYPES.JSON,
      ...config?.headers,
    },
    params: config?.params,
    data: config?.data,
    timeout: config?.timeout,
    withCredentials: config?.withCredentials,
    responseType: config?.responseType,
    validateStatus: config?.validateStatus,
  };
};

export const createHeaders = (headers: HttpHeaders = {}): HttpHeaders => {
  return {
    [API_HEADERS.CONTENT_TYPE]: API_CONTENT_TYPES.JSON,
    [API_HEADERS.ACCEPT]: API_CONTENT_TYPES.JSON,
    ...headers,
  };
};

export const createParams = (params: HttpParams = {}): HttpParams => {
  return Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== null && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {} as HttpParams);
};

export const createQueryString = (params: HttpParams = {}): string => {
  const queryParams = Object.entries(params)
    .filter(([_, value]) => value !== null && value !== undefined)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value
          .map((v) => `${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`)
          .join('&');
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
    })
    .join('&');

  return queryParams ? `?${queryParams}` : '';
};

export const createUrl = (baseUrl: string, path: string, params?: HttpParams): string => {
  const queryString = params ? createQueryString(params) : '';
  return `${baseUrl}${path}${queryString}`;
};

export const handleHttpError = (error: any) => {
  if (error.response) {
    return createNetworkError({
      url: error.config?.url,
      method: error.config?.method,
      status: error.response.status,
    });
  }
  if (error.request) {
    return createNetworkError({
      url: error.config?.url,
      method: error.config?.method,
    });
  }
  return createNetworkError({
    url: error.config?.url,
    method: error.config?.method,
  });
};

export const isHttpError = (error: any): boolean => {
  return (
    error &&
    typeof error === 'object' &&
    ('response' in error || 'request' in error || 'config' in error)
  );
};

export const getHttpErrorMessage = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An error occurred';
};

export const getHttpErrorStatus = (error: any): number => {
  return error.response?.status || 500;
};

export const getHttpErrorHeaders = (error: any): HttpHeaders => {
  return error.response?.headers || {};
}; 