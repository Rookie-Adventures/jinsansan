import { http, HttpResponse } from 'msw'

// 模拟用户数据库
const mockUsers = [
  {
    username: 'test',
    password: 'test',
    id: 1,
    role: 'admin',
    permissions: ['read', 'write', 'admin']
  },
  {
    username: 'admin',
    password: 'admin123',
    id: 2,
    role: 'admin',
    permissions: ['read', 'write', 'admin']
  }
] as const

export const handlers = [
  // 分析数据接口模拟
  http.get('/api/analytics/route', () => {
    return HttpResponse.json({
      code: 200,
      message: 'success',
      data: {
        totalVisits: 1000,
        uniqueUsers: 500,
        avgDuration: '5m 30s'
      }
    })
  }),

  // 登录接口模拟
  http.post('/auth/login', async ({ request }) => {
    const body = await request.json() as { username: string; password: string }
    
    // 查找匹配的用户
    const user = mockUsers.find(
      u => u.username === body.username && u.password === body.password
    )

    if (user) {
      const { password, ...userWithoutPassword } = user
      return HttpResponse.json({
        code: 200,
        message: 'success',
        data: {
          token: `mock-jwt-token-${user.id}`,
          user: userWithoutPassword
        }
      })
    }

    // 登录失败响应
    return HttpResponse.json(
      {
        code: 401,
        message: '用户名或密码错误',
        data: null
      },
      { status: 401 }
    )
  }),
] 