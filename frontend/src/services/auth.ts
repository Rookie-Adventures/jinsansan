import type { LoginFormData } from '@/types/auth';
import request from '@/utils/request';

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

export const authApi = {
  login: async (data: LoginFormData) => {
    const response = await request.post<LoginResponse>('/auth/login', data);
    return response.data;
  },
  
  register: async (data: LoginFormData & { email: string }) => {
    const response = await request.post<LoginResponse>('/auth/register', data);
    return response.data;
  },
  
  logout: () => 
    request.post('/auth/logout'),
  
  getCurrentUser: async () => {
    const response = await request.get<LoginResponse['user']>('/auth/me');
    return response.data;
  },
}; 