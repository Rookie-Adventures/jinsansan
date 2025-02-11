import { vi } from 'vitest';

export interface MockFetchResponse {
  ok: boolean;
  status: number;
  statusText: string;
  headers: Headers;
  json: () => Promise<unknown>;
  type: ResponseType;
  url: string;
  redirected: boolean;
  body: ReadableStream<Uint8Array> | null;
  bodyUsed: boolean;
  clone: () => MockFetchResponse;
  arrayBuffer: () => Promise<ArrayBuffer>;
  blob: () => Promise<Blob>;
  formData: () => Promise<FormData>;
  text: () => Promise<string>;
}

export interface MockFetchOptions {
  ok?: boolean;
  status?: number;
  statusText?: string;
  json?: unknown;
  headers?: Headers;
}

/**
 * 创建模拟的 Response 对象
 * @param options 响应选项
 * @returns 模拟的 Response 对象
 */
export const createMockResponse = (options: MockFetchOptions = {}): MockFetchResponse => {
  const {
    ok = true,
    status = 200,
    statusText = 'OK',
    json = {},
    headers = new Headers(),
  } = options;

  const response: MockFetchResponse = {
    ok,
    status,
    statusText,
    headers,
    json: () => Promise.resolve(json),
    type: 'basic',
    url: '',
    redirected: false,
    body: null,
    bodyUsed: false,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
    formData: () => Promise.resolve(new FormData()),
    text: () => Promise.resolve(''),
    clone: function() { return { ...this }; },
  };

  return response;
};

/**
 * 设置全局的 fetch 模拟
 * @param defaultOptions 默认的响应选项
 * @returns 模拟的 fetch 函数
 */
export const setupMockFetch = (defaultOptions: MockFetchOptions = {}) => {
  const mockResponse = createMockResponse(defaultOptions);
  const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(mockResponse));
  
  global.fetch = fetchMock;
  
  return fetchMock;
};

/**
 * 设置全局的 navigator 模拟
 * @param userAgent 用户代理字符串
 */
export const setupMockNavigator = (userAgent = 'test-agent') => {
  Object.defineProperty(global, 'navigator', {
    value: {
      userAgent,
    },
    writable: true,
  });
}; 