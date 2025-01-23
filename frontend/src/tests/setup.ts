import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { afterEach, beforeAll, vi } from 'vitest'
import { handlers } from '../mocks/handlers'

// MSW 服务器设置
export const server = setupServer(...handlers)

// 全局 Mock 设置
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({
      pathname: '/',
      search: '',
      hash: '',
      state: null
    })
  }
})

// 环境设置
beforeAll(() => {
  // 启动 MSW
  server.listen({ onUnhandledRequest: 'error' })
  
  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn()
  }
  global.localStorage = localStorageMock
  
  // Mock window.matchMedia
  global.matchMedia = vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
})

// 每个测试后清理
afterEach(() => {
  cleanup()
  server.resetHandlers()
  localStorage.clear()
})

// 所有测试结束后清理
afterAll(() => {
  server.close()
  vi.clearAllMocks()
}) 