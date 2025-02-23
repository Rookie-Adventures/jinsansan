import * as express from 'express';
import { Request, Response, NextFunction } from 'express';

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

export const roleMiddleware = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({ message: '没有权限访问此资源' });
    }
    next();
  };
};