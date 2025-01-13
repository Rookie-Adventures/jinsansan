# 监控系统

## 日志系统

### 概述
日志系统采用单例模式实现，提供了统一的日志记录接口，支持不同环境下的日志处理策略。

### 特性
- 支持多种日志级别（debug, info, warn, error）
- 批量处理和自动发送
- 环境感知（开发环境和生产环境）
- 队列缓冲机制

### 使用示例
```typescript
import { Logger } from '@/infrastructure/logging/Logger';

const logger = Logger.getInstance();

// 记录信息日志
logger.info('User logged in', { userId: '123' });

// 记录警告日志
logger.warn('Rate limit approaching', { current: 90, limit: 100 });

// 记录错误日志
logger.error('API call failed', { error: 'Network error' });

// 记录调试日志（仅在开发环境）
logger.debug('Debug information', { data: 'test' });
```

## 性能监控

### 概述
性能监控系统提供了全面的前端性能指标收集和分析功能。

### 监控指标
1. **页面加载性能**
   - DOM完成时间
   - 页面加载完成时间
   - DOM交互时间
   - DOM内容加载时间

2. **资源加载性能**
   - 资源加载时间
   - 资源类型统计
   - 加载失败分析

3. **长任务监控**
   - 任务执行时间
   - 任务阻塞分析
   - 性能瓶颈识别

4. **用户交互监控**
   - 首次输入延迟
   - 交互响应时间
   - 用户体验分析

### 使用示例
```typescript
import { PerformanceMonitor } from '@/infrastructure/monitoring/PerformanceMonitor';

const monitor = PerformanceMonitor.getInstance();

// 记录自定义指标
monitor.trackCustomMetric('buttonClick', 100);

// 记录API调用性能
monitor.trackApiCall('/api/users', 200, true);
```

## HTTP 请求监控

### 概述
HTTP 请求监控集成在 HTTP 客户端中，自动记录所有 API 请求的日志和性能指标。

### 监控内容
1. **请求日志**
   - URL
   - 方法
   - 请求头
   - 请求参数
   - 请求体

2. **响应日志**
   - 状态码
   - 响应数据
   - 响应时间

3. **错误日志**
   - 错误信息
   - 错误类型
   - 错误堆栈

### 使用示例
```typescript
import { http } from '@/infrastructure/http/HttpClient';

// 发起请求（自动记录日志和性能指标）
try {
  const response = await http.get('/api/users');
  // 处理响应...
} catch (error) {
  // 错误已自动记录...
}
```

## 最佳实践

1. **日志级别使用**
   - `debug`: 仅用于开发环境的调试信息
   - `info`: 正常的业务操作日志
   - `warn`: 潜在的问题警告
   - `error`: 错误和异常情况

2. **性能指标收集**
   - 合理设置采样率
   - 避免过多的自定义指标
   - 关注关键业务指标

3. **监控数据处理**
   - 定期分析监控数据
   - 设置合理的告警阈值
   - 及时响应性能问题

## 配置说明

### 日志系统配置
```typescript
const LOG_CONFIG = {
  MAX_QUEUE_SIZE: 100,    // 日志队列最大大小
  FLUSH_INTERVAL: 5000,   // 日志发送间隔（毫秒）
};
```

### 性能监控配置
```typescript
const MONITOR_CONFIG = {
  BATCH_SIZE: 50,         // 指标批处理大小
  SEND_INTERVAL: 10000,   // 指标发送间隔（毫秒）
};
```

### HTTP 监控配置
```typescript
const HTTP_CONFIG = {
  timeout: 10000,         // 请求超时时间
  retries: 3,            // 重试次数
  logLevel: 'info',      // 日志级别
};
``` 