import { vi, describe, it, expect, beforeEach } from 'vitest';

import type { BaseResponse } from '../../http/HttpClient';
import type { UploadOptions, DownloadParams } from '../FileService';

import { http } from '../../http/HttpClient';
import { FileServiceImpl } from '../FileService';

// Mock http client
vi.mock('../../http/HttpClient', () => ({
  http: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('FileService', () => {
  let fileService: FileServiceImpl;
  const mockUrl = 'blob:test';
  
  beforeEach(() => {
    fileService = new FileServiceImpl();
    vi.clearAllMocks();
    
    // Mock URL methods
    window.URL.createObjectURL = vi.fn().mockReturnValue(mockUrl);
    window.URL.revokeObjectURL = vi.fn();
  });

  describe('uploadCSV', () => {
    const mockFile = new File(['test,data\n1,2'], 'test.csv', { type: 'text/csv' });
    const mockResponse: BaseResponse<{ success: boolean; message: string }> = {
      code: 200,
      message: 'Success',
      data: { success: true, message: 'Upload successful' }
    };

    it('应该正确上传CSV文件', async () => {
      vi.mocked(http.post).mockResolvedValue(mockResponse);

      const result = await fileService.uploadCSV(mockFile);

      expect(http.post).toHaveBeenCalledWith(
        '/api/files/upload/csv',
        expect.any(FormData),
        expect.objectContaining({
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('应该处理上传进度', async () => {
      const mockProgress = vi.fn();
      const options: UploadOptions = {
        onProgress: mockProgress,
      };

      vi.mocked(http.post).mockImplementation(async (_url, _data, config) => {
        // 模拟上传进度
        if (config?.onUploadProgress) {
          config.onUploadProgress({ loaded: 50, total: 100 } as any);
        }
        return mockResponse;
      });

      await fileService.uploadCSV(mockFile, options);

      expect(mockProgress).toHaveBeenCalledWith(50);
    });

    it('应该使用自定义请求头', async () => {
      const options: UploadOptions = {
        headers: {
          'Custom-Header': 'test-value',
        },
      };

      vi.mocked(http.post).mockResolvedValue(mockResponse);

      await fileService.uploadCSV(mockFile, options);

      expect(http.post).toHaveBeenCalledWith(
        '/api/files/upload/csv',
        expect.any(FormData),
        expect.objectContaining({
          headers: {
            'Content-Type': 'multipart/form-data',
            'Custom-Header': 'test-value',
          },
        })
      );
    });
  });

  describe('downloadCSV', () => {
    const mockArrayBuffer = new ArrayBuffer(8);
    const mockResponse: BaseResponse<ArrayBuffer> = {
      code: 200,
      message: 'Success',
      data: mockArrayBuffer
    };

    it('应该正确下载CSV文件', async () => {
      vi.mocked(http.get).mockResolvedValue(mockResponse);

      const params: DownloadParams = {
        fileName: 'test.csv',
        filters: { status: 'active' },
        columns: ['id', 'name'],
      };

      const result = await fileService.downloadCSV(params);

      expect(http.get).toHaveBeenCalledWith('/api/files/download/csv', {
        params,
        responseType: 'arraybuffer',
      });
      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('text/csv');
      expect(window.URL.createObjectURL).toHaveBeenCalled();
      expect(window.URL.revokeObjectURL).toHaveBeenCalled();
    });
  });

  describe('parseCSV', () => {
    it('应该正确解析CSV内容', async () => {
      const csvContent = 'name,age\nJohn,30\nJane,25';
      
      const result = await fileService.parseCSV(csvContent);

      expect(result).toEqual([
        { name: 'John', age: '30' },
        { name: 'Jane', age: '25' },
      ]);
    });

    it('应该处理空CSV内容', async () => {
      const csvContent = 'name,age\n';
      
      const result = await fileService.parseCSV(csvContent);

      expect(result).toEqual([]);
    });

    it('应该处理带空格的CSV内容', async () => {
      const csvContent = ' name , age \n John , 30 ';
      
      const result = await fileService.parseCSV(csvContent);

      expect(result).toEqual([{ name: 'John', age: '30' }]);
    });
  });

  describe('generateCSV', () => {
    it('应该正确生成CSV内容', async () => {
      const data = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
      ];

      const result = await fileService.generateCSV(data);

      expect(result).toBe('name,age\nJohn,30\nJane,25');
    });

    it('应该处理空数据', async () => {
      const result = await fileService.generateCSV([]);

      expect(result).toBe('');
    });

    it('应该处理包含特殊字符的数据', async () => {
      const data = [
        { name: 'John, Jr.', age: 30 },
        { name: 'Jane', age: 25 },
      ];

      const result = await fileService.generateCSV(data);

      expect(result).toBe('name,age\nJohn, Jr.,30\nJane,25');
    });
  });
}); 