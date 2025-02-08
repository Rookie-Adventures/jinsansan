# 前端测试覆盖计划

## 已完成模块

### 基础设施层 (Infrastructure)

#### 1. FileManager
- ✅ 文件验证
  - 文件大小验证
  - 文件类型验证
  - 文件名长度验证
- ✅ 文件处理
  - 文件内容读取
  - 预览URL生成与释放
- ✅ 文件转换
  - Base64转换
  - Blob转换
- ✅ 错误处理
  - 读取错误
  - 转换错误
  - URL操作错误
- ✅ 批量处理
  - 批量验证
  - 批量预览

#### 2. Logger
- ✅ 单例模式
- ✅ 日志级别
  - info 日志
  - error 日志
  - warn 日志
  - debug 日志
- ✅ 日志格式化
  - 时间戳格式
  - 对象数据处理
  - 循环引用处理
- ✅ 错误处理
  - undefined 消息
  - null 消息
  - 非字符串消息

#### 3. HttpClient
- ✅ 配置管理
  - 默认配置
  - 自定义配置合并
- ✅ HTTP方法
  - GET请求
  - POST请求
  - PUT请求
  - DELETE请求
  - PATCH请求
- ✅ 拦截器
  - 请求拦截
  - 响应拦截
  - 错误处理
- ✅ 性能监控
  - 请求时间跟踪
  - 成功/失败统计

## 待测试模块

### 组件层 (Components)

#### 1. 通用组件 (Common)
- ⏳ Button
- ⏳ Input
- ⏳ Select
- ⏳ Modal
- ⏳ Table

#### 2. 布局组件 (Layout)
- ⏳ Header
- ⏳ Sidebar
- ⏳ Footer
- ⏳ Content

#### 3. 业务组件 (Business)
- ⏳ UserProfile
- ⏳ Dashboard
- ⏳ Settings

### 工具层 (Utils)

#### 1. 安全
- ⏳ 认证
- ⏳ 授权
- ⏳ 加密

#### 2. 状态管理
- ⏳ Store
- ⏳ Actions
- ⏳ Reducers

## 测试指标

### 当前覆盖率
- 语句覆盖率：85%
- 分支覆盖率：80%
- 函数覆盖率：90%
- 行覆盖率：85%

### 目标覆盖率
- 语句覆盖率：90%
- 分支覆盖率：85%
- 函数覆盖率：95%
- 行覆盖率：90%

### 进度总览

#### 已完成阶段
1. ✅ 第一阶段：核心功能与工具测试
   - 完成度：100%
   - 覆盖率：45%（达标）

2. ✅ 第二阶段：认证与错误处理
   - 完成度：100%
   - 覆盖率：60%（达标）

3. ⏳ 第三阶段：基础设施与通用组件
   - 完成度：95%
   - 当前覆盖率：57.31%（进行中）

### 下一阶段优先任务（基于覆盖率报告）

#### 最高优先级 (覆盖率 0%)
1. 路由和认证
   - [x] router/guards/AuthGuard.tsx
   - [x] router/guards/GuestGuard.tsx
   - [ ] router/index.tsx

2. 表单和反馈组件
   - [x] components/feedback/LoadingBar.tsx
   - [x] components/feedback/Toast.tsx
   - [ ] components/form/FormField.tsx
   - [ ] hooks/form/useForm.ts

3. 基础设施
   - [ ] infrastructure/search/SearchService.ts
   - [ ] utils/http/config.ts
   - [ ] utils/http/decorators.ts
   - [ ] utils/http/interceptors.ts

#### 高优先级 (覆盖率 < 50%)
1. 页面组件
   - [ ] HomePage.tsx (0%)
   - [ ] components/business/sections/ (0%)
     - FeatureSection.tsx
     - HeroSection.tsx
     - PricingSection.tsx

2. 工具类
   - [ ] utils/auth/validation.ts (14.08%)
   - [ ] utils/router/analytics.ts (0%)
   - [ ] utils/router/error-handler.ts (0%)

#### 中优先级 (覆盖率 50-80%)
1. 监控模块
   - [ ] infrastructure/monitoring/PerformanceMonitor.ts (59.32%)
   - [ ] infrastructure/monitoring/RouterAnalytics.ts (48.77%)

2. 日志模块
   - [ ] infrastructure/logging/Logger.ts (64.28%)

3. 错误处理
   - [ ] components/ErrorNotification (0%)
   - [ ] contexts/ErrorContext.tsx (0%)

#### 低优先级 (覆盖率 > 80%)
1. 性能优化
   - [ ] MetricsDisplay.tsx (93.81%)
   - [ ] AlertManagement.tsx (100%)

2. 安全模块
   - [ ] utils/security/encryption.ts (87.59%)
   - [ ] utils/security/policy.ts (91.77%)

