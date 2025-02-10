import { render, screen, fireEvent } from '@testing-library/react';
import { FileUploader } from '../FileUploader';
import { vi, describe, it, expect } from 'vitest';

// 测试配置
const TEST_FILE_CONTENT = 'test content';
const TEST_FILE_NAME = 'test.csv';
const TEST_FILE_TYPE = 'text/csv';

// Mock FileService
vi.mock('../../../infrastructure/file/FileService', () => ({
  FileServiceImpl: vi.fn().mockImplementation(() => ({
    uploadCSV: vi.fn().mockResolvedValue(undefined),
  })),
}));

describe('FileUploader', () => {
  describe('基础渲染', () => {
    it('应该正确渲染文件上传组件', () => {
      render(<FileUploader />);
      const fileInput = screen.getByTestId('file-input');
      const uploadButton = screen.getByText('选择文件');

      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute('type', 'file');
      expect(fileInput).toHaveAttribute('accept', '.csv');
      expect(uploadButton).toBeInTheDocument();
    });

    it('初始状态下不应该显示已选择文件', () => {
      render(<FileUploader />);
      const selectedFile = screen.queryByText(/已选择:/);

      expect(selectedFile).not.toBeInTheDocument();
    });
  });

  describe('文件处理', () => {
    it('选择文件时应该触发处理函数', () => {
      const onUploadComplete = vi.fn();
      render(<FileUploader onUploadComplete={onUploadComplete} />);

      const file = new File([TEST_FILE_CONTENT], TEST_FILE_NAME, { type: TEST_FILE_TYPE });
      const fileInput = screen.getByTestId('file-input');

      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(onUploadComplete).toHaveBeenCalledWith(file);
      expect(screen.getByText(`已选择: ${file.name}`)).toBeInTheDocument();
    });

    it('选择空文件时不应该触发上传', () => {
      const onUploadComplete = vi.fn();
      render(<FileUploader onUploadComplete={onUploadComplete} />);

      const fileInput = screen.getByTestId('file-input');
      fireEvent.change(fileInput, { target: { files: [] } });

      expect(onUploadComplete).not.toHaveBeenCalled();
      expect(screen.queryByText(/已选择:/)).not.toBeInTheDocument();
    });
  });
});
