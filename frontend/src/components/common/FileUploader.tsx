import React, { useState } from 'react';
import { FileService, FileServiceImpl } from '../../infrastructure/file/FileService';

interface FileUploaderProps {
  onUploadComplete?: (result: any) => void;
  onError?: (error: Error) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onUploadComplete,
  onError
}) => {
  const [progress, setProgress] = useState(0);
  const fileService: FileService = new FileServiceImpl();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await fileService.uploadCSV(file, {
        onProgress: (progress) => setProgress(progress),
        validateRow: (row) => {
          // 添加自定义验证逻辑
          return true;
        }
      });
      onUploadComplete?.(result);
    } catch (error) {
      onError?.(error as Error);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
      />
      {progress > 0 && progress < 100 && (
        <div>上传进度: {progress}%</div>
      )}
    </div>
  );
}; 