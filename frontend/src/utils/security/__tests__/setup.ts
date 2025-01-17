import { vi } from 'vitest';

// Mock localStorage with a working implementation
const store = new Map<string, string>();
const localStorageMock = {
  getItem: vi.fn((key: string) => store.get(key) || null),
  setItem: vi.fn((key: string, value: string) => store.set(key, value)),
  removeItem: vi.fn((key: string) => store.delete(key)),
  clear: vi.fn(() => store.clear()),
  length: 0,
  key: vi.fn((index: number) => null),
} as Storage;

global.localStorage = localStorageMock;

// Mock fetch
const mockHeaders = new Headers();
const mockResponse: Response = {
  ok: true,
  json: () => Promise.resolve({}),
  headers: mockHeaders,
  status: 200,
  statusText: 'OK',
  type: 'basic',
  url: '',
  redirected: false,
  body: null,
  bodyUsed: false,
  clone: () => mockResponse,
  arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
  blob: () => Promise.resolve(new Blob()),
  formData: () => Promise.resolve(new FormData()),
  text: () => Promise.resolve(''),
} as Response;

type FetchImpl = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(mockResponse));

global.fetch = fetchMock;

// Mock navigator
Object.defineProperty(global, 'navigator', {
  value: {
    userAgent: 'test-agent',
  },
  writable: true,
});

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  store.clear();
  fetchMock.mockClear();
}); 