import { AxiosHeaders, type AxiosError } from 'axios';

// 共享的测试数据类型
export type { AxiosError };
export interface TestData {
  id: number;
  name: string;
}

export interface ComplexTestData {
  id: number;
  name: string;
  metadata: {
    createdAt: string;
    updatedAt: string;
  };
  tags: string[];
}

export type TestResponse<T = unknown> = {
  code: number;
  data: T;
  message: string;
}

// 测试数据创建函数
export const createTestData = (id: number = 1, name: string = 'test'): TestData => ({
  id,
  name,
});

export const createComplexTestData = (): ComplexTestData => ({
  id: 1,
  name: 'test',
  metadata: {
    createdAt: '2024-01-01',
    updatedAt: '2024-01-02',
  },
  tags: ['tag1', 'tag2'],
});

export const createTestResponse = <T>(data: T, code: number = 200, message: string = 'success'): TestResponse<T> => ({
  code,
  data,
  message,
});

export const createAxiosError = (status: number = 500, message: string = 'Internal server error'): AxiosError => {
  const headers = new AxiosHeaders();
  return {
    name: 'AxiosError',
    message: 'Request failed',
    isAxiosError: true,
    toJSON: () => ({}),
    config: {
      headers,
    },
    response: {
      data: { message },
      status,
      statusText: message,
      headers: {},
      config: {
        headers,
      },
    },
  };
};

// 类型测试工具
export const expectTypeChecks = (data: ComplexTestData): void => {
  expect(typeof data.id).toBe('number');
  expect(typeof data.name).toBe('string');
  expect(Array.isArray(data.tags)).toBe(true);
  expect(data.metadata).toHaveProperty('createdAt');
  expect(data.metadata).toHaveProperty('updatedAt');
};

export type UnionResponseType = { success: true; data: TestData } | { success: false; error: string };

export const createUnionResponses = (testData: TestData): [UnionResponseType, UnionResponseType] => {
  const successResponse: UnionResponseType = { success: true, data: testData };
  const errorResponse: UnionResponseType = { success: false, error: 'Not found' };
  return [successResponse, errorResponse];
}; 