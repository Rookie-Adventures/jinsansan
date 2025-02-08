import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface FileUploaderProps {
  onUploadComplete?: (file: File) => void;
  onError?: (error: Error) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onUploadComplete,
  onError
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      onUploadComplete?.(file);
    }
  };

  return (
    <Box sx={{ textAlign: 'center', p: 2 }}>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        id="file-upload"
        data-testid="file-input"
      />
      <label htmlFor="file-upload">
        <Button
          variant="contained"
          component="span"
          startIcon={<CloudUploadIcon />}
          sx={{ mb: 2 }}
        >
          选择文件
        </Button>
      </label>
      {selectedFile && (
        <Typography variant="body2" color="textSecondary">
          已选择: {selectedFile.name}
        </Typography>
      )}
    </Box>
  );
}; 