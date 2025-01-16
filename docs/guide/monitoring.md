# 监控系统文档

> 状态：✅ 已实施
> 
> 最后更新：2024年1月
> 
> 完成度：
> - [x] 性能监控基础框架 (100%)
> - [x] HTTP请求监控 (100%)
> - [x] 路由分析 (80%)
> - [x] 告警系统 (90%)

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

## 4. 告警系统

### 4.1 告警规则配置
```typescript
interface AlertRule {
  id: string;
  name: string;
  type: 'threshold' | 'trend' | 'anomaly';
  metric: string;
  condition: {
    operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
    value: number;
  };
  severity: 'info' | 'warning' | 'error' | 'critical';
  enabled: boolean;
  notification: {
    email?: string[];
  };
}
```

### 4.2 告警管理器
```typescript
class AlertManager {
  // 添加规则
  addRule(rule: Omit<AlertRule, 'id'>): AlertRule;

  // 更新规则
  updateRule(rule: AlertRule): void;

  // 删除规则
  deleteRule(ruleId: string): void;

  // 启用/禁用规则
  toggleRule(ruleId: string, enabled: boolean): void;

  // 检查指标
  checkMetric(metric: PerformanceMetric): void;
}
```

### 4.3 告警通知
- 支持邮件通知
- 告警历史记录
- 告警状态追踪

## 5. 数据上报

### 5.1 批量处理
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

## 6. 配置说明

### 6.1 性能监控配置
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

### 6.2 告警配置
```typescript
interface AlertConfig {
  enabled: boolean;          // 是否启用告警
  rules: AlertRule[];        // 告警规则列表
  notification: {            // 通知设置
    defaultEmail?: string[]; // 默认接收邮箱
  };
}
```

## 7. 待实现功能

### 7.1 高优先级
- [ ] 告警数据可视化
- [ ] 告警规则导入/导出
- [ ] 告警规则模板

### 7.2 中优先级
- [ ] 更多告警通知渠道
- [ ] 告警规则测试工具
- [ ] 高级告警条件配置

### 7.3 低优先级
- [ ] 路由分析仪表板
- [ ] 性能趋势分析
- [ ] 监控配置面板 

## 8. 使用建议

### 8.1 小型项目使用建议
- 优先启用基础监控功能（页面加载、API调用）
- 根据实际需求逐步开启其他功能
- 将告警阈值设置得相对宽松，避免信息过载
- 重点监控核心业务功能和关键用户路径

### 8.2 推荐配置
```typescript
const recommendedConfig: MonitorConfig = {
  batchSize: 10,           // 较小的批处理大小
  sendInterval: 30000,     // 30秒发送一次
  enablePageLoad: true,    // 启用页面加载监控
  enableResource: false,   // 禁用资源监控
  enableLongTask: false,   // 禁用长任务监控
  enableInteraction: true, // 启用交互监控（核心功能）
  enableRemote: true      // 启用远程上报
};
``` 