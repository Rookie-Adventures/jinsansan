export interface PerformanceMetrics {
  requestTimes: Map<string, number>;
  responseTimes: number[];
  errorRates: Map<string, number>;
  resourceUsage: Map<string, number>;
  customMetrics: Map<string, number>;
}

export enum MetricType {
  REQUEST_TIME = 'REQUEST_TIME',
  RESPONSE_TIME = 'RESPONSE_TIME',
  ERROR_RATE = 'ERROR_RATE',
  RESOURCE_USAGE = 'RESOURCE_USAGE',
  CUSTOM = 'CUSTOM',
}

export interface PerformanceStats {
  avgResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  errorRates: { [key: string]: number };
  resourceUsage: { [key: string]: number };
  customMetrics: { [key: string]: number };
}

export interface PerformanceTrend {
  trend: 'improving' | 'stable' | 'degrading';
  current: number;
}

export interface PerformanceTrends {
  responseTime: PerformanceTrend;
  errorRate: PerformanceTrend;
}

export interface MetricConfig {
  name: string;
  type: MetricType;
  threshold?: number;
  unit?: string;
  description?: string;
}
