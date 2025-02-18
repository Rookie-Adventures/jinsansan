/**
 * 通用 HTTP 配置接口
 * @description 定义 HTTP 请求的通用配置选项
 * @remarks 这些配置选项在整个应用的 HTTP 请求中被使用
 */
export interface HttpConfig {
  /** 请求头配置 */
  headers?: Record<string, string>;
  /** 请求超时时间（毫秒） */
  timeout?: number;
  /** 用于取消请求的信号 */
  signal?: AbortSignal;
  /** 其他可能的配置项 */
  [key: string]: unknown;
}

/**
 * HTTP 客户端接口
 * @description 定义应用中所有 HTTP 请求的标准接口
 * @remarks
 * 这是一个关键的接口契约，在多个服务中被实现：
 * - 基础 HTTP 客户端
 * - 认证服务
 * - 搜索服务
 * - 文件服务
 * 请勿删除或修改任何方法签名，这些都是 API 契约的一部分。
 */
export interface HttpClient {
  /**
   * HTTP GET 请求
   * @param url - 请求地址，用于指定资源位置
   * @param config - 请求配置，包含headers、timeout等选项
   * @remarks 参数即使未在某些实现中使用，也是接口契约的必要部分
   */
  get<T = unknown>(url: string, config?: HttpConfig): Promise<T>;

  /**
   * HTTP POST 请求
   * @param url - 请求地址，用于指定资源位置
   * @param data - 请求数据，包含需要创建或更新的资源信息
   * @param config - 请求配置，包含headers、timeout等选项
   * @remarks 所有参数都是 RESTful API 规范的重要组成部分
   */
  post<T = unknown>(url: string, data?: unknown, config?: HttpConfig): Promise<T>;

  /**
   * HTTP PUT 请求
   * @param url - 请求地址，用于指定资源位置
   * @param data - 请求数据，包含需要更新的资源信息
   * @param config - 请求配置，包含headers、timeout等选项
   * @remarks 遵循 HTTP/1.1 规范，用于完整更新资源
   */
  put<T = unknown>(url: string, data?: unknown, config?: HttpConfig): Promise<T>;

  /**
   * HTTP DELETE 请求
   * @param url - 请求地址，用于指定要删除的资源位置
   * @param config - 请求配置，包含headers、timeout等选项
   * @remarks 即使某些实现可能不使用全部参数，保留它们也是为了接口的完整性
   */
  delete<T = unknown>(url: string, config?: HttpConfig): Promise<T>;
}
