# 项目结构

本项目采用前后端分离的架构，以下是项目的实际目录结构：

## 根目录结构

```bash
project-root/
├── frontend/           # 前端应用
├── backend/           # 后端应用
├── docs/             # 项目文档
└── package.json      # 项目配置文件
```

## 前端项目结构 (frontend)

```bash
frontend/
├── src/
│   ├── assets/          # 静态资源
│   ├── components/      # React 组件
│   ├── contexts/        # React Context
│   ├── hooks/          # 自定义 Hooks
│   ├── infrastructure/ # 基础设施代码
│   ├── mocks/          # 模拟数据
│   ├── pages/          # 页面组件
│   ├── router/         # 路由配置
│   ├── services/       # API 服务
│   ├── store/          # 状态管理
│   ├── test/           # 测试文件
│   ├── theme/          # 主题配置
│   ├── types/          # TypeScript 类型定义
│   └── utils/          # 工具函数
├── public/             # 公共资源
└── 配置文件            # 如 vite.config.ts, tsconfig.json 等
```

## 后端项目结构 (backend)

> 注：后端部分正在开发中

## 类型共享

目前前后端共享的类型定义包括：

### API 相关
- `ApiResponse` - API 响应格式
- `ApiError` - 错误格式
- `PaginationParams` - 分页参数
- `PaginatedResponse` - 分页响应
- `SortParams` - 排序参数
- `FilterParams` - 过滤参数

### 认证相关
- `LoginFormData` - 登录表单数据
- `RegisterFormData` - 注册表单数据
- `AuthResponse` - 认证响应

## 开发规范

1. 组件文件使用 PascalCase 命名
2. 工具函数文件使用 camelCase 命名
3. 类型定义文件使用 `.ts` 扩展名
4. 测试文件以 `.test.ts` 或 `.spec.ts` 结尾 