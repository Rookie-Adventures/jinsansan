import { http, HttpResponse } from 'msw';

import type { ApiResponse } from '@/types/api';

interface LoginRequest {
  username: string;
  password: string;
}

interface RegisterRequest extends LoginRequest {
  email: string;
}

interface User {
  id: number;
  username: string;
  email: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

// 模拟用户存储
const users: User[] = [
  {
    id: 1,
    username: 'test',
    email: 'test@example.com',
  },
];

export const authHandlers = [
  // 登录
  http.post<never, LoginRequest>('/auth/login', async ({ request }) => {
    const { username, password } = await request.json();

    const user = users.find(u => u.username === username);

    // 用户不存在
    if (!user) {
      return HttpResponse.json(
        {
          code: 401,
          message: '用户不存在',
          data: null,
        } as ApiResponse<null>,
        { status: 401 }
      );
    }

    // 密码错误
    if (password !== 'test') {
      return HttpResponse.json(
        {
          code: 401,
          message: '密码错误',
          data: null,
        } as ApiResponse<null>,
        { status: 401 }
      );
    }

    return HttpResponse.json(
      {
        code: 200,
        message: '登录成功',
        data: {
          token: `mock-jwt-token-${user.id}`,
          user,
        },
      } as ApiResponse<LoginResponse>,
      { status: 200 }
    );
  }),

  // 注册
  http.post<never, RegisterRequest>('/auth/register', async ({ request }) => {
    const data = await request.json();

    // 检查用户名是否已存在
    if (users.some(u => u.username === data.username)) {
      return HttpResponse.json(
        {
          code: 400,
          message: '用户名已存在',
          data: null,
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // 检查邮箱是否已存在
    if (users.some(u => u.email === data.email)) {
      return HttpResponse.json(
        {
          code: 400,
          message: '邮箱已被使用',
          data: null,
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // 创建新用户
    const newUser: User = {
      id: users.length + 1,
      username: data.username,
      email: data.email,
    };
    users.push(newUser);

    return HttpResponse.json(
      {
        code: 200,
        message: '注册成功',
        data: {
          token: `mock-jwt-token-${newUser.id}`,
          user: newUser,
        },
      } as ApiResponse<LoginResponse>,
      { status: 200 }
    );
  }),

  // 登出
  http.post('/auth/logout', () => {
    return HttpResponse.json(
      {
        code: 200,
        message: '退出登录成功',
        data: null,
      } as ApiResponse<null>,
      { status: 200 }
    );
  }),

  // 获取用户信息
  http.get<never, never>('/auth/me', ({ request }) => {
    const token = request.headers.get('Authorization');

    if (token?.startsWith('Bearer mock-jwt-token-')) {
      const userId = parseInt(token.split('-').pop() || '0');
      const user = users.find(u => u.id === userId);

      if (user) {
        return HttpResponse.json(
          {
            code: 200,
            message: '获取用户信息成功',
            data: user,
          } as ApiResponse<User>,
          { status: 200 }
        );
      }
    }

    return HttpResponse.json(
      {
        code: 401,
        message: '未授权',
        data: null,
      } as ApiResponse<null>,
      { status: 401 }
    );
  }),
];
