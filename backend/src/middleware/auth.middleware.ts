import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']?.split(' ')[1]; // 从请求头中获取 token

  if (!token) {
    return res.status(401).json({ message: '未授权' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ message: '无效的 token' });
    }
    req.user = user as User; // 将用户信息附加到请求对象上
    next();
  });
}; 