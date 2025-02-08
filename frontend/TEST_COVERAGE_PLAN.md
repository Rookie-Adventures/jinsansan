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
     - 基础状态测试
     - 登录功能测试（成功/失败）
     - 注册功能测试（成功/失败）
     - 登出功能测试（成功/失败）
     - 获取当前用户测试
     - 错误处理测试
     - Redux 集成测试
     - 导航逻辑测试
   - useAuthForm hook 测试完成，覆盖率 100%
     - 基础功能测试
     - 表单操作测试
     - 类型安全测试
   - useCache hook 测试完成，覆盖率 100%
     - 获取缓存数据测试
     - 设置缓存数据测试
     - 生成缓存键测试
     - 清除缓存测试
     - 缓存持久性测试

### 下一步优先任务
1. ✅ 提高 Navbar 组件测试覆盖率（目标：80%以上）
2. ✅ 完成 useAuth hook 测试
3. 开始其他 hooks 模块的测试:
   - [ ] useHttp hook
   - [x] useCache hook
   - [ ] useRequest hook

### 第四阶段：核心功能与服务 (2周)
目标：将整体覆盖率提升至 80%

#### 优先级 6：Hooks 模块
- [x] hooks/auth (当前: 100% -> 目标: 90%)
  - [x] useAuth.ts
  - [x] useAuthForm.ts
- [ ] hooks/http (当前: 45.07% -> 目标: 90%)
  - [x] useCache.ts
  - [ ] useHttp.ts
- [ ] hooks/data (当前: 35.75% -> 目标: 90%)
  - [ ] useRequest.ts

#### 优先级 7：服务模块
- [ ] services/auth 模块 (当前: 35.52% -> 目标: 90%)
  - [ ] authService.ts
  - [ ] tokenService.ts

### 第五阶段：页面与反馈组件 (2周)
目标：将整体覆盖率提升至 90%

#### 优先级 8：页面组件
- [ ] pages 模块 (当前: 0% -> 目标: 90%)
  - [ ] ErrorPage.tsx
  - [ ] HomePage.tsx
  - [ ] pages/auth/
    - [ ] LoginPage.tsx
    - [ ] RegisterPage.tsx
  - [ ] pages/monitoring/
    - [ ] AlertManagement.tsx

#### 优先级 9：反馈组件
- [ ] components/feedback 模块 (当前: 0% -> 目标: 90%)
  - [ ] LoadingBar.tsx
  - [ ] Toast.tsx
  - [ ] TopProgressBar.tsx
- [ ] components/form 模块 (当前: 0% -> 目标: 90%)
  - [ ] FormField.tsx

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
   - 当前覆盖率：51.85%（进行中）
   - 待完成：Navbar.tsx（当前：72.58%）

#### 待开始阶段
4. 📅 第四阶段：核心功能与服务
   - 计划开始时间：2024-02-XX
   - 预计用时：2周
   - 主要任务：完成所有hooks和服务模块的测试

5. 📅 第五阶段：页面与反馈组件
   - 计划开始时间：2024-03-XX
   - 预计用时：2周
   - 主要任务：完成所有页面组件和反馈组件的测试

## 测试规范

### 测试文件组织
```
src/
  __tests__/                # 全局测试
  components/
    __tests__/             # 组件测试
    common/
      __tests__/          # 通用组件测试
    layout/
      __tests__/         # 布局组件测试
  hooks/
    __tests__/            # Hooks测试
  store/
    __tests__/           # Redux相关测试
  utils/
    __tests__/           # 工具函数测试
```

### 测试命名规范
```
# 组件测试
ComponentName.test.tsx

# Hook测试
useHookName.test.tsx

# 工具函数测试
utilName.test.ts

# 类测试
ClassName.test.ts
```

### 测试结构规范
```typescript
describe('模块名', () => {
  describe('功能/场景', () => {
    it('应该达到的预期结果', () => {
      // 测试代码
    });
  });
});
```

### 测试分类
1. 单元测试
   - 组件渲染测试
   - Hook 行为测试
   - 工具函数测试
   - 类方法测试

2. 集成测试
   - 组件交互测试
   - 状态管理测试
   - API 调用测试
   - 路由导航测试

3. 端到端测试
   - 用户流程测试
   - 关键功能测试
   - 性能测试

### 测试优先级
1. 核心业务逻辑
2. 用户交互功能
3. 错误处理
4. 边界条件
5. 性能相关

### 测试覆盖率要求
- 语句覆盖率 (Statement Coverage): ≥ 80%
- 分支覆盖率 (Branch Coverage): ≥ 80%
- 函数覆盖率 (Function Coverage): ≥ 80%
- 行覆盖率 (Line Coverage): ≥ 80%

## 注意事项
1. 优先补充已有较好覆盖率的模块，确保其稳定性
2. 每个新增测试用例都要确保与现有用例独立
3. 合理使用 mock 和 stub，特别是在测试HTTP请求时
4. 每完成一个模块的测试就运行全套测试确保无回归
5. 及时更新测试文档和注释
6. 对于覆盖率为0%的模块，先编写基本的快照测试和渲染测试 