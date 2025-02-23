import * as express from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: { // 根据需要定义更具体的用户类型
        id: string;
        name: string;
        email: string;
        role: string; // 假设用户有角色属性
      };
    }
  }
} 