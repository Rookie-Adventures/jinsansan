import { http, HttpResponse } from 'msw'
import { setupWorker } from 'msw/browser'
import { authHandlers } from './handlers/auth'

// 合并所有处理器
export const handlers = [...authHandlers]

// 创建 worker 实例
export const worker = setupWorker(...handlers)

// 开发环境下启动 mock 服务
if (process.env.NODE_ENV === 'development') {
  worker.start({
    onUnhandledRequest: 'bypass', // 对未处理的请求直接放行
  })
} 