/**
 * 性能指标类型
 */
export type MetricType =
  | 'page_load'
  | 'resource'
  | 'long_task'
  | 'interaction'
  | 'custom'
  | 'api_call'
  | 'cpu_usage';

/**
 * 指标数据联合类型
 */
export type MetricData =
  | PageLoadMetrics
  | ResourceMetrics
  | LongTaskMetrics
  | InteractionMetrics
  | CustomMetrics
  | ApiCallMetrics;

/**
 * 性能指标接口
 */
export interface PerformanceMetric {
  /** 指标类型 */
  type: MetricType;
  /** 时间戳 */
  timestamp: number;
  /** 指标数据 */
  data: MetricData;
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
  /** 标签 */
  tags?: Record<string, string | number | boolean | null>;
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

/**
 * 告警通知类型
 * - 'trigger' 触发告警
 * - 'resolve' 告警恢复
 */
export type AlertNotificationType = 'trigger' | 'resolve';

/**
 * 告警通知
 */
export interface AlertNotification {
  /** 通知类型 */
  type: AlertNotificationType;
  /** 告警规则 */
  rule: AlertRule;
  /** 告警值 */
  value: number;
  /** 时间戳 */
  timestamp: number;
  /** 通知配置 */
  config: AlertNotificationConfig;
  /** 告警消息 */
  message?: string;
  /** 告警详情 */
  details?: {
    /** 持续时间（毫秒） */
    duration?: number;
    /** 上一次告警值 */
    previousValue?: number;
    /** 自定义元数据 */
    metadata?: Record<string, unknown>;
  };
}

/**
 * 告警通知配置
 */
export interface AlertNotificationConfig {
  /** 邮件接收人列表 */
  email?: string[];
  /** Webhook URL */
  webhook?: string;
  /** Slack 频道 */
  slack?: string;
}

/**
 * 告警规则类型
 */
export type AlertRuleType = 'threshold' | 'trend' | 'anomaly';

/**
 * 告警级别
 */
export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';

/**
 * 告警规则配置
 */
export interface AlertRule {
  /** 规则ID */
  id: string;
  /** 规则名称 */
  name: string;
  /** 规则类型 */
  type: AlertRuleType;
  /** 监控指标 */
  metric: string;
  /** 告警条件 */
  condition: AlertCondition;
  /** 告警级别 */
  severity: AlertSeverity;
  /** 是否启用 */
  enabled: boolean;
  /** 通知配置 */
  notification: AlertNotificationConfig;
}

/**
 * 告警配置接口
 */
export interface AlertConfig {
  /** 是否启用告警 */
  enabled: boolean;
  /** 告警规则列表 */
  rules: AlertRule[];
  /** 通知设置 */
  notification: {
    /** 默认接收邮箱 */
    defaultEmail?: string[];
  };
}

/**
 * 告警状态
 */
export type AlertStatus = 'active' | 'resolved';

/**
 * 告警记录
 */
export interface Alert {
  /** 告警ID */
  id: string;
  /** 规则ID */
  ruleId: string;
  /** 告警值 */
  value: number;
  /** 时间戳 */
  timestamp: number;
  /** 告警消息 */
  message: string;
  /** 开始时间 */
  startTime?: number;
  /** 结束时间 */
  endTime?: number;
  /** 告警状态 */
  status: AlertStatus;
}

/**
 * 告警条件操作符
 * - '>' 大于
 * - '<' 小于
 * - '>=' 大于等于
 * - '<=' 小于等于
 * - '==' 等于
 * - '!=' 不等于
 */
export type AlertOperator = '>' | '<' | '>=' | '<=' | '==' | '!=';

/**
 * 告警条件配置
 */
export interface AlertCondition {
  /** 比较操作符 */
  operator: AlertOperator;
  /** 阈值 */
  value: number;
  /** 持续时间（毫秒），可选 */
  duration?: number;
  /** 是否需要连续满足条件，默认为 true */
  consecutive?: boolean;
}
