import { http, HttpResponse } from 'msw'

interface LoginRequest {
  username: string
  password: string
}

interface User {
  id: number
  username: string
  email: string
}

interface LoginResponse {
  token: string
  user: User
}

type ApiResponse<T> = {
  data: T
  message?: string
  status: number
}

export const authHandlers = [
  // 登录
  http.post<never, LoginRequest>('/api/auth/login', async ({ request }) => {
    const { username, password } = await request.json()
    
    if (username === 'test' && password === 'test') {
      return HttpResponse.json<ApiResponse<LoginResponse>>({
        data: {
          token: 'mock-jwt-token',
          user: {
            id: 1,
            username: 'test',
            email: 'test@example.com'
          }
        },
        status: 200
      })
    }
    
    return HttpResponse.json<ApiResponse<null>>({
      data: null,
      message: '用户名或密码错误',
      status: 401
    })
  }),

  // 获取用户信息
  http.get<never, never>('/api/auth/me', ({ request }) => {
    const token = request.headers.get('Authorization')
    
    if (token === 'Bearer mock-jwt-token') {
      return HttpResponse.json<ApiResponse<User>>({
        data: {
          id: 1,
          username: 'test',
          email: 'test@example.com'
        },
        status: 200
      })
    }
    
    return HttpResponse.json<ApiResponse<null>>({
      data: null,
      message: '未授权',
      status: 401
    })
  })
] 