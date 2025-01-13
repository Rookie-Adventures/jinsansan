/**
 * 性能指标类型
 */
export type MetricType = 'page_load' | 'resource' | 'long_task' | 'interaction' | 'custom' | 'api_call';

/**
 * 性能指标接口
 */
export interface PerformanceMetric {
  /** 指标类型 */
  type: MetricType;
  /** 时间戳 */
  timestamp: number;
  /** 指标数据 */
  data: any;
}

/**
 * 页面加载指标接口
 */
export interface PageLoadMetrics {
  /** DOM完成时间 */
  domComplete: number;
  /** 页面加载完成时间 */
  loadEventEnd: number;
  /** DOM可交互时间 */
  domInteractive: number;
  /** DOM内容加载完成时间 */
  domContentLoadedEventEnd: number;
}

/**
 * 资源加载指标接口
 */
export interface ResourceMetrics {
  /** 资源名称 */
  name: string;
  /** 加载时间 */
  duration: number;
  /** 资源类型 */
  type: string;
}

/**
 * 长任务指标接口
 */
export interface LongTaskMetrics {
  /** 任务持续时间 */
  duration: number;
  /** 任务开始时间 */
  startTime: number;
}

/**
 * 交互指标接口
 */
export interface InteractionMetrics {
  /** 交互名称 */
  name: string;
  /** 交互持续时间 */
  duration: number;
  /** 交互开始时间 */
  startTime: number;
}

/**
 * 自定义指标接口
 */
export interface CustomMetrics {
  /** 指标名称 */
  name: string;
  /** 指标值 */
  value: number;
}

/**
 * API调用指标接口
 */
export interface ApiCallMetrics {
  /** API地址 */
  url: string;
  /** 调用时间 */
  duration: number;
  /** 是否成功 */
  success: boolean;
}

/**
 * 性能监控配置接口
 */
export interface MonitorConfig {
  /** 批处理大小 */
  batchSize: number;
  /** 发送间隔（毫秒） */
  sendInterval: number;
  /** 是否启用页面加载监控 */
  enablePageLoad: boolean;
  /** 是否启用资源监控 */
  enableResource: boolean;
  /** 是否启用长任务监控 */
  enableLongTask: boolean;
  /** 是否启用交互监控 */
  enableInteraction: boolean;
  /** 是否启用远程上报 */
  enableRemote: boolean;
  /** 远程上报地址 */
  remoteUrl?: string;
} 