import { Request, Response, NextFunction } from 'express';
import { ErrorUtil } from '../utils/error.util';

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err); // 打印错误信息到控制台

  const response = ErrorUtil.handleError(err.message || '内部服务器错误');
  res.status(err.status || 500).json(response);
}; 