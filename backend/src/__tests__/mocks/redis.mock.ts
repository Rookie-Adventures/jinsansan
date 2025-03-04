import { vi } from 'vitest';

export const redisMock = {
  connect: vi.fn().mockResolvedValue(undefined),
  setEx: vi.fn().mockResolvedValue('OK'),
  get: vi.fn().mockResolvedValue(null),
  on: vi.fn(),
};

export const createClientMock = () => redisMock;

export default {
  createClient: createClientMock
}; 