### 目标
- 短期目标：将所有 0% 覆盖率的关键模块提升至少到 60%
- 中期目标：将整体覆盖率提升至 80%
- 长期目标：保持所有核心模块覆盖率在 90% 以上

### 注意事项
1. ✅ 已完成路由和认证相关组件的测试
2. 关注错误处理和用户反馈相关组件的测试
3. 完善监控和日志模块的测试用例
4. 持续维护已有高覆盖率模块的测试质量


## 下一步计划

1. 完成通用组件测试
2. 实现布局组件测试
3. 补充业务组件测试
4. 提升整体覆盖率

## 注意事项

1. 优先测试核心功能和错误处理
2. 确保异步操作的完整测试
3. 模拟各种边界情况
4. 保持测试代码的可维护性

## 当前状态 (2024-02)
- 语句覆盖率：51.85% (目标: 80%) ⬆️
- 分支覆盖率：78.84% (目标: 80%) ⬆️
- 函数覆盖率：66.79% (目标: 80%) ⬆️
- 代码行覆盖率：51.85% (目标: 80%) ⬆️

### 最新完成的测试（2024-02）
1. 通用组件
   - FileUploader 组件测试完成，覆盖率 100%
   - SearchBar 组件测试完成，覆盖率 100%
   - ThemeToggle 组件测试完成，覆盖率 100%

2. 布局组件
   - MainLayout 组件测试完成，覆盖率 100%
   - Navbar 组件测试完成，覆盖率 100%
     - 基础渲染测试
     - 导航功能测试
     - 用户认证状态测试
     - 错误处理测试
     - 移动端视图测试
     - 用户菜单操作测试

3. Hooks 模块
   - useAuth hook 测试完成，覆盖率 100%
   - useAuthForm hook 测试完成，覆盖率 100%
   - useCache hook 测试完成，覆盖率 100%
   - useHttp hook 测试完成，覆盖率 100%
   - useRequest hook 测试完成，覆盖率 100%

4. 页面组件
   - ErrorPage 组件测试完成，覆盖率 100%
   - LoginPage 组件测试完成，覆盖率 100%
   - RegisterPage 组件测试完成，覆盖率 100%
   - AlertManagement 组件测试完成，覆盖率 100%
     - 基础渲染测试
       - 添加规则按钮渲染
       - 规则列表渲染
       - 操作按钮渲染
     - 规则操作测试
       - 添加规则功能
       - 删除规则功能
       - 编辑规则功能
       - 启用/禁用规则功能
     - 数据加载测试
       - 初始加载
       - 操作后重新加载

### 下一步优先任务
1. ✅ 提高 Navbar 组件测试覆盖率（目标：80%以上）
2. ✅ 完成 useAuth hook 测试
3. ✅ 完成 hooks 模块的测试
4. ✅ 完成 services/auth 模块的测试
5. ✅ 完成页面组件测试:
   - [x] ErrorPage.tsx
   - [x] LoginPage.tsx
   - [x] RegisterPage.tsx
6. ✅ 开始 pages/monitoring 模块的测试:
   - [x] AlertManagement.tsx
7. 开始 pages/monitoring 模块的其他组件测试:
   - [x] MetricsDisplay.tsx


### 第四阶段：核心功能与服务 (2周)
目标：将整体覆盖率提升至 80%

#### 优先级 6：Hooks 模块
- [x] hooks/auth (当前: 100% -> 目标: 90%)
  - [x] useAuth.ts
  - [x] useAuthForm.ts
- [x] hooks/http (当前: 100% -> 目标: 90%)
  - [x] useCache.ts
  - [x] useHttp.ts
- [x] hooks/data (当前: 100% -> 目标: 90%)
  - [x] useRequest.ts

#### 优先级 7：服务模块
- [x] services/auth 模块 (当前: 100% -> 目标: 90%)
  - [x] authService.ts
    - 基础功能测试
      - 登录/注册/登出
      - 用户信息获取
      - Token 管理
    - 错误处理测试
      - 请求失败处理
      - Token 缺失处理
  - [x] tokenService.ts
    - Token 管理测试
      - 存储/获取/删除
      - Token 解析
      - 过期检查
    - 错误处理测试
      - 无效 Token 处理

### 第五阶段：页面与反馈组件 (2周)
目标：将整体覆盖率提升至 90%

#### 优先级 8：页面组件
- [ ] pages 模块 (当前: 0% -> 目标: 90%)
  - [x] ErrorPage.tsx
  - [ ] HomePage.tsx
  - [x] pages/auth/
    - [x] LoginPage.tsx
    - [x] RegisterPage.tsx
  - [ ] pages/monitoring/
    - [x] AlertManagement.tsx
    - [x] MetricsDisplay.tsx





## 测试规范

### 测试文件组织
```