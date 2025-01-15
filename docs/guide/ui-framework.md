# UI 框架

## 当前实现状态 (2024年1月)

### 已实现的技术栈 ✅
- Material UI 5.16.9
- Emotion (样式引擎)
- Framer Motion 10.16.16

### 已实现的组件 ✅

#### 通用组件 (common)
- Loading：加载状态组件
- FileUploader：文件上传组件
- SearchBar：搜索栏组件
- ThemeToggle：主题切换组件

#### 布局组件 (layout)
- MainLayout：主布局容器

#### 错误处理
- ErrorBoundary：错误边界
- ErrorNotification：错误通知

### 已实现的主题配置 ✅

```typescript
const baseThemeOptions: ThemeOptions = {
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: '#6b6b6b #2b2b2b',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: 8,
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            backgroundColor: '#6b6b6b',
            minHeight: 24,
          },
        },
      },
    },
  },
};

export const theme = (isDarkMode: boolean) =>
  createTheme({
    ...baseThemeOptions,
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
  });
```

### 规划中的必要功能 📋

#### 1. 基础组件补充
- 数据表格组件
- 高级表单组件
- 文件预览组件
- 分页组件

#### 2. 业务组件开发
- 用户信息卡片
- 权限控制组件
- 设置面板
- 通知中心

#### 3. 性能优化
- 组件代码分割
- 样式按需加载
- 主题切换性能优化
- 大型列表虚拟化 