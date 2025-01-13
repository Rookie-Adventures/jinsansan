# 文件处理

## 文件服务 (FileService)

### 功能特性
- CSV 文件上传
- CSV 文件下载
- CSV 文件解析
- CSV 文件生成
- 进度监控
- 错误处理

### 使用示例
```typescript
// 文件上传
const fileService = new FileServiceImpl();
const uploadResult = await fileService.uploadCSV(file, {
  onProgress: (progress) => console.log(`Upload progress: ${progress}%`),
  validateRow: (row) => validateUserData(row)
});

// 文件下载
const csvBlob = await fileService.downloadCSV({
  fileName: 'users.csv',
  columns: ['id', 'name', 'email'],
  filters: { role: 'user' }
});
```

## 最佳实践
1. 文件大小限制
2. 格式验证
3. 错误处理
4. 进度监控 