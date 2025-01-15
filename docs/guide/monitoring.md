# 监控系统文档

> 状态：🚧 开发中
> 
> 最后更新：2024年1月
> 
> 完成度：
> - [x] 性能监控基础框架 (100%)
> - [x] HTTP请求监控 (100%)
> - [x] 路由分析 (80%)
> - [ ] 告警系统 (0%)

## 1. 性能监控

### 1.1 已实现功能
```typescript
import { PerformanceMonitor } from '@/infrastructure/monitoring/PerformanceMonitor';

const monitor = PerformanceMonitor.getInstance();

// 页面加载性能
monitor.observePageLoadMetrics();  // 自动收集

// 资源加载性能
monitor.observeResourceTiming();   // 自动收集

// 长任务监控
monitor.observeLongTasks();        // 自动收集

// 用户交互监控
monitor.observeUserInteractions(); // 自动收集

// 自定义指标
monitor.trackCustomMetric('buttonClick', 100);

// API调用性能
monitor.trackApiCall('/api/users', 200, true);
```

### 1.2 指标类型定义
```typescript
type MetricType = 'page_load' | 'resource' | 'long_task' | 'interaction' | 'custom' | 'api_call';

interface PerformanceMetric {
  type: MetricType;
  timestamp: number;
  data: any;
}
```

## 2. HTTP请求监控

### 2.1 已实现功能
```typescript
// 请求拦截器
axiosInstance.interceptors.request.use((config) => {
  // 记录请求开始时间
  config.metadata = { startTime: Date.now() };
  
  // 记录请求日志
  logger.info('API Request', {
    url: config.url,
    method: config.method,
    headers: config.headers,
    params: config.params,
    data: config.data,
  });

  return config;
});

// 响应拦截器
axiosInstance.interceptors.response.use((response) => {
  const duration = Date.now() - (config.metadata?.startTime || 0);

  // 记录性能指标
  performanceMonitor.trackApiCall(
    config.url || '',
    duration,
    true
  );

  return response;
});
```

## 3. 路由分析

### 3.1 已实现功能
```typescript
class RouterAnalytics {
  trackRoute(path: string, navigationType: string): void {
    const analytics: RouteAnalytics = {
      path,
      timestamp: Date.now(),
      navigationType,
      previousPath: this.lastPath,
      duration: this.lastTimestamp ? Date.now() - this.lastTimestamp : undefined
    };

    this.analytics.push(analytics);
    this.reportAnalytics(analytics);
  }
}
```

## 4. 数据上报

### 4.1 批量处理
```typescript
private async sendMetrics(): Promise<void> {
  if (this.metrics.length === 0) return;

  try {
    const metricsToSend = [...this.metrics];
    this.metrics = [];

    if (process.env.NODE_ENV === 'production') {
      await fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics: metricsToSend }),
      });
    }
  } catch (error) {
    console.error('Failed to send metrics:', error);
    this.metrics = [...this.metrics, ...this.metrics];
  }
}
```

## 5. 配置说明

### 5.1 性能监控配置
```typescript
interface MonitorConfig {
  batchSize: number;         // 批处理大小
  sendInterval: number;      // 发送间隔（毫秒）
  enablePageLoad: boolean;   // 是否启用页面加载监控
  enableResource: boolean;   // 是否启用资源监控
  enableLongTask: boolean;   // 是否启用长任务监控
  enableInteraction: boolean;// 是否启用交互监控
  enableRemote: boolean;     // 是否启用远程上报
  remoteUrl?: string;       // 远程上报地址
}
```

## 6. 待实现功能

### 6.1 高优先级
- [ ] 错误聚合分析
- [ ] 性能指标阈值告警
- [ ] 监控数据可视化

### 6.2 中优先级
- [ ] 用户行为分析
- [ ] 性能趋势分析
- [ ] 自定义告警规则

### 6.3 低优先级
- [ ] 智能异常检测
- [ ] 多维度数据分析
- [ ] 监控配置面板 