/**
 * 文件验证选项接口
 */
export interface FileValidationOptions {
  /** 允许的文件类型数组 */
  allowedTypes: string[];
  /** 最大文件大小（字节） */
  maxSize: number;
  /** 最大文件名长度 */
  maxNameLength: number;
}

/**
 * 文件验证结果接口
 */
export interface FileValidationResult {
  /** 验证的文件 */
  file: File;
  /** 是否验证通过 */
  isValid: boolean;
}

/**
 * 文件处理错误类型
 */
export type FileError = {
  /** 错误代码 */
  code: string;
  /** 错误消息 */
  message: string;
  /** 原始错误 */
  originalError?: Error;
}; 