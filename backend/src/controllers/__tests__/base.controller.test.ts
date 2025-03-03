import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BaseController } from '../base.controller';
import { ErrorCode } from '../../types/error.codes';

// 创建一个测试用的控制器类
class TestController extends BaseController {
  testSuccess(res: any) {
    const data = { test: 'data' };
    return this.success(res, data);
  }

  testError(res: any) {
    return this.error(res, ErrorCode.NOT_FOUND, '未找到');
  }

  testHandleRequest(req: any, res: any) {
    const handler = async () => ({ test: 'data' });
    return this.handleRequest(req, res, handler);
  }

  testHandleRequestError(req: any, res: any) {
    const handler = async () => {
      throw new Error('测试错误');
    };
    return this.handleRequest(req, res, handler);
  }

  testGetPagination(req: any) {
    return this.getPagination(req);
  }
}

describe('BaseController', () => {
  let controller: TestController;
  let mockRes: any;

  beforeEach(() => {
    controller = new TestController();
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
  });

  describe('success', () => {
    it('should return success response', async () => {
      await controller.testSuccess(mockRes);
      expect(mockRes.json).toHaveBeenCalledWith({
        code: ErrorCode.SUCCESS,
        message: '成功',
        data: { test: 'data' },
        timestamp: expect.any(Number)
      });
    });
  });

  describe('error', () => {
    it('should return error response', async () => {
      await controller.testError(mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(ErrorCode.NOT_FOUND);
      expect(mockRes.json).toHaveBeenCalledWith({
        code: ErrorCode.NOT_FOUND,
        message: '未找到',
        data: null,
        timestamp: expect.any(Number)
      });
    });
  });

  describe('handleRequest', () => {
    it('should handle successful request', async () => {
      const mockReq = {};
      await controller.testHandleRequest(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith({
        code: ErrorCode.SUCCESS,
        message: '成功',
        data: { test: 'data' },
        timestamp: expect.any(Number)
      });
    });

    it('should handle request error', async () => {
      const mockReq = {};
      await controller.testHandleRequestError(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(ErrorCode.INTERNAL_ERROR);
      expect(mockRes.json).toHaveBeenCalledWith({
        code: ErrorCode.INTERNAL_ERROR,
        message: '服务器错误',
        data: null,
        timestamp: expect.any(Number)
      });
    });
  });

  describe('getPagination', () => {
    it('should return pagination object', () => {
      const req = {
        query: {
          page: '2',
          pageSize: '20'
        }
      };
      const pagination = controller.testGetPagination(req);
      expect(pagination).toEqual({
        page: 2,
        pageSize: 20,
        skip: 20,
        limit: 20
      });
    });

    it('should return default pagination values', () => {
      const req = { query: {} };
      const pagination = controller.testGetPagination(req);
      expect(pagination).toEqual({
        page: 1,
        pageSize: 10,
        skip: 0,
        limit: 10
      });
    });
  });
}); 