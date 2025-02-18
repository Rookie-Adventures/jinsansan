import { describe, it, expect, vi, beforeEach } from 'vitest';

import { FileManager, FileError } from '..';
import { Logger } from '../../logging/Logger';

describe('FileManager', () => {
  let fileManager: FileManager;
  let mockLogger: Logger;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock Logger
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    } as unknown as Logger;

    // Mock FileReader API
    class MockFileReader {
      readAsDataURL = vi.fn();
      readAsText = vi.fn();
      onload: null | ((this: FileReader, ev: ProgressEvent<FileReader>) => any) = null;
      onerror: null | ((this: FileReader, ev: ProgressEvent<FileReader>) => any) = null;
      result = '';
      error: DOMException | null = null;
      readyState = 0;
      EMPTY = 0;
      LOADING = 1;
      DONE = 2;
      abort = vi.fn();
      addEventListener = vi.fn();
      removeEventListener = vi.fn();
      dispatchEvent = vi.fn();

      static EMPTY = 0;
      static LOADING = 1;
      static DONE = 2;
    }

    global.FileReader = MockFileReader as unknown as typeof FileReader;

    // Mock URL API
    global.URL.createObjectURL = vi.fn();
    global.URL.revokeObjectURL = vi.fn();

    fileManager = new FileManager(mockLogger);
  });

  describe('文件验证', () => {
    it('应该验证文件大小', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB

      expect(fileManager.validateFileSize(file, 2 * 1024 * 1024)).toBe(true); // 2MB limit
      expect(fileManager.validateFileSize(file, 512 * 1024)).toBe(false); // 512KB limit
    });

    it('应该验证文件类型', () => {
      const imageFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const textFile = new File([''], 'test.txt', { type: 'text/plain' });

      expect(fileManager.validateFileType(imageFile, ['image/jpeg', 'image/png'])).toBe(true);
      expect(fileManager.validateFileType(textFile, ['image/jpeg', 'image/png'])).toBe(false);
    });

    it('应该验证文件名长度', () => {
      const shortNameFile = new File([''], 'test.txt', { type: 'text/plain' });
      const longNameFile = new File([''], 'a'.repeat(256) + '.txt', { type: 'text/plain' });

      expect(fileManager.validateFileName(shortNameFile, 255)).toBe(true);
      expect(fileManager.validateFileName(longNameFile, 255)).toBe(false);
    });
  });

  describe('文件处理', () => {
    it('应该读取文件内容', async () => {
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const mockResult = 'test content';

      // Mock FileReader for this specific test
      const mockFileReader = {
        readAsText: vi.fn().mockImplementation(function (this: any) {
          setTimeout(() => {
            this.result = mockResult;
            this.onload?.();
          });
        }),
        onload: null,
        onerror: null,
        result: '',
      };

      vi.spyOn(window, 'FileReader').mockImplementation(
        () => mockFileReader as unknown as FileReader
      );

      const result = await fileManager.readFileContent(file);
      expect(result).toBe(mockResult);
    });

    it('应该生成文件预览URL', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const mockUrl = 'blob:test-url';
      (global.URL.createObjectURL as jest.Mock).mockReturnValue(mockUrl);

      const url = fileManager.createPreviewUrl(file);

      expect(url).toBe(mockUrl);
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(file);
    });

    it('应该释放文件预览URL', () => {
      const mockUrl = 'blob:test-url';

      fileManager.revokePreviewUrl(mockUrl);

      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);
    });
  });

  describe('文件转换', () => {
    it('应该将文件转换为Base64', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const mockBase64 = 'data:text/plain;base64,dGVzdA==';

      // Mock FileReader for this specific test
      const mockFileReader = {
        readAsDataURL: vi.fn().mockImplementation(function (this: any) {
          setTimeout(() => {
            this.result = mockBase64;
            this.onload?.();
          });
        }),
        onload: null,
        onerror: null,
        result: '',
      };

      vi.spyOn(window, 'FileReader').mockImplementation(
        () => mockFileReader as unknown as FileReader
      );

      const result = await fileManager.convertToBase64(file);
      expect(result).toBe(mockBase64);
    });

    it('应该将Base64转换为Blob', () => {
      const base64 = 'data:text/plain;base64,dGVzdA=='; // "test" in base64
      const blob = fileManager.convertBase64ToBlob(base64);

      expect(blob instanceof Blob).toBe(true);
      expect(blob.type).toBe('text/plain');
    });
  });

  describe('错误处理', () => {
    it('应该处理文件读取错误', async () => {
      const file = new File([''], 'test.txt', { type: 'text/plain' });
      const mockError = new DOMException('Read error');

      // Mock FileReader for this specific test
      const mockFileReader = {
        readAsText: vi.fn().mockImplementation(function (this: any) {
          setTimeout(() => {
            this.error = mockError;
            this.onerror?.();
          });
        }),
        onload: null,
        onerror: null,
        error: mockError,
      };

      vi.spyOn(window, 'FileReader').mockImplementation(
        () => mockFileReader as unknown as FileReader
      );

      await expect(fileManager.readFileContent(file)).rejects.toMatchObject({
        code: 'FILE_READ_ERROR',
        message: '文件读取失败',
        originalError: mockError,
      } as FileError);
      expect(mockLogger.error).toHaveBeenCalledWith('文件读取失败', expect.any(Object));
    });

    it('应该处理无效的Base64数据', () => {
      const invalidBase64 = 'invalid-base64-data';

      expect(() => fileManager.convertBase64ToBlob(invalidBase64)).toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith('Base64转换Blob失败', expect.any(Object));
    });

    it('应该处理预览URL创建失败', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const mockError = new Error('URL creation failed');
      (global.URL.createObjectURL as jest.Mock).mockImplementation(() => {
        throw mockError;
      });

      expect(() => fileManager.createPreviewUrl(file)).toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith('创建预览URL失败', expect.any(Object));
    });

    it('应该处理预览URL释放失败', () => {
      const mockUrl = 'blob:test-url';
      const mockError = new Error('URL revocation failed');
      (global.URL.revokeObjectURL as jest.Mock).mockImplementation(() => {
        throw mockError;
      });

      expect(() => fileManager.revokePreviewUrl(mockUrl)).toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith('释放预览URL失败', expect.any(Object));
    });
  });

  describe('批量处理', () => {
    it('应该批量验证文件', () => {
      const files = [
        new File([''], 'test1.jpg', { type: 'image/jpeg' }),
        new File([''], 'test2.png', { type: 'image/png' }),
        new File([''], 'test3.txt', { type: 'text/plain' }),
      ];

      const validTypes = ['image/jpeg', 'image/png'];
      const results = fileManager.validateFiles(files, {
        allowedTypes: validTypes,
        maxSize: 1024 * 1024,
        maxNameLength: 255,
      });

      expect(results).toEqual([
        { file: files[0], isValid: true },
        { file: files[1], isValid: true },
        { file: files[2], isValid: false },
      ]);
    });

    it('应该批量生成预览URL', () => {
      const files = [
        new File([''], 'test1.jpg', { type: 'image/jpeg' }),
        new File([''], 'test2.png', { type: 'image/png' }),
      ];

      const mockUrls = ['blob:url1', 'blob:url2'];
      (global.URL.createObjectURL as jest.Mock)
        .mockReturnValueOnce(mockUrls[0])
        .mockReturnValueOnce(mockUrls[1]);

      const urls = fileManager.createPreviewUrls(files);

      expect(urls).toEqual(mockUrls);
      expect(global.URL.createObjectURL).toHaveBeenCalledTimes(2);
    });
  });
});
