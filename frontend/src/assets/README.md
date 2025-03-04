# 资源模块 (Assets)

## 目录结构

```
assets/
├── images/         # 图片资源
├── icons/          # 图标资源
├── fonts/          # 字体资源
├── styles/         # 样式资源
└── react.svg       # React 图标
```

## 资源规范

### 命名规范
- 图片文件使用 kebab-case 命名（如 `user-avatar.png`）
- 图标文件使用 kebab-case 命名（如 `menu-icon.svg`）
- 字体文件使用 kebab-case 命名（如 `roboto-regular.woff2`）
- 样式文件使用 kebab-case 命名（如 `global-styles.css`）

### 资源结构
```typescript
// 资源导入示例
import logo from '@/assets/images/logo.png';
import icon from '@/assets/icons/menu.svg';
import font from '@/assets/fonts/roboto.woff2';
import styles from '@/assets/styles/global.css';
```

## 资源分类

### 1. 图片资源 (images/)
- 页面图片
- 背景图片
- 装饰图片

### 2. 图标资源 (icons/)
- 功能图标
- 状态图标
- 导航图标

### 3. 字体资源 (fonts/)
- 系统字体
- 自定义字体
- 图标字体

### 4. 样式资源 (styles/)
- 全局样式
- 主题样式
- 组件样式

## 使用示例

### 图片使用
```typescript
import logo from '@/assets/images/logo.png';

export const Logo = () => {
  return <img src={logo} alt="Logo" />;
};
```

### 图标使用
```typescript
import { ReactComponent as MenuIcon } from '@/assets/icons/menu.svg';

export const MenuButton = () => {
  return <MenuIcon />;
};
```

### 字体使用
```css
@font-face {
  font-family: 'Roboto';
  src: url('@/assets/fonts/roboto.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
}
```

### 样式使用
```typescript
import '@/assets/styles/global.css';

export const App = () => {
  return <div className="app">App Content</div>;
};
```

## 最佳实践

1. **资源管理**
   - 合理组织资源
   - 优化资源大小
   - 使用资源版本

2. **性能优化**
   - 压缩资源
   - 使用 CDN
   - 实现懒加载

3. **开发规范**
   - 使用 TypeScript
   - 遵循资源规范
   - 保持代码简洁

4. **版本控制**
   - 管理资源版本
   - 处理资源更新
   - 清理无用资源

## 注意事项

1. 资源开发时需要考虑：
   - 资源的可维护性
   - 资源的性能表现
   - 资源的版本管理
   - 资源的测试覆盖

2. 资源使用时的注意事项：
   - 正确处理资源路径
   - 处理资源加载
   - 遵循资源规范

## 更新日志

### v1.0.0
- 初始化资源模块
- 实现基础资源
- 添加资源文档 