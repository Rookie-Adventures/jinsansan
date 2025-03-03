import { Request, Response } from 'express';
import { ResponseUtil } from '../utils/response.util';
import { ErrorCode } from '../types/error.codes';

export abstract class BaseController {
  protected success<T>(res: Response, data: T, message = '成功') {
    return res.json(ResponseUtil.success(data, message));
  }

  protected error(res: Response, code: ErrorCode = ErrorCode.INTERNAL_ERROR, message = '服务器错误') {
    return res.status(code).json(ResponseUtil.error(code, message));
  }

  protected async handleRequest(
    req: Request,
    res: Response,
    handler: () => Promise<any>
  ) {
    try {
      const result = await handler();
      return this.success(res, result);
    } catch (error) {
      console.error('Request handling error:', error);
      return this.error(res);
    }
  }

  protected getPagination(req: Request) {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    return {
      page,
      pageSize,
      skip: (page - 1) * pageSize,
      limit: pageSize
    };
  }
} 