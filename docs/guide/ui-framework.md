# UI 框架

## Material-UI 集成

### 基础配置
- Material Design 3 实现
- 主题系统配置
- 响应式布局支持

### 主题配置
```typescript
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
});
```

## 基础组件
- 布局组件
- 导航组件
- 表单组件
- 反馈组件

## 自定义组件
- 认证相关组件
- 数据展示组件
- 交互组件
- 业务组件

## 最佳实践
1. 组件复用
2. 主题定制
3. 响应式设计
4. 性能优化 