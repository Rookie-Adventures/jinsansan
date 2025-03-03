/**
 * 用户对象类型
 */
export interface User {
  id: string;          // 用户ID
  username: string;   // 用户名
  email: string;      // 用户邮箱
  permissions: string[]; // 用户权限
} 