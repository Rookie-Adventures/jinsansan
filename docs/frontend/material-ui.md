# Material UI 使用规范

## 主题配置

### 基础主题设置
项目使用 Material UI 的主题系统进行全局样式管理。主题配置位于 `frontend/src/theme/index.ts`：

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
  // ... 其他配置
};
```

### 暗色模式支持
项目支持动态切换明暗主题：

```typescript
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

## 组件规范

### 布局组件

#### Container 使用
- 使用 `Container` 组件控制内容最大宽度
- 通过 `maxWidth` 属性设置不同的宽度限制
```typescript
<Container maxWidth="lg">
  {/* 内容 */}
</Container>
```

#### Box 组件
- 用于创建灵活的布局容器
- 使用 `sx` 属性进行样式定制
```typescript
<Box
  sx={{
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    p: 3,
  }}
>
  {/* 内容 */}
</Box>
```

### 响应式设计

#### 断点使用
- 使用 Material UI 的断点系统进行响应式设计
- 通过 `useMediaQuery` hook 实现响应式逻辑
```typescript
const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
```

#### 响应式样式
- 使用 `sx` 属性中的对象语法定义响应式样式
```typescript
sx={{
  py: { xs: 4, md: 6 },
  px: { xs: 2, sm: 3 },
  fontSize: { xs: '1.1rem', sm: '1.25rem' },
}}
```

### 表单组件

#### TextField 使用规范
- 统一使用 `outlined` 变体
- 必须提供 `label` 属性
- 使用 `margin="normal"` 保持一致的间距
```typescript
<TextField
  fullWidth
  label="密码"
  variant="outlined"
  margin="normal"
  type="password"
/>
```

#### Button 使用规范
- 主要操作使用 `contained` 变体
- 次要操作使用 `outlined` 或 `text` 变体
- 禁用按钮文字变换：`textTransform: 'none'`
```typescript
<Button
  variant="contained"
  color="primary"
  sx={{ textTransform: 'none' }}
>
  登录
</Button>
```

### 反馈组件

#### Progress 组件
- 使用 `LinearProgress` 显示加载进度
- 使用 `CircularProgress` 显示加载状态
```typescript
<LinearProgress variant="determinate" value={progress} />
<CircularProgress />
```

#### Alert & Snackbar
- 使用 `Snackbar` 显示临时消息
- 使用 `Alert` 组件显示不同类型的提示
```typescript
<Snackbar
  open={open}
  autoHideDuration={3000}
  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
>
  <Alert severity={severity} variant="filled">
    {message}
  </Alert>
</Snackbar>
```

## 最佳实践

### 样式定制
1. 优先使用 `sx` 属性进行样式定制
2. 对于重复使用的样式，使用 `styled` API 创建样式组件
3. 避免直接使用内联样式

### 主题扩展
1. 在 `theme/index.ts` 中集中管理主题配置
2. 使用类型安全的主题扩展
3. 保持颜色系统的一致性

### 性能优化
1. 使用 `React.memo` 优化重复渲染
2. 合理使用 `useTheme` hook
3. 避免不必要的样式计算

### 无障碍性
1. 提供适当的 `aria-*` 属性
2. 确保适当的颜色对比度
3. 支持键盘导航

## 组件目录结构
```
src/
  components/
    common/          # 通用 UI 组件
    feedback/        # 反馈类组件
    form/           # 表单相关组件
    layout/         # 布局组件
    business/       # 业务相关组件
``` 