// 生成缓存键
public generateCacheKey(config: HttpRequestConfig): string {
  const { method = 'GET', url = '', params, data } = config;
  return `${method}-${url}-${JSON.stringify(params)}-${JSON.stringify(data)}`;
} 