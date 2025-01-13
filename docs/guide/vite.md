# Vite 配置

## 开发环境配置

### 基础配置
```typescript
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
```

### 测试配置
```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        '**/types/',
      ],
    },
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
```

## 功能特性

### 路径别名
- 使用 `@` 作为 src 目录的别名
- 简化导入路径
- TypeScript 路径映射支持

### 开发服务器
- 端口: 3000
- 自动打开浏览器
- API 代理配置

### 代理设置
- 目标: `http://localhost:8080`
- 路径重写: `/api`
- 支持跨域

### 测试集成
- 使用 Vitest
- JSdom 环境
- 覆盖率报告
- 测试文件过滤

## 最佳实践
1. 使用路径别名简化导入
2. 配置合适的代理规则
3. 保持测试覆盖率
4. 排除不必要的测试文件 