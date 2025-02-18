# ESLint 问题分析与修复计划

## 问题概览

总计发现 425 个问题 (298 errors, 127 warnings)，分布在 89 个文件中。

## 1. 高优先级问题

### 1.1 类型安全问题
- [ ] @typescript-eslint/no-explicit-any (31处)
- [ ] @typescript-eslint/no-non-null-assertion (5处)
- [ ] @typescript-eslint/explicit-module-boundary-types (20处)

### 1.2 未使用的代码
- [ ] no-unused-vars (约50处)
- [ ] unused-imports/no-unused-vars

### 1.3 React 相关严重问题
- [ ] testing-library/no-wait-for-multiple-assertions (12处)
- [ ] testing-library/no-node-access (15处)
- [ ] testing-library/no-unnecessary-act (3处)

## 2. 问题集中的文件

### 2.1 最高频率问题文件 (优先处理)

1. **src/utils/error/errorLogger.ts** (28个问题)
   - [ ] no-unused-vars (多处)
   - [ ] no-console (多处)
   - [ ] @typescript-eslint/no-unused-vars

2. **src/utils/http/types.ts** (14个问题)
   - [ ] no-unused-vars (多处)
   - [ ] 未使用的枚举成员

3. **src/infrastructure/http/HttpClient.ts** (11个问题)
   - [ ] @typescript-eslint/no-explicit-any
   - [ ] @typescript-eslint/explicit-module-boundary-types

4. **src/components/auth/AuthPage.tsx** (8个问题)
   - [ ] import/default
   - [ ] no-unused-vars
   - [ ] @typescript-eslint/no-non-null-assertion
   - [ ] import/no-named-as-default-member

5. **src/components/monitoring/AlertRuleList.tsx** (6个问题)
   - [ ] no-unused-vars
   - [ ] 未使用的参数

## 3. 问题集中的目录

### 3.1 src/utils/ (约120个问题)
- [ ] http/
- [ ] error/
- [ ] security/
- [ ] monitoring/

### 3.2 src/components/ (约90个问题)
- [ ] auth/
- [ ] monitoring/
- [ ] common/

### 3.3 src/infrastructure/ (约60个问题)
- [ ] monitoring/
- [ ] http/
- [ ] file/

### 3.4 src/tests/ (约40个问题)
- [ ] setup.ts
- [ ] utils.tsx
- [ ] react/

## 4. 修复计划

### 第一阶段：代码清理 (高优先级)
1. [ ] 清理未使用的变量和导入 (约50处)
2. [ ] 清理未使用的枚举成员
3. [ ] 优化导入/导出规范
4. [ ] 处理重复导出

### 第二阶段：类型安全
1. [ ] 修复所有 any 类型使用 (31处)
2. [ ] 添加缺失的返回类型 (20处)
3. [ ] 处理非空断言 (5处)
4. [ ] 创建通用类型定义

### 第三阶段：测试代码优化
1. [ ] 修复测试断言问题
2. [ ] 优化 DOM 访问方式
3. [ ] 清理不必要的 act 调用
4. [ ] 优化异步测试

### 第四阶段：代码质量提升
1. [ ] 清理 console 语句
2. [ ] 优化 React Hooks 依赖
3. [ ] 优化 Fragment 使用
4. [ ] 完善错误处理

## 5. 修复指南

### 5.1 类型安全修复示例
```typescript
// 替换 any 类型
type ApiResponse<T> = {
  data: T;
  status: number;
  message: string;
};

// 添加返回类型
function getData(): Promise<ApiResponse<User[]>> {
  // ...
}
```

### 5.2 测试代码修复示例
```typescript
// 优化 DOM 访问
// 错误方式
expect(container.querySelector('button')).toBeInTheDocument();

// 正确方式
expect(screen.getByRole('button')).toBeInTheDocument();

// 优化异步测试
// 错误方式
await waitFor(() => {
  expect(something).toBe(true);
  expect(somethingElse).toBe(false);
});

// 正确方式
await waitFor(() => expect(something).toBe(true));
await waitFor(() => expect(somethingElse).toBe(false));
```

### 5.3 React Hooks 修复示例
```typescript
// 添加缺失的依赖项
useEffect(() => {
  // effect 逻辑
}, [dependency1, dependency2]);

// 优化 Fragment 使用
// 不需要 Fragment
<>
  <SingleChild />
</>

// 正确使用
<SingleChild />
```

## 6. 进度跟踪

### 6.1 完成情况
- [ ] 第一阶段 (0/4)
- [ ] 第二阶段 (0/4)
- [ ] 第三阶段 (0/4)
- [ ] 第四阶段 (0/4)

### 6.2 问题解决统计
- 总问题数：425
- 已解决：0
- 剩余：425

## 7. 注意事项

1. 每次修改后运行完整的测试套件
2. 修改类型定义后检查相关组件
3. 保持修改的原子性，避免大规模重构
4. 记录修改日志，方便回溯
5. 优先解决影响功能的问题

## 8. 修改日志

### 2024-03-21
- 调整修复计划优先级，将代码清理移至第一阶段
- 原因：
  1. 降低代码复杂度，减少干扰
  2. 提高类型检查准确性
  3. 操作风险最小
  4. 便于后续验证

### YYYY-MM-DD
- 初始化问题跟踪文档
- 完成问题分析和分类
- 制定修复计划 