import { Logger } from '../logging/Logger';
import { FileValidationOptions, FileValidationResult, FileError } from './types';

export class FileManager {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * 验证文件大小
   * @param file 要验证的文件
   * @param maxSize 最大允许大小（字节）
   */
  public validateFileSize(file: File, maxSize: number): boolean {
    const isValid = file.size <= maxSize;
    if (!isValid) {
      this.logger.warn('文件大小超过限制', {
        fileName: file.name,
        fileSize: file.size,
        maxSize,
      });
    }
    return isValid;
  }

  /**
   * 验证文件类型
   * @param file 要验证的文件
   * @param allowedTypes 允许的文件类型数组
   */
  public validateFileType(file: File, allowedTypes: string[]): boolean {
    const isValid = allowedTypes.includes(file.type);
    if (!isValid) {
      this.logger.warn('文件类型不允许', {
        fileName: file.name,
        fileType: file.type,
        allowedTypes,
      });
    }
    return isValid;
  }

  /**
   * 验证文件名长度
   * @param file 要验证的文件
   * @param maxLength 最大允许长度
   */
  public validateFileName(file: File, maxLength: number): boolean {
    const isValid = file.name.length <= maxLength;
    if (!isValid) {
      this.logger.warn('文件名超过长度限制', {
        fileName: file.name,
        nameLength: file.name.length,
        maxLength,
      });
    }
    return isValid;
  }

  /**
   * 批量验证文件
   * @param files 文件数组
   * @param options 验证选项
   */
  public validateFiles(files: File[], options: FileValidationOptions): FileValidationResult[] {
    return files.map(file => ({
      file,
      isValid:
        this.validateFileSize(file, options.maxSize) &&
        this.validateFileType(file, options.allowedTypes) &&
        this.validateFileName(file, options.maxNameLength),
    }));
  }

  /**
   * 读取文件内容
   * @param file 要读取的文件
   * @throws {FileError} 当文件读取失败时抛出
   */
  public readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result as string);
      };

      reader.onerror = () => {
        const error: FileError = {
          code: 'FILE_READ_ERROR',
          message: '文件读取失败',
          originalError: reader.error as Error,
        };
        this.logger.error(error.message, {
          fileName: file.name,
          error: reader.error,
        });
        reject(error);
      };

      reader.readAsText(file);
    });
  }

  /**
   * 创建文件预览URL
   * @param file 要预览的文件
   * @throws {FileError} 当创建预览URL失败时抛出
   */
  public createPreviewUrl(file: File): string {
    try {
      return URL.createObjectURL(file);
    } catch (error) {
      const fileError: FileError = {
        code: 'PREVIEW_URL_ERROR',
        message: '创建预览URL失败',
        originalError: error as Error,
      };
      this.logger.error(fileError.message, {
        fileName: file.name,
        error,
      });
      throw fileError;
    }
  }

  /**
   * 批量创建预览URL
   * @param files 文件数组
   * @throws {FileError} 当创建预览URL失败时抛出
   */
  public createPreviewUrls(files: File[]): string[] {
    return files.map(file => this.createPreviewUrl(file));
  }

  /**
   * 释放预览URL
   * @param url 要释放的URL
   * @throws {FileError} 当释放预览URL失败时抛出
   */
  public revokePreviewUrl(url: string): void {
    try {
      URL.revokeObjectURL(url);
    } catch (error) {
      const fileError: FileError = {
        code: 'REVOKE_URL_ERROR',
        message: '释放预览URL失败',
        originalError: error as Error,
      };
      this.logger.error(fileError.message, {
        url,
        error,
      });
      throw fileError;
    }
  }

  /**
   * 将文件转换为Base64
   * @param file 要转换的文件
   * @throws {FileError} 当转换失败时抛出
   */
  public convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result as string);
      };

      reader.onerror = () => {
        const error: FileError = {
          code: 'BASE64_CONVERSION_ERROR',
          message: '转换Base64失败',
          originalError: reader.error as Error,
        };
        this.logger.error(error.message, {
          fileName: file.name,
          error: reader.error,
        });
        reject(error);
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * 将Base64转换为Blob
   * @param base64 Base64字符串
   * @throws {FileError} 当转换失败时抛出
   */
  public convertBase64ToBlob(base64: string): Blob {
    try {
      const parts = base64.split(';base64,');
      const contentType = parts[0].split(':')[1];
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);

      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }

      return new Blob([uInt8Array], { type: contentType });
    } catch (error) {
      const fileError: FileError = {
        code: 'BLOB_CONVERSION_ERROR',
        message: 'Base64转换Blob失败',
        originalError: error as Error,
      };
      this.logger.error(fileError.message, {
        error,
      });
      throw fileError;
    }
  }
}
