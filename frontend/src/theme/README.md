# 主题模块 (Theme)

## 目录结构

```
theme/
├── index.ts        # 主题配置入口
├── types.ts        # 主题类型定义
├── utils.ts        # 主题工具函数
├── index.test.ts   # 主题配置测试
└── utils.test.ts   # 工具函数测试
```

## 主题规范

### 命名规范
- 主题文件使用 camelCase 命名（如 `themeConfig.ts`）
- 类型文件使用 camelCase 命名（如 `themeTypes.ts`）
- 工具文件使用 camelCase 命名（如 `themeUtils.ts`）
- 测试文件使用 `.test.ts` 后缀

### 主题结构
```typescript
// 主题配置模板
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});
```

## 主题分类

### 1. 主题配置 (index.ts)
- 颜色系统
- 排版系统
- 组件样式
- 响应式断点

### 2. 类型定义 (types.ts)
- 主题类型
- 组件类型
- 工具类型

### 3. 工具函数 (utils.ts)
- 颜色工具
- 排版工具
- 响应式工具

## 使用示例

### 主题配置
```typescript
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme';

export const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppContent />
    </ThemeProvider>
  );
};
```

### 主题使用
```typescript
import { useTheme } from '@mui/material/styles';

export const ThemedComponent = () => {
  const theme = useTheme();
  
  return (
    <Box sx={{
      color: theme.palette.primary.main,
      typography: theme.typography.h1,
    }}>
      Themed Content
    </Box>
  );
};
```

### 响应式使用
```typescript
import { useMediaQuery } from '@mui/material';

export const ResponsiveComponent = () => {
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Box sx={{
      padding: isMobile ? 2 : 4,
    }}>
      Responsive Content
    </Box>
  );
};
```

## 最佳实践

1. **主题设计**
   - 使用设计系统
   - 保持一致性
   - 支持暗色模式

2. **性能优化**
   - 优化主题切换
   - 减少样式计算
   - 使用 CSS-in-JS

3. **测试规范**
   - 编写单元测试
   - 测试主题切换
   - 测试响应式

4. **开发规范**
   - 使用 TypeScript
   - 遵循 Material-UI 最佳实践
   - 保持代码简洁

## 注意事项

1. 主题开发时需要考虑：
   - 主题的可维护性
   - 主题的性能表现
   - 主题的类型安全
   - 主题的测试覆盖

2. 主题使用时的注意事项：
   - 正确处理主题切换
   - 处理响应式布局
   - 遵循主题规范

## 更新日志

### v1.0.0
- 初始化主题模块
- 实现基础主题
- 添加主题文档 