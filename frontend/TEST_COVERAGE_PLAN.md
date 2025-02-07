# 前端测试覆盖提升计划

## 当前状态 (2024-02)
- 语句覆盖率：43.53% (目标: 80%) ⬆️
- 分支覆盖率：78.65% (目标: 80%) ⬆️
- 函数覆盖率：68.72% (目标: 80%) ⬆️
- 代码行覆盖率：43.53% (目标: 80%) ⬆️

## 提升策略
采用小步快进策略，按照以下优先级逐步提高测试覆盖率：
1. ✅ 已有高覆盖率模块的补充测试
2. ✅ 核心功能与工具模块优先
3. 通用基础组件次之
4. 业务组件最后

## 阶段性目标

### 第一阶段：核心功能与工具测试 (2周)
目标：将整体覆盖率提升至 45% ✅

#### 优先级 1：已有良好覆盖的模块补充
- [x] ErrorBoundary 组件维护 (当前: 100%, 仅需补充边界用例)
- [x] Loading 组件维护 (当前: 100%, 仅需补充性能测试)
- [x] security 工具模块补充 (当前: 100%)
  - [x] encryption.ts 补充测试 (当前: 100%)
  - [x] policy.ts 补充测试 (当前: 100%)

#### 优先级 2：核心工具模块
- [x] utils/http/error 模块测试 (当前: 100% -> 目标: 90%)
  - [x] prevention.ts (当前: 100%)
  - [x] recovery.ts (当前: 100%)
  - [x] reporter.ts (当前: 100%)
  - [x] retry.ts (当前: 100%)
- [x] infrastructure/monitoring 模块 (当前: 100% -> 目标: 90%)
  - [x] PerformanceMonitor.ts (当前: 100%)
  - [x] UserAnalytics.ts (当前: 100%)

### 第二阶段：认证与错误处理 (2周)
目标：将整体覆盖率提升至 60% ✅

#### 优先级 3：认证与错误处理
- [x] components/auth 模块 (当前: 100% -> 目标: 90%)
  - [x] AuthForm.tsx (当前: 100%)
  - [x] AuthCard.tsx (当前: 100%)
  - [x] AuthPage.tsx (当前: 100%)
  - [x] LoginForm.tsx (当前: 100%)
  - [x] RegisterForm.tsx (当前: 100%)
- [x] ErrorNotification 组件 (当前: 100% -> 目标: 90%)
- [x] utils/error 模块 (当前: 100% -> 目标: 90%)
  - [x] errorUtils.ts (当前: 100%)
  - [x] errorLogger.ts (当前: 100%)

### 第三阶段：基础设施与通用组件 (2周)
目标：将整体覆盖率提升至 80%

#### 优先级 4：基础设施
- [ ] infrastructure/http 模块 (当前: 0% -> 目标: 80%)
  - [ ] httpClient.ts
  - [ ] interceptors/
  - [ ] middleware/
- [ ] infrastructure/logging 模块 (当前: 0% -> 目标: 80%)
  - [ ] logger.ts
  - [ ] formatters/
  - [ ] transports/
- [ ] infrastructure/file 模块 (当前: 0% -> 目标: 80%)
  - [ ] fileManager.ts
  - [ ] uploader.ts
  - [ ] validator.ts

#### 优先级 5：通用组件
- [ ] components/common 模块 (当前: 0% -> 目标: 80%)
  - [ ] FileUploader.tsx
  - [ ] SearchBar.tsx
  - [ ] ThemeToggle.tsx
- [ ] components/layout 模块 (当前: 0% -> 目标: 80%)
  - [ ] MainLayout.tsx
  - [ ] Navbar.tsx

## 测试规范

### 测试文件组织
```
src/
  └── components/
      ├── ErrorBoundary/
      │   ├── ErrorBoundary.tsx
      │   ├── ErrorBoundary.test.tsx      # 单元测试
      │   └── ErrorBoundary.spec.tsx      # 集成测试
      └── auth/
          ├── LoginForm.tsx
          ├── LoginForm.test.tsx
          └── LoginForm.spec.tsx
```

### 测试类型
1. 单元测试 (*.test.tsx)
   - 组件渲染测试
   - 属性验证测试
   - 事件处理测试
   - 错误处理测试

2. 集成测试 (*.spec.tsx)
   - 组件交互测试
   - 状态管理测试
   - API 调用测试
   - 路由集成测试

## 进度追踪

### 每周目标
1. ✅ 第一周：完成已有高覆盖率模块的补充测试和核心工具模块测试
2. ✅ 第二周：完成认证相关组件和错误处理模块测试
3. 第三周：完成基础设施模块测试
4. 第四周：完成通用组件测试
5. 第五周：完成业务组件测试
6. 第六周：完成剩余组件测试和优化

### 检查点
- [x] 第一阶段完成检查 (2周后)
  - [x] 核心功能测试覆盖率达到90%
  - [x] 整体覆盖率达到45%
- [x] 第二阶段完成检查 (4周后)
  - [x] 认证与错误处理覆盖率达到90%
  - [x] 整体覆盖率达到60%
- [ ] 第三阶段完成检查 (6周后)
  - [ ] 基础设施与通用组件覆盖率达到80%
  - [ ] 整体覆盖率达到80%

## 每日任务模板

```markdown
### 日期：YYYY-MM-DD

#### 今日目标
- [ ] 组件/模块：
- [ ] 测试类型：
- [ ] 当前覆盖率：
- [ ] 目标覆盖率：

#### 完成情况
- [ ] 新增测试用例数：
- [ ] 实际覆盖率：
- [ ] 发现的问题：
- [ ] 解决方案：

#### 明日计划
- [ ] 
```

## 注意事项
1. 优先补充已有较好覆盖率的模块，确保其稳定性
2. 每个新增测试用例都要确保与现有用例独立
3. 合理使用 mock 和 stub，特别是在测试HTTP请求时
4. 每完成一个模块的测试就运行全套测试确保无回归
5. 及时更新测试文档和注释
6. 对于覆盖率为0%的模块，先编写基本的快照测试和渲染测试 