/**
 * 用户基础信息接口
 */
export interface User {
  id: number;
  username: string;
  email: string;
  permissions: string[];
} 