import { AxiosProgressEvent } from 'axios';

import { http } from '../http/HttpClient';

export interface UploadOptions {
  /** 上传进度回调函数 */
  onProgress?: (progress: number) => void;
  /**
   * @todo - 将来用于实现分片上传
   * 文件分片大小（字节）
   */
  chunkSize?: number;
  /** 自定义请求头 */
  headers?: Record<string, string>;
  /**
   * @todo - 将来用于CSV行数据验证
   * CSV行数据验证函数
   */
  validateRow?: (row: unknown) => boolean;
}

export interface DownloadParams {
  /** 下载文件名 */
  fileName: string;
  /** 下载过滤条件 */
  filters?: Record<string, unknown>;
  /** 要下载的列 */
  columns?: string[];
}

export interface FileService {
  uploadCSV(file: File, options?: UploadOptions): Promise<{ success: boolean; message: string }>;
  downloadCSV(params: DownloadParams): Promise<Blob>;
  parseCSV<T extends Record<string, unknown>>(content: string): Promise<T[]>;
  generateCSV<T extends Record<string, unknown>>(data: T[]): Promise<string>;
}

export class FileServiceImpl implements FileService {
  async uploadCSV(
    file: File,
    options?: UploadOptions
  ): Promise<{ success: boolean; message: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return http.post('/api/files/upload/csv', formData, {
      headers: {
        ...options?.headers,
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          options?.onProgress?.(progress);
        }
      },
    });
  }

  async downloadCSV(params: DownloadParams): Promise<Blob> {
    const response = await http.get('/api/files/download/csv', {
      params,
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = params.fileName;
    link.click();
    window.URL.revokeObjectURL(url);

    return blob;
  }

  async parseCSV<T extends Record<string, unknown>>(content: string): Promise<T[]> {
    const rows = content.split('\n');
    const headers = rows[0].split(',');

    return rows.slice(1).map(row => {
      const values = row.split(',');
      return headers.reduce((obj: Partial<T>, header, index) => {
        const key = header.trim() as keyof T;
        obj[key] = values[index]?.trim() as T[keyof T];
        return obj;
      }, {}) as T;
    });
  }

  async generateCSV<T extends Record<string, unknown>>(data: T[]): Promise<string> {
    if (!data.length) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header as keyof T]).join(',')),
    ];

    return csvRows.join('\n');
  }
}
