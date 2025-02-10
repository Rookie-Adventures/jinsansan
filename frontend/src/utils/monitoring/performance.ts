import { PerformanceMetrics } from './types';

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics;
  private readonly maxSampleSize: number = 100;
  private readonly reportingInterval: number = 60000; // 1分钟
  private reportingTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.metrics = {
      requestTimes: new Map(),
      responseTimes: [],
      errorRates: new Map(),
      resourceUsage: new Map(),
      customMetrics: new Map(),
    };
    this.startReporting();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // 记录请求开始时间
  public recordRequestStart(requestId: string): void {
    this.metrics.requestTimes.set(requestId, performance.now());
  }

  // 记录请求结束并计算响应时间
  public recordRequestEnd(requestId: string): void {
    const startTime = this.metrics.requestTimes.get(requestId);
    if (startTime) {
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // 添加到响应时间数组
      this.metrics.responseTimes.push(responseTime);

      // 保持数组大小在限制范围内
      if (this.metrics.responseTimes.length > this.maxSampleSize) {
        this.metrics.responseTimes.shift();
      }

      // 清理请求时间记录
      this.metrics.requestTimes.delete(requestId);
    }
  }

  // 记录错误
  public recordError(errorType: string): void {
    const currentCount = this.metrics.errorRates.get(errorType) || 0;
    this.metrics.errorRates.set(errorType, currentCount + 1);
  }

  // 记录资源使用情况
  public recordResourceUsage(resource: string, value: number): void {
    this.metrics.resourceUsage.set(resource, value);
  }

  // 记录自定义指标
  public recordCustomMetric(name: string, value: number): void {
    this.metrics.customMetrics.set(name, value);
  }

  // 获取性能统计
  public getPerformanceStats(): any {
    const responseTimes = this.metrics.responseTimes;
    const totalRequests = responseTimes.length;

    if (totalRequests === 0) {
      return {
        avgResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        errorRates: Object.fromEntries(this.metrics.errorRates),
        resourceUsage: Object.fromEntries(this.metrics.resourceUsage),
        customMetrics: Object.fromEntries(this.metrics.customMetrics),
      };
    }

    // 计算平均响应时间
    const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / totalRequests;

    // 计算百分位数
    const sortedTimes = [...responseTimes].sort((a, b) => a - b);
    const p95Index = Math.floor(totalRequests * 0.95);
    const p99Index = Math.floor(totalRequests * 0.99);

    return {
      avgResponseTime,
      p95ResponseTime: sortedTimes[p95Index],
      p99ResponseTime: sortedTimes[p99Index],
      errorRates: Object.fromEntries(this.metrics.errorRates),
      resourceUsage: Object.fromEntries(this.metrics.resourceUsage),
      customMetrics: Object.fromEntries(this.metrics.customMetrics),
    };
  }

  // 重置性能指标
  public resetMetrics(): void {
    this.metrics = {
      requestTimes: new Map(),
      responseTimes: [],
      errorRates: new Map(),
      resourceUsage: new Map(),
      customMetrics: new Map(),
    };
  }

  // 开始定期报告
  private startReporting(): void {
    if (this.reportingTimer) {
      clearInterval(this.reportingTimer);
    }

    this.reportingTimer = setInterval(() => {
      const stats = this.getPerformanceStats();
      console.log('Performance Report:', stats);

      // 可以在这里添加将性能数据发送到监控系统的逻辑
      this.sendToMonitoringSystem(stats);
    }, this.reportingInterval);
  }

  // 停止定期报告
  public stopReporting(): void {
    if (this.reportingTimer) {
      clearInterval(this.reportingTimer);
      this.reportingTimer = null;
    }
  }

  // 发送数据到监控系统
  private async sendToMonitoringSystem(stats: any): Promise<void> {
    try {
      // 这里可以实现将数据发送到实际的监控系统的逻辑
      // 例如：
      await fetch('/api/monitoring/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stats),
      });
    } catch (error) {
      console.error('Failed to send metrics to monitoring system:', error);
    }
  }

  // 获取指定时间范围内的性能数据
  public getMetricsInTimeRange(startTime: number, endTime: number): PerformanceMetrics {
    // 过滤指定时间范围内的数据
    const filteredResponseTimes = this.metrics.responseTimes.filter((_, index) => {
      const timestamp =
        Date.now() - (this.metrics.responseTimes.length - index) * this.reportingInterval;
      return timestamp >= startTime && timestamp <= endTime;
    });

    const filteredMetrics: PerformanceMetrics = {
      requestTimes: new Map(),
      responseTimes: filteredResponseTimes,
      errorRates: new Map(),
      resourceUsage: new Map(),
      customMetrics: new Map(),
    };

    // 过滤错误率数据
    this.metrics.errorRates.forEach((value, key) => {
      filteredMetrics.errorRates.set(key, value);
    });

    // 过滤资源使用数据
    this.metrics.resourceUsage.forEach((value, key) => {
      filteredMetrics.resourceUsage.set(key, value);
    });

    // 过滤自定义指标数据
    this.metrics.customMetrics.forEach((value, key) => {
      filteredMetrics.customMetrics.set(key, value);
    });

    return filteredMetrics;
  }

  // 分析性能趋势
  public analyzeTrends(): any {
    const stats = this.getPerformanceStats();
    const trends = {
      responseTime: {
        trend: this.calculateTrend(this.metrics.responseTimes),
        current: stats.avgResponseTime,
      },
      errorRate: {
        trend: this.calculateErrorTrend(),
        current: this.calculateCurrentErrorRate(),
      },
    };
    return trends;
  }

  private calculateTrend(data: number[]): 'improving' | 'stable' | 'degrading' {
    if (data.length < 2) return 'stable';

    const recentData = data.slice(-10); // 使用最近的10个数据点
    const avg = recentData.reduce((sum, val) => sum + val, 0) / recentData.length;
    const prevAvg = data.slice(-20, -10).reduce((sum, val) => sum + val, 0) / 10;

    const threshold = 0.1; // 10%的变化阈值

    if (avg < prevAvg * (1 - threshold)) return 'improving';
    if (avg > prevAvg * (1 + threshold)) return 'degrading';
    return 'stable';
  }

  private calculateErrorTrend(): 'improving' | 'stable' | 'degrading' {
    // 实现错误率趋势计算逻辑
    return 'stable';
  }

  private calculateCurrentErrorRate(): number {
    const totalErrors = Array.from(this.metrics.errorRates.values()).reduce(
      (sum, count) => sum + count,
      0
    );
    const totalRequests = this.metrics.responseTimes.length;
    return totalRequests === 0 ? 0 : totalErrors / totalRequests;
  }
}

export default PerformanceMonitor;